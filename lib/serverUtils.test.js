import { Readable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkThrottle, getClientKey, readJsonBody, resetThrottle, slugId, withTimeout } from './serverUtils.js'

describe('slugId', () => {
  it('slugifies short input', () => {
    expect(slugId('lesson', 'Hello World!', '1')).toBe('lesson-hello-world-1')
  })

  it('hashes long input and stays within schema limits', () => {
    const a = slugId('lesson', 'x'.repeat(200), 'a')
    const b = slugId('lesson', 'x'.repeat(200), 'b')
    expect(a.length).toBeLessThanOrEqual(80)
    expect(a).not.toBe(b)
  })

  it('falls back when nothing is slug-safe', () => {
    expect(slugId('src', '—')).toBe('src-item')
  })
})

describe('getClientKey', () => {
  it('prefers platform-set headers over X-Forwarded-For', () => {
    const req = { headers: { 'x-forwarded-for': 'spoofed, 1.1.1.1', 'x-real-ip': '2.2.2.2' } }
    expect(getClientKey(req)).toBe('2.2.2.2')
  })

  it('falls back to X-Forwarded-For, then the socket', () => {
    expect(getClientKey({ headers: { 'x-forwarded-for': '3.3.3.3, 4.4.4.4' } })).toBe('3.3.3.3')
    expect(getClientKey({ headers: {}, socket: { remoteAddress: '5.5.5.5' } })).toBe('5.5.5.5')
  })
})

describe('checkThrottle', () => {
  beforeEach(() => {
    resetThrottle()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('allows 12 requests per minute per client, then resets', () => {
    for (let i = 0; i < 12; i += 1) expect(checkThrottle('c')).toBe(true)
    expect(checkThrottle('c')).toBe(false)
    expect(checkThrottle('other')).toBe(true)
    vi.advanceTimersByTime(60_001)
    expect(checkThrottle('c')).toBe(true)
  })
})

describe('readJsonBody', () => {
  const reqFrom = (text) => Readable.from([Buffer.from(text)])

  it('parses JSON and treats an empty body as {}', async () => {
    await expect(readJsonBody(reqFrom('{"a":1}'))).resolves.toEqual({ a: 1 })
    await expect(readJsonBody(reqFrom('  '))).resolves.toEqual({})
  })

  it('rejects invalid and oversized bodies', async () => {
    await expect(readJsonBody(reqFrom('{nope'))).rejects.toMatchObject({ code: 'INVALID_JSON' })
    await expect(readJsonBody(reqFrom('x'.repeat(40_000)))).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' })
  })
})

describe('withTimeout', () => {
  it('rejects with TIMEOUT and aborts the signal', async () => {
    let seen
    const run = (signal) => {
      seen = signal
      return new Promise(() => {})
    }
    await expect(withTimeout(run, 10, 'Thing')).rejects.toMatchObject({ code: 'TIMEOUT' })
    expect(seen.aborted).toBe(true)
  })

  it('resolves when the work finishes first', async () => {
    await expect(withTimeout(async () => 42, 1_000, 'Thing')).resolves.toBe(42)
  })
})
