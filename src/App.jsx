import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decadeTimelinePercent, formatDecadeKeyLabel, uniqueDecadeKeysFromCards } from './catalog/cardTimeline.js'
import {
  CARD_BY_ID,
  HISTORY_CARDS,
  LEARNING_DOMAINS,
  TOPIC_LIST,
  normalizeCard,
  recommendNextCard,
} from './catalog/catalog.js'
import { LEARN_LEVELS, LEARN_SCOPES } from './learn/learnOptions.js'
import { LearnPathChapters } from './learn/LearnPathChapters.jsx'
import { LearnTopicPanel } from './learn/LearnTopicPanel.jsx'
import { LearningLessonPlaceholder } from './learn/LearningLessonDetail.jsx'
import { MyPathsSection } from './learn/MyPathsSection.jsx'
import { buildDemoPathRecord } from './learn/demo/mockLearningPathAdapter.js'
import {
  generateLesson,
  isForceMockMode,
  isMissingConfigError,
  planLearningPath,
} from './learn/learningPathApi.js'
import {
  createPathRecordFromPlan,
  deletePath,
  getPathById,
  loadActivePathId,
  loadAllPaths,
  markLessonComplete,
  mergeSourcesIntoCatalog,
  setActivePathId,
  touchPathOpened,
  updateLessonInPath,
  upsertPath,
} from './learn/learningPathStorage.js'
import { lessonToDisplayCard, plannedLessonsForActiveTrack } from './learn/lessonToCard.js'
import {
  getLocalDateKey,
  isDailyEditionVisible,
  markEditionCardExplored,
  selectDailyEdition,
} from './edition/dailyEdition.js'
import { isNarrativeCard } from './stories/flagshipStories.js'
import { RichStoryDetail } from './stories/RichStoryDetail.jsx'
import { StoryArt, StoryVideo } from './stories/StoryPreviewCard.jsx'
import { PrimaryNavigation } from './components/PrimaryNavigation.jsx'
import { ExplorePanel } from './feed/ExplorePanel.jsx'
import { LearningReel } from './feed/LearningReel.jsx'
import { feedItemFromCatalogCard } from './feed/cardAdapter.js'
import { loadFeedItems } from './feed/feedRepository.js'
import { loadDetailModePreference, saveDetailModePreference } from './feed/feedStorage.js'
import { buildPathDripFeedItems } from './feed/pathDrip.js'
import { LibraryPanel } from './library/LibraryPanel.jsx'
import { getZoneById } from './zones/zoneData.js'
import { buildZoneDripFeedItems } from './zones/zoneDripFeed.js'
import {
  loadPathDripEnabled,
  loadZoneDripEnabled,
  loadZoneProgress,
  markZoneStepComplete,
  setPathDripEnabled,
} from './zones/zoneProgress.js'
import { ZoneDetail } from './zones/ZoneDetail.jsx'
import { ZonesPanel } from './zones/ZonesPanel.jsx'
import {
  FEED_HISTORY_STATE,
  LIBRARY_HISTORY_STATE,
  ZONES_HISTORY_STATE,
  feedHistoryState,
  feedItemIdFromLocation,
  feedUrl,
  learnHomeHistoryState,
  learnHomeUrl,
  learnPathHistoryState,
  learnPathIdFromLocation,
  learnPathUrl,
  libraryUrl,
  shortPathUrl,
  storyHistoryState,
  storyIdFromLocation,
  storyUrl,
  zoneHistoryState,
  zoneIdFromLocation,
  zoneUrl,
  zonesUrl,
} from './routing.js'
import { STORAGE_KEYS, readJson, writeJson } from './storage/localStore.js'
import './App.css'

function detailFactBullets(card) {
  if (card.factBullets?.length) return card.factBullets
  const text = (card.coreFact ?? card.story ?? '').trim()
  if (!text) return []
  if (text.length <= 260) return [text]
  const sentences =
    text.match(/[^.!?]+[.!?]+(?:\s|$)/gu)?.map((s) => s.trim()).filter(Boolean) ??
    []
  if (sentences.length > 1) return sentences.slice(0, 6)
  return [text]
}

function StoryDetailHero({ card, badges }) {
  return (
    <div className="story-detail-hero">
      <StoryArt image={card.image} title={card.title} variant="detail" />
      <div className="story-detail-hero-body">
        <div className="story-card-labels">
          <span className="category">{card.domain ?? card.category}</span>
          {card.decadeLabel ? (
            <span className="decade-tag">{card.decadeLabel}</span>
          ) : null}
          {card.format ? <span className="format-label">{card.format}</span> : null}
        </div>
        <h2 className="story-detail-title">{card.title}</h2>
        {badges}
      </div>
    </div>
  )
}

function StoryStatusBadges({ saved, known }) {
  if (!saved && !known) return null
  return (
    <div className="story-card-tags">
      {saved && <span className="meta-badge meta-badge--saved">Saved</span>}
      {known && <span className="meta-badge">Known</span>}
    </div>
  )
}

function ContinueLearning({ card, onOpen }) {
  return (
    <div className="story-next">
      <h3 className="story-section-label">Continue learning</h3>
      <button type="button" className="story-next-card" onClick={() => onOpen(card.id)}>
        <span className="story-next-title">{card.title}</span>
        <span className="story-next-meta">
          {card.domain}
          {card.format ? ` · ${card.format}` : ''}
        </span>
      </button>
    </div>
  )
}

