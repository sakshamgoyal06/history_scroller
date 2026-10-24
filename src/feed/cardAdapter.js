import { verifiedYoutubeIdForCard } from '../catalog/data/storyYoutube.js'

/**
 * Build a minimal slide feed item from a legacy catalog card.
 * @param {Record<string, unknown>} card
 * @returns {import('./feedTypes.js').FeedItem | null}
 */
export function feedItemFromCatalogCard(card) {
  if (!card?.id || typeof card.id !== 'string') return null
  const id = `feed-card-${card.id}`
  const hook = String(card.hook ?? card.title ?? '').trim()
  const scene = String(card.scene ?? '').trim()
  const facts = Array.isArray(card.factBullets)
    ? card.factBullets.filter((l) => typeof l === 'string' && l.trim())
    : []
  const core = String(card.coreFact ?? card.story ?? '').trim()
  const why = String(card.whyItMatters ?? card.relevance ?? '').trim()
  const takeaway = String(card.rabbitHole ?? why ?? hook).trim()

  const slides = [
    {
      id: `${id}-hook`,
      type: 'hook',
      eyebrow: 'Curiosity',
      heading: String(card.title ?? ''),
      body: hook,
    },
    {
      id: `${id}-context`,
      type: 'context',
      eyebrow: 'Context',
      body: scene || facts[0] || core.slice(0, 280),
    },
    {
      id: `${id}-reveal`,
      type: 'reveal',
      eyebrow: 'The reveal',
      body: facts.length > 0 ? facts.slice(0, 2).join(' ') : core.slice(0, 320),
    },
    {
      id: `${id}-meaning`,
      type: 'meaning',
      eyebrow: 'Why it matters',
      body: why || core.slice(0, 240),
    },
    {
      id: `${id}-takeaway`,
      type: 'takeaway',
      eyebrow: 'Takeaway',
      body: takeaway,
      emphasis: why ? why.slice(0, 120) : undefined,
    },
  ]

  const youtubeId = verifiedYoutubeIdForCard(card.id)
  const wordCount = slides.reduce((n, s) => n + (s.body?.split(/\s+/).length ?? 0), 0)

  return {
    id,
    parentCardId: card.id,
    type: 'slides',
    title: String(card.title ?? card.id),
    hook,
    domain: String(card.domain ?? card.category ?? 'History'),
    topics: card.category ? [String(card.category)] : [],
    formatLabel: String(card.format ?? 'Story'),
    estimatedSeconds: Math.max(45, Math.round(wordCount / 2.5)),
    art: {
      src: card.image ?? `/stories/${card.id}.svg`,
      alt: String(card.title ?? ''),
    },
    slides,
    deepDive: {
      cardId: card.id,
      defaultMode: card.format === 'narrative' ? 'story' : 'explainer',
    },
    video: youtubeId
      ? {
          provider: 'youtube',
          youtubeId,
          title: String(card.title ?? ''),
          caption: hook,
        }
      : undefined,
  }
}
