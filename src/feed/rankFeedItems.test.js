import { describe, expect, it } from 'vitest'
import { PROTOTYPE_FEED_ITEMS } from './prototypeFeedItems.js'
import { addNotInterested } from './feedStorage.js'
import { rankFeedItems } from './rankFeedItems.js'

const rank = (overrides = {}) =>
  rankFeedItems({
    items: PROTOTYPE_FEED_ITEMS,
    savedCardIds: new Set(),
    knownCardIds: new Set(),
    recentViewPenalty: new Map(),
    dateKey: '2026-10-24',
    ...overrides,
  })

describe('rankFeedItems', () => {
  it('returns every item exactly once, without internal score fields', () => {
    const out = rank()
    expect(out.map((i) => i.id).sort()).toEqual(PROTOTYPE_FEED_ITEMS.map((i) => i.id).sort())
    expect(out.some((i) => '_rankScore' in i)).toBe(false)
  })

  it('is deterministic for the same day and signals', () => {
    expect(rank().map((i) => i.id)).toEqual(rank().map((i) => i.id))
  })

  it('drops items marked not interested', () => {
    const hidden = PROTOTYPE_FEED_ITEMS[0].id
    addNotInterested(hidden)
    expect(rank().map((i) => i.id)).not.toContain(hidden)
  })

  it('avoids three of the same domain in a row when alternatives exist', () => {
    const out = rank()
    for (let i = 2; i < out.length; i += 1) {
      const run = new Set([out[i - 2].domain, out[i - 1].domain, out[i].domain])
      const remaining = new Set(out.slice(i).map((x) => x.domain))
      if (remaining.size > 1) expect(run.size, `position ${i}`).toBeGreaterThan(1)
    }
  })

  it('interleaves drip inserts', () => {
    const drip = { ...PROTOTYPE_FEED_ITEMS[0], id: 'drip-1' }
    const out = rank({ dripInserts: [drip] })
    expect(out.map((i) => i.id)).toContain('drip-1')
  })
})
