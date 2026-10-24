/** @typedef {'slides' | 'video'} FeedItemType */

/** @typedef {'hook' | 'context' | 'reveal' | 'meaning' | 'takeaway'} SlideBeatType */

/**
 * @typedef {object} FeedSlide
 * @property {string} id
 * @property {SlideBeatType} type
 * @property {string} [eyebrow]
 * @property {string} [heading]
 * @property {string} [body]
 * @property {string} [emphasis]
 */

/**
 * @typedef {object} FeedArt
 * @property {string} src
 * @property {string} [alt]
 */

/**
 * @typedef {object} FeedVideo
 * @property {'youtube' | 'local'} provider
 * @property {string} [youtubeId]
 * @property {string} [src]
 * @property {string} [poster]
 * @property {string} [title]
 * @property {string} [creator]
 * @property {number} [durationSeconds]
 * @property {string} [caption]
 */

/**
 * @typedef {object} FeedDeepDive
 * @property {string} cardId
 * @property {'story' | 'explainer'} [defaultMode]
 */

/**
 * @typedef {object} FeedZoneRef
 * @property {string} zoneId
 * @property {number} stepIndex
 */

/**
 * @typedef {object} FeedItem
 * @property {string} id
 * @property {string} parentCardId
 * @property {FeedItemType} type
 * @property {string} title
 * @property {string} hook
 * @property {string} domain
 * @property {string[]} topics
 * @property {string} [formatLabel]
 * @property {string} [publishedAt]
 * @property {string} [updatedAt]
 * @property {number} [estimatedSeconds]
 * @property {FeedArt} [art]
 * @property {FeedSlide[]} [slides]
 * @property {FeedVideo} [video]
 * @property {FeedDeepDive} [deepDive]
 * @property {FeedZoneRef[]} [zoneRefs]
 * @property {string[]} [sources]
 * @property {string} [pathDripLabel]
 * @property {string} [pathDripPathId]
 * @property {number} [pathDripStepIndex]
 * @property {number} [pathDripStepTotal]
 */

/** Session stale after 4 hours */
export const SESSION_STALE_MS = 4 * 60 * 60 * 1000

/** @param {unknown} item */
export function isValidFeedItem(item) {
  if (!item || typeof item !== 'object') return false
  const o = /** @type {Record<string, unknown>} */ (item)
  if (typeof o.id !== 'string' || typeof o.parentCardId !== 'string') return false
  if (o.type !== 'slides' && o.type !== 'video') return false
  if (typeof o.title !== 'string' || typeof o.hook !== 'string') return false
  if (o.type === 'slides') {
    const slides = o.slides
    if (!Array.isArray(slides) || slides.length < 3 || slides.length > 6) return false
  }
  if (o.type === 'video') {
    const video = o.video
    if (!video || typeof video !== 'object') return false
    const v = /** @type {FeedVideo} */ (video)
    if (v.provider === 'youtube' && typeof v.youtubeId === 'string' && v.youtubeId) return true
    if (v.provider === 'local' && typeof v.src === 'string' && v.src) return true
    return false
  }
  return true
}
