import { createHash, randomBytes } from 'crypto'

const MAX_BODY_BYTES = 32_768

/** @type {Map<string, number[]>} */
const throttleBuckets = new Map()

const THROTTLE_WINDOW_MS = 60_000
const THROTTLE_MAX_PER_WINDOW = 12

export function createRequestId() {
  return randomBytes(8).toString('hex')
}

export function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

/**
 * Best-effort in-memory throttling (not production-grade).
 * @returns {boolean} true if allowed
 */
export function checkThrottle(clientKey) {
  const now = Date.now()
  const bucket = throttleBuckets.get(clientKey) ?? []
  const recent = bucket.filter((t) => now - t < THROTTLE_WINDOW_MS)
  if (recent.length >= THROTTLE_MAX_PER_WINDOW) {
    throttleBuckets.set(clientKey, recent)
    return false
  }
  recent.push(now)
  throttleBuckets.set(clientKey, recent)
  return true
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let total = 0
    req.on('data', (chunk) => {
      total += chunk.length
      if (total > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { code: 'PAYLOAD_TOO_LARGE' }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        if (!raw.trim()) {
          resolve({})
          return
        }
        resolve(JSON.parse(raw))
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { code: 'INVALID_JSON' }))
      }
    })
    req.on('error', reject)
  })
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export function safeApiError({ message, code, requestId, retryable = false, status = 500 }) {
  return {
    status,
    body: {
      error: message,
      code,
      requestId,
      retryable,
    },
  }
}

export function requireOpenAiConfig(requestId) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL
  if (!apiKey || !model) {
    return {
      ok: false,
      error: safeApiError({
        message: 'Learning planner is not configured on this deployment.',
        code: 'MISSING_CONFIGURATION',
        requestId,
        retryable: false,
        status: 503,
      }),
    }
  }
  return { ok: true, apiKey, model }
}

export function withTimeout(promise, ms, label) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return Promise.race([
    promise(controller.signal),
    new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject(Object.assign(new Error(`${label} timed out`), { code: 'TIMEOUT' }))
      })
    }),
  ]).finally(() => clearTimeout(timer))
}

const SLUG_BASE_MAX = 48

export function slugId(prefix, ...parts) {
  const joined = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!joined) {
    return `${prefix}-item`
  }

  if (joined.length <= SLUG_BASE_MAX) {
    return `${prefix}-${joined}`
  }

  const hash = createHash('sha256').update(joined).digest('hex').slice(0, 8)
  const headLen = SLUG_BASE_MAX - hash.length - 1
  const base = `${joined.slice(0, headLen)}-${hash}`
  return `${prefix}-${base}`
}
