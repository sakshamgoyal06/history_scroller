/**
 * Hash routes + History API state shapes.
 *
 * Routes: #feed/<id>, #story/<id>, #zones, #zone/<id>, #learn, #learn/path/<id>,
 * #path/<id> (short share link), #library. Anything else is the For You feed.
 */

function base() {
  return `${window.location.pathname}${window.location.search}`
}

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

/**
 * Pure parser so routing can be unit-tested without a browser.
 * @param {string} hash e.g. "#zone/money-basics"
 * @returns {{ view: 'feed' | 'story' | 'zones' | 'zone' | 'learnHome' | 'learnPath' | 'library', id?: string | null }}
 */
export function parseHash(hash) {
  const h = String(hash ?? '')
  const withId = (re, view) => {
    const match = re.exec(h)
    if (!match) return null
    const id = safeDecode(match[1])
    return id ? { view, id } : null
  }
  return (
    withId(/^#story\/([^/#?]+)/, 'story') ??
    withId(/^#feed\/([^/#?]+)/, 'feed') ??
    withId(/^#zone\/([^/#?]+)/, 'zone') ??
    withId(/^#learn\/path\/([^/#?]+)/, 'learnPath') ??
    withId(/^#path\/([^/#?]+)/, 'learnPath') ??
    (h === '#zones' ? { view: 'zones' } : null) ??
    (h.startsWith('#learn') ? { view: 'learnHome' } : null) ??
    (h === '#library' ? { view: 'library' } : null) ?? { view: 'feed', id: null }
  )
}

const routeFromLocation = () => parseHash(window.location.hash)

export function feedItemIdFromLocation() {
  const route = routeFromLocation()
  return route.view === 'feed' ? (route.id ?? null) : null
}

export function zoneIdFromLocation() {
  const route = routeFromLocation()
  return route.view === 'zone' ? route.id : null
}

export function storyIdFromLocation() {
  const route = routeFromLocation()
  return route.view === 'story' ? route.id : null
}

export function learnPathIdFromLocation() {
  const route = routeFromLocation()
  return route.view === 'learnPath' ? route.id : null
}

export function feedUrl(feedItemId) {
  return feedItemId ? `${base()}#feed/${encodeURIComponent(feedItemId)}` : base()
}

export function storyUrl(id) {
  return `${base()}#story/${encodeURIComponent(id)}`
}

export function zonesUrl() {
  return `${base()}#zones`
}

export function zoneUrl(zoneId) {
  return `${base()}#zone/${encodeURIComponent(zoneId)}`
}

export function learnHomeUrl() {
  return `${base()}#learn`
}

export function learnPathUrl(pathId) {
  return `${base()}#learn/path/${encodeURIComponent(pathId)}`
}

export function shortPathUrl(pathId) {
  return `${base()}#path/${encodeURIComponent(pathId)}`
}

export function libraryUrl() {
  return `${base()}#library`
}

export const FEED_HISTORY_STATE = { view: 'feed', mode: 'forYou' }

export function feedHistoryState(mode = 'forYou', feedItemId = null) {
  return { view: 'feed', mode, feedItemId }
}

export function storyHistoryState(id, returnFeed = null) {
  return returnFeed ? { view: 'story', id, returnFeed } : { view: 'story', id }
}

export const ZONES_HISTORY_STATE = { view: 'zones' }

export function zoneHistoryState(zoneId) {
  return { view: 'zone', zoneId }
}

export function learnHomeHistoryState() {
  return { view: 'learnHome' }
}

export function learnPathHistoryState(pathId) {
  return { view: 'learnPath', pathId }
}

export const LIBRARY_HISTORY_STATE = { view: 'library' }
