import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CARD_BY_ID, HISTORY_CARDS, LEARNING_DOMAINS, recommendNextCard } from './catalog.js'
import { feedItemFromCatalogCard } from './feed/cardAdapter.js'
import { isValidFeedItem } from './feed/feedTypes.js'
import { PROTOTYPE_FEED_ITEMS } from './feed/prototypeFeedItems.js'
import { LEARNING_ZONES } from './zones/zoneData.js'

const publicDir = fileURLToPath(new URL('../public', import.meta.url))

describe('catalog', () => {
  it('has unique card IDs', () => {
    expect(CARD_BY_ID.size).toBe(HISTORY_CARDS.length)
  })

  it('normalizes every card into a known domain with teaching content', () => {
    for (const card of HISTORY_CARDS) {
      expect(LEARNING_DOMAINS, card.id).toContain(card.domain)
      expect(card.title, card.id).toBeTruthy()
      expect(card.hook || card.coreFact, card.id).toBeTruthy()
    }
  })

  it('ships artwork for every card', () => {
    const missing = HISTORY_CARDS.filter((c) => !existsSync(`${publicDir}${c.image}`)).map((c) => c.id)
    expect(missing).toEqual([])
  })

  it('recommends a different card', () => {
    const next = recommendNextCard(HISTORY_CARDS[0].id, new Set())
    expect(next).toBeTruthy()
    expect(next.id).not.toBe(HISTORY_CARDS[0].id)
  })
})

describe('feed content', () => {
  it('ships only valid prototype feed items with unique IDs pointing at real cards', () => {
    const ids = new Set()
    for (const item of PROTOTYPE_FEED_ITEMS) {
      expect(isValidFeedItem(item), item.id).toBe(true)
      expect(ids.has(item.id), item.id).toBe(false)
      ids.add(item.id)
      expect(CARD_BY_ID.has(item.parentCardId), item.parentCardId).toBe(true)
    }
  })

  it('can adapt catalog cards into valid feed items', () => {
    const adapted = HISTORY_CARDS.map((c) => feedItemFromCatalogCard(c)).filter(Boolean)
    expect(adapted.length).toBeGreaterThan(0)
    expect(adapted.every(isValidFeedItem)).toBe(true)
  })

  it('only references existing cards from learning zones', () => {
    for (const zone of LEARNING_ZONES) {
      for (const step of zone.steps) expect(CARD_BY_ID.has(step.cardId), `${zone.id}:${step.cardId}`).toBe(true)
    }
  })
})
