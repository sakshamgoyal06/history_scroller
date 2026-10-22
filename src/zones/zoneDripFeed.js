import { LEARNING_ZONES } from './zoneData.js'
import { loadZoneDripEnabled, loadZoneProgress, nextIncompleteZoneStep } from './zoneProgress.js'

/**
 * @param {import('../feed/feedTypes.js').FeedItem[]} allFeedItems
 */
export function buildZoneDripFeedItems(allFeedItems) {
  const enabled = loadZoneDripEnabled()
  const progress = loadZoneProgress()
  /** @type {import('../feed/feedTypes.js').FeedItem[]} */
  const drips = []

  for (const zone of LEARNING_ZONES) {
    if (!enabled[zone.id]) continue
    const step = nextIncompleteZoneStep(zone, progress)
    if (!step) continue
    const feedId = step.feedItemId ?? `feed-card-${step.cardId}`
    const base = allFeedItems.find((f) => f.id === feedId || f.parentCardId === step.cardId)
    if (!base) continue
    drips.push({
      ...base,
      id: `feed-zone-drip-${zone.id}-${step.order}`,
      zoneRefs: [{ zoneId: zone.id, stepIndex: step.order - 1 }],
      formatLabel: `Zone · Part ${step.order} of ${zone.steps.length}`,
    })
  }
  return drips
}
