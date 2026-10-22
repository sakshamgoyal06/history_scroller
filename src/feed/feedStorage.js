import { FEED_STORAGE_KEYS } from './feedTypes.js'

const RECENT_CAP = 400

function safeParse(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function readStore(key, fallback) {
  try {
    return safeParse(localStorage.getItem(key), fallback)
  } catch {
    return fallback
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or private mode */
  }
}

function normalizeIdList(raw) {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter((id) => typeof id === 'string' && id))]
}

export function loadLikedIds() {
  const data = readStore(FEED_STORAGE_KEYS.liked, { ids: [] })
  return normalizeIdList(data?.ids ?? data)
}

export function toggleLikedId(feedItemId) {
  const ids = loadLikedIds()
  const set = new Set(ids)
  if (set.has(feedItemId)) set.delete(feedItemId)
  else set.add(feedItemId)
  const next = [...set]
  writeStore(FEED_STORAGE_KEYS.liked, { version: 1, ids: next, updatedAt: Date.now() })
  return next
}

export function isLiked(feedItemId) {
  return loadLikedIds().includes(feedItemId)
}

export function loadNotInterestedIds() {
  const data = readStore(FEED_STORAGE_KEYS.notInterested, { ids: [] })
  return normalizeIdList(data?.ids ?? data)
}

export function addNotInterested(feedItemId) {
  const ids = loadNotInterestedIds()
  if (ids.includes(feedItemId)) return ids
  const next = [...ids, feedItemId]
  writeStore(FEED_STORAGE_KEYS.notInterested, { version: 1, ids: next, updatedAt: Date.now() })
  return next
}

export function loadDomainPreferences() {
  const data = readStore(FEED_STORAGE_KEYS.domainPreferences, { fewerTopics: [] })
  const fewer = Array.isArray(data?.fewerTopics)
    ? data.fewerTopics.filter((t) => typeof t === 'string')
    : []
  const domainPenalty = data?.domainPenalty && typeof data.domainPenalty === 'object' ? data.domainPenalty : {}
  return { fewerTopics: fewer, domainPenalty }
}

export function penalizeDomain(domain) {
  const prefs = loadDomainPreferences()
  const domainPenalty = { ...prefs.domainPenalty }
  domainPenalty[domain] = (domainPenalty[domain] ?? 0) + 1
  writeStore(FEED_STORAGE_KEYS.domainPreferences, {
    version: 1,
    fewerTopics: prefs.fewerTopics,
    domainPenalty,
    updatedAt: Date.now(),
  })
}

export function addFewerTopic(topic) {
  const prefs = loadDomainPreferences()
  const set = new Set(prefs.fewerTopics)
  set.add(topic)
  writeStore(FEED_STORAGE_KEYS.domainPreferences, {
    version: 1,
    fewerTopics: [...set],
    domainPenalty: prefs.domainPenalty,
    updatedAt: Date.now(),
  })
}

export function loadRecentlyViewed() {
  const data = readStore(FEED_STORAGE_KEYS.recentlyViewed, { entries: [] })
  if (!Array.isArray(data?.entries)) return []
  return data.entries
    .filter((e) => e && typeof e.id === 'string')
    .map((e) => ({
      id: e.id,
      feedItemId: typeof e.feedItemId === 'string' ? e.feedItemId : e.id,
      parentCardId: typeof e.parentCardId === 'string' ? e.parentCardId : undefined,
      viewedAt: typeof e.viewedAt === 'number' ? e.viewedAt : Date.now(),
    }))
}

export function pushRecentlyViewed(entry) {
  const prev = loadRecentlyViewed()
  const filtered = prev.filter((e) => e.feedItemId !== entry.feedItemId)
  const next = [{ ...entry, viewedAt: entry.viewedAt ?? Date.now() }, ...filtered].slice(0, RECENT_CAP)
  writeStore(FEED_STORAGE_KEYS.recentlyViewed, { version: 1, entries: next })
  return next
}

export function clearRecentlyViewed() {
  writeStore(FEED_STORAGE_KEYS.recentlyViewed, { version: 1, entries: [] })
}

export function loadExploredIds() {
  const data = readStore(FEED_STORAGE_KEYS.explored, { ids: [] })
  return normalizeIdList(data?.ids ?? data)
}

export function markExplored(feedItemId) {
  const ids = loadExploredIds()
  if (ids.includes(feedItemId)) return ids
  const next = [...ids, feedItemId]
  writeStore(FEED_STORAGE_KEYS.explored, { version: 1, ids: next, updatedAt: Date.now() })
  return next
}

export function loadCompletedIds() {
  const data = readStore(FEED_STORAGE_KEYS.completed, { ids: [] })
  return normalizeIdList(data?.ids ?? data)
}

export function markCompleted(feedItemId) {
  const ids = loadCompletedIds()
  if (ids.includes(feedItemId)) return ids
  const next = [...ids, feedItemId]
  writeStore(FEED_STORAGE_KEYS.completed, { version: 1, ids: next, updatedAt: Date.now() })
  return next
}

export function loadDetailModePreference() {
  const data = readStore(FEED_STORAGE_KEYS.detailMode, { mode: 'story' })
  return data?.mode === 'explainer' ? 'explainer' : 'story'
}

export function saveDetailModePreference(mode) {
  writeStore(FEED_STORAGE_KEYS.detailMode, { version: 1, mode: mode === 'explainer' ? 'explainer' : 'story' })
}

export function buildAffinitySignals({ savedCardIds = [], knownCardIds = [], likedFeedIds = [] }) {
  const domainCounts = /** @type {Record<string, number>} */ ({})
  const topicCounts = /** @type {Record<string, number>} */ ({})

  const bump = (map, key) => {
    if (!key) return
    map[key] = (map[key] ?? 0) + 1
  }

  for (const id of likedFeedIds) bump(topicCounts, id)
  for (const id of savedCardIds) bump(topicCounts, `card:${id}`)
  for (const id of knownCardIds) bump(topicCounts, `known:${id}`)

  return { domainCounts, topicCounts, savedCardIds, knownCardIds, likedFeedIds }
}
