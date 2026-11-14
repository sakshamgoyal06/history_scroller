/**
 * UPSC feed assembly (FR-UPSC-01, FR-UPSC-02, FR-UPSC-05).
 */

export const GS_PAPERS = /** @type {const} */ (['GS1', 'GS2', 'GS3', 'GS4'])
export const POST_STEPS = /** @type {const} */ (['What happened', 'Background', 'Key facts', 'Why it matters'])

/** At most one "interesting" card per this many current-affairs posts (~80/20 mix). */
export const CA_PER_INTERESTING = 4

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
  if (post?.kind === 'interesting') {
    if (!post.body?.length) missing.push('body')
    return missing
  }
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
 * Builds one day's UPSC feed: publishable current-affairs posts first, with interesting cards
 * slotted in after every CA_PER_INTERESTING posts (never more than that ratio allows).
 * A GS filter narrows current affairs to that paper and keeps interesting cards of that paper.
 * @param {import('./upscContent.js').UpscPost[]} posts
 * @param {{ dateKey: string, gs?: string }} options
 */
export function buildUpscFeed(posts, { dateKey, gs = 'All' }) {
  const day = posts.filter((p) => p.dateKey === dateKey && missingUpscFields(p).length === 0)
  const byPaper = (p) => gs === 'All' || p.gs === gs
  const ca = day.filter((p) => p.kind === 'current-affairs' && byPaper(p))
  const interesting = day.filter((p) => p.kind === 'interesting' && byPaper(p))
  const allowed = Math.max(ca.length ? Math.ceil(ca.length / CA_PER_INTERESTING) : 0, 0)
  const extras = interesting.slice(0, allowed)

  const out = []
  let extraIdx = 0
  ca.forEach((post, i) => {
    out.push(post)
    if ((i + 1) % CA_PER_INTERESTING === 0 && extraIdx < extras.length) out.push(extras[extraIdx++])
  })
  while (extraIdx < extras.length) out.push(extras[extraIdx++])
  return out
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
