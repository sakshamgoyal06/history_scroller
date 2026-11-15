import { describe, expect, it } from 'vitest'
import {
  buildUpscFeed,
  gsCounts,
  latestEditionDate,
  missingUpscFields,
  revisionSlots,
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

describe('buildUpscFeed (FR-UPSC-01, 05)', () => {
  it('keeps today’s publishable posts in order', () => {
    const posts = [ca('a'), ca('bad', 'GS2', { why: '' }), ca('old', 'GS2', { dateKey: '2026-11-13' }), ca('b', 'GS3')]
    expect(buildUpscFeed(posts, { dateKey: day }).map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('filters by GS paper', () => {
    const posts = [ca('a', 'GS2'), ca('b', 'GS3')]
    expect(buildUpscFeed(posts, { dateKey: day, gs: 'GS3' }).map((p) => p.id)).toEqual(['b'])
    expect(buildUpscFeed(posts, { dateKey: day, gs: 'GS4' })).toEqual([])
  })

  it('builds the sample edition with national and international news', () => {
    const feed = buildUpscFeed(UPSC_SAMPLE_POSTS, { dateKey: SAMPLE_EDITION_DATE })
    expect(feed).toHaveLength(5)
    expect(feed.some((p) => p.gsArea === 'International relations')).toBe(true)
  })
})

describe('revisionSlots (FR-UPSC-01)', () => {
  it('shows up to three due cards after the news', () => {
    expect(revisionSlots(5, 6)).toBe(3)
    expect(revisionSlots(5, 2)).toBe(2)
  })
  it('never lets revision outnumber news', () => {
    expect(revisionSlots(1, 3)).toBe(1)
    expect(revisionSlots(0, 3)).toBe(0)
  })
  it('hides revision while a GS filter is on', () => {
    expect(revisionSlots(5, 3, 'GS2')).toBe(0)
  })
})

describe('helpers', () => {
  it('counts current affairs per paper', () => {
    expect(gsCounts([ca('a', 'GS2'), ca('b', 'GS3')], day)).toEqual({ All: 2, GS1: 0, GS2: 1, GS3: 1, GS4: 0 })
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
