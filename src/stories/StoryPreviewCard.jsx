import { isNarrativeCard } from './flagshipStories.js'

export function StoryArt({ image, title, variant = 'feed' }) {
  return (
    <div className={`story-art story-art--${variant}`}>
      <img src={image} alt="" className="story-art-img" loading="lazy" decoding="async" />
      <div className="story-art-scrim" aria-hidden="true" />
      <span className="visually-hidden">{title}</span>
    </div>
  )
}

export function StoryPreviewCard({
  card,
  badges = null,
  interactive = false,
  onOpen,
  className = '',
  id,
}) {
  const planned = card.generationStatus === 'planned' || card.generationStatus === 'generating'
  const narrative = !planned && isNarrativeCard(card)
  const headline =
    planned || narrative ? (card.curiosityQuestion ?? card.title) : card.title
  const previewText = planned
    ? card.hook
    : narrative
      ? (card.deck ?? card.hook)
      : card.hook
  const readingMinutes = narrative ? card.readingMinutes : null

  const body = (
    <>
      <StoryArt image={card.image} title={card.title} variant={interactive ? 'feed' : 'detail'} />
      <div className="story-preview-body">
        <div className="story-card-top">
          <div className="story-card-labels">
            <span className="category">{card.domain ?? card.category}</span>
            {card.decadeLabel ? (
              <span className="decade-tag">{card.decadeLabel}</span>
            ) : null}
            {planned ? (
              <span className="format-label format-label--planned">
                {card.generationStatus === 'generating' ? 'Generating' : 'Planned'}
              </span>
            ) : narrative ? (
              <span className="format-label format-label--narrative">Story</span>
            ) : card.format ? (
              <span className="format-label">{card.format}</span>
            ) : null}
            {readingMinutes ? (
              <span className="reading-time-tag">{readingMinutes} min read</span>
            ) : null}
          </div>
          {interactive ? (
            <span className="story-card-chevron" aria-hidden="true">
              {narrative ? 'Read' : '→'}
            </span>
          ) : null}
        </div>
        <h2 className={`story-card-title${narrative ? ' story-card-title--narrative' : ''}`}>
          {headline}
        </h2>
        <p
          className={`story-card-hook${interactive ? '' : ' story-card-hook--detail'}${narrative ? ' story-card-hook--deck' : ''}`}
        >
          {previewText}
        </p>
        {narrative && interactive ? (
          <span className="story-card-read-cta">Read the story</span>
        ) : null}
        {badges}
      </div>
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        id={id}
        className={`story-preview story-preview--interactive${narrative ? ' story-preview--narrative' : ''}${className ? ` ${className}` : ''}`}
        onClick={onOpen}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className={`story-preview story-preview--static${narrative ? ' story-preview--narrative' : ''}${className ? ` ${className}` : ''}`}
    >
      {body}
    </div>
  )
}

export function StoryVideo({ youtubeId, title }) {
  if (!youtubeId) return null
  return (
    <div className="story-video">
      <div className="story-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={`Video: ${title}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export function StoryVideoSearch({ query }) {
  const q = String(query ?? '').trim()
  if (!q) return null
  const href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
  return (
    <div className="story-video-search">
      <a
        className="story-video-search-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        Search YouTube: {q}
      </a>
      <p className="story-video-search-note">
        Curiosity Feed opens a search link—not an auto-picked video—so we never embed unverified
        IDs.
      </p>
    </div>
  )
}
