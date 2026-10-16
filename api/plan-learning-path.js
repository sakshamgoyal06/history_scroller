import {
  PlanLearningPathRequestSchema,
  PlanLearningPathResponseSchema,
} from '../lib/learningPathSchemas.js'
import { runLearningPathPlanner } from '../lib/openaiPlanner.js'
import { assignStablePlanIds } from '../lib/planIds.js'
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

const PLAN_TIMEOUT_MS = 120_000

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

  const parsed = PlanLearningPathRequestSchema.safeParse(body)
  if (!parsed.success) {
    const err = safeApiError({
      message: 'Invalid planning request. Check topic, level, scope, and length.',
      code: 'VALIDATION_ERROR',
      requestId,
      status: 400,
    })
    sendJson(res, err.status, err.body)
    return
  }

  const input = parsed.data
  console.info('[plan-learning-path]', requestId, {
    topic: input.topic.slice(0, 80),
    level: input.level,
    scope: input.geographicScope,
    length: input.requestedLength,
  })

  try {
    const modelPlan = await withTimeout(
      (signal) =>
        runLearningPathPlanner({
          apiKey: config.apiKey,
          model: config.model,
          signal,
          input: {
            topic: input.topic,
            focus: input.focus,
            level: input.level,
            geographicScope: input.geographicScope,
            requestedLength: input.requestedLength,
            buildMode: input.buildMode ?? 'single_track',
          },
        }),
      PLAN_TIMEOUT_MS,
      'Planning',
    )

    const withIds = assignStablePlanIds(modelPlan, { requestId })

    if (withIds.scopeDecision === 'needs_narrowing' && !withIds.clarification) {
      withIds.inputStatus = 'needs_clarification'
    }

    if (withIds.scopeDecision === 'single_path' && withIds.course?.tracks?.length !== 1) {
      throw Object.assign(new Error('Invalid single_path plan'), { code: 'PLAN_SHAPE' })
    }

    if (withIds.scopeDecision === 'multi_track' && (withIds.course?.tracks?.length ?? 0) < 2) {
      throw Object.assign(new Error('Invalid multi_track plan'), { code: 'PLAN_SHAPE' })
    }

    const response = PlanLearningPathResponseSchema.parse({
      schemaVersion: 1,
      requestId,
      ...withIds,
    })

    sendJson(res, 200, response)
  } catch (e) {
    console.error('[plan-learning-path]', requestId, e?.message ?? e)
    const retryable = e?.code === 'TIMEOUT' || e?.status === 429
    const err = safeApiError({
      message: retryable
        ? 'Planning took too long or the service is busy. Try again.'
        : 'Could not plan this topic right now. Try again or narrow your topic.',
      code: e?.code ?? 'PLAN_FAILED',
      requestId,
      retryable,
      status: retryable ? 503 : 500,
    })
    sendJson(res, err.status, err.body)
  }
}
