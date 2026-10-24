import { FLAGSHIP_NARRATIVES, isNarrativeCard } from './flagshipStories.js'
import { StoryPreviewCard } from './StoryPreviewCard.jsx'

/**
 * Surfaces narrative-format catalog entries (Story Mode) on the default feed.
 * @param {{ catalog: Array<Record<string, unknown>>, onOpenStory: (id: string) => void, excludeIds?: Set<string> }} props
 */
export function FeaturedStoryMode({ catalog, onOpenStory }) {
  const flagshipIds = new Set(FLAGSHIP_NARRATIVES.map((s) => s.id))
  const cards = catalog.filter((c) => isNarrativeCard(c) || flagshipIds.has(c.id))
  if (cards.length === 0) return null

  return (
    <section className="featured-story-mode" aria-labelledby="featured-story-mode-heading">
      <header className="featured-story-mode-header">
        <h2 id="featured-story-mode-heading" className="featured-story-mode-title">
          Story Mode
        </h2>
        <p className="featured-story-mode-sub">
          Longer narratives with beats, context, and a clear takeaway—the rest of the feed
          stays in the classic card format.
        </p>
      </header>
      {cards.map((card) => (
        <StoryPreviewCard
          key={card.id}
          card={card}
          interactive
          className="featured-story-mode-card"
          onOpen={() => onOpenStory(card.id)}
        />
      ))}
    </section>
  )
}
