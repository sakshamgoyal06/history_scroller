import { loadDomainPreferences, loadExploredIds, loadLikedIds, loadNotInterestedIds } from './feedStorage.js'

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function domainAffinity(item, signals) {
  const { domainCounts, savedCardIds, knownCardIds, likedDomains, likedTopics } = signals
  let score = 0
  score += (domainCounts[item.domain] ?? 0) * 3
  if (likedDomains.has(item.domain)) score += 8
  for (const t of item.topics ?? []) {
    if (likedTopics.has(t)) score += 4
    if (signals.fewerTopics.has(t)) score -= 6
  }
  if (savedCardIds.has(item.parentCardId)) score += 6
  if (knownCardIds.has(item.parentCardId)) score += 2
  const penalty = signals.domainPenalty[item.domain] ?? 0
  score -= penalty * 4
  return score
}

function recencyBoost(item) {
  if (!item.publishedAt) return 0
  const ts = Date.parse(item.publishedAt)
  if (Number.isNaN(ts)) return 0
  const ageDays = (Date.now() - ts) / (86400000)
  return Math.max(0, 14 - ageDays) * 0.2
}

function applyDiversityOrdering(items, rng) {
  /** @type {import('./feedTypes.js').FeedItem[]} */
  const result = []
  const pool = [...items]

  while (pool.length > 0) {
    let bestIdx = 0
    let bestScore = -Infinity
    for (let i = 0; i < pool.length; i += 1) {
      const item = pool[i]
      let score = item._rankScore ?? 0
      const last = result[result.length - 1]
      const prev = result[result.length - 2]
      if (last && last.domain === item.domain) score -= 12
      if (prev && prev.domain === item.domain && last?.domain === item.domain) score -= 40
      if (last && last.type === item.type) score -= 8
      if (prev && prev.type === item.type && last?.type === item.type) score -= 30
      score += rng() * 0.35
      if (score > bestScore) {
        bestScore = score
        bestIdx = i
      }
    }
    const [picked] = pool.splice(bestIdx, 1)
    result.push(picked)
  }
  return result
}

/**
 * @param {object} params
 * @param {import('./feedTypes.js').FeedItem[]} params.items
 * @param {Set<string>} params.savedCardIds
 * @param {Set<string>} params.knownCardIds
 * @param {Map<string, number>} [params.recentViewPenalty] feed item id → recent view count
 * @param {import('./feedTypes.js').FeedItem[]} [params.dripInserts]
 * @param {string} [params.dateKey]
 * @param {number} [params.sessionSalt]
 */
export function rankFeedItems({
  items,
  savedCardIds,
  knownCardIds,
  recentViewPenalty = new Map(),
  dripInserts = [],
  dateKey = new Date().toISOString().slice(0, 10),
  sessionSalt = 0,
}) {
  const notInterested = new Set(loadNotInterestedIds())
  const likedIds = loadLikedIds()
  const explored = new Set(loadExploredIds())
  const prefs = loadDomainPreferences()

  const likedDomains = new Set()
  const likedTopics = new Set()
  for (const item of items) {
    if (likedIds.includes(item.id)) {
      likedDomains.add(item.domain)
      for (const t of item.topics ?? []) likedTopics.add(t)
    }
  }

  const domainCounts = /** @type {Record<string, number>} */ ({})
  for (const item of items) {
    if (likedIds.includes(item.id)) domainCounts[item.domain] = (domainCounts[item.domain] ?? 0) + 1
  }
  for (const id of savedCardIds) {
    const cardItem = items.find((it) => it.parentCardId === id)
    if (cardItem) domainCounts[cardItem.domain] = (domainCounts[cardItem.domain] ?? 0) + 1
  }

  const signals = {
    domainCounts,
    savedCardIds,
    knownCardIds,
    likedDomains,
    likedTopics,
    fewerTopics: new Set(prefs.fewerTopics),
    domainPenalty: prefs.domainPenalty,
  }

  const seed = hashString(`${dateKey}:${sessionSalt}`) ^ hashString([...likedIds].sort().join(','))
  const rng = mulberry32(seed)

  const filtered = items.filter((item) => !notInterested.has(item.id))

  const scored = filtered.map((item) => {
    let score = domainAffinity(item, signals)
    score += recencyBoost(item)
    if (explored.has(item.id)) score -= 3
    const recent = recentViewPenalty.get(item.id)
    if (recent) score -= Math.min(10, recent * 2)
    if (!explored.has(item.id)) score += 4
    const roll = rng()
    if (roll < 0.35) score += domainAffinity(item, signals) * 0.5
    else if (roll < 0.6) score += 2
    else if (roll < 0.8) score += rng() * 3
    else if (roll < 0.9) score += 1
    else score += knownCardIds.has(item.parentCardId) ? 2 : 0
    return { ...item, _rankScore: score }
  })

  let ordered = applyDiversityOrdering(scored, rng)

  if (dripInserts.length > 0) {
    const merged = []
    let dripIdx = 0
    let sinceInsert = 0
    const interval = 4 + (hashString(dateKey) % 3)
    for (const item of ordered) {
      merged.push(item)
      sinceInsert += 1
      if (sinceInsert >= interval && dripIdx < dripInserts.length) {
        merged.push(dripInserts[dripIdx])
        dripIdx += 1
        sinceInsert = 0
      }
    }
    while (dripIdx < dripInserts.length) {
      merged.push(dripInserts[dripIdx])
      dripIdx += 1
    }
    ordered = merged
  }

  return ordered.map(({ _rankScore, ...rest }) => rest)
}
