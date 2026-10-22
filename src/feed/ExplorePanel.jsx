import { DailyEdition } from '../DailyEdition.jsx'
import { FeaturedStoryMode } from '../FeaturedStoryMode.jsx'
import { StoryPreviewCard } from '../StoryPreviewCard.jsx'

export function ExplorePanel({
  catalog,
  filteredCards,
  showDailyEdition,
  knownIds,
  savedIds,
  onOpenStory,
  emptyState,
}) {
  if (filteredCards.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">{emptyState.title}</h2>
        <p className="empty-state-body">{emptyState.body}</p>
        {emptyState.action ? (
          <button type="button" className="empty-state-action" onClick={emptyState.action.onClick}>
            {emptyState.action.label}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <>
      {showDailyEdition ? (
        <>
          <DailyEdition catalog={catalog} onOpenStory={onOpenStory} />
          <FeaturedStoryMode catalog={catalog} onOpenStory={onOpenStory} />
          <h2 className="explore-all-heading">Explore everything</h2>
        </>
      ) : null}
      {filteredCards.map((card) => (
        <StoryPreviewCard
          key={card.id}
          id={`card-${card.id}`}
          card={card}
          interactive
          className={knownIds.has(card.id) ? 'known' : ''}
          onOpen={() => onOpenStory(card.id)}
          badges={
            (savedIds.has(card.id) || knownIds.has(card.id)) && (
              <div className="story-card-tags">
                {savedIds.has(card.id) ? (
                  <span className="meta-badge meta-badge--saved">Saved</span>
                ) : null}
                {knownIds.has(card.id) ? <span className="meta-badge">Known</span> : null}
              </div>
            )
          }
        />
      ))}
    </>
  )
}
