import { loadPathDripEnabled } from '../zones/zoneProgress.js'
import { loadAllPaths } from '../learningPathStorage.js'
import { plannedLessonsForActiveTrack } from '../lessonToCard.js'

/**
 * Build feed items for next incomplete lessons on dripped paths.
 * @param {import('./feedTypes.js').FeedItem[]} catalogFeedItems
 * @param {{ paths?: object[], enabledIds?: string[] }} [state] defaults to reading storage
 */
export function buildPathDripFeedItems(catalogFeedItems, state = {}) {
  const enabled = state.enabledIds ?? loadPathDripEnabled()
  if (enabled.length === 0) return []
  const paths = state.paths ?? loadAllPaths()

  /** @type {import('./feedTypes.js').FeedItem[]} */
  const drips = []
  for (const pathId of enabled) {
    const path = paths.find((p) => p.id === pathId)
    if (!path) continue
    const pathTitle = path.course?.title ?? path.preferences?.topic ?? 'Your path'
    const lessons = plannedLessonsForActiveTrack(path)
    const completed = new Set(path.completedLessonIds ?? [])
    const next = lessons.find((l) => !completed.has(l.id) && l.generationStatus !== 'error')
    if (!next) continue
    if (next.generationStatus === 'planned') continue

    const existing = catalogFeedItems.find((f) => f.parentCardId === next.id)
    if (existing) {
      drips.push({
        ...existing,
        pathDripLabel: pathTitle,
        pathDripPathId: pathId,
        pathDripStepIndex: next.lessonOrder ?? next.order ?? 1,
        pathDripStepTotal: lessons.length,
      })
      continue
    }

    drips.push({
      id: `feed-path-${pathId}-${next.id}`,
      parentCardId: next.id,
      type: 'slides',
      title: next.title ?? 'Path lesson',
      hook: next.hook ?? next.curiosityQuestion ?? 'Continue your custom path.',
      domain: next.domain ?? 'General Knowledge',
      topics: ['custom-path'],
      formatLabel: 'Custom path',
      estimatedSeconds: 90,
      art: { src: '/stories/learn-generated.svg', alt: 'Generated lesson' },
      slides: [
        {
          id: `pd-${next.id}-hook`,
          type: 'hook',
          eyebrow: 'Your path',
          heading: next.title ?? 'Lesson',
          body: next.hook ?? next.scene ?? 'Open the full lesson to continue.',
        },
        {
          id: `pd-${next.id}-context`,
          type: 'context',
          eyebrow: 'Step',
          body: `Part ${next.lessonOrder ?? next.order ?? '?'} of ${lessons.length} in ${pathTitle}.`,
        },
        {
          id: `pd-${next.id}-takeaway`,
          type: 'takeaway',
          eyebrow: 'Next',
          body: 'Go deeper to read the generated lesson and mark progress.',
        },
      ],
      deepDive: { cardId: next.id, defaultMode: 'story' },
      pathDripLabel: pathTitle,
      pathDripPathId: pathId,
      pathDripStepIndex: next.lessonOrder ?? next.order ?? 1,
      pathDripStepTotal: lessons.length,
    })
  }
  return drips
}
