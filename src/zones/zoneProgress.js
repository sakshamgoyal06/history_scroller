const ZONE_PROGRESS_KEY = 'curiosity-feed-zone-progress-v1'
const ZONE_DRIP_KEY = 'curiosity-feed-zone-drip-v1'
const PATH_DRIP_KEY = 'curiosity-feed-path-drip-v1'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function loadZoneProgress() {
  const data = safeParse(localStorage.getItem(ZONE_PROGRESS_KEY), { zones: {} })
  return data?.zones && typeof data.zones === 'object' ? data.zones : {}
}

export function saveZoneProgress(zones) {
  localStorage.setItem(ZONE_PROGRESS_KEY, JSON.stringify({ version: 1, zones, updatedAt: Date.now() }))
}

export function markZoneStepComplete(zoneId, stepOrder) {
  const zones = loadZoneProgress()
  const z = zones[zoneId] ?? { completedOrders: [], lastStep: 0 }
  const set = new Set(Array.isArray(z.completedOrders) ? z.completedOrders : [])
  set.add(stepOrder)
  zones[zoneId] = {
    completedOrders: [...set].sort((a, b) => a - b),
    lastStep: Math.max(z.lastStep ?? 0, stepOrder),
    updatedAt: Date.now(),
  }
  saveZoneProgress(zones)
  return zones[zoneId]
}

export function resetZoneProgress(zoneId) {
  const zones = loadZoneProgress()
  delete zones[zoneId]
  saveZoneProgress(zones)
}

export function nextIncompleteZoneStep(zone, progress) {
  const z = progress[zone.id]
  const done = new Set(Array.isArray(z?.completedOrders) ? z.completedOrders : [])
  return zone.steps.find((s) => !done.has(s.order)) ?? null
}

export function loadZoneDripEnabled() {
  const data = safeParse(localStorage.getItem(ZONE_DRIP_KEY), { enabled: {} })
  return data?.enabled && typeof data.enabled === 'object' ? data.enabled : {}
}

export function setZoneDripEnabled(zoneId, enabled) {
  const enabledMap = loadZoneDripEnabled()
  if (enabled) enabledMap[zoneId] = true
  else delete enabledMap[zoneId]
  localStorage.setItem(ZONE_DRIP_KEY, JSON.stringify({ version: 1, enabled: enabledMap }))
}

export function loadPathDripEnabled() {
  const data = safeParse(localStorage.getItem(PATH_DRIP_KEY), { pathIds: [] })
  return Array.isArray(data?.pathIds) ? data.pathIds.filter((id) => typeof id === 'string') : []
}

export function setPathDripEnabled(pathId, enabled) {
  const ids = new Set(loadPathDripEnabled())
  if (enabled) ids.add(pathId)
  else ids.delete(pathId)
  localStorage.setItem(PATH_DRIP_KEY, JSON.stringify({ version: 1, pathIds: [...ids] }))
}
