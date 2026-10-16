const STORAGE_PATHS = 'curiosity-feed-learning-paths-v1'
const STORAGE_ACTIVE = 'curiosity-feed-active-path-v1'

export const PATH_SCHEMA_VERSION = 1

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function loadAllPaths() {
  const data = safeParse(localStorage.getItem(STORAGE_PATHS), { version: PATH_SCHEMA_VERSION, paths: [] })
  if (!data || data.version !== PATH_SCHEMA_VERSION || !Array.isArray(data.paths)) {
    return []
  }
  return data.paths.filter((p) => p && typeof p.id === 'string')
}

function saveAllPaths(paths) {
  localStorage.setItem(
    STORAGE_PATHS,
    JSON.stringify({ version: PATH_SCHEMA_VERSION, paths }),
  )
}

export function loadActivePathId() {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.pathId ?? null
  } catch {
    return null
  }
}

export function setActivePathId(pathId) {
  if (!pathId) {
    localStorage.removeItem(STORAGE_ACTIVE)
    return
  }
  localStorage.setItem(STORAGE_ACTIVE, JSON.stringify({ pathId, updatedAt: Date.now() }))
}

export function getPathById(pathId) {
  return loadAllPaths().find((p) => p.id === pathId) ?? null
}

export function upsertPath(pathRecord) {
  const paths = loadAllPaths()
  const idx = paths.findIndex((p) => p.id === pathRecord.id)
  const next = { ...pathRecord, updatedAt: Date.now() }
  if (idx >= 0) paths[idx] = next
  else paths.unshift(next)
  saveAllPaths(paths)
  return next
}

export function deletePath(pathId) {
  const paths = loadAllPaths().filter((p) => p.id !== pathId)
  saveAllPaths(paths)
  if (loadActivePathId() === pathId) {
    setActivePathId(null)
  }
}

/**
 * @param {object} params
 */
export function createPathRecordFromPlan({
  plan,
  preferences,
  buildMode,
  activeTrackId,
  sourceLabel,
  isDemo,
}) {
  const pathId = plan.course?.id ?? `path-${Date.now()}`
  const now = Date.now()

  const tracks = (plan.course?.tracks ?? []).map((track) => ({
    ...track,
    lessons: track.lessons.map((lesson) => ({
      generationStatus: 'planned',
      generatedAt: null,
      generationError: null,
      lessonCore: null,
      presentation: null,
      sources: [],
      completedAt: null,
      ...lesson,
    })),
  }))

  return {
    id: pathId,
    schemaVersion: PATH_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    preferences,
    scopeDecision: plan.scopeDecision,
    planRequestId: plan.requestId,
    sourceLabel,
    isDemo,
    buildMode,
    activeTrackId,
    course: plan.course
      ? {
          ...plan.course,
          tracks,
        }
      : null,
    sourceCatalog: {},
    completedLessonIds: [],
    activeLessonId: null,
  }
}

export function mergeSourcesIntoCatalog(pathRecord, sources) {
  const catalog = { ...(pathRecord.sourceCatalog ?? {}) }
  for (const src of sources) {
    if (src?.id && src.url) catalog[src.id] = src
  }
  return catalog
}

export function updateLessonInPath(pathRecord, trackId, lessonId, patch) {
  if (!pathRecord?.course) return pathRecord
  const tracks = pathRecord.course.tracks.map((track) => {
    if (track.id !== trackId) return track
    return {
      ...track,
      lessons: track.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
      ),
    }
  })
  return upsertPath({ ...pathRecord, course: { ...pathRecord.course, tracks } })
}

export function getTrack(pathRecord, trackId) {
  return pathRecord?.course?.tracks?.find((t) => t.id === trackId) ?? null
}

export function getLesson(pathRecord, trackId, lessonId) {
  const track = getTrack(pathRecord, trackId)
  return track?.lessons?.find((l) => l.id === lessonId) ?? null
}

export function pathProgress(pathRecord) {
  const tracks = pathRecord?.course?.tracks ?? []
  let total = 0
  let ready = 0
  let completed = 0
  for (const track of tracks) {
    for (const lesson of track.lessons) {
      total += 1
      if (lesson.generationStatus === 'ready') ready += 1
      if (pathRecord.completedLessonIds?.includes(lesson.id)) completed += 1
    }
  }
  return { total, ready, completed, trackCount: tracks.length }
}

export function listPathSummaries() {
  return loadAllPaths().map((p) => ({
    id: p.id,
    title: p.course?.title ?? p.preferences?.topic ?? 'Learning path',
    scopeDecision: p.scopeDecision,
    sourceLabel: p.sourceLabel,
    buildMode: p.buildMode,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    ...pathProgress(p),
  }))
}
