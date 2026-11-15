/**
 * UPSC feed assembly (FR-UPSC-01, FR-UPSC-02, FR-UPSC-05).
 */

export const GS_PAPERS = /** @type {const} */ (['GS1', 'GS2', 'GS3', 'GS4'])
export const POST_STEPS = /** @type {const} */ (['What happened', 'Background', 'Key facts', 'Why it matters'])

/** Revision cards due today come after the news and never outnumber it (FR-UPSC-01). */
export const MAX_REVISION_CARDS = 3

/**
 * Fields a current-affairs post must have before it can publish (FR-UPSC-02).
 * @param {import('./upscContent.js').UpscPost} post
 * @returns {string[]} missing field names; empty when publishable
 */
export function missingUpscFields(post) {
  const missing = []
  if (!post?.head?.trim()) missing.push('head')
  if (!GS_PAPERS.includes(/** @type {any} */ (post?.gs))) missing.push('gs')
  if (!post?.sources?.length) missing.push('sources')
  if (!post?.what?.trim()) missing.push('what')
  if (!post?.background?.trim()) missing.push('background')
  if (!post?.facts?.length) missing.push('facts')
  if (!post?.why?.trim()) missing.push('why')
  return missing
}

/**
 * Latest edition date on or before `dateKey` that has content.
 * @param {import('./upscContent.js').UpscPost[]} posts
 * @param {string} dateKey
 */
export function latestEditionDate(posts, dateKey) {
  const dates = [...new Set(posts.map((p) => p.dateKey))].filter((d) => d <= dateKey).sort()
  return dates.length ? dates[dates.length - 1] : null
}

/**
 * Builds one day's UPSC feed: that day's publishable national and international current-affairs posts,
 * narrowed by GS paper when a filter is set (FR-UPSC-01, FR-UPSC-05).
 * @param {import('./upscContent.js').UpscPost[]} posts
 * @param {{ dateKey: string, gs?: string }} options
 */
export function buildUpscFeed(posts, { dateKey, gs = 'All' }) {
  return posts.filter(
    (p) => p.dateKey === dateKey && p.kind === 'current-affairs' && missingUpscFields(p).length === 0 && (gs === 'All' || p.gs === gs),
  )
}

/**
 * How many due revision cards to show after the news: at most MAX_REVISION_CARDS and never more than
 * the number of news posts (FR-UPSC-01). None when a GS filter is on or there is no news.
 * @param {number} newsCount
 * @param {number} dueCount
 * @param {string} gs
 */
export function revisionSlots(newsCount, dueCount, gs = 'All') {
  if (gs !== 'All' || newsCount === 0) return 0
  return Math.min(MAX_REVISION_CARDS, newsCount, dueCount)
}

/**
 * Counts of a day's publishable current-affairs posts per GS paper (for the filter bar and the
 * "caught up" tally).
 * @param {import('./upscContent.js').UpscPost[]} posts
 * @param {string} dateKey
 */
export function gsCounts(posts, dateKey) {
  /** @type {Record<string, number>} */
  const counts = { All: 0, GS1: 0, GS2: 0, GS3: 0, GS4: 0 }
  for (const p of posts) {
    if (p.dateKey !== dateKey || p.kind !== 'current-affairs' || missingUpscFields(p).length) continue
    counts.All += 1
    counts[p.gs] += 1
  }
  return counts
}

/**
 * Splits "==highlighted== text" into segments for rendering.
 * @param {string} text
 * @returns {{ text: string, mark: boolean }[]}
 */
export function splitHighlights(text) {
  const parts = String(text ?? '').split('==')
  return parts.map((t, i) => ({ text: t, mark: i % 2 === 1 })).filter((s) => s.text.length > 0)
}
