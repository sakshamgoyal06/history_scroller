import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StoryVideo, StoryVideoSearch } from './StoryPreviewCard.jsx'

function beatClass(type) {
  if (type === 'turning-point') return 'rich-beat rich-beat--turn'
  if (type === 'scene') return 'rich-beat rich-beat--scene'
  return 'rich-beat rich-beat--explain'
}

export function RichStoryDetail({
  card,
  badges,
  relatedCards,
  onOpenRelated,
  onReadComplete,
}) {
  const scrollRef = useRef(null)
  const [readProgress, setReadProgress] = useState(0)

  const youtubeId = card.youtube?.id ?? card.youtubeId ?? null
  const youtubeTitle = card.youtube?.title ?? card.title
  const videoSearchQuery = card.videoSearchQuery ?? card.youtube?.searchQuery ?? null
  const lessonCore = card.lessonCore ?? null

  const beats = useMemo(
    () => (Array.isArray(card.storyBeats) ? card.storyBeats : []),
    [card.storyBeats],
  )

  const updateProgress = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewport = window.innerHeight || 1
    const total = el.scrollHeight - viewport
    if (total <= 0) {
      setReadProgress(1)
      return
    }
    const scrolled = Math.min(total, Math.max(0, -rect.top))
    setReadProgress(scrolled / total)
  }, [])

  const readCompleteSent = useRef(false)

  useEffect(() => {
    readCompleteSent.current = false
  }, [card.id])

  useEffect(() => {
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [updateProgress, card.id])

  useEffect(() => {
    if (!onReadComplete || readCompleteSent.current) return
    if (readProgress >= 0.85) {
      readCompleteSent.current = true
      onReadComplete()
    }
  }, [readProgress, onReadComplete])

  const immediate = card.consequences?.immediate ?? []
  const longTerm = card.consequences?.longTerm ?? []

  return (
    <article className="rich-story" ref={scrollRef}>
      <div
        className="rich-story-progress"
        role="presentation"
        aria-hidden="true"
        style={{ '--read-progress': readProgress }}
      >
        <div className="rich-story-progress-fill" />
      </div>

      <header className="rich-story-hero">
        <div className="story-card-labels">
          <span className="category">{card.domain ?? card.category}</span>
          {card.decadeLabel ? <span className="decade-tag">{card.decadeLabel}</span> : null}
          {card.readingMinutes ? (
            <span className="reading-time-tag">{card.readingMinutes} min read</span>
          ) : null}
        </div>
        <h2 className="rich-story-question">{card.curiosityQuestion ?? card.title}</h2>
        {card.deck ? <p className="rich-story-deck">{card.deck}</p> : null}
        {badges}
      </header>

      {card.coldOpen?.body ? (
        <section className="rich-section rich-section--cold">
          {card.coldOpen.heading ? (
            <h3 className="rich-section-label">{card.coldOpen.heading}</h3>
          ) : null}
          <p className="rich-section-body">{card.coldOpen.body}</p>
        </section>
      ) : null}

      {card.context?.body ? (
        <section className="rich-section">
          <h3 className="rich-section-label">
            {card.context.heading ?? 'The world before'}
          </h3>
          <p className="rich-section-body">{card.context.body}</p>
        </section>
      ) : null}

      {card.centralQuestion ? (
        <div className="rich-central-question">
          <p className="rich-central-question-text">{card.centralQuestion}</p>
        </div>
      ) : null}

      <div className="rich-beats">
        {beats.map((beat) => (
          <section key={beat.heading} className={beatClass(beat.type)}>
            <h3 className="rich-beat-heading">{beat.heading}</h3>
            <p className="rich-beat-body">{beat.body}</p>
          </section>
        ))}
      </div>

      {(immediate.length > 0 || longTerm.length > 0) && (
        <section className="rich-section rich-section--consequences">
          <h3 className="rich-section-label">What followed</h3>
          {immediate.length > 0 ? (
            <>
              <p className="rich-consequence-sub">In the near term</p>
              <ul className="rich-list">
                {immediate.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
          {longTerm.length > 0 ? (
            <>
              <p className="rich-consequence-sub">Over years</p>
              <ul className="rich-list">
                {longTerm.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      )}

      {card.complication?.body ? (
        <section className="rich-section rich-section--complication">
          <h3 className="rich-section-label">
            {card.complication.heading ?? 'The complication'}
          </h3>
          <p className="rich-section-body">{card.complication.body}</p>
        </section>
      ) : null}

      {card.takeaway ? (
        <section className="rich-takeaway">
          <h3 className="rich-takeaway-label">Remember this</h3>
          <p className="rich-takeaway-body">{card.takeaway}</p>
        </section>
      ) : null}

      {lessonCore?.keyTerms?.length > 0 ? (
        <section className="rich-section">
          <h3 className="rich-section-label">Key terms</h3>
          <ul className="rich-list rich-list--inline">
            {lessonCore.keyTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {lessonCore?.examples?.length > 0 ? (
        <section className="rich-section">
          <h3 className="rich-section-label">Examples</h3>
          <ul className="rich-list">
            {lessonCore.examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {lessonCore?.verifiedClaims?.length > 0 ? (
        <section className="rich-section rich-section--claims">
          <h3 className="rich-section-label">Sourced facts</h3>
          <ul className="rich-claims">
            {lessonCore.verifiedClaims.map((claim) => (
              <li key={claim.id} className="rich-claim">
                <p className="rich-claim-text">{claim.text}</p>
                {claim.sourceIds?.length > 0 ? (
                  <ul className="rich-claim-sources">
                    {claim.sourceIds.map((sid) => {
                      const src = (card.sources ?? []).find((s) => s.id === sid)
                      if (!src?.url) return null
                      return (
                        <li key={sid}>
                          <a href={src.url} target="_blank" rel="noopener noreferrer">
                            {src.title ?? src.url}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {lessonCore?.uncertainties?.length > 0 ? (
        <section className="rich-section">
          <h3 className="rich-section-label">Still debated or uncertain</h3>
          <ul className="rich-list">
            {lessonCore.uncertainties.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {youtubeId ? (
        <section className="rich-section rich-section--rabbit">
          <h3 className="rich-section-label">Rabbit hole</h3>
          {card.youtube?.channel ? (
            <p className="rich-youtube-meta">{card.youtube.channel}</p>
          ) : null}
          <StoryVideo youtubeId={youtubeId} title={youtubeTitle} />
        </section>
      ) : videoSearchQuery ? (
        <section className="rich-section rich-section--rabbit">
          <h3 className="rich-section-label">Go deeper on video</h3>
          <StoryVideoSearch query={videoSearchQuery} title={card.title} />
        </section>
      ) : null}

      {Array.isArray(card.sources) && card.sources.length > 0 ? (
        <section className="rich-section rich-section--sources">
          <h3 className="rich-section-label">Sources</h3>
          <ul className="rich-sources">
            {card.sources.map((src) => (
              <li key={src.url ?? src.title}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.title}
                </a>
                {src.publisher ? <span className="rich-source-publisher"> · {src.publisher}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedCards?.length > 0 ? (
        <div className="story-next">
          <h3 className="story-section-label">Continue learning</h3>
          {relatedCards.map((related) => (
            <button
              key={related.id}
              type="button"
              className="story-next-card"
              onClick={() => onOpenRelated(related.id)}
            >
              <span className="story-next-title">{related.title}</span>
              <span className="story-next-meta">
                {related.domain}
                {related.format ? ` · ${related.format}` : ''}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </article>
  )
}
