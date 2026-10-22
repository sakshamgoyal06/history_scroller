import { SESSION_KEYS, SESSION_STALE_MS } from './feedTypes.js'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function loadFeedSession() {
  const started = Number(sessionStorage.getItem(SESSION_KEYS.sessionStartedAt) ?? 0)
  const stale = !started || Date.now() - started > SESSION_STALE_MS
  if (stale) return { stale: true, order: [], activeId: null, summaryShown: false }

  return {
    stale: false,
    order: safeParse(sessionStorage.getItem(SESSION_KEYS.feedOrder), []),
    activeId: sessionStorage.getItem(SESSION_KEYS.activeFeedItemId),
    summaryShown: sessionStorage.getItem(SESSION_KEYS.summaryShown) === '1',
  }
}

export function startFeedSession(order, activeId) {
  sessionStorage.setItem(SESSION_KEYS.sessionStartedAt, String(Date.now()))
  sessionStorage.setItem(SESSION_KEYS.feedOrder, JSON.stringify(order))
  if (activeId) sessionStorage.setItem(SESSION_KEYS.activeFeedItemId, activeId)
  sessionStorage.removeItem(SESSION_KEYS.summaryShown)
}

export function updateFeedSession(order, activeId) {
  sessionStorage.setItem(SESSION_KEYS.feedOrder, JSON.stringify(order))
  if (activeId) sessionStorage.setItem(SESSION_KEYS.activeFeedItemId, activeId)
}

export function markSessionSummaryShown() {
  sessionStorage.setItem(SESSION_KEYS.summaryShown, '1')
}
