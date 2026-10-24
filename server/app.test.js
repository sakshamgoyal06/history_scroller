import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cacheControlFor, createAppServer } from './app.js'

let server
let baseUrl

beforeAll(async () => {
  const distDir = mkdtempSync(path.join(tmpdir(), 'curiosity-dist-'))
  mkdirSync(path.join(distDir, 'assets'))
  writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><title>shell</title>')
  writeFileSync(path.join(distDir, 'assets', 'app-abc123.js'), 'console.log(1)')
  server = createAppServer({ distDir })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterAll(() => new Promise((resolve) => server.close(resolve)))

describe('createAppServer', () => {
  it('answers the health check', async () => {
    const res = await fetch(`${baseUrl}/healthz`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ok')
  })

  it('serves built assets with long-lived caching and security headers', async () => {
    const res = await fetch(`${baseUrl}/assets/app-abc123.js`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/javascript')
    expect(res.headers.get('cache-control')).toContain('immutable')
    expect(res.headers.get('x-frame-options')).toBe('DENY')
  })

  it('falls back to the SPA shell for client routes but 404s missing files', async () => {
    const page = await fetch(`${baseUrl}/library/saved`)
    expect(page.status).toBe(200)
    expect(await page.text()).toContain('shell')
    expect((await fetch(`${baseUrl}/assets/missing.js`)).status).toBe(404)
  })

  it('does not serve files outside the build directory', async () => {
    const res = await fetch(`${baseUrl}/..%2fpackage.json`)
    expect(await res.text()).not.toContain('curiosity-feed')
  })

  it('routes /api to the handlers and never caches them', async () => {
    const res = await fetch(`${baseUrl}/api/plan-learning-path`)
    expect(res.status).toBe(405)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect((await fetch(`${baseUrl}/api/nope`, { method: 'POST' })).status).toBe(404)
  })
})

describe('cacheControlFor', () => {
  it('keeps the shell, service worker and remote content revalidating', () => {
    expect(cacheControlFor('index.html')).toBe('no-cache')
    expect(cacheControlFor('sw.js')).toBe('no-cache')
    expect(cacheControlFor('content/feed-index.json')).toBe('no-cache')
  })
})
