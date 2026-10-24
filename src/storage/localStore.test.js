import { afterEach, describe, expect, it, vi } from 'vitest'
import { SESSION_KEYS, STORAGE_KEYS, readJson, readText, removeKey, writeJson } from './localStore.js'

describe('storage keys', () => {
  // These strings are on users' devices. Changing one orphans their data unless a migration ships with it.
  it('keeps every persisted key value stable', () => {
    expect(STORAGE_KEYS).toMatchInlineSnapshot(`
      {
        "activePath": "curiosity-feed-active-path-v1",
        "completed": "curiosity-feed-completed-v1",
        "dailyEditionProgress": "history-feed-daily-edition-progress",
        "detailMode": "curiosity-feed-detail-mode-v1",
        "domainPreferences": "curiosity-feed-domain-preferences-v1",
        "explored": "curiosity-feed-explored-v1",
        "known": "history-feed-known",
        "learningPaths": "curiosity-feed-learning-paths-v1",
        "liked": "curiosity-feed-liked-v1",
        "notInterested": "curiosity-feed-not-interested-v1",
        "pathDrip": "curiosity-feed-path-drip-v1",
        "recentlyViewed": "curiosity-feed-recently-viewed-v1",
        "remoteFeedCache": "curiosity-feed-remote-cache-v1",
        "saved": "history-feed-saved",
        "zoneDrip": "curiosity-feed-zone-drip-v1",
        "zoneProgress": "curiosity-feed-zone-progress-v1",
      }
    `)
    expect(Object.values(SESSION_KEYS)).toHaveLength(4)
  })

  it('has no duplicate key values', () => {
    const values = [...Object.values(STORAGE_KEYS), ...Object.values(SESSION_KEYS)]
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('readJson / writeJson', () => {
  afterEach(() => vi.restoreAllMocks())

  it('round-trips values and falls back on missing or corrupt data', () => {
    expect(readJson('k', 'fallback')).toBe('fallback')
    expect(writeJson('k', { a: 1 })).toBe(true)
    expect(readJson('k', null)).toEqual({ a: 1 })
    localStorage.setItem('k', '{broken')
    expect(readJson('k', 'fallback')).toBe('fallback')
    removeKey('k')
    expect(readText('k')).toBeNull()
  })

  it('reports a failed write instead of throwing (quota exceeded)', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(writeJson('k', 'v')).toBe(false)
  })

  it('degrades gracefully when storage is unavailable', () => {
    vi.spyOn(globalThis, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readJson('k', 'fallback', 'session')).toBe('fallback')
    expect(writeJson('k', 'v', 'session')).toBe(false)
  })
})
