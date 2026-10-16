/** @typedef {'bigIdea' | 'fromHistory' | 'sciTech' | 'surprise'} EditionSlot */

export const EDITION_SLOT_LABELS = {
  bigIdea: "Today's big idea",
  fromHistory: 'From history',
  sciTech: 'Science & technology',
  surprise: 'Surprise me',
}

const STORAGE_DAILY_PROGRESS = 'history-feed-daily-edition-progress'

const BIG_IDEA_DOMAINS = new Set(['Economics', 'Civics', 'Geography', 'Current Affairs'])
const HISTORY_DOMAIN = 'History'
const SCI_TECH_DOMAINS = new Set(['Science', 'Technology'])

/** @returns {string} Local calendar date YYYY-MM-DD */
export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** @param {string} dateKey */
export function formatEditionDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** FNV-1a 32-bit hash for deterministic daily seeding */
export function hashDateKey(dateKey) {
  let h = 2166136261
  for (let i = 0; i < dateKey.length; i += 1) {
    h ^= dateKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** @param {number} seed */
export function createSeededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** @param {string} domain */
function domainOf(card) {
  return typeof card.domain === 'string' ? card.domain : ''
}

/**
 * @param {Array<{ id: string, domain?: string }>} cards
 * @param {Set<string>} exclude
 * @param {(card: { id: string, domain?: string }) => boolean} predicate
 * @param {() => number} rng
 */
function pickOne(cards, exclude, predicate, rng) {
  const pool = cards.filter((c) => c.id && !exclude.has(c.id) && predicate(c))
  if (pool.length === 0) return null
  const idx = Math.floor(rng() * pool.length)
  return pool[idx]
}

/**
 * @param {Array<{ id: string, domain?: string }>} catalog
 * @param {string} [dateKey]
 * @returns {{ dateKey: string, picks: Record<EditionSlot, { id: string, domain?: string } | null> }}
 */
export function selectDailyEdition(catalog, dateKey = getLocalDateKey()) {
  const rng = createSeededRandom(hashDateKey(dateKey))
  const exclude = new Set()
  /** @type {Record<EditionSlot, { id: string, domain?: string } | null>} */
  const picks = {
    bigIdea: null,
    fromHistory: null,
    sciTech: null,
    surprise: null,
  }

  picks.bigIdea = pickOne(
    catalog,
    exclude,
    (c) => BIG_IDEA_DOMAINS.has(domainOf(c)),
    rng,
  )
  if (picks.bigIdea) exclude.add(picks.bigIdea.id)

  picks.fromHistory = pickOne(
    catalog,
    exclude,
    (c) => domainOf(c) === HISTORY_DOMAIN,
    rng,
  )
  if (picks.fromHistory) exclude.add(picks.fromHistory.id)

  picks.sciTech = pickOne(
    catalog,
    exclude,
    (c) => SCI_TECH_DOMAINS.has(domainOf(c)),
    rng,
  )
  if (picks.sciTech) exclude.add(picks.sciTech.id)

  picks.surprise = pickOne(catalog, exclude, () => true, rng)

  return { dateKey, picks }
}

/** @returns {Record<string, string[]>} */
function loadProgressStore() {
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_PROGRESS)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** @param {Record<string, string[]>} store */
function saveProgressStore(store) {
  localStorage.setItem(STORAGE_DAILY_PROGRESS, JSON.stringify(store))
}

/** @param {string} dateKey */
export function getExploredIdsForDate(dateKey) {
  const store = loadProgressStore()
  const list = store[dateKey]
  return Array.isArray(list) ? [...new Set(list.filter((id) => typeof id === 'string'))] : []
}

/** @param {string} dateKey @param {string} cardId */
export function markEditionCardExplored(dateKey, cardId) {
  if (!dateKey || !cardId) return
  const store = loadProgressStore()
  const prev = getExploredIdsForDate(dateKey)
  if (prev.includes(cardId)) return
  store[dateKey] = [...prev, cardId]
  saveProgressStore(store)
}

/** @param {string} dateKey @param {number} total */
export function editionProgressSummary(dateKey, total) {
  const explored = getExploredIdsForDate(dateKey).length
  const safeTotal = Math.max(0, total)
  return {
    explored: Math.min(explored, safeTotal || explored),
    total: safeTotal,
    label: `${Math.min(explored, safeTotal)} of ${safeTotal} explored`,
  }
}

export function isDailyEditionVisible({
  showSavedOnly,
  activeZone,
  activeFilterCount,
  homePanel,
}) {
  if (homePanel !== 'feed') return false
  if (showSavedOnly) return false
  if (activeZone) return false
  if (activeFilterCount > 0) return false
  return true
}
