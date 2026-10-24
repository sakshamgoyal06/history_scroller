import { ADDITIONAL_LEARNING_CARDS } from './additionalLearningCards.js'
import { timelineFieldsForCard } from './cardTimeline.js'
import { CORE_CARDS } from './data/coreCards.js'
import { allFlagshipCatalogEntries } from './flagshipStories.js'
import { STORY_YOUTUBE } from './feed/storyYoutube.js'

export const LEARNING_DOMAINS = [
  'History',
  'Economics',
  'Geography',
  'Civics',
  'Technology',
  'Current Affairs',
  'Science',
  'General Knowledge',
]

const CATEGORY_TO_DOMAIN = {
  'Ancient World': 'History',
  Medieval: 'History',
  Renaissance: 'History',
  Enlightenment: 'History',
  'Modern Era': 'History',
  'Science & Invention': 'Science',
  'Culture & Society': 'Civics',
}

const CARD_DOMAIN_BY_ID = {
  'silk-road': 'Geography',
  'roman-concrete': 'Technology',
  'industrial-mills': 'Economics',
  'green-revolution': 'Economics',
  'ada-lovelace': 'Technology',
  'un-declaration': 'Civics',
}

const CARD_FORMAT_BY_ID = {
  'silk-road': 'Map',
  'magna-carta': 'Institution',
  'gothic-cathedral': 'Institution',
  'un-declaration': 'Institution',
  'constantinople-1453': 'Timeline',
}

function firstSentence(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return ''
  const match = /^([\s\S]+?[.!?])(?:\s|$)/u.exec(trimmed)
  return match ? match[1] : trimmed.slice(0, 220)
}

/** @param {Record<string, unknown>} card */
export function normalizeCard(card) {
  const domain =
    card.domain ??
    CARD_DOMAIN_BY_ID[card.id] ??
    CATEGORY_TO_DOMAIN[card.category] ??
    'History'
  const format = card.format ?? CARD_FORMAT_BY_ID[card.id] ?? 'Story'
  const factBullets = Array.isArray(card.factBullets)
    ? card.factBullets.filter((line) => typeof line === 'string' && line.trim())
    : []
  const coreFact =
    card.coreFact ??
    (factBullets.length > 0 ? factBullets.join(' ') : (card.story ?? ''))
  const whyItMatters = card.whyItMatters ?? card.relevance ?? ''
  const hook =
    card.format === 'narrative' ? (card.deck ?? card.hook ?? '') : (card.hook ?? '')
  const scene =
    card.scene ??
    (card.format === 'narrative' && card.coldOpen?.body
      ? firstSentence(card.coldOpen.body)
      : firstSentence(coreFact))
  const sources = Array.isArray(card.sources) ? card.sources : []

  const timeline = timelineFieldsForCard(card)

  return {
    ...card,
    domain,
    format,
    hook,
    scene,
    coreFact,
    factBullets,
    whyItMatters,
    sources,
    story: coreFact,
    relevance: whyItMatters,
    ...(timeline ?? {}),
  }
}


/** Every built-in card, normalized once at module load. */
export const HISTORY_CARDS = [
  ...CORE_CARDS,
  ...ADDITIONAL_LEARNING_CARDS,
  ...allFlagshipCatalogEntries(),
].map((card) =>
  normalizeCard({
    ...card,
    image: `/stories/${card.id}.svg`,
    youtubeId: STORY_YOUTUBE[card.id] ?? card.youtube?.id ?? null,
  }),
)

/** Legacy era/topic labels on original catalog cards (list-panel filter). */
export const TOPIC_LIST = [
  ...new Set(
    HISTORY_CARDS.map((c) => c.category).filter((topic) => typeof topic === 'string' && topic),
  ),
].sort((a, b) => a.localeCompare(b))

export const CARD_BY_ID = new Map(HISTORY_CARDS.map((c) => [c.id, c]))

export function recommendNextCard(currentId, knownIds) {
  const idx = HISTORY_CARDS.findIndex((c) => c.id === currentId)
  if (idx < 0) return null
  const current = HISTORY_CARDS[idx]
  const domain = current.domain

  for (let step = 1; step <= HISTORY_CARDS.length; step += 1) {
    const candidate = HISTORY_CARDS[(idx + step) % HISTORY_CARDS.length]
    if (candidate.domain === domain && !knownIds.has(candidate.id)) {
      return candidate
    }
  }
  for (let step = 1; step <= HISTORY_CARDS.length; step += 1) {
    const candidate = HISTORY_CARDS[(idx + step) % HISTORY_CARDS.length]
    if (candidate.id !== currentId) return candidate
  }
  return null
}
