import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FeedActions } from './FeedActions.jsx'
import { SlideFeedItem } from './SlideFeedItem.jsx'
import { VideoFeedItem } from './VideoFeedItem.jsx'
import { SessionSummaryCard } from './SessionSummaryCard.jsx'
import { rankFeedItems } from './rankFeedItems.js'
import {
  loadExploredIds,
  markCompleted,
  markExplored,
  pushRecentlyViewed,
} from './feedStorage.js'
import { loadFeedSession, markSessionSummaryShown, startFeedSession, updateFeedSession } from './feedSession.js'
import { loadNotInterestedIds } from './feedStorage.js'

const EXPLORE_THRESHOLD = 0.7
const EXPLORE_MS = 2000
const SUMMARY_AFTER = 8

function feedItemShareUrl(feedItemId) {
  const base = `${window.location.pathname}${window.location.search}`
  return `${base}#feed/${encodeURIComponent(feedItemId)}`
}

export function LearningReel({
  items,
  catalogCardById,
  savedCardIds,
  knownCardIds,
  onToggleSave,
  onKnown,
  onGoDeeper,
  onToast,
  onPreferenceRefresh,
  initialFeedItemId,
  onActiveFeedItemChange,
  slideIndexByFeedId,
  onSlideIndexChange,
  dripItems = [],
  offline = false,
  onOpenLibrary,
  onContinuePath,
}) {
  const scrollerRef = useRef(null)
  const visibilityTimers = useRef(new Map())
  const exploredThisSession = useRef(new Set(loadExploredIds()))
  const [exploredCount, setExploredCount] = useState(0)
  const [deepDiveCount, setDeepDiveCount] = useState(0)
  const [savedSessionCount, setSavedSessionCount] = useState(0)
  const [domainTally, setDomainTally] = useState(() => new Set())
  const [summaryInserted, setSummaryInserted] = useState(() => loadFeedSession().summaryShown)
  const [activeId, setActiveId] = useState(null)
  const [notInterestedVersion, setNotInterestedVersion] = useState(0)

  const recentPenalty = useMemo(() => {
    const map = new Map()
    return map
  }, [])

  const ranked = useMemo(() => {
    void notInterestedVersion
    const merged = [...items, ...dripItems].filter(
      (item) => !loadNotInterestedIds().includes(item.id),
    )
    const session = loadFeedSession()
    const rankedList = rankFeedItems({
      items: merged,
      savedCardIds,
      knownCardIds,
      recentViewPenalty: recentPenalty,
      dripInserts: [],
    })

    if (!session.stale && session.order?.length) {
      const orderSet = new Set(rankedList.map((i) => i.id))
      const restored = session.order.filter((id) => orderSet.has(id))
      for (const item of rankedList) {
        if (!restored.includes(item.id)) restored.push(item.id)
      }
      const byId = new Map(rankedList.map((i) => [i.id, i]))
      return restored.map((id) => byId.get(id)).filter(Boolean)
    }

    startFeedSession(
      rankedList.map((i) => i.id),
      initialFeedItemId ?? rankedList[0]?.id,
    )
    return rankedList
  }, [items, dripItems, savedCardIds, knownCardIds, recentPenalty, notInterestedVersion, initialFeedItemId])

  const displayList = useMemo(() => {
    if (summaryInserted || exploredCount < SUMMARY_AFTER) return ranked
    markSessionSummaryShown()
    const copy = [...ranked]
    const insertAt = Math.min(SUMMARY_AFTER, copy.length)
    copy.splice(insertAt, 0, { id: '__session_summary__', type: 'summary' })
    return copy
  }, [ranked, exploredCount, summaryInserted])

  useEffect(() => {
    if (initialFeedItemId && scrollerRef.current) {
      const el = scrollerRef.current.querySelector(`[data-feed-id="${initialFeedItemId}"]`)
      el?.scrollIntoView({ behavior: 'instant' })
      setActiveId(initialFeedItemId)
    }
  }, [initialFeedItemId, displayList.length])

  const markItemExplored = useCallback(
    (item) => {
      if (!item || item.id === '__session_summary__') return
      if (exploredThisSession.current.has(item.id)) return
      exploredThisSession.current.add(item.id)
      markExplored(item.id)
      pushRecentlyViewed({
        id: item.parentCardId,
        feedItemId: item.id,
        parentCardId: item.parentCardId,
      })
      setExploredCount((c) => c + 1)
      setDomainTally((prev) => new Set(prev).add(item.domain))
      onPreferenceRefresh?.()
    },
    [onPreferenceRefresh],
  )

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute('data-feed-id')
          if (!id) continue
          if (entry.isIntersecting && entry.intersectionRatio >= EXPLORE_THRESHOLD) {
            if (!visibilityTimers.current.has(id)) {
              const timer = window.setTimeout(() => {
                const item = ranked.find((i) => i.id === id)
                markItemExplored(item)
              }, EXPLORE_MS)
              visibilityTimers.current.set(id, timer)
            }
            if (entry.intersectionRatio >= 0.55) {
              setActiveId(id)
              updateFeedSession(
                ranked.map((i) => i.id),
                id,
              )
              onActiveFeedItemChange?.(id)
            }
          } else {
            const timer = visibilityTimers.current.get(id)
            if (timer) {
              window.clearTimeout(timer)
              visibilityTimers.current.delete(id)
            }
          }
        }
      },
      { root, threshold: [0.55, EXPLORE_THRESHOLD] },
    )

    root.querySelectorAll('[data-feed-id]').forEach((el) => observer.observe(el))
    return () => {
      observer.disconnect()
      visibilityTimers.current.forEach((t) => window.clearTimeout(t))
      visibilityTimers.current.clear()
    }
  }, [displayList, ranked, markItemExplored, onActiveFeedItemChange])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 8) return
      root.scrollBy({ top: e.deltaY, behavior: 'auto' })
    }
    root.addEventListener('wheel', onWheel, { passive: true })
    return () => root.removeEventListener('wheel', onWheel)
  }, [])

  const handleSaveToggle = (item) => {
    const card = catalogCardById.get(item.parentCardId)
    if (card) {
      onToggleSave(card)
      setSavedSessionCount((c) => c + 1)
    }
  }

  const handleKnown = (item) => {
    const card = catalogCardById.get(item.parentCardId)
    if (card) onKnown(card)
  }

  const stats = {
    exploredCount,
    domains: [...domainTally],
    savedCount: savedSessionCount,
    deepDives: deepDiveCount,
  }

  return (
    <div className="learning-reel-wrap">
      <div className="learning-reel-hint" aria-hidden="true">
        Scroll for more
      </div>
      <div className="learning-reel" ref={scrollerRef} tabIndex={0} aria-label="For You learning reel">
        {displayList.map((item) => {
          if (item.id === '__session_summary__') {
            return (
              <section key="__session_summary__" className="reel-page reel-page--summary" data-feed-id="__session_summary__">
                <SessionSummaryCard
                  stats={stats}
                  onKeepExploring={() => setSummaryInserted(true)}
                  onContinuePath={onContinuePath}
                  onReviewSaved={onOpenLibrary}
                  onFinish={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              </section>
            )
          }

          const slideIndex = slideIndexByFeedId?.[item.id] ?? 0
          const isActive = activeId === item.id
          const saved = savedCardIds.has(item.parentCardId)
          const known = knownCardIds.has(item.parentCardId)

          const metaParts = [item.domain, item.formatLabel ?? (item.type === 'video' ? 'Video' : 'Slides')]
          if (item.pathDripLabel) {
            metaParts.unshift(
              `${item.pathDripLabel} · Part ${item.pathDripStepIndex} of ${item.pathDripStepTotal}`,
            )
          } else if (item.zoneRefs?.[0]) {
            metaParts.unshift(`Zone step ${item.zoneRefs[0].stepIndex + 1}`)
          }

          const actions = (
            <FeedActions
              feedItem={item}
              saved={saved}
              known={known}
              onToggleSave={() => handleSaveToggle(item)}
              onKnown={() => handleKnown(item)}
              onToast={onToast}
              shareUrl={feedItemShareUrl(item.id)}
              onPreferenceChange={() => {
                setNotInterestedVersion((v) => v + 1)
                onPreferenceRefresh?.()
              }}
            />
          )

          return (
            <section key={item.id} className="reel-page" data-feed-id={item.id}>
              {item.type === 'video' ? (
                <VideoFeedItem
                  item={item}
                  isActive={isActive}
                  offline={offline}
                  metaLine={metaParts.join(' · ')}
                  onExplored={() => markItemExplored(item)}
                  onGoDeeper={() => {
                    setDeepDiveCount((c) => c + 1)
                    onGoDeeper(item, slideIndex)
                  }}
                  actions={actions}
                />
              ) : (
                <SlideFeedItem
                  item={item}
                  slideIndex={slideIndex}
                  onSlideIndexChange={(idx) => onSlideIndexChange?.(item.id, idx)}
                  metaLine={metaParts.join(' · ')}
                  onCompleted={() => markCompleted(item.id)}
                  onGoDeeper={() => {
                    setDeepDiveCount((c) => c + 1)
                    onGoDeeper(item, slideIndex)
                  }}
                  actions={actions}
                />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
