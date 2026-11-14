import { describe, expect, it } from 'vitest'
import {
  CA_PER_INTERESTING,
  buildUpscFeed,
  gsCounts,
  latestEditionDate,
  missingUpscFields,
  splitHighlights,
} from './upscFeed.js'
import { SAMPLE_EDITION_DATE, UPSC_EXPLAINERS, UPSC_SAMPLE_POSTS } from './upscContent.js'

const day = '2026-11-14'
const ca = (id, gs = 'GS2', extra = {}) => ({
  id,
  kind: 'current-affairs',
  dateKey: day,
  gs,
  gsArea: 'x',
  head: `Head ${id}`,
  what: 'w',
  background: 'b',
  facts: ['f'],
  why: 'y',
  sources: [{ publisher: 'p', title: 't' }],
  minutes: 2,
  ...extra,
})
const fun = (id, gs = 'GS1') => ({
  id,
  kind: 'interesting',
  dateKey: day,
  gs,
  gsArea: 'x',
  head: `Fun ${id}`,
  body: ['b'],
  sources: [{ publisher: 'p', title: 't' }],
  minutes: 1,
})

describe('missingUpscFields (FR-UPSC-02)', () => {
  it('accepts a complete post', () => {
    expect(missingUpscFields(ca('a'))).toEqual([])
  })
  it('names every missing field', () => {
    expect(missingUpscFields(ca('a', 'GS9', { what: '', facts: [], sources: [] }))).toEqual(['gs', 'sources', 'what', 'facts'])
  })
  it('every sample post and explainer is complete and sourced', () => {
    for (const p of UPSC_SAMPLE_POSTS) expect(missingUpscFields(p), p.id).toEqual([])
    for (const e of Object.values(UPSC_EXPLAINERS)) expect(e.sources.length, e.id).toBeGreaterThan(0)
  })
})

describe('buildUpscFeed (FR-UPSC-01)', () => {
  it('puts current affairs first and keeps interesting cards to about 20%', () => {
    const posts = [fun('f1'), fun('f2'), fun('f3'), ...Array.from({ length: 8 }, (_, i) => ca(`c${i}`))]
    const feed = buildUpscFeed(posts, { dateKey: day })
    const extras = feed.filter((p) => p.kind === 'interesting')
    expect(extras).toHaveLength(8 / CA_PER_INTERESTING)
    expect(feed[0].kind).toBe('current-affairs')
    expect(feed[CA_PER_INTERESTING].kind).toBe('interesting')
    expect(extras.length / feed.length).toBeLessThanOrEqual(0.2)
  })

  it('drops unpublishable posts and other days', () => {
    const posts = [ca('ok'), ca('bad', 'GS2', { why: '' }), ca('old', 'GS2', { dateKey: '2026-11-13' })]
    expect(buildUpscFeed(posts, { dateKey: day }).map((p) => p.id)).toEqual(['ok'])
  })

  it('filters by GS paper', () => {
    const posts = [ca('a', 'GS2'), ca('b', 'GS3'), fun('f', 'GS3')]
    expect(buildUpscFeed(posts, { dateKey: day, gs: 'GS3' }).map((p) => p.id)).toEqual(['b', 'f'])
    expect(buildUpscFeed(posts, { dateKey: day, gs: 'GS4' })).toEqual([])
  })

  it('shows no interesting card on a day without current affairs', () => {
    expect(buildUpscFeed([fun('f')], { dateKey: day })).toEqual([])
  })

  it('builds the sample edition with one interesting card at the end', () => {
    const feed = buildUpscFeed(UPSC_SAMPLE_POSTS, { dateKey: SAMPLE_EDITION_DATE })
    expect(feed).toHaveLength(5)
    expect(feed.at(-1).kind).toBe('interesting')
  })
})

describe('helpers', () => {
  it('counts current affairs per paper', () => {
    expect(gsCounts([ca('a', 'GS2'), ca('b', 'GS3'), fun('f')], day)).toEqual({ All: 2, GS1: 0, GS2: 1, GS3: 1, GS4: 0 })
  })
  it('finds the latest edition on or before a date', () => {
    const posts = [ca('a', 'GS2', { dateKey: '2026-11-12' }), ca('b', 'GS2', { dateKey: '2026-11-14' })]
    expect(latestEditionDate(posts, '2026-11-13')).toBe('2026-11-12')
    expect(latestEditionDate(posts, '2026-11-20')).toBe('2026-11-14')
    expect(latestEditionDate(posts, '2026-11-01')).toBeNull()
  })
  it('splits highlight markers', () => {
    expect(splitHighlights('Set under ==Section 45ZB== now')).toEqual([
      { text: 'Set under ', mark: false },
      { text: 'Section 45ZB', mark: true },
      { text: ' now', mark: false },
    ])
  })
})
