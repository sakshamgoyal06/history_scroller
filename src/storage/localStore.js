/**
 * Single home for browser storage: every key the app persists, plus safe read/write helpers.
 *
 * Key values are a compatibility contract with data already on users' devices (and the
 * planned v0.7 → account import, PRD FR-ACCT-04). Never rename a value without a migration.
 */

export const STORAGE_KEYS = {
  // Legacy names from the history-only prototype (kept for existing saved data).
  saved: 'history-feed-saved',
  known: 'history-feed-known',
  dailyEditionProgress: 'history-feed-daily-edition-progress',

  liked: 'curiosity-feed-liked-v1',
  notInterested: 'curiosity-feed-not-interested-v1',
  domainPreferences: 'curiosity-feed-domain-preferences-v1',
  recentlyViewed: 'curiosity-feed-recently-viewed-v1',
  explored: 'curiosity-feed-explored-v1',
  completed: 'curiosity-feed-completed-v1',
  detailMode: 'curiosity-feed-detail-mode-v1',
  remoteFeedCache: 'curiosity-feed-remote-cache-v1',

  zoneProgress: 'curiosity-feed-zone-progress-v1',
  zoneDrip: 'curiosity-feed-zone-drip-v1',
  pathDrip: 'curiosity-feed-path-drip-v1',

  learningPaths: 'curiosity-feed-learning-paths-v1',
  activePath: 'curiosity-feed-active-path-v1',
}

/** sessionStorage keys (per-tab feed session). */
export const SESSION_KEYS = {
  feedOrder: 'curiosity-feed-session-order-v1',
  activeFeedItemId: 'curiosity-feed-session-active-v1',
  sessionStartedAt: 'curiosity-feed-session-started-v1',
  summaryShown: 'curiosity-feed-session-summary-v1',
}

/** @param {'local' | 'session'} area */
function storageArea(area) {
  // Accessing the storage getter itself can throw (blocked cookies, some private modes).
  try {
    return area === 'session' ? globalThis.sessionStorage : globalThis.localStorage
  } catch {
    return null
  }
}

/**
 * @param {string} key
 * @param {'local' | 'session'} [area]
 * @returns {string | null}
 */
export function readText(key, area = 'local') {
  try {
    return storageArea(area)?.getItem(key) ?? null
  } catch {
    return null
  }
}

/**
 * @param {string} key
 * @param {string} value
 * @param {'local' | 'session'} [area]
 * @returns {boolean} false when the write failed (quota exceeded or storage unavailable)
 */
export function writeText(key, value, area = 'local') {
  try {
    const store = storageArea(area)
    if (!store) return false
    store.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback returned when the key is missing or holds invalid JSON
 * @param {'local' | 'session'} [area]
 * @returns {T}
 */
export function readJson(key, fallback, area = 'local') {
  const raw = readText(key, area)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @param {'local' | 'session'} [area]
 * @returns {boolean} false when the write failed
 */
export function writeJson(key, value, area = 'local') {
  return writeText(key, JSON.stringify(value), area)
}

/**
 * @param {string} key
 * @param {'local' | 'session'} [area]
 */
export function removeKey(key, area = 'local') {
  try {
    storageArea(area)?.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}
