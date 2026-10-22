import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  addFewerTopic,
  addNotInterested,
  isLiked,
  penalizeDomain,
  toggleLikedId,
} from './feedStorage.js'

function IconHeart({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.75-9.5-9.5C1.25 8.25 3.5 5 6.75 5c1.75 0 3.25.9 4 2.25.75-1.35 2.25-2.25 4-2.25 3.25 0 5.5 3.25 4.25 6-2 4.75-9.5 9.5-9.5 9.5z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconBookmark({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M6 4h12v16l-6-4-6 4V4z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 3v12M12 3l4 4M12 3L8 7M5 14v5h14v-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMore() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="6" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" />
    </svg>
  )
}

export function FeedActions({
  feedItem,
  saved,
  known,
  onToggleSave,
  onKnown,
  onPreferenceChange,
  onToast,
  shareUrl,
}) {
  const [likedVersion, setLikedVersion] = useState(0)
  const liked = isLiked(feedItem.id)
  void likedVersion
  const [likePulse, setLikePulse] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const sheetId = useId()
  const restoreFocus = useRef(null)

  const toggleLike = useCallback(() => {
    toggleLikedId(feedItem.id)
    setLikedVersion((v) => v + 1)
    setLikePulse(true)
    onPreferenceChange?.()
    onToast?.('We will show more like this')
    window.setTimeout(() => setLikePulse(false), 400)
  }, [feedItem.id, onPreferenceChange, onToast])

  const share = useCallback(async () => {
    const text = `${feedItem.title}\n\n${feedItem.hook}\n\n${shareUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ title: feedItem.title, text: feedItem.hook, url: shareUrl })
        onToast?.('Shared')
        return
      }
      await navigator.clipboard.writeText(text)
      onToast?.('Link copied')
    } catch {
      onToast?.('Could not share')
    }
  }, [feedItem, onToast, shareUrl])

  const openSheet = () => {
    restoreFocus.current = document.activeElement
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    restoreFocus.current?.focus?.()
  }

  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeSheet()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  return (
    <div className="feed-actions">
      <button
        type="button"
        className={`feed-action-btn${liked ? ' feed-action-btn--active' : ''}${likePulse ? ' feed-action-btn--pulse' : ''}`}
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike — show fewer like this' : 'Like — show more like this'}
      >
        <IconHeart filled={liked} />
        <span>Like</span>
      </button>
      <button
        type="button"
        className={`feed-action-btn${saved ? ' feed-action-btn--active' : ''}`}
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={saved ? 'Unsave' : 'Save for later'}
      >
        <IconBookmark filled={saved} />
        <span>Save</span>
      </button>
      <button type="button" className="feed-action-btn" onClick={share} aria-label="Share">
        <IconShare />
        <span>Share</span>
      </button>
      <button
        type="button"
        className="feed-action-btn feed-action-btn--more"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        aria-controls={sheetId}
        aria-label="More actions"
      >
        <IconMore />
        <span>More</span>
      </button>

      {sheetOpen ? (
        <div className="feed-sheet-backdrop" role="presentation" onClick={closeSheet}>
          <div
            id={sheetId}
            className="feed-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More actions"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="feed-sheet-item"
              onClick={() => {
                onKnown?.()
                closeSheet()
              }}
            >
              {known ? 'Mark as new again' : 'I knew this'}
            </button>
            <button
              type="button"
              className="feed-sheet-item"
              onClick={() => {
                addNotInterested(feedItem.id)
                onPreferenceChange?.()
                onToast?.('Hidden for this session')
                closeSheet()
              }}
            >
              Not for me
            </button>
            <button
              type="button"
              className="feed-sheet-item"
              onClick={() => {
                penalizeDomain(feedItem.domain)
                for (const t of feedItem.topics ?? []) addFewerTopic(t)
                onPreferenceChange?.()
                onToast?.('We will show fewer like this')
                closeSheet()
              }}
            >
              Show me fewer topics like this
            </button>
            <button type="button" className="feed-sheet-cancel" onClick={closeSheet}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
