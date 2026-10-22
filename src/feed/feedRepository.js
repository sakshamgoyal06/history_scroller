import { isValidFeedItem } from './feedTypes.js'
import { PROTOTYPE_FEED_ITEMS } from './prototypeFeedItems.js'

const REMOTE_CACHE_KEY = 'curiosity-feed-remote-cache-v1'

function readRemoteCache() {
  try {
    const raw = localStorage.getItem(REMOTE_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeRemoteCache(payload) {
  try {
    localStorage.setItem(
      REMOTE_CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), payload }),
    )
  } catch {
    /* ignore */
  }
}

/**
 * @param {import('./feedTypes.js').FeedItem[]} extra
 */
function dedupeItems(...lists) {
  const map = new Map()
  for (const list of lists) {
    for (const item of list) {
      if (!isValidFeedItem(item)) continue
      map.set(item.id, item)
    }
  }
  return [...map.values()]
}

/**
 * @returns {Promise<{ items: import('./feedTypes.js').FeedItem[], meta: { source: string, error?: string, fetchedAt?: number } }>}
 */
export async function loadFeedItems(extraItems = []) {
  const bundled = PROTOTYPE_FEED_ITEMS
  let remoteItems = []
  let meta = { source: 'bundled' }

  try {
    const res = await fetch('/content/feed-index.json', { cache: 'no-cache' })
    if (res.ok) {
      const json = await res.json()
      const list = Array.isArray(json?.items) ? json.items : []
      remoteItems = list.filter(isValidFeedItem)
      writeRemoteCache(json)
      meta = { source: 'remote+bundled', fetchedAt: Date.now() }
    } else {
      throw new Error(`HTTP ${res.status}`)
    }
  } catch (err) {
    const cached = readRemoteCache()
    if (cached?.payload?.items) {
      remoteItems = cached.payload.items.filter(isValidFeedItem)
      meta = {
        source: 'cache+bundled',
        error: String(err?.message ?? err),
        fetchedAt: cached.fetchedAt,
      }
    } else {
      meta = { source: 'bundled', error: String(err?.message ?? err) }
    }
  }

  const items = dedupeItems(bundled, remoteItems, extraItems)
  return { items, meta }
}

export function getFeedItemById(items, id) {
  return items.find((it) => it.id === id) ?? null
}