function StoryDetailSections({ card }) {
  const facts = detailFactBullets(card)
  const setup = card.scene?.trim()
  const hook = card.hook?.trim()
  const why = (card.whyItMatters ?? card.relevance)?.trim()
  const rabbit = card.rabbitHole?.trim()

  return (
    <div className="story-detail-sections">
      {hook ? (
        <section className="story-section">
          <h3 className="story-section-label">Hook</h3>
          <p className="story-section-body story-section-body--hook">{hook}</p>
        </section>
      ) : null}
      {setup ? (
        <section className="story-section">
          <h3 className="story-section-label">The setup</h3>
          <p className="story-section-body">{setup}</p>
        </section>
      ) : null}
      {facts.length > 0 ? (
        <section className="story-section">
          <h3 className="story-section-label">The fact</h3>
          {facts.length === 1 ? (
            <p className="story-section-body">{facts[0]}</p>
          ) : (
            <ul className="story-fact-list">
              {facts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {why ? (
        <section className="story-section story-section--matters">
          <h3 className="story-section-label">Why it matters</h3>
          <p className="story-section-body">{why}</p>
        </section>
      ) : null}
      {rabbit ? (
        <section className="story-section story-section--rabbit">
          <h3 className="story-section-label">Rabbit hole</h3>
          <p className="story-section-body story-section-body--rabbit">{rabbit}</p>
          <StoryVideo youtubeId={card.youtubeId} title={card.title} />
        </section>
      ) : null}
    </div>
  )
}

function findLessonCardAcrossPaths(id, pathCards, paths) {
  const fromActive = pathCards?.find((c) => c.id === id)
  if (fromActive) return fromActive
  for (const pathRecord of paths) {
    for (const track of pathRecord.course?.tracks ?? []) {
      const lesson = track.lessons.find((l) => l.id === id)
      if (lesson) {
        return lessonToDisplayCard({
          pathRecord,
          trackId: track.id,
          lesson,
          trackTitle: track.title,
          trackLessonCount: track.lessons.length,
        })
      }
    }
  }
  return null
}

function cardByIdFromPools(id, pathCards, paths) {
  const catalog = HISTORY_CARDS.find((c) => c.id === id)
  if (catalog) return catalog
  return findLessonCardAcrossPaths(id, pathCards, paths)
}

function uiStateFromPlan(plan) {
  if (plan.scopeDecision === 'needs_narrowing') return 'needs_clarification'
  if (plan.scopeDecision === 'multi_track') return 'multi_track_proposed'
  return 'single_path_proposed'
}

function TimelineFilter({ decades, selectedDecades, onToggleDecade, onClear }) {
  if (decades.length === 0) return null

  return (
    <div className="timeline-filter" aria-label="Filter by decade">
      <div className="timeline-filter-head">
        <span className="timeline-filter-title">Timeline</span>
        {selectedDecades.size > 0 ? (
          <button type="button" className="timeline-filter-clear" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      <div className="timeline-track-wrap">
        <div className="timeline-track" aria-hidden="true">
          <div className="timeline-track-glow" />
          {decades.map((key) => (
            <span
              key={`tick-${key}`}
              className="timeline-track-tick"
              style={{ left: `${decadeTimelinePercent(key)}%` }}
            />
          ))}
        </div>
        <div className="timeline-decades-scroll">
          <nav className="timeline-decades">
            <button
              type="button"
              className={`timeline-decade-chip${selectedDecades.size === 0 ? ' active' : ''}`}
              onClick={onClear}
            >
              All eras
            </button>
            {decades.map((key) => {
              const active = selectedDecades.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  className={`timeline-decade-chip${active ? ' active' : ''}`}
                  style={{ '--timeline-pos': `${decadeTimelinePercent(key)}%` }}
                  onClick={() => onToggleDecade(key)}
                  aria-pressed={active}
                >
                  {formatDecadeKeyLabel(key)}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
      <p className="timeline-filter-hint">
        Tap a decade to filter the feed—science cards use discovery or invention dates.
      </p>
    </div>
  )
}

/** Resolve the current URL into UI state (initial load and in-app #hash links). */
function resolveRouteFromLocation() {
  const storyId = storyIdFromLocation()
  const feedItemId = feedItemIdFromLocation()
  const zoneId = zoneIdFromLocation()
  const pathId = learnPathIdFromLocation()
  const hash = window.location.hash
  const route = {
    homePanel: 'feed',
    learnUiState: 'home',
    storyId: null,
    feedItemId: null,
    zoneViewId: null,
    pathRecord: null,
    historyState: FEED_HISTORY_STATE,
    url: feedUrl(),
  }

  if (
    storyId &&
    (HISTORY_CARDS.some((c) => c.id === storyId) ||
      findLessonCardAcrossPaths(storyId, [], loadAllPaths()))
  ) {
    return { ...route, storyId, historyState: storyHistoryState(storyId), url: storyUrl(storyId) }
  }
  if (feedItemId) {
    return {
      ...route,
      feedItemId,
      historyState: feedHistoryState('forYou', feedItemId),
      url: feedUrl(feedItemId),
    }
  }
  if (zoneId && getZoneById(zoneId)) {
    return {
      ...route,
      homePanel: 'zones',
      zoneViewId: zoneId,
      historyState: zoneHistoryState(zoneId),
      url: zoneUrl(zoneId),
    }
  }
  const pathRecord = pathId ? getPathById(pathId) : null
  if (pathRecord) {
    return {
      ...route,
      homePanel: 'learn',
      learnUiState: 'path',
      pathRecord,
      historyState: learnPathHistoryState(pathRecord.id),
      url: learnPathUrl(pathRecord.id),
    }
  }
  if (hash.startsWith('#learn')) {
    return { ...route, homePanel: 'learn', historyState: learnHomeHistoryState(), url: learnHomeUrl() }
  }
  if (hash === '#zones') {
    return { ...route, homePanel: 'zones', historyState: ZONES_HISTORY_STATE, url: zonesUrl() }
  }
  if (hash === '#library') {
    return { ...route, homePanel: 'library', historyState: LIBRARY_HISTORY_STATE, url: libraryUrl() }
  }
  return route
}

function App() {
  const [initialRoute] = useState(resolveRouteFromLocation)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState(() => new Set())
  const [selectedDecades, setSelectedDecades] = useState(() => new Set())
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [filterListOpen, setFilterListOpen] = useState(false)
  const [homePanel, setHomePanel] = useState(initialRoute.homePanel)
  const [learnTopic, setLearnTopic] = useState('')
  const [learnLevel, setLearnLevel] = useState('curious')
  const [learnScope, setLearnScope] = useState('both')
  const [learnLength, setLearnLength] = useState(5)
  const [learnFocus, setLearnFocus] = useState('')
  const [learnUiState, setLearnUiState] = useState(initialRoute.learnUiState)
  const [planResult, setPlanResult] = useState(null)
  const [planError, setPlanError] = useState(null)
  const [planningMessage, setPlanningMessage] = useState('')
  const [pathsVersion, setPathsVersion] = useState(0)
  const planSubmitLock = useRef(false)
  const [planSubmitLocked, setPlanSubmitLocked] = useState(false)
  const lessonGenLock = useRef(new Set())
  // Lets callbacks declared earlier (and the prefetch chain) call the latest generator.
  const generateLessonForStoryRef = useRef(null)
  const [activePathRecord, setActivePathRecord] = useState(() => {
    if (initialRoute.pathRecord) return initialRoute.pathRecord
    const id = loadActivePathId()
    return id ? getPathById(id) : null
  })
  const [lessonGenPhase, setLessonGenPhase] = useState(null)
  const [activeZoneId, setActiveZoneId] = useState(null)
  const [activeZoneViewId, setActiveZoneViewId] = useState(initialRoute.zoneViewId)
  const [feedMode, setFeedMode] = useState('forYou')
  const [feedItems, setFeedItems] = useState([])
  const [feedRankKey, setFeedRankKey] = useState(0)
  const [deepLinkFeedItemId, setDeepLinkFeedItemId] = useState(initialRoute.feedItemId)
  const [slideIndexByFeedId, setSlideIndexByFeedId] = useState({})
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [detailMode, setDetailMode] = useState(() => loadDetailModePreference())
  const [pathDripIds, setPathDripIds] = useState(() => loadPathDripEnabled())
  const [savedCards, setSavedCards] = useState(() =>
    readJson(STORAGE_KEYS.saved, []),
  )
  const [knownIds, setKnownIds] = useState(() => new Set(readJson(STORAGE_KEYS.known, [])))
  const [activeStoryId, setActiveStoryId] = useState(initialRoute.storyId)

  const [storedPaths, setStoredPaths] = useState(() => loadAllPaths())

  const generatedPathCards = useMemo(() => {
    if (!activePathRecord) return []
    return plannedLessonsForActiveTrack(activePathRecord)
  }, [activePathRecord])
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const activeStory = useMemo(() => {
    const raw = cardByIdFromPools(activeStoryId, generatedPathCards, storedPaths)
    return raw ? normalizeCard(raw) : null
  }, [activeStoryId, generatedPathCards, storedPaths])

  const recommendedNext = useMemo(() => {
    if (!activeStoryId) return null
    const pathIdx = generatedPathCards.findIndex((c) => c.id === activeStoryId)
    if (pathIdx >= 0) {
      return generatedPathCards[pathIdx + 1] ?? null
    }
    return recommendNextCard(activeStoryId, knownIds)
  }, [activeStoryId, knownIds, generatedPathCards])

  const isGeneratedStory = useMemo(() => {
    if (!activeStoryId) return false
    return generatedPathCards.some((c) => c.id === activeStoryId)
  }, [activeStoryId, generatedPathCards])

  const savedIds = useMemo(
    () => new Set(savedCards.map((c) => c.id)),
    [savedCards],
  )

  const savedCardsLive = useMemo(() => {
    const byId = new Map(HISTORY_CARDS.map((c) => [c.id, c]))
    return savedCards.map((s) => normalizeCard(byId.get(s.id) ?? s))
  }, [savedCards])

  const activeZone = useMemo(
    () => (activeZoneId ? getZoneById(activeZoneId) : null),
    [activeZoneId],
  )

  const catalogFeedExtras = useMemo(
    () => HISTORY_CARDS.map((c) => feedItemFromCatalogCard(c)).filter(Boolean),
    [],
  )

  useEffect(() => {
    let cancelled = false
    void loadFeedItems(catalogFeedExtras).then(({ items }) => {
      if (cancelled) return
      setFeedItems(items)
    })
    return () => {
      cancelled = true
    }
  }, [catalogFeedExtras])

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Zone drip settings live in storage; feedRankKey bumps whenever they may have changed.
  const zoneDripSnapshot = useMemo(() => {
    void feedRankKey
    return { enabled: loadZoneDripEnabled(), progress: loadZoneProgress() }
  }, [feedRankKey])

  const zoneDripItems = useMemo(
    () => buildZoneDripFeedItems(feedItems, zoneDripSnapshot),
    [feedItems, zoneDripSnapshot],
  )

  const pathDripItems = useMemo(
    () => buildPathDripFeedItems(feedItems, { paths: storedPaths, enabledIds: pathDripIds }),
    [feedItems, storedPaths, pathDripIds],
  )

  const filteredCards = useMemo(() => {
    let pool = showSavedOnly ? savedCardsLive : HISTORY_CARDS
    if (activeZone) {
      const allowed = new Set(activeZone.steps.map((s) => s.cardId))
      pool = pool.filter((c) => allowed.has(c.id))
    }
    if (selectedDomain) {
      pool = pool.filter((c) => c.domain === selectedDomain)
    }
    if (selectedTopics.size > 0) {
      pool = pool.filter((c) => c.category && selectedTopics.has(c.category))
    }
    if (selectedDecades.size > 0) {
      pool = pool.filter((c) => c.decadeKey && selectedDecades.has(c.decadeKey))
    }
    return pool
  }, [showSavedOnly, savedCardsLive, selectedDomain, selectedTopics, selectedDecades, activeZone])

  const catalogDecades = useMemo(
    () => uniqueDecadeKeysFromCards(HISTORY_CARDS),
    [],
  )

  const allDomainsSelected = selectedDomain === null
  const activeFilterCount =
    (selectedDomain ? 1 : 0) + selectedTopics.size + selectedDecades.size

  const toggleSavedView = useCallback(() => {
    setShowSavedOnly((on) => !on)
    setFilterListOpen(false)
  }, [])

  const selectAllDomains = useCallback(() => {
    setSelectedDomain(null)
    setActiveZoneId(null)
  }, [])

  const clearActiveZone = useCallback(() => {
    setActiveZoneId(null)
  }, [])

  const openZoneDetail = useCallback((zoneId) => {
    setActiveZoneViewId(zoneId)
    setHomePanel('zones')
    window.history.pushState(zoneHistoryState(zoneId), '', zoneUrl(zoneId))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const pickDomain = useCallback((domain) => {
    setSelectedDomain((prev) => (prev === domain ? null : domain))
  }, [])

  const toggleTopic = useCallback((topic) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topic)) next.delete(topic)
      else next.add(topic)
      return next
    })
  }, [])

  const clearTopicFilters = useCallback(() => {
    setSelectedTopics(new Set())
  }, [])

  const clearDecadeFilters = useCallback(() => {
    setSelectedDecades(new Set())
  }, [])

  const toggleDecade = useCallback((decadeKey) => {
    setSelectedDecades((prev) => {
      const next = new Set(prev)
      if (next.has(decadeKey)) next.delete(decadeKey)
      else next.add(decadeKey)
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedDomain(null)
    setSelectedTopics(new Set())
    setSelectedDecades(new Set())
  }, [])

  const leaveSavedView = useCallback(() => {
    setShowSavedOnly(false)
  }, [])

  useEffect(() => {
    writeJson(STORAGE_KEYS.saved, savedCards)
  }, [savedCards])

  useEffect(() => {
    writeJson(STORAGE_KEYS.known, [...knownIds])
  }, [knownIds])

  useEffect(() => {
    const applyHistoryState = (state) => {
      if (state?.view === 'story' && state.id) {
        setActiveStoryId(state.id)
        if (state.returnFeed) {
          setHomePanel('feed')
          setFeedMode('forYou')
          setDeepLinkFeedItemId(state.returnFeed.feedItemId)
          setSlideIndexByFeedId((prev) => ({
            ...prev,
            [state.returnFeed.feedItemId]: state.returnFeed.slideIndex ?? 0,
          }))
        }
        return
      }
      if (state?.view === 'zone' && state.zoneId) {
        setActiveStoryId(null)
        setHomePanel('zones')
        setActiveZoneViewId(state.zoneId)
        return
      }
      if (state?.view === 'feed') {
        setActiveStoryId(null)
        setHomePanel('feed')
        setFeedMode(state.mode ?? 'forYou')
        if (state.feedItemId) setDeepLinkFeedItemId(state.feedItemId)
        return
      }
      if (state?.view === 'learnPath' && state.pathId) {
        setActiveStoryId(null)
        setHomePanel('learn')
        setLearnUiState('path')
        const path = getPathById(state.pathId)
        if (path) {
          setActivePathRecord(path)
          setActivePathId(path.id)
        }
        return
      }
      if (state?.view === 'learnHome') {
        setActiveStoryId(null)
        setHomePanel('learn')
        setLearnUiState('home')
        return
      }
      if (state?.view === 'zones') {
        setActiveStoryId(null)
        setHomePanel('zones')
        setActiveZoneViewId(null)
        return
      }
      if (state?.view === 'library') {
        setActiveStoryId(null)
        setHomePanel('library')
        return
      }
      setActiveStoryId(null)
      setHomePanel('feed')
      setFeedMode('forYou')
    }

    // Normalize the entry's history state; React state was initialized from the same route.
    window.history.replaceState(initialRoute.historyState, '', initialRoute.url)
    if (initialRoute.pathRecord) setActivePathId(initialRoute.pathRecord.id)

    const onPopState = (event) => {
      if (event.state) {
        applyHistoryState(event.state)
      } else {
        // A typed or tapped #hash link (fragment navigation) has no state: resolve it from the URL.
        const route = resolveRouteFromLocation()
        window.history.replaceState(route.historyState, '', route.url)
        applyHistoryState(route.historyState)
      }
      window.scrollTo(0, 0)
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [initialRoute])

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const handleSave = useCallback(
    (card) => {
      setSavedCards((prev) => {
        if (prev.some((c) => c.id === card.id)) {
          showToast('Removed from saved')
          return prev.filter((c) => c.id !== card.id)
        }
        showToast('Saved for later')
        return [...prev, card]
      })
    },
    [showToast],
  )

  const feedStatus = useMemo(() => {
    const parts = []
    if (showSavedOnly) parts.push('Saved')
    if (activeZone) parts.push(`Zone: ${activeZone.title}`)
    parts.push(
      `${filteredCards.length} ${filteredCards.length === 1 ? 'story' : 'stories'}`,
    )
    if (activeFilterCount > 0) {
      parts.push(
        `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'}`,
      )
    }
    return parts.join(' · ')
  }, [showSavedOnly, activeZone, filteredCards.length, activeFilterCount])

  const emptyState = useMemo(() => {
    if (showSavedOnly && savedCards.length === 0) {
      return {
        title: 'No saved stories yet',
        body: 'Tap Save on any story in the feed to keep it here for later.',
        action: { label: 'Browse feed', onClick: leaveSavedView },
      }
    }
    if (showSavedOnly && activeFilterCount > 0) {
      return {
        title: 'No matches in saved',
        body: 'None of your saved stories match the domains or topics you picked.',
        action: { label: 'Clear filters', onClick: clearAllFilters },
      }
    }
    if (activeFilterCount > 0) {
      return {
        title: 'No stories for these filters',
        body: 'Try fewer domains, topics, or timeline decades—or reset to see the full feed.',
        action: { label: 'Show all', onClick: clearAllFilters },
      }
    }
    return {
      title: 'Nothing to show',
      body: 'Check back soon for new stories.',
      action: null,
    }
  }, [
    showSavedOnly,
    savedCards.length,
    activeFilterCount,
    clearAllFilters,
    leaveSavedView,
  ])

  const handleKnown = useCallback(
    (card) => {
      setKnownIds((prev) => {
        const next = new Set(prev)
        if (next.has(card.id)) {
          next.delete(card.id)
          showToast('Marked as new again')
        } else {
          next.add(card.id)
          showToast('Nice — marked as known')
        }
        return next
      })
    },
    [showToast],
  )

  const openFeedItemById = useCallback(
    (feedItemId) => {
      setHomePanel('feed')
      setFeedMode('forYou')
      setDeepLinkFeedItemId(feedItemId)
      setActiveStoryId(null)
      window.history.pushState(feedHistoryState('forYou', feedItemId), '', feedUrl(feedItemId))
    },
    [],
  )

  const openStoryFromFeed = useCallback(
    (feedItem, slideIndex = 0) => {
      const ret = { feedItemId: feedItem.id, slideIndex }
      setSlideIndexByFeedId((prev) => ({ ...prev, [feedItem.id]: slideIndex }))
      setFilterListOpen(false)
      setActiveStoryId(feedItem.parentCardId)
      setHomePanel('feed')
      const pathCard = findLessonCardAcrossPaths(
        feedItem.parentCardId,
        generatedPathCards,
        loadAllPaths(),
      )
      if (pathCard?.pathId) {
        const path = touchPathOpened(pathCard.pathId) ?? getPathById(pathCard.pathId)
        if (path) {
          setActivePathRecord(path)
          setActivePathId(path.id)
        }
      }
      window.history.pushState(
        storyHistoryState(feedItem.parentCardId, ret),
        '',
        storyUrl(feedItem.parentCardId),
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [generatedPathCards],
  )

  const openStory = useCallback((id) => {
    setFilterListOpen(false)
    setActiveStoryId(id)
    const pathCard = findLessonCardAcrossPaths(id, generatedPathCards, loadAllPaths())
    if (pathCard?.pathId) {
      const path = touchPathOpened(pathCard.pathId) ?? getPathById(pathCard.pathId)
      if (path) {
        setActivePathRecord(path)
        setActivePathId(path.id)
        setHomePanel('learn')
        setLearnUiState('path')
      }
    }
    const dateKey = getLocalDateKey()
    const { picks } = selectDailyEdition(HISTORY_CARDS, dateKey)
    const editionIds = new Set(
      Object.values(picks)
        .filter(Boolean)
        .map((p) => p.id),
    )
    if (editionIds.has(id)) {
      markEditionCardExplored(dateKey, id)
      window.dispatchEvent(new Event('daily-edition-progress'))
    }
    const current = window.history.state
    if (current?.view !== 'story' || current?.id !== id) {
      window.history.pushState(storyHistoryState(id), '', storyUrl(id))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [generatedPathCards])

  const closeStory = useCallback(() => {
    if (window.history.state?.view === 'story') {
      window.history.back()
      return
    }
    setActiveStoryId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSurprise = useCallback(() => {
    const pool = filteredCards
    if (pool.length === 0) return
    const unknown = pool.filter((c) => !knownIds.has(c.id))
    const pickFrom = unknown.length > 0 ? unknown : pool
    const card = pickFrom[Math.floor(Math.random() * pickFrom.length)]
    openStory(card.id)
    showToast(`Surprise: ${card.title}`)
  }, [filteredCards, knownIds, showToast, openStory])

  const bumpPaths = useCallback(() => {
    setStoredPaths(loadAllPaths())
    setPathsVersion((v) => v + 1)
  }, [])

  const resetLearnFlow = useCallback(() => {
    setLearnUiState('home')
    setPlanResult(null)
    setPlanError(null)
    setLearnTopic('')
    setLearnFocus('')
    setLearnLevel('curious')
    setLearnScope('both')
    setLearnLength(5)
    setActivePathRecord(null)
    setActivePathId(null)
    window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
  }, [])

  const markActiveLessonComplete = useCallback(() => {
    if (!activeStory?.isGeneratedPath || !activeStory.trackId || !activePathRecord) return
    const next = markLessonComplete(activePathRecord, activeStory.trackId, activeStory.id)
    setActivePathRecord(next)
    bumpPaths()
  }, [activeStory, activePathRecord, bumpPaths])

  const openPathScreen = useCallback(
    (pathId) => {
      const path = touchPathOpened(pathId) ?? getPathById(pathId)
      if (!path) return
      setActivePathId(path.id)
      setActivePathRecord(path)
      setLearnUiState('path')
      setHomePanel('learn')
      setPlanResult(null)
      setActiveStoryId(null)
      window.history.pushState(learnPathHistoryState(path.id), '', shortPathUrl(path.id))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [],
  )

  const exitLearnPathToHome = useCallback(() => {
    setLearnUiState('home')
    setActiveStoryId(null)
    window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const backToPathScreen = useCallback(() => {
    markActiveLessonComplete()
    setActiveStoryId(null)
    setLearnUiState('path')
    setHomePanel('learn')
    const pathId = activePathRecord?.id ?? loadActivePathId()
    if (pathId) {
      const path = touchPathOpened(pathId) ?? getPathById(pathId)
      if (path) {
        setActivePathRecord(path)
        setActivePathId(path.id)
      }
      window.history.pushState(learnPathHistoryState(pathId), '', learnPathUrl(pathId))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activePathRecord, markActiveLessonComplete])

  const openNextPathChapter = useCallback(
    (nextId) => {
      markActiveLessonComplete()
      openStory(nextId)
    },
    [markActiveLessonComplete, openStory],
  )

  const openRecommendedNext = useCallback(
    (id) => (isGeneratedStory ? openNextPathChapter(id) : openStory(id)),
    [isGeneratedStory, openNextPathChapter, openStory],
  )

  const handleDetailBack = useCallback(() => {
    if (activeStory?.isGeneratedPath) {
      const cards = generatedPathCards.length
        ? generatedPathCards
        : plannedLessonsForActiveTrack(
            activePathRecord ?? getPathById(loadActivePathId() ?? ''),
          )
      const idx = cards.findIndex((c) => c.id === activeStory.id)
      if (idx > 0) {
        markActiveLessonComplete()
        if (window.history.state?.view === 'story') {
          window.history.back()
        } else {
          openStory(cards[idx - 1].id)
        }
        return
      }
      backToPathScreen()
      return
    }
    closeStory()
  }, [
    activeStory,
    generatedPathCards,
    activePathRecord,
    markActiveLessonComplete,
    openStory,
    backToPathScreen,
    closeStory,
  ])

  const continueLearnTopic = useCallback(() => {
    if (!learnTopic.trim()) return
    setLearnUiState('confirm')
  }, [learnTopic])

  const runPlanRequest = useCallback(
    async ({ topicOverride, focusOverride } = {}) => {
      if (planSubmitLock.current) return
      const topic = (topicOverride ?? learnTopic).trim().slice(0, 150)
      if (!topic) return

      planSubmitLock.current = true
      setPlanSubmitLocked(true)
      setPlanError(null)
      setLearnUiState('planning')
      setPlanningMessage('Assessing the scope…')

      if (isForceMockMode()) {
        setPlanningMessage('Designing the learning sequence…')
        const demo = buildDemoPathRecord({
          topic,
          level: learnLevel,
          scope: learnScope,
          length: learnLength,
          focus: focusOverride ?? learnFocus,
        })
        upsertPath(demo)
        setActivePathId(demo.id)
        setActivePathRecord(demo)
        bumpPaths()
        setLearnUiState('path')
        setHomePanel('learn')
        window.history.pushState(learnPathHistoryState(demo.id), '', learnPathUrl(demo.id))
        planSubmitLock.current = false
        setPlanSubmitLocked(false)
        showToast('Demo path ready')
        return
      }

      setPlanningMessage('Designing the learning sequence…')
      const result = await planLearningPath({
        topic,
        focus: (focusOverride ?? learnFocus).trim().slice(0, 300),
        level: learnLevel,
        geographicScope: learnScope,
        requestedLength: learnLength === 3 ? 3 : 5,
        buildMode: 'single_track',
      })

      planSubmitLock.current = false
      setPlanSubmitLocked(false)

      if (!result.ok) {
        setPlanError({
          message: result.error,
          code: result.code,
          requestId: result.requestId,
          retryable: result.retryable,
          missingConfig: isMissingConfigError(result),
        })
        setLearnUiState('error')
        return
      }

      if (result.data.inputStatus === 'unsupported') {
        setPlanError({
          message: result.data.scopeExplanation || 'This topic is not supported for learning paths.',
          code: 'UNSUPPORTED',
          retryable: false,
        })
        setLearnUiState('error')
        return
      }

      setPlanResult(result.data)
      setLearnUiState(uiStateFromPlan(result.data))
    },
    [learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast],
  )

  const handleAssessTopic = useCallback(() => {
    void runPlanRequest()
  }, [runPlanRequest])

  const handleRetryPlan = useCallback(() => {
    void runPlanRequest()
  }, [runPlanRequest])

  const handleUseDemoFallback = useCallback(() => {
    const topic = learnTopic.trim()
    if (!topic) return
    setLearnUiState('saving')
    const demo = buildDemoPathRecord({
      topic,
      level: learnLevel,
      scope: learnScope,
      length: learnLength,
      focus: learnFocus,
    })
    upsertPath(demo)
    setActivePathId(demo.id)
    setActivePathRecord(demo)
    bumpPaths()
    setLearnUiState('path')
    setHomePanel('learn')
    window.history.pushState(learnPathHistoryState(demo.id), '', learnPathUrl(demo.id))
    showToast('Demo path ready (not live AI)')
  }, [learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast])

  const persistPlanChoice = useCallback(
    ({ buildMode, activeTrackId, sourceLabel = 'generated', isDemo = false }) => {
      if (!planResult?.course) return
      setLearnUiState('saving')
      const record = createPathRecordFromPlan({
        plan: planResult,
        preferences: {
          topic: learnTopic.trim(),
          level: learnLevel,
          scope: learnScope,
          length: learnLength,
          focus: learnFocus.trim(),
        },
        buildMode,
        activeTrackId,
        sourceLabel,
        isDemo,
      })
      const saved = upsertPath(record)
      setActivePathId(saved.id)
      setActivePathRecord(saved)
      bumpPaths()
      setLearnUiState('path')
      setHomePanel('learn')
      window.history.pushState(learnPathHistoryState(saved.id), '', learnPathUrl(saved.id))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      showToast('Learning path saved · generating lesson 1…')
      const firstTrack = saved.course?.tracks?.find((t) => t.id === activeTrackId)
      const firstLesson = firstTrack?.lessons?.slice().sort((a, b) => a.order - b.order)[0]
      if (firstLesson && !isDemo) {
        const card = lessonToDisplayCard({
          pathRecord: saved,
          trackId: firstTrack.id,
          lesson: firstLesson,
          trackTitle: firstTrack.title,
          trackLessonCount: firstTrack.lessons.length,
        })
        queueMicrotask(() => {
          void generateLessonForStoryRef.current?.(card, { prefetch: true })
        })
      }
    },
    [planResult, learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast],
  )

  const handleConfirmSinglePath = useCallback(() => {
    const trackId = planResult?.course?.tracks?.[0]?.id
    if (!trackId) return
    persistPlanChoice({ buildMode: 'single_track', activeTrackId: trackId })
  }, [planResult, persistPlanChoice])

  const handleLearnTrack = useCallback(
    (trackId) => {
      persistPlanChoice({ buildMode: 'single_track', activeTrackId: trackId })
    },
    [persistPlanChoice],
  )

  const handleBuildFullCourse = useCallback(() => {
    const trackId =
      planResult?.course?.recommendedTrackId ?? planResult?.course?.tracks?.[0]?.id ?? null
    if (!trackId) return
    persistPlanChoice({ buildMode: 'full_course', activeTrackId: trackId })
  }, [planResult, persistPlanChoice])

  const handleSelectNarrowing = useCallback(
    (option) => {
      setLearnTopic(option.refinedTopic)
      setLearnFocus((prev) => {
        const trimmed = prev.trim()
        return trimmed ? `${trimmed}; ${option.label}` : option.label
      })
      void runPlanRequest({ topicOverride: option.refinedTopic })
    },
    [runPlanRequest],
  )

  const handleResumePath = useCallback(
    (pathId) => {
      openPathScreen(pathId)
    },
    [openPathScreen],
  )

  const handleDeletePath = useCallback(
    (pathId, title) => {
      const ok = window.confirm(`Delete “${title}”? This cannot be undone.`)
      if (!ok) return
      deletePath(pathId)
      bumpPaths()
      if (activePathRecord?.id === pathId) {
        setActivePathRecord(null)
        setLearnUiState('home')
      }
      showToast('Path deleted')
    },
    [activePathRecord, bumpPaths, showToast],
  )

  const handleSwitchTrack = useCallback(
    (trackId) => {
      if (!activePathRecord) return
      const next = upsertPath({ ...activePathRecord, activeTrackId: trackId })
      setActivePathRecord(next)
      bumpPaths()
    },
    [activePathRecord, bumpPaths],
  )

  const learnActivePathMeta = useMemo(() => {
    if (!activePathRecord?.course) return null
    const levelLabel =
      LEARN_LEVELS.find((l) => l.id === activePathRecord.preferences?.level)?.label ??
      activePathRecord.course.level
    const scopeLabel =
      LEARN_SCOPES.find((s) => s.id === activePathRecord.preferences?.scope)?.label ??
      activePathRecord.course.geographicScope
    const track = activePathRecord.course.tracks.find(
      (t) => t.id === activePathRecord.activeTrackId,
    )
    return {
      topic: activePathRecord.course.title,
      levelLabel,
      scopeLabel,
      trackTitle: track?.title ?? null,
      lessonCount: track?.lessons?.length ?? 0,
      sourceLabel: activePathRecord.sourceLabel,
      buildMode: activePathRecord.buildMode,
      tracks: activePathRecord.course.tracks,
      activeTrackId: activePathRecord.activeTrackId,
    }
  }, [activePathRecord])

  const generateLessonForStory = useCallback(
    async (storyCard, { prefetch = false } = {}) => {
      if (!storyCard?.pathId || !storyCard?.trackId) return
      const lockKey = storyCard.id
      if (lessonGenLock.current.has(lockKey)) return
      lessonGenLock.current.add(lockKey)

      let path = getPathById(storyCard.pathId) ?? activePathRecord
      if (!path) {
        lessonGenLock.current.delete(lockKey)
        return
      }

      const track = path.course?.tracks?.find((t) => t.id === storyCard.trackId)
      const lesson = track?.lessons?.find((l) => l.id === storyCard.id)
      if (!lesson || lesson.generationStatus === 'ready') {
        lessonGenLock.current.delete(lockKey)
        return
      }
      if (lesson.generationStatus === 'generating') {
        const started = lesson.generationStartedAt ?? 0
        const stale = Date.now() - started > 4 * 60 * 1000
        if (!stale) {
          lessonGenLock.current.delete(lockKey)
          return
        }
      }

      if (path.isDemo) {
        lessonGenLock.current.delete(lockKey)
        return
      }

      path = updateLessonInPath(path, storyCard.trackId, storyCard.id, {
        generationStatus: 'generating',
        generationError: null,
        generationStartedAt: Date.now(),
      })
      setActivePathRecord(path)
      bumpPaths()
      if (!prefetch) setLessonGenPhase('research')

      const priorLessonTitles = track.lessons
        .filter((l) => l.order < lesson.order)
        .map((l) => l.title)

      const result = await generateLesson({
        pathId: path.id,
        trackId: track.id,
        lessonId: lesson.id,
        courseTitle: path.course.title,
        level: path.course.level,
        geographicScope: path.course.geographicScope,
        trackTitle: track.title,
        lesson,
        priorLessonTitles,
      })

      if (!result.ok) {
        path = updateLessonInPath(getPathById(path.id) ?? path, track.id, lesson.id, {
          generationStatus: 'error',
          generationError: result.error,
        })
        setActivePathRecord(path)
        bumpPaths()
        if (!prefetch) setLessonGenPhase('error')
        lessonGenLock.current.delete(lockKey)
        return
      }

      const { presentation, lessonCore, sources } = result.data
      const catalog = mergeSourcesIntoCatalog(path, sources)
      path = updateLessonInPath(getPathById(path.id) ?? path, track.id, lesson.id, {
        generationStatus: 'ready',
        generatedAt: Date.now(),
        presentation,
        lessonCore,
        sources: sources.map((s) => s.id),
        generationError: null,
      })
      path = upsertPath({ ...path, sourceCatalog: catalog })
      setActivePathRecord(path)
      bumpPaths()
      if (!prefetch) setLessonGenPhase(null)
      lessonGenLock.current.delete(lockKey)

      const nextLesson = track.lessons.find((l) => l.order === lesson.order + 1)
      if (nextLesson?.generationStatus === 'planned') {
        const nextCard = lessonToDisplayCard({
          pathRecord: path,
          trackId: track.id,
          lesson: nextLesson,
          trackTitle: track.title,
          trackLessonCount: track.lessons.length,
        })
        void generateLessonForStoryRef.current?.(nextCard, { prefetch: true })
      }
    },
    [activePathRecord, bumpPaths],
  )

  useEffect(() => {
    generateLessonForStoryRef.current = generateLessonForStory
  }, [generateLessonForStory])

  useEffect(() => {
    if (!activeStory?.isGeneratedPath) return
    if (activeStory.generationStatus === 'ready' || activeStory.generationStatus === 'error') return
    // Starting a network request is the effect; its synchronous "generating" update is intended.
    // oxlint-disable-next-line react/set-state-in-effect
    void generateLessonForStory(activeStory)
  }, [activeStory, generateLessonForStory])

  const displayedLessonGenPhase =
    activeStory?.generationStatus === 'error' ? 'error' : (lessonGenPhase ?? 'preparing')

  const inDetail = activeStoryId !== null

  const showDailyEdition = useMemo(
    () =>
      isDailyEditionVisible({
        showSavedOnly,
        activeZone,
        activeFilterCount,
        homePanel,
        feedMode,
      }),
    [showSavedOnly, activeZone, activeFilterCount, homePanel, feedMode],
  )

  const handlePrimaryNav = useCallback(
    (panel) => {
      setHomePanel(panel)
      setFilterListOpen(false)
      if (panel === 'feed') {
        window.history.pushState(feedHistoryState(feedMode), '', feedUrl(deepLinkFeedItemId))
      } else if (panel === 'learn') {
        if (learnUiState === 'planning' || learnUiState === 'saving') return
        setLearnUiState('home')
        window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
      } else if (panel === 'zones') {
        setActiveZoneViewId(null)
        window.history.pushState(ZONES_HISTORY_STATE, '', zonesUrl())
      } else if (panel === 'library') {
        window.history.pushState(LIBRARY_HISTORY_STATE, '', libraryUrl())
      }
    },
    [feedMode, deepLinkFeedItemId, learnUiState],
  )

  const togglePathDrip = useCallback((pathId, enabled) => {
    setPathDripEnabled(pathId, enabled)
    setPathDripIds(loadPathDripEnabled())
    setFeedRankKey((k) => k + 1)
    showToast(enabled ? 'Next lesson will drip into For You' : 'Removed from For You')
  }, [showToast])

  const openZoneStep = useCallback(
    (zone, step, mode) => {
      const feedMatch =
        feedItems.find((f) => f.id === step.feedItemId || f.parentCardId === step.cardId) ??
        null
      if (mode === 'focus' && feedMatch) {
        openStoryFromFeed(feedMatch, 0)
        markZoneStepComplete(zone.id, step.order)
        return
      }
      if (feedMatch) openStoryFromFeed(feedMatch, 0)
      else openStory(step.cardId)
    },
    [feedItems, openStory, openStoryFromFeed],
  )

  const narrativeRelated = useMemo(() => {
    if (!activeStory || !isNarrativeCard(activeStory)) return []
    const ids = Array.isArray(activeStory.relatedCardIds) ? activeStory.relatedCardIds : []
    return ids.map((id) => CARD_BY_ID.get(id)).filter(Boolean)
  }, [activeStory])

  const activePathLessonRaw = useMemo(() => {
    if (!activeStory?.isGeneratedPath || !activePathRecord) return null
    const track = activePathRecord.course?.tracks?.find((t) => t.id === activeStory.trackId)
    return track?.lessons?.find((l) => l.id === activeStory.id) ?? null
  }, [activeStory, activePathRecord])

  const activePathTrackMeta = useMemo(() => {
    if (!activeStory?.trackId || !activePathRecord?.course) return null
    return activePathRecord.course.tracks.find((t) => t.id === activeStory.trackId) ?? null
  }, [activeStory, activePathRecord])

  const showExploreChrome =
    !inDetail && homePanel === 'feed' && feedMode === 'explore'

  return (
    <div
      className={`app${inDetail ? ' app--detail' : ''}${homePanel === 'feed' && feedMode === 'forYou' && !inDetail ? ' app--reel' : ''}${!inDetail ? ' app--with-bottom-nav' : ''}`}
    >
      <header className="top-bar">
        <div className="brand">
          {inDetail ? (
            <button type="button" className="back-btn" onClick={handleDetailBack}>
              ← Back
            </button>
          ) : homePanel === 'learn' && learnUiState === 'path' ? (
            <button type="button" className="back-btn" onClick={exitLearnPathToHome}>
              ← Back
            </button>
          ) : null}
          <h1 className={inDetail ? 'brand-title--detail' : ''}>
            {inDetail
              ? (activeStory?.title ?? activeStory?.curiosityQuestion ?? 'Story')
              : homePanel === 'library'
                ? 'Library'
                : activeZone && homePanel === 'feed'
                  ? activeZone.title
                  : homePanel === 'zones'
                    ? 'Learning Zones'
                    : homePanel === 'learn' && learnUiState === 'path' && learnActivePathMeta
                      ? learnActivePathMeta.topic
                      : homePanel === 'learn'
                        ? 'Learn a Topic'
                        : 'Curiosity Feed'}
          </h1>
          {!inDetail && showExploreChrome && (
            <div className="header-actions">
              <button
                type="button"
                className={`filter-icon-btn${filterListOpen ? ' active' : ''}${selectedTopics.size > 0 ? ' has-filters' : ''}`}
                onClick={() => setFilterListOpen((o) => !o)}
                aria-expanded={filterListOpen}
                aria-controls="category-filter-list"
                aria-label={
                  selectedTopics.size > 0
                    ? `Filter topics, ${selectedTopics.size} selected`
                    : 'Filter topics'
                }
              >
                <svg
                  className="filter-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 6h16M7 12h10M10 18h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.35"
                    strokeLinecap="round"
                  />
                </svg>
                {selectedTopics.size > 0 && (
                  <span className="filter-icon-badge">{selectedTopics.size}</span>
                )}
              </button>
              <button
                type="button"
                className={`saved-toggle${showSavedOnly ? ' active' : ''}`}
                onClick={toggleSavedView}
                aria-pressed={showSavedOnly}
                aria-label={showSavedOnly ? 'Show all stories' : 'Show saved only'}
              >
                Saved
              </button>
            </div>
          )}
        </div>

        {!inDetail && homePanel === 'feed' ? (
          <nav className="feed-subnav" aria-label="Feed mode">
            <button
              type="button"
              className={`feed-subnav-btn${feedMode === 'forYou' ? ' active' : ''}`}
              aria-current={feedMode === 'forYou' ? 'page' : undefined}
              onClick={() => {
                setFeedMode('forYou')
                window.history.replaceState(feedHistoryState('forYou', deepLinkFeedItemId), '', feedUrl(deepLinkFeedItemId))
              }}
            >
              For You
            </button>
            <button
              type="button"
              className={`feed-subnav-btn${feedMode === 'explore' ? ' active' : ''}`}
              aria-current={feedMode === 'explore' ? 'page' : undefined}
              onClick={() => {
                setFeedMode('explore')
                window.history.replaceState(feedHistoryState('explore'), '', feedUrl())
              }}
            >
              Explore
            </button>
          </nav>
        ) : null}

        {!inDetail && (
          <>
            {showExploreChrome ? (
              <>
                <div className="filters-scroll" aria-label="Domain filters">
                  <nav className="filters">
                    <button
                      type="button"
                      className={`filter-chip${allDomainsSelected ? ' active' : ''}`}
                      onClick={selectAllDomains}
                    >
                      All
                    </button>
                    {LEARNING_DOMAINS.map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        className={`filter-chip${selectedDomain === domain ? ' active' : ''}`}
                        onClick={() => pickDomain(domain)}
                      >
                        {domain}
                      </button>
                    ))}
                  </nav>
                </div>

                <TimelineFilter
                  decades={catalogDecades}
                  selectedDecades={selectedDecades}
                  onToggleDecade={toggleDecade}
                  onClear={clearDecadeFilters}
                />

                {filterListOpen && (
                  <div
                    id="category-filter-list"
                    className="filter-list-panel"
                    role="group"
                    aria-label="Multi-select topics"
                  >
                    <div className="filter-list-head">
                      <span className="filter-list-title">Topics</span>
                      {selectedTopics.size > 0 && (
                        <button
                          type="button"
                          className="filter-list-clear"
                          onClick={clearTopicFilters}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="filter-list-hint">
                      Pick one domain above, then multi-select era topics here to narrow
                      further.
                    </p>
                    <ul className="filter-list">
                      {TOPIC_LIST.map((topic) => (
                        <li key={topic}>
                          <label className="filter-list-item">
                            <input
                              type="checkbox"
                              checked={selectedTopics.has(topic)}
                              onChange={() => toggleTopic(topic)}
                            />
                            <span>{topic}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}
      </header>

      {!inDetail && homePanel === 'feed' && feedMode === 'explore' && (
        <div className="feed-toolbar">
          <p className="feed-status" aria-live="polite">
            {feedStatus}
          </p>
          <div className="feed-toolbar-actions">
            {activeZone ? (
              <button type="button" className="zone-clear-link" onClick={clearActiveZone}>
                Leave zone
              </button>
            ) : null}
            <button
              type="button"
              className="surprise-link"
              onClick={handleSurprise}
            >
              Surprise me
            </button>
          </div>
        </div>
      )}

      <main
        className={`feed${homePanel === 'feed' && feedMode === 'forYou' && !inDetail ? ' feed--reel' : ''}${homePanel === 'zones' && !inDetail ? ' feed--zones' : ''}${homePanel === 'learn' && !inDetail ? ' feed--learn' : ''}`}
      >
        {!inDetail && homePanel === 'learn' && learnUiState !== 'path' ? (
          <>
            <div className="learn-home-create">
              <LearnTopicPanel
                topic={learnTopic}
                onTopicChange={setLearnTopic}
                level={learnLevel}
                onLevelChange={setLearnLevel}
                scope={learnScope}
                onScopeChange={setLearnScope}
                length={learnLength}
                onLengthChange={setLearnLength}
                focus={learnFocus}
                onFocusChange={setLearnFocus}
                uiState={learnUiState === 'home' ? 'start' : learnUiState}
                onContinue={continueLearnTopic}
                onGenerate={handleAssessTopic}
                onEditTopic={() => {
                  setLearnUiState('home')
                  setPlanResult(null)
                  setPlanError(null)
                }}
                planResult={planResult}
                planError={planError}
                onRetryPlan={handleRetryPlan}
                onUseDemoFallback={handleUseDemoFallback}
                onSelectNarrowing={handleSelectNarrowing}
                onConfirmSinglePath={handleConfirmSinglePath}
                onLearnTrack={handleLearnTrack}
                onBuildFullCourse={handleBuildFullCourse}
                planningMessage={planningMessage}
                submitLocked={planSubmitLocked}
              />
            </div>
            <MyPathsSection
              refreshKey={pathsVersion}
              onOpenPath={handleResumePath}
              onDelete={handleDeletePath}
            />
          </>
        ) : !inDetail && homePanel === 'learn' && learnUiState === 'path' ? (
          <>
            {learnActivePathMeta?.buildMode === 'full_course' &&
            learnActivePathMeta.tracks?.length > 1 ? (
              <div className="learn-track-switch">
                <span className="learn-legend">Track</span>
                <div className="learn-options">
                  {learnActivePathMeta.tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      className={`learn-option${learnActivePathMeta.activeTrackId === track.id ? ' learn-option--active' : ''}`}
                      onClick={() => handleSwitchTrack(track.id)}
                    >
                      {track.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <LearnPathChapters
              pathMeta={learnActivePathMeta}
              cards={generatedPathCards}
              completedLessonIds={activePathRecord?.completedLessonIds}
              onOpenChapter={openStory}
              onNewTopic={resetLearnFlow}
              pathDripEnabled={
                activePathRecord?.id
                  ? pathDripIds.includes(activePathRecord.id)
                  : false
              }
              onTogglePathDrip={(enabled) => {
                if (activePathRecord?.id) togglePathDrip(activePathRecord.id, enabled)
              }}
            />
          </>
        ) : !inDetail && homePanel === 'library' ? (
          <LibraryPanel
            feedItems={feedItems}
            savedCardsLive={savedCardsLive}
            catalogById={CARD_BY_ID}
            onOpenFeedItem={openFeedItemById}
            onOpenStory={openStory}
            onOpenPath={openPathScreen}
            onUnsave={(card) => handleSave(card)}
            onRefreshLikes={() => setFeedRankKey((k) => k + 1)}
          />
        ) : !inDetail && homePanel === 'zones' && activeZoneViewId ? (
          <ZoneDetail
            zoneId={activeZoneViewId}
            onBack={() => {
              setActiveZoneViewId(null)
              window.history.pushState(ZONES_HISTORY_STATE, '', zonesUrl())
            }}
            onOpenStep={openZoneStep}
            onContinueInFeed={(zoneId) => {
              setHomePanel('feed')
              setFeedMode('forYou')
              window.history.pushState(feedHistoryState('forYou'), '', feedUrl())
              void zoneId
            }}
          />
        ) : !inDetail && homePanel === 'zones' ? (
          <ZonesPanel onOpenZone={openZoneDetail} />
        ) : !inDetail && homePanel === 'feed' && feedMode === 'forYou' ? (
          <LearningReel
            items={feedItems}
            dripItems={[...zoneDripItems, ...pathDripItems]}
            catalogCardById={CARD_BY_ID}
            savedCardIds={savedIds}
            knownCardIds={knownIds}
            onToggleSave={handleSave}
            onKnown={handleKnown}
            onGoDeeper={openStoryFromFeed}
            onToast={showToast}
            onPreferenceRefresh={() => setFeedRankKey((k) => k + 1)}
            initialFeedItemId={deepLinkFeedItemId}
            onActiveFeedItemChange={(id) => {
              setDeepLinkFeedItemId(id)
              window.history.replaceState(
                feedHistoryState('forYou', id),
                '',
                feedUrl(id),
              )
            }}
            slideIndexByFeedId={slideIndexByFeedId}
            onSlideIndexChange={(feedId, idx) =>
              setSlideIndexByFeedId((prev) => ({ ...prev, [feedId]: idx }))
            }
            offline={offline}
            onOpenLibrary={() => handlePrimaryNav('library')}
            onContinuePath={() => {
              const id = loadActivePathId()
              if (id) openPathScreen(id)
            }}
          />
        ) : !inDetail && homePanel === 'feed' && feedMode === 'explore' ? (
          <ExplorePanel
            catalog={HISTORY_CARDS}
            filteredCards={filteredCards}
            showDailyEdition={showDailyEdition}
            knownIds={knownIds}
            savedIds={savedIds}
            onOpenStory={openStory}
            emptyState={emptyState}
          />
        ) : inDetail && !activeStory ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Story not found</h2>
            <p className="empty-state-body">It may have been removed from the catalog.</p>
            <button type="button" className="empty-state-action" onClick={closeStory}>
              Back to feed
            </button>
          </div>
        ) : inDetail && activeStory ? (
          <article
            className={`card card--detail${isNarrativeCard(activeStory) ? ' card--detail-narrative' : ''}`}
          >
            {isGeneratedStory && activeStory.generationStatus !== 'ready' ? (
              <div className="card-inner card-inner--detail">
                <LearningLessonPlaceholder
                  lesson={activePathLessonRaw}
                  trackMeta={activePathTrackMeta}
                  phase={displayedLessonGenPhase}
                  errorMessage={activePathLessonRaw?.generationError ?? undefined}
                  onRetry={() => void generateLessonForStory(activeStory)}
                />
              </div>
            ) : (
              <>
                {!isGeneratedStory && isNarrativeCard(activeStory) ? (
                  <div className="detail-mode-toggle" role="group" aria-label="Detail mode">
                    <button
                      type="button"
                      className={`detail-mode-btn${detailMode === 'story' ? ' active' : ''}`}
                      aria-pressed={detailMode === 'story'}
                      onClick={() => {
                        setDetailMode('story')
                        saveDetailModePreference('story')
                      }}
                    >
                      Story
                    </button>
                    <button
                      type="button"
                      className={`detail-mode-btn${detailMode === 'explainer' ? ' active' : ''}`}
                      aria-pressed={detailMode === 'explainer'}
                      onClick={() => {
                        setDetailMode('explainer')
                        saveDetailModePreference('explainer')
                      }}
                    >
                      Explainer
                    </button>
                  </div>
                ) : null}
                {isNarrativeCard(activeStory) && detailMode === 'story' ? (
                  <div className="card-inner card-inner--detail card-inner--rich">
                    <RichStoryDetail
                      card={activeStory}
                      badges={
                        <StoryStatusBadges
                          saved={savedIds.has(activeStory.id)}
                          known={knownIds.has(activeStory.id)}
                        />
                      }
                      relatedCards={
                        narrativeRelated.length > 0 ? narrativeRelated : null
                      }
                      onOpenRelated={openStory}
                      onReadComplete={isGeneratedStory ? markActiveLessonComplete : undefined}
                    />
                  </div>
                ) : (
                  <>
                    <StoryDetailHero
                      card={activeStory}
                      badges={
                        <StoryStatusBadges
                          saved={savedIds.has(activeStory.id)}
                          known={knownIds.has(activeStory.id)}
                        />
                      }
                    />
                    <div className="card-inner card-inner--detail">
                      <StoryDetailSections card={activeStory} />
                    </div>
                    {recommendedNext ? (
                      <ContinueLearning card={recommendedNext} onOpen={openRecommendedNext} />
                    ) : null}
                  </>
                )}
              </>
            )}
            {isNarrativeCard(activeStory) &&
            detailMode === 'story' &&
            !narrativeRelated.length &&
            recommendedNext ? (
              <ContinueLearning card={recommendedNext} onOpen={openRecommendedNext} />
            ) : null}
            <div className="card-actions">
              {!isGeneratedStory ? (
                <>
                  <button
                    type="button"
                    className={`action-btn action-btn--known${knownIds.has(activeStory.id) ? ' known-active' : ''}`}
                    onClick={() => handleKnown(activeStory)}
                  >
                    I knew this
                  </button>
                  <button
                    type="button"
                    className={`action-btn action-btn--save${savedIds.has(activeStory.id) ? ' saved' : ''}`}
                    onClick={() => handleSave(activeStory)}
                    aria-pressed={savedIds.has(activeStory.id)}
                  >
                    {savedIds.has(activeStory.id) ? 'Saved ✓' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--surprise"
                    onClick={handleSurprise}
                  >
                    Surprise me
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="action-btn action-btn--save"
                  onClick={backToPathScreen}
                >
                  Back to path
                </button>
              )}
            </div>
          </article>
        ) : null}
      </main>

      {!inDetail ? (
        <PrimaryNavigation active={homePanel} onChange={handlePrimaryNav} variant="bottom" />
      ) : null}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
