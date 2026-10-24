import { useCallback, useState } from 'react'

export function VideoFeedItem({ item, isActive, onExplored, onGoDeeper, actions, metaLine, offline }) {
  const [armed, setArmed] = useState(false)
  const video = item.video ?? {}
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

  // Scrolling away disarms the player (adjusting state during render, not in an effect).
  if (!isActive && armed) setArmed(false)

  const play = useCallback(() => {
    if (offline && video.provider === 'youtube') return
    setArmed(true)
    onExplored?.()
  }, [offline, onExplored, video.provider])

  return (
    <article className="reel-item reel-item--video">
      <div className="reel-item-meta">{metaLine ?? `${item.domain} · Video · ~${Math.round((item.estimatedSeconds ?? 180) / 60)} min`}</div>
      <div className="reel-video-stage">
        {!armed ? (
          <button type="button" className="reel-video-poster-btn" onClick={play} aria-label={`Play video: ${item.title}`}>
            <img
              className="reel-art reel-art--video"
              src={video.poster ?? item.art?.src}
              alt=""
              loading="lazy"
            />
            <span className="reel-video-play">▶ Play</span>
            {offline && video.provider === 'youtube' ? (
              <span className="reel-video-offline">Video needs a connection</span>
            ) : null}
          </button>
        ) : null}
        {armed && isActive && video.provider === 'youtube' && video.youtubeId ? (
          <div className="reel-video-embed">
            <iframe
              title={video.title ?? item.title}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=0&rel=0`}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : null}
        {armed && isActive && video.provider === 'local' && video.src ? (
          <video
            className="reel-video-local"
            controls
            playsInline
            preload={reducedMotion ? 'none' : 'metadata'}
            poster={video.poster ?? item.art?.src}
            src={video.src}
            onPlay={() => onExplored?.()}
          />
        ) : null}
      </div>
      <div className="reel-video-caption">
        <p className="reel-video-title">{video.title ?? item.title}</p>
        {video.creator ? <p className="reel-video-creator">{video.creator}</p> : null}
        {video.caption ? <p className="reel-video-summary">{video.caption}</p> : null}
      </div>
      <button type="button" className="reel-go-deeper" onClick={onGoDeeper}>
        Go deeper
      </button>
      {actions}
    </article>
  )
}
