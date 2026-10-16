import OpenAI from 'openai'
import { z } from 'zod'
import { LessonCoreSchema, LessonPresentationSchema } from './learningPathSchemas.js'
import { zodToOpenAiJsonSchema } from './openAiJsonSchema.js'
import { extractSourcesFromResponse } from './extractResearchFromResponse.js'
import { slugId } from './serverUtils.js'

const LESSON_SYSTEM = `You are Curiosity Feed's lesson author. Write rich, concrete educational stories—not outlines or template labels.

Requirements:
- Use ONLY facts supported by the research packet and source list. Cite via sourceIds on verifiedClaims.
- Include specific names, dates, numbers, institutions, and mechanisms where the sources support them.
- No personalized medical, legal, or financial advice.
- Never invent source URLs or YouTube video IDs. Set videoSearchQuery to a concise YouTube search phrase (e.g. "RBI repo rate explained").
- Mark genuine debate in lessonCore.uncertainties—not every lesson needs uncertainty.
- presentation.format must be "narrative" with at least 5 storyBeats; each beat body is 2–5 sentences of substantive prose (not bullet placeholders).
- coldOpen.body must open with a vivid, factual scene or moment—not "In this lesson we will learn..."
- deck is a compelling 1–2 sentence preview for the feed card.
- domain is the subject field (e.g. Economics, History)—not the course title.
- readingMinutes should reflect real reading time (typically 4–8).`

const StructuredLessonSchema = z.object({
  lessonCore: LessonCoreSchema,
  presentation: LessonPresentationSchema,
})

function buildResearchQueries(lessonContext) {
  const brief = lessonContext.lessonBrief ?? {}
  const fromBrief = Array.isArray(brief.sourceQueries) ? brief.sourceQueries : []
  const queries = [
    ...fromBrief,
    lessonContext.title,
    brief.videoSearchQuery,
    `${lessonContext.courseTitle} ${lessonContext.title} facts`,
  ].filter((q) => typeof q === 'string' && q.trim())
  return [...new Set(queries.map((q) => q.trim()))].slice(0, 4)
}

/**
 * @param {{ apiKey: string, model: string, signal: AbortSignal, lessonContext: Record<string, unknown> }} params
 */
export async function runLessonResearch({ apiKey, model, signal, lessonContext }) {
  const openai = new OpenAI({ apiKey })
  const queries = buildResearchQueries(lessonContext)
  const scopeLine =
    lessonContext.geographicScope === 'india'
      ? 'Prioritize India-specific sources where relevant.'
      : lessonContext.geographicScope === 'global'
        ? 'Use international sources; compare across countries when useful.'
        : 'Mix India-specific and global sources where appropriate.'

  const response = await openai.responses.create(
    {
      model,
      tools: [{ type: 'web_search' }],
      tool_choice: 'required',
      include: ['web_search_call.action.sources'],
      input: [
        {
          role: 'system',
          content:
            'You are a research assistant. Use web search to gather current, checkable facts for one lesson. Prefer government, university, museum, and established news/education sites. Write a research brief in markdown with sections: Summary, Key facts (bulleted, each fact specific), Open questions. Reference real-world details (dates, names, figures) when found.',
        },
        {
          role: 'user',
          content: [
            `Lesson title: ${lessonContext.title}`,
            `Objective: ${lessonContext.objective}`,
            `Curiosity question: ${lessonContext.curiosityQuestion}`,
            `Level: ${lessonContext.level}`,
            scopeLine,
            `Suggested search angles: ${queries.join(' | ')}`,
            `Prior lessons in track: ${(lessonContext.priorLessonTitles ?? []).join('; ') || 'none'}`,
          ].join('\n'),
        },
      ],
    },
    { signal },
  )

  const summary = response.output_text?.trim()
  if (!summary) {
    throw Object.assign(new Error('Empty research response'), { code: 'MODEL_EMPTY' })
  }

  const extracted = extractSourcesFromResponse(response)
  if (extracted.length === 0) {
    throw Object.assign(new Error('No web sources returned for this lesson'), {
      code: 'LESSON_NO_SOURCES',
    })
  }

  const sourceRecords = extracted.slice(0, 12).map((src, idx) => ({
    ...src,
    id: slugId('src', src.url.slice(0, 48), String(idx)),
    snippet: undefined,
  }))

  const notes = summary
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 24)

  return { summary, sourceRecords, notes }
}

/**
 * @param {{ apiKey: string, model: string, signal: AbortSignal, lessonContext: Record<string, unknown>, research: Awaited<ReturnType<typeof runLessonResearch>> }} params
 */
export async function runLessonStructured({ apiKey, model, signal, lessonContext, research }) {
  const openai = new OpenAI({ apiKey })
  const jsonSchema = zodToOpenAiJsonSchema(StructuredLessonSchema)

  const sourceBlock = research.sourceRecords
    .map((s) => `${s.id}: ${s.title} — ${s.url}`)
    .join('\n')

  const response = await openai.responses.create(
    {
      model,
      input: [
        { role: 'system', content: LESSON_SYSTEM },
        {
          role: 'user',
          content: [
            'Write the full lesson JSON from this research. Every verifiedClaim must use sourceIds from the list below.',
            '',
            'Sources (only these ids are valid):',
            sourceBlock,
            '',
            'Research brief:',
            research.summary,
            '',
            'Lesson placement:',
            JSON.stringify(
              {
                title: lessonContext.title,
                objective: lessonContext.objective,
                curiosityQuestion: lessonContext.curiosityQuestion,
                whyThisComesNow: lessonContext.whyThisComesNow,
                level: lessonContext.level,
                geographicScope: lessonContext.geographicScope,
                videoSearchQuery:
                  lessonContext.videoSearchQuery ??
                  lessonContext.lessonBrief?.videoSearchQuery,
              },
              null,
              2,
            ),
          ].join('\n'),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'GeneratedLesson',
          schema: jsonSchema,
          strict: true,
        },
      },
    },
    { signal },
  )

  const text = response.output_text
  if (!text) {
    throw Object.assign(new Error('Empty lesson response'), { code: 'MODEL_EMPTY' })
  }

  const parsed = StructuredLessonSchema.parse(JSON.parse(text))
  const validSourceIds = new Set(research.sourceRecords.map((s) => s.id))

  const scrubIds = (ids) => ids.filter((id) => validSourceIds.has(id))

  const defaultVideoQuery =
    lessonContext.lessonBrief?.videoSearchQuery ??
    lessonContext.videoSearchQuery ??
    `${lessonContext.title} explained`

  const lessonCore = {
    ...parsed.lessonCore,
    verifiedClaims: parsed.lessonCore.verifiedClaims.map((claim, idx) => ({
      ...claim,
      id: slugId('claim', String(lessonContext.lessonId), String(idx)),
      sourceIds: scrubIds(claim.sourceIds),
    })),
    sourceIds: scrubIds(parsed.lessonCore.sourceIds),
  }

  if (lessonCore.verifiedClaims.length < 2) {
    throw Object.assign(new Error('Lesson lacked sufficient sourced claims'), {
      code: 'LESSON_THIN',
    })
  }

  return {
    lessonCore,
    presentation: {
      ...parsed.presentation,
      format: 'narrative',
      videoSearchQuery: parsed.presentation.videoSearchQuery?.trim() || defaultVideoQuery,
    },
    sources: research.sourceRecords,
  }
}
