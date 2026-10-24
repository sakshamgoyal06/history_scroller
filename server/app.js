import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import lessonHandler from '../api/generate-lesson.js'
import planHandler from '../api/plan-learning-path.js'

/** One entry per endpoint. Handlers keep the (req, res) shape over plain Node objects. */
export const API_ROUTES = {
  '/api/plan-learning-path': planHandler,
  '/api/generate-lesson': lessonHandler,
}

// Lessons may take up to the 280 s budget in generate-lesson.js. Node's default requestTimeout
// (300 s) would race it, so give requests a little headroom past the client's 300 s timeout.
export const REQUEST_TIMEOUT_MS = 330_000

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * HTTP server for the API, plus the built SPA when `distDir` is set (production).
 * @param {{ distDir?: string, cors?: boolean }} [options]
 */
export function createAppServer({ distDir, cors = false } = {}) {
  const server = http.createServer((req, res) => {
    handleRequest(req, res, { distDir, cors }).catch((e) => {
      console.error('[server]', e)
      if (!res.headersSent) sendError(res, 500, 'Internal error', 'INTERNAL')
      else res.destroy()
    })
  })
  server.requestTimeout = REQUEST_TIMEOUT_MS
  return server
}

async function handleRequest(req, res, { distDir, cors }) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(key, value)
  if (cors) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  const pathname = parsePathname(req.url)
  if (pathname === null) {
    sendError(res, 400, 'Bad request', 'BAD_REQUEST')
    return
  }

  if (pathname === '/healthz') {
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('ok')
    return
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store')
    if (cors && req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }
    const handler = API_ROUTES[pathname]
    if (!handler) {
      sendError(res, 404, 'Not found', 'NOT_FOUND')
      return
    }
    req.url = pathname
    await handler(req, res)
    return
  }

  if (!distDir) {
    sendError(res, 404, 'Not found', 'NOT_FOUND')
    return
  }
  await serveStatic(req, res, distDir, pathname)
}

async function serveStatic(req, res, distDir, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED')
    return
  }

  const root = path.resolve(distDir)
  const candidate = path.resolve(root, `.${pathname}`)
  // Anything that escapes the build directory falls through to the SPA shell.
  const insideRoot = candidate === root || candidate.startsWith(root + path.sep)
  let filePath = insideRoot ? await fileOrNull(candidate) : null
  if (!filePath && insideRoot) filePath = await fileOrNull(path.join(candidate, 'index.html'))

  if (!filePath) {
    // SPA fallback (client routes are hash-based, but deep links still land on the shell).
    // Missing assets are a real 404 so a stale cached page doesn't parse index.html as JS.
    if (path.extname(pathname)) {
      sendError(res, 404, 'Not found', 'NOT_FOUND')
      return
    }
    filePath = path.join(root, 'index.html')
  }

  const ext = path.extname(filePath).toLowerCase()
  res.statusCode = 200
  res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream')
  res.setHeader('Cache-Control', cacheControlFor(path.relative(root, filePath)))
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(filePath)
    .on('error', () => res.destroy())
    .pipe(res)
}

/** Hashed build assets are immutable; the shell, service worker and manifest must revalidate. */
export function cacheControlFor(relativePath) {
  const normalized = relativePath.split(path.sep).join('/')
  if (normalized.startsWith('assets/')) return 'public, max-age=31536000, immutable'
  if (normalized.startsWith('content/')) return 'no-cache'
  if (/\.(png|jpe?g|webp|svg|ico|woff2|mp4|webm)$/i.test(normalized)) return 'public, max-age=86400'
  return 'no-cache'
}

async function fileOrNull(filePath) {
  try {
    const info = await stat(filePath)
    return info.isFile() ? filePath : null
  } catch {
    return null
  }
}

function parsePathname(rawUrl) {
  try {
    return decodeURIComponent(new URL(rawUrl ?? '/', 'http://localhost').pathname)
  } catch {
    return null
  }
}

function sendError(res, status, message, code) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({ error: message, code }))
}
