import { STORAGE_KEYS, readJson, writeJson } from '../storage/localStore.js'
import { isValidFeedItem } from './feedTypes.js'
import { PROTOTYPE_FEED_ITEMS } from './prototypeFeedItems.js'

function readRemoteCache() {
  return readJson(STORAGE_KEYS.remoteFeedCache, null)
}

function writeRemoteCache(payload) {
  writeJson(STORAGE_KEYS.remoteFeedCache, { fetchedAt: Date.now(), payload })
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
