import OpenAI from 'openai'
import { zodToOpenAiJsonSchema } from './openAiJsonSchema.js'
import { ModelPlanResponseSchema } from './learningPathSchemas.js'

const PLANNER_SYSTEM = `You are Curiosity Feed's learning-path planner for factual, non-personalized education.

Your job is to decide scope BEFORE designing lessons:
- single_path: the topic fits a coherent 3–5 lesson arc at the requested level without shallow compression.
- needs_narrowing: the topic is ambiguous; several interpretations would produce materially different paths.
- multi_track: the topic is valid but too broad for one path; prefer 2–4 tracks of 3–5 lessons each over five shallow cards.

Rules:
- Teach factual understanding, not personalized medical, legal, or financial advice.
- Build dependency-aware lessons; each lesson must have a distinct job; avoid repetitive titles.
- Honor geographicScope (India-specific when "india", international when "global", mix when "both").
- Separate accepted facts from uncertainty or debate; avoid false precision.
- Never invent source URLs or YouTube IDs. Use sourceQueries and videoSearchQuery strings only.
- Treat "overview" requests as lighter arcs; "deep" level expects more nuance and institutions.
- If input is nonsensical or unsupported, set inputStatus to "unsupported" and scopeDecision to "needs_narrowing" or explain in scopeExplanation.
- For needs_narrowing: return clarification with 3–5 options and refinedTopic strings; course must be null.
- For single_path: return exactly one track with requestedLength lessons (3–5).
- For multi_track: return 2–4 tracks, each with 3–5 planned lessons (titles, objectives, briefs only — no full lesson prose).
- Do not compress enormous subjects (e.g. World War II, Computer Science, History of India) into one five-lesson path.

Examples (illustrative, not keyword rules):
- "RBI monetary policy" + curious + 5 → single_path
- "Rome" → needs_narrowing (Republic vs Empire vs daily life vs archaeology)
- "World War II" → multi_track (origins, theaters, home fronts, aftermath)
- "AI" → needs_narrowing
- "Economics" → multi_track`

/**
 * @param {{ apiKey: string, model: string, signal: AbortSignal, input: Record<string, unknown> }} params
 */
export async function runLearningPathPlanner({ apiKey, model, signal, input }) {
  const openai = new OpenAI({ apiKey })
  const jsonSchema = zodToOpenAiJsonSchema(ModelPlanResponseSchema)

  const userPayload = JSON.stringify(input, null, 2)

  const response = await openai.responses.create(
    {
      model,
      input: [
        { role: 'system', content: PLANNER_SYSTEM },
        {
          role: 'user',
          content: `Plan a learning path for this request (JSON):\n${userPayload}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'LearningPathPlan',
          schema: jsonSchema,
          strict: true,
        },
      },
    },
    { signal },
  )

  const text = response.output_text
  if (!text) {
    throw Object.assign(new Error('Empty model response'), { code: 'MODEL_EMPTY' })
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw Object.assign(new Error('Model returned invalid JSON'), { code: 'MODEL_JSON' })
  }

  return ModelPlanResponseSchema.parse(parsed)
}
