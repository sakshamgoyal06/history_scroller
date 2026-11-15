import { SESSION_KEYS, readJson, readText, removeKey, writeJson, writeText } from '../storage/localStore.js'
import { SESSION_STALE_MS } from './feedTypes.js'

export function loadFeedSession() {
  const started = Number(readText(SESSION_KEYS.sessionStartedAt, 'session') ?? 0)
  const stale = !started || Date.now() - started > SESSION_STALE_MS
  if (stale) return { stale: true, order: [], activeId: null, summaryShown: false }

  return {
    stale: false,
    order: readJson(SESSION_KEYS.feedOrder, [], 'session'),
    activeId: readText(SESSION_KEYS.activeFeedItemId, 'session'),
    summaryShown: readText(SESSION_KEYS.summaryShown, 'session') === '1',
  }
}

export function startFeedSession(order, activeId) {
  writeText(SESSION_KEYS.sessionStartedAt, String(Date.now()), 'session')
  writeJson(SESSION_KEYS.feedOrder, order, 'session')
  if (activeId) writeText(SESSION_KEYS.activeFeedItemId, activeId, 'session')
  removeKey(SESSION_KEYS.summaryShown, 'session')
}

export function updateFeedSession(order, activeId) {
  writeJson(SESSION_KEYS.feedOrder, order, 'session')
  if (activeId) writeText(SESSION_KEYS.activeFeedItemId, activeId, 'session')
}

export function markSessionSummaryShown() {
  writeText(SESSION_KEYS.summaryShown, '1', 'session')
}
