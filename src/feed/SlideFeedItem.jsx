import { useCallback, useEffect, useRef } from 'react'

function formatTime(seconds) {
  if (!seconds || seconds < 60) return `${seconds ?? 45}s read`
  return `${Math.round(seconds / 60)} min read`
}

export function SlideFeedItem({
  item,
  slideIndex,
  onSlideIndexChange,
  onGoDeeper,
  onCompleted,
  actions,
  metaLine,
}) {
  const slides = item.slides ?? []
  const index = Math.min(Math.max(slideIndex, 0), Math.max(slides.length - 1, 0))
  const slide = slides[index]
  const liveRef = useRef(null)
  const touchStart = useRef(null)

  useEffect(() => {
    if (liveRef.current && slide) {
      liveRef.current.textContent = `Slide ${index + 1} of ${slides.length}. ${slide.heading ?? slide.eyebrow ?? ''} ${slide.body ?? ''}`
    }
  }, [index, slide, slides.length])

  useEffect(() => {
    if (index === slides.length - 1 && slides.length > 0) onCompleted?.()
  }, [index, slides.length, onCompleted])

  const go = useCallback(
    (delta) => {
      const next = Math.min(Math.max(index + delta, 0), slides.length - 1)
      if (next !== index) onSlideIndexChange(next)
    },
    [index, onSlideIndexChange, slides.length],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) go(1)
      else go(-1)
    }
    touchStart.current = null
  }

  return (
    <article className="reel-item reel-item--slides">
      <div className="reel-item-meta">{metaLine ?? `${item.domain} · ${item.formatLabel ?? 'Slides'} · ${formatTime(item.estimatedSeconds)}`}</div>
      <div className="reel-art-wrap">
        <img className="reel-art" src={item.art?.src} alt={item.art?.alt ?? ''} loading="lazy" decoding="async" />
      </div>
      <div
        className="reel-slide-body"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="reel-slide-nav">
          <button type="button" className="reel-slide-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous slide">
            ←
          </button>
          <span className="reel-slide-progress" aria-live="polite">
            {index + 1} of {slides.length}
          </span>
          <button
            type="button"
            className="reel-slide-btn"
            onClick={() => go(1)}
            disabled={index >= slides.length - 1}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
        <div className="reel-dots" aria-hidden="true">
          {slides.map((s, i) => (
            <span key={s.id} className={`reel-dot${i === index ? ' reel-dot--active' : ''}`} />
          ))}
        </div>
        <p className="sr-only" ref={liveRef} aria-live="polite" />
        {slide ? (
          <>
            {slide.eyebrow ? <p className="reel-slide-eyebrow">{slide.eyebrow}</p> : null}
            {slide.heading ? <h2 className="reel-slide-heading">{slide.heading}</h2> : null}
            {slide.body ? <p className="reel-slide-text">{slide.body}</p> : null}
            {slide.emphasis ? <p className="reel-slide-emphasis">{slide.emphasis}</p> : null}
          </>
        ) : null}
        {index === slides.length - 1 ? (
          <button type="button" className="reel-go-deeper" onClick={onGoDeeper}>
            Go deeper
          </button>
        ) : null}
      </div>
      {actions}
    </article>
  )
}
