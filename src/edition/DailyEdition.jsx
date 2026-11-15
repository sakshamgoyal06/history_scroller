import { useMemo, useSyncExternalStore } from 'react'
import {
  EDITION_SLOT_LABELS,
  editionProgressSummary,
  formatEditionDate,
  getExploredIdsForDate,
  getLocalDateKey,
  selectDailyEdition,
} from './dailyEdition.js'
import { StoryPreviewCard } from '../stories/StoryPreviewCard.jsx'

function subscribeProgress(onStoreChange) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('daily-edition-progress', onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('daily-edition-progress', onStoreChange)
  }
}

function getProgressSnapshot(dateKey) {
  return () => getExploredIdsForDate(dateKey).join(',')
}

export function DailyEdition({ catalog, onOpenStory, renderPreview }) {
  const dateKey = getLocalDateKey()
  const formattedDate = formatEditionDate(dateKey)

  const edition = useMemo(() => selectDailyEdition(catalog, dateKey), [catalog, dateKey])

  const exploredKey = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot(dateKey),
    getProgressSnapshot(dateKey),
  )
  const exploredSet = useMemo(() => new Set(exploredKey.split(',').filter(Boolean)), [exploredKey])

  const slots = useMemo(
    () =>
      /** @type {const} */ ([
        'bigIdea',
        'fromHistory',
        'sciTech',
        'surprise',
      ]).map((slot) => {
        const pick = edition.picks[slot]
        const card = pick ? catalog.find((c) => c.id === pick.id) : null
        return { slot, card }
      }),
    [edition.picks, catalog],
  )

  const totalCards = slots.filter((s) => s.card).length
  const progress = editionProgressSummary(dateKey, totalCards)

  const Preview = renderPreview ?? StoryPreviewCard

  return (
    <section className="daily-edition" aria-labelledby="daily-edition-heading">
      <header className="daily-edition-header">
        <div>
          <h2 id="daily-edition-heading" className="daily-edition-title">
            Today&apos;s Edition
          </h2>
          <p className="daily-edition-sub">
            Four ideas selected for {formattedDate}
          </p>
        </div>
        <p className="daily-edition-progress" aria-live="polite">
          {progress.label}
        </p>
      </header>
      <p className="daily-edition-tag">Fresh picks every day</p>
      <div className="daily-edition-slots">
        {slots.map(({ slot, card }) => {
          if (!card) return null
          const explored = exploredSet.has(card.id)
          return (
            <div key={slot} className="daily-edition-slot">
              <p className="daily-edition-slot-label">{EDITION_SLOT_LABELS[slot]}</p>
              <Preview
                card={card}
                interactive
                className={`daily-edition-card${explored ? ' daily-edition-card--explored' : ''}`}
                onOpen={() => onOpenStory(card.id)}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
