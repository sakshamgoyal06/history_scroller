import {
  GenerateLessonRequestSchema,
  GenerateLessonResponseSchema,
} from '../lib/learningPathSchemas.js'
import { runLessonResearch, runLessonStructured } from '../lib/openaiLesson.js'
import {
  checkThrottle,
  createRequestId,
  getClientKey,
  readJsonBody,
  requireOpenAiConfig,
  safeApiError,
  sendJson,
  withTimeout,
} from '../lib/serverUtils.js'

const LESSON_TIMEOUT_MS = 180_000

export default async function handler(req, res) {
  const requestId = createRequestId()

  if (req.method !== 'POST') {
    const err = safeApiError({
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      requestId,
      status: 405,
    })
    sendJson(res, err.status, err.body)
    return
  }

  const clientKey = getClientKey(req)
  if (!checkThrottle(clientKey)) {
    const err = safeApiError({
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
      requestId,
      retryable: true,
      status: 429,
    })
    sendJson(res, err.status, err.body)
    return
  }

  const config = requireOpenAiConfig(requestId)
  if (!config.ok) {
    sendJson(res, config.error.status, config.error.body)
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (e) {
    const code = e.code === 'PAYLOAD_TOO_LARGE' ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON'
    const message =
      code === 'PAYLOAD_TOO_LARGE' ? 'Request body is too large.' : 'Request body must be valid JSON.'
    const err = safeApiError({ message, code, requestId, status: 400 })
    sendJson(res, err.status, err.body)
    return
  }

  const parsed = GenerateLessonRequestSchema.safeParse(body)
  if (!parsed.success) {
    const err = safeApiError({
      message: 'Invalid lesson generation request.',
      code: 'VALIDATION_ERROR',
      requestId,
      status: 400,
    })
    sendJson(res, err.status, err.body)
    return
  }

  const payload = parsed.data
  const lessonContext = {
    pathId: payload.pathId,
    trackId: payload.trackId,
    lessonId: payload.lessonId,
    courseTitle: payload.courseTitle,
    trackTitle: payload.trackTitle,
    level: payload.level,
    geographicScope: payload.geographicScope,
    priorLessonTitles: payload.priorLessonTitles,
    title: payload.lesson.title,
    objective: payload.lesson.objective,
    curiosityQuestion: payload.lesson.curiosityQuestion,
    whyThisComesNow: payload.lesson.whyThisComesNow,
    lessonBrief: payload.lesson.lessonBrief,
    videoSearchQuery: payload.lesson.lessonBrief.videoSearchQuery,
  }

  console.info('[generate-lesson]', requestId, {
    pathId: payload.pathId,
    lessonId: payload.lessonId,
    title: payload.lesson.title.slice(0, 80),
  })

  try {
    const research = await withTimeout(
      (signal) =>
        runLessonResearch({
          apiKey: config.apiKey,
          model: config.model,
          signal,
          lessonContext,
        }),
      LESSON_TIMEOUT_MS,
      'Lesson research',
    )

    const structured = await withTimeout(
      (signal) =>
        runLessonStructured({
          apiKey: config.apiKey,
          model: config.model,
          signal,
          lessonContext,
          research,
        }),
      LESSON_TIMEOUT_MS,
      'Lesson writing',
    )

    const response = GenerateLessonResponseSchema.parse({
      schemaVersion: 1,
      requestId,
      pathId: payload.pathId,
      trackId: payload.trackId,
      lessonId: payload.lessonId,
      sources: structured.sources,
      lessonCore: structured.lessonCore,
      presentation: structured.presentation,
    })

    sendJson(res, 200, response)
  } catch (e) {
    console.error('[generate-lesson]', requestId, e?.message ?? e)
    const retryable =
      e?.code === 'TIMEOUT' ||
      e?.status === 429 ||
      e?.code === 'LESSON_NO_SOURCES' ||
      e?.code === 'LESSON_THIN'
    const err = safeApiError({
      message:
        e?.code === 'LESSON_NO_SOURCES'
          ? 'Web search did not return usable sources. Try again in a moment.'
          : e?.code === 'LESSON_THIN'
            ? 'The lesson draft was too thin. Retry to regenerate with more detail.'
            : retryable
              ? 'Lesson generation timed out or the service is busy. Try again.'
              : 'Could not generate this lesson right now.',
      code: e?.code ?? 'LESSON_FAILED',
      requestId,
      retryable,
      status: retryable ? 503 : 500,
    })
    sendJson(res, err.status, err.body)
  }
}
