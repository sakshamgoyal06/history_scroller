import { z } from 'zod'

export const LEARN_LEVEL_ENUM = z.enum(['beginner', 'curious', 'deep'])
export const LEARN_SCOPE_ENUM = z.enum(['india', 'global', 'both'])
export const BUILD_MODE_ENUM = z.enum(['single_track', 'full_course'])
export const SCOPE_DECISION_ENUM = z.enum(['single_path', 'needs_narrowing', 'multi_track'])
export const INPUT_STATUS_ENUM = z.enum(['valid', 'needs_clarification', 'unsupported'])

export const PlanLearningPathRequestSchema = z.object({
  topic: z.string().trim().min(1).max(150),
  focus: z.string().trim().max(300).optional().default(''),
  level: LEARN_LEVEL_ENUM,
  geographicScope: LEARN_SCOPE_ENUM,
  requestedLength: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  buildMode: BUILD_MODE_ENUM.optional(),
  parentRequestId: z.string().max(64).optional(),
})

export const LessonBriefSchema = z.object({
  keyConcepts: z.array(z.string()).max(12),
  importantQuestions: z.array(z.string()).max(8),
  exampleToUse: z.string().max(500),
  misconceptionToAddress: z.string().max(500),
  sourceQueries: z.array(z.string()).max(8),
  videoSearchQuery: z.string().max(200),
})

export const PlannedLessonSchema = z.object({
  id: z.string().min(1).max(80),
  order: z.number().int().min(1).max(20),
  title: z.string().min(1).max(200),
  curiosityQuestion: z.string().min(1).max(300),
  objective: z.string().min(1).max(500),
  whyThisComesNow: z.string().min(1).max(500),
  prerequisites: z.array(z.string()).max(8),
  estimatedMinutes: z.number().int().min(2).max(45),
  lessonBrief: LessonBriefSchema,
})

export const PlannedTrackSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(800),
  order: z.number().int().min(1).max(10),
  estimatedMinutes: z.number().int().min(5).max(240),
  lessons: z.array(PlannedLessonSchema).min(3).max(5),
})

export const CoursePlanSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  overview: z.string().min(1).max(1200),
  level: LEARN_LEVEL_ENUM,
  geographicScope: LEARN_SCOPE_ENUM,
  estimatedMinutes: z.number().int().min(5).max(600),
  recommendedTrackId: z.string().min(1).max(80),
  tracks: z.array(PlannedTrackSchema).min(1).max(4),
})

export const ClarificationOptionSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  refinedTopic: z.string().min(1).max(150),
})

export const ClarificationSchema = z.object({
  question: z.string().min(1).max(300),
  options: z.array(ClarificationOptionSchema).min(3).max(5),
})

/** Model-facing plan (IDs may be placeholders; server rewrites). */
export const ModelPlanResponseSchema = z.object({
  inputStatus: INPUT_STATUS_ENUM,
  scopeDecision: SCOPE_DECISION_ENUM,
  normalizedTopic: z.string().min(1).max(150),
  interpretedGoal: z.string().min(1).max(400),
  scopeExplanation: z.string().min(1).max(1200),
  assumptions: z.array(z.string()).max(8),
  clarification: ClarificationSchema.nullable(),
  course: CoursePlanSchema.nullable(),
})

export const PlanLearningPathResponseSchema = z.object({
  schemaVersion: z.literal(1),
  requestId: z.string().min(1).max(64),
  inputStatus: INPUT_STATUS_ENUM,
  scopeDecision: SCOPE_DECISION_ENUM,
  normalizedTopic: z.string().min(1).max(150),
  interpretedGoal: z.string().min(1).max(400),
  scopeExplanation: z.string().min(1).max(1200),
  assumptions: z.array(z.string()).max(8),
  clarification: ClarificationSchema.nullable(),
  course: CoursePlanSchema.nullable(),
})

export const SourceRecordSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(300),
  url: z.string().url().max(2000),
  publisher: z.string().max(200).optional(),
  snippet: z.string().max(500).optional(),
})

export const VerifiedClaimSchema = z.object({
  id: z.string().min(1).max(80),
  text: z.string().min(1).max(800),
  sourceIds: z.array(z.string()).max(12),
})

export const LessonCoreSchema = z.object({
  question: z.string().min(1).max(300),
  learningObjectives: z.array(z.string()).min(1).max(8),
  keyTerms: z.array(z.string()).max(16),
  verifiedClaims: z.array(VerifiedClaimSchema).max(24),
  causalChain: z.array(z.string()).max(12),
  examples: z.array(z.string()).max(8),
  misconceptions: z.array(z.string()).max(8),
  uncertainties: z.array(z.string()).max(8),
  takeaway: z.string().min(1).max(600),
  sourceIds: z.array(z.string()).max(24),
})

export const LessonPresentationSchema = z.object({
  format: z.literal('narrative'),
  title: z.string().min(1).max(200),
  curiosityQuestion: z.string().min(1).max(300),
  deck: z.string().min(1).max(500),
  domain: z.string().min(1).max(80),
  readingMinutes: z.number().int().min(2).max(45),
  coldOpen: z.object({
    heading: z.string().max(120).optional(),
    body: z.string().min(1).max(1200),
  }),
  context: z
    .object({
      heading: z.string().max(120).optional(),
      body: z.string().min(1).max(1200),
    })
    .optional(),
  centralQuestion: z.string().max(400).optional(),
  storyBeats: z
    .array(
      z.object({
        heading: z.string().min(1).max(200),
        body: z.string().min(80).max(2000),
        type: z.enum(['scene', 'explanation', 'turning-point']),
      }),
    )
    .min(5)
    .max(12),
  complication: z
    .object({
      heading: z.string().max(120).optional(),
      body: z.string().min(1).max(1200),
    })
    .optional(),
  takeaway: z.string().min(1).max(600),
  videoSearchQuery: z.string().max(200).optional(),
})

export const GenerateLessonRequestSchema = z.object({
  pathId: z.string().min(1).max(80),
  trackId: z.string().min(1).max(80),
  lessonId: z.string().min(1).max(80),
  courseTitle: z.string().min(1).max(200),
  level: LEARN_LEVEL_ENUM,
  geographicScope: LEARN_SCOPE_ENUM,
  trackTitle: z.string().min(1).max(200),
  lesson: PlannedLessonSchema,
  priorLessonTitles: z.array(z.string()).max(8).optional().default([]),
})

export const GenerateLessonResponseSchema = z.object({
  schemaVersion: z.literal(1),
  requestId: z.string().min(1).max(64),
  pathId: z.string().min(1).max(80),
  trackId: z.string().min(1).max(80),
  lessonId: z.string().min(1).max(80),
  sources: z.array(SourceRecordSchema).max(20),
  lessonCore: LessonCoreSchema,
  presentation: LessonPresentationSchema,
})

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  requestId: z.string().optional(),
  retryable: z.boolean().optional(),
})
