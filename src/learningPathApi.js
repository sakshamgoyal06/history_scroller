const DEFAULT_TIMEOUT_MS = 120_000

/**
 * @param {string} path
 * @param {unknown} body
 * @param {{ signal?: AbortSignal, timeoutMs?: number }} [options]
 */
async function postJson(path, body, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data?.error ?? 'Request failed',
        code: data?.code ?? 'REQUEST_FAILED',
        requestId: data?.requestId,
        retryable: Boolean(data?.retryable),
      }
    }
    return { ok: true, data }
  } catch (e) {
    const aborted = e?.name === 'AbortError'
    return {
      ok: false,
      status: aborted ? 408 : 0,
      error: aborted ? 'Request timed out. Try again.' : 'Network error. Check your connection.',
      code: aborted ? 'TIMEOUT' : 'NETWORK',
      retryable: true,
    }
  } finally {
    clearTimeout(timer)
  }
}

export function planLearningPath(payload, options) {
  return postJson('/api/plan-learning-path', payload, options)
}

export function generateLesson(payload, options) {
  return postJson('/api/generate-lesson', payload, { ...options, timeoutMs: 180_000 })
}

export function isForceMockMode() {
  return import.meta.env.VITE_LEARN_FORCE_MOCK === 'true'
}

export function isMissingConfigError(result) {
  return !result.ok && result.code === 'MISSING_CONFIGURATION'
}
