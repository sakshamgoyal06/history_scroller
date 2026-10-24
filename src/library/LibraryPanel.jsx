import { useMemo, useState } from 'react'
import { loadLikedIds, toggleLikedId, clearRecentlyViewed, loadRecentlyViewed } from '../feed/feedStorage.js'
import { listPathSummaries } from '../learn/learningPathStorage.js'
import { getFeedItemById } from '../feed/feedRepository.js'

export function LibraryPanel({
  feedItems,
  savedCardsLive,
  catalogById,
  onOpenFeedItem,
  onOpenStory,
  onOpenPath,
  onUnsave,
  onRefreshLikes,
}) {
  const [likedIds, setLikedIds] = useState(() => loadLikedIds())
  const [recent, setRecent] = useState(() => loadRecentlyViewed())
  const [confirmClear, setConfirmClear] = useState(false)

  const likedItems = useMemo(
    () => likedIds.map((id) => getFeedItemById(feedItems, id)).filter(Boolean),
    [likedIds, feedItems],
  )

  const paths = listPathSummaries()

  return (
    <div className="library-panel">
      <section className="library-section" aria-labelledby="lib-liked">
        <h2 id="lib-liked" className="learn-section-title">
          Liked
        </h2>
        {likedItems.length === 0 ? (
          <p className="library-empty">Like posts in For You to ask for more on those topics.</p>
        ) : (
          <ul className="library-list">
            {likedItems.map((item) => (
              <li key={item.id}>
                <button type="button" className="library-row" onClick={() => onOpenFeedItem(item.id)}>
                  <span className="library-row-title">{item.title}</span>
                  <span className="library-row-meta">{item.domain}</span>
                </button>
                <button
                  type="button"
                  className="learn-text-btn"
                  onClick={() => {
                    toggleLikedId(item.id)
                    setLikedIds(loadLikedIds())
                    onRefreshLikes?.()
                  }}
                >
                  Unlike
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="library-section" aria-labelledby="lib-saved">
        <h2 id="lib-saved" className="learn-section-title">
          Saved
        </h2>
        {savedCardsLive.length === 0 ? (
          <p className="library-empty">Save ideas you want to revisit—without cluttering your reel.</p>
        ) : (
          <ul className="library-list">
            {savedCardsLive.map((card) => (
              <li key={card.id}>
                <button type="button" className="library-row" onClick={() => onOpenStory(card.id)}>
                  <span className="library-row-title">{card.title}</span>
                  <span className="library-row-meta">{card.domain}</span>
                </button>
                <button type="button" className="learn-text-btn" onClick={() => onUnsave(card)}>
                  Unsave
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="library-section" aria-labelledby="lib-paths">
        <h2 id="lib-paths" className="learn-section-title">
          My Paths
        </h2>
        {paths.length === 0 ? (
          <p className="library-empty">Custom paths you generate in Learn appear here.</p>
        ) : (
          <ul className="library-list">
            {paths.map((p) => (
              <li key={p.id}>
                <button type="button" className="library-row" onClick={() => onOpenPath(p.id)}>
                  <span className="library-row-title">{p.title}</span>
                  <span className="library-row-meta">
                    {p.completed}/{p.total} chapters
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="library-section" aria-labelledby="lib-recent">
        <div className="library-section-head">
          <h2 id="lib-recent" className="learn-section-title">
            Recently viewed
          </h2>
          {recent.length > 0 && !confirmClear ? (
            <button type="button" className="learn-text-btn" onClick={() => setConfirmClear(true)}>
              Clear history
            </button>
          ) : null}
        </div>
        {confirmClear ? (
          <div className="library-clear-confirm">
            <p>Clear recently viewed? Saved and liked items stay.</p>
            <button
              type="button"
              className="zone-card-action"
              onClick={() => {
                clearRecentlyViewed()
                setRecent([])
                setConfirmClear(false)
              }}
            >
              Clear
            </button>
            <button type="button" className="learn-text-btn" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        ) : null}
        {recent.length === 0 ? (
          <p className="library-empty">Your reel explorations show up here with timestamps.</p>
        ) : (
          <ul className="library-list">
            {recent.slice(0, 40).map((entry) => {
              const card = catalogById.get(entry.parentCardId ?? entry.id)
              const feedMatch = feedItems.find(
                (f) => f.id === entry.feedItemId || f.parentCardId === entry.parentCardId,
              )
              return (
                <li key={`${entry.feedItemId}-${entry.viewedAt}`}>
                  <button
                    type="button"
                    className="library-row"
                    onClick={() => {
                      if (feedMatch) onOpenFeedItem(feedMatch.id)
                      else if (card) onOpenStory(card.id)
                    }}
                  >
                    <span className="library-row-title">{card?.title ?? feedMatch?.title ?? entry.id}</span>
                    <span className="library-row-meta">
                      {new Date(entry.viewedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
