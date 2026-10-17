import { StoryPreviewCard } from './StoryPreviewCard.jsx'

export function LearnPathChapters({
  pathMeta,
  cards,
  completedLessonIds,
  onOpenChapter,
  onNewTopic,
}) {
  if (!pathMeta || cards.length === 0) return null

  const completed = new Set(completedLessonIds ?? [])

  return (
    <div className="learn-path-screen">
      <header className="learn-path-screen-header">
        <div>
          <p className="learn-path-screen-label">
            {pathMeta.sourceLabel === 'demo' ? 'Demo path' : 'Your learning path'}
          </p>
          <h2 className="learn-path-screen-title">{pathMeta.topic}</h2>
          <p className="learn-path-screen-meta">
            {pathMeta.levelLabel} · {pathMeta.scopeLabel}
            {pathMeta.trackTitle ? ` · ${pathMeta.trackTitle}` : ''} · {pathMeta.lessonCount}{' '}
            chapters
          </p>
        </div>
        <button type="button" className="learn-secondary-btn" onClick={onNewTopic}>
          New topic
        </button>
      </header>

      {pathMeta.buildMode === 'full_course' && pathMeta.tracks?.length > 1 ? (
        <p className="learn-path-order-hint">Switch tracks from the path list when needed.</p>
      ) : null}

      <p className="learn-path-order-hint">
        Open a chapter to read or generate it. Progress saves when you finish reading.
      </p>

      <div className="learn-path-cards">
        {cards.map((card) => (
          <StoryPreviewCard
            key={card.id}
            id={`card-${card.id}`}
            card={card}
            interactive
            onOpen={() => onOpenChapter(card.id)}
            className={completed.has(card.id) ? 'learn-chapter--done' : ''}
            badges={
              card.pathOrder ? (
                <div className="story-card-tags">
                  <span className="meta-badge meta-badge--path">
                    Chapter {card.pathOrder} of{' '}
                    {card.pathTrackLessonCount ?? cards.length}
                    {completed.has(card.id) ? ' · read' : ''}
                    {!completed.has(card.id) &&
                    card.generationStatus === 'planned'
                      ? ' · tap to generate'
                      : ''}
                  </span>
                </div>
              ) : null
            }
          />
        ))}
      </div>
    </div>
  )
}
