const GENERATED_CARD_IMAGE = '/stories/learn-generated.svg'

/**
 * Build a feed/detail card from a stored lesson + path context.
 */
export function lessonToDisplayCard({
  pathRecord,
  trackId,
  lesson,
  trackTitle,
  trackLessonCount,
}) {
  const presentation = lesson.presentation
  const sources = Object.values(pathRecord.sourceCatalog ?? {}).filter((src) => {
    const ids = new Set([
      ...(lesson.lessonCore?.sourceIds ?? []),
      ...(lesson.sources ?? []).map((s) => s.id),
    ])
    return ids.has(src.id)
  })

  if (lesson.legacyCard) {
    return {
      ...lesson.legacyCard,
      id: lesson.id,
      pathId: pathRecord.id,
      trackId,
      pathOrder: lesson.order,
      pathTopic: pathRecord.course?.title ?? pathRecord.preferences?.topic,
      pathTrackTitle: trackTitle,
      pathTrackLessonCount: trackLessonCount,
      image: GENERATED_CARD_IMAGE,
      sourceLabel: pathRecord.sourceLabel,
      isGeneratedPath: true,
      generationStatus: 'ready',
    }
  }

  if (presentation) {
    return {
      ...presentation,
      id: lesson.id,
      pathId: pathRecord.id,
      trackId,
      pathOrder: lesson.order,
      pathTopic: pathRecord.course?.title ?? pathRecord.preferences?.topic,
      pathTrackTitle: trackTitle,
      pathTrackLessonCount: trackLessonCount,
      image: GENERATED_CARD_IMAGE,
      format: 'narrative',
      sourceLabel: pathRecord.sourceLabel,
      isGeneratedPath: true,
      generationStatus: lesson.generationStatus,
      title: presentation.title ?? lesson.title,
      lessonCore: lesson.lessonCore ?? null,
      videoSearchQuery:
        presentation.videoSearchQuery ?? lesson.lessonBrief?.videoSearchQuery ?? null,
      sources: sources.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        publisher: s.publisher,
      })),
      youtube: null,
      youtubeId: null,
    }
  }

  const status = lesson.generationStatus ?? 'planned'
  const statusLine =
    status === 'generating'
      ? 'Researching and writing this lesson…'
      : status === 'error'
        ? 'Generation failed — open to retry'
        : 'Not written yet — open to research & generate'

  return {
    id: lesson.id,
    pathId: pathRecord.id,
    trackId,
    pathOrder: lesson.order,
    pathTopic: pathRecord.course?.title ?? pathRecord.preferences?.topic,
    pathTrackTitle: trackTitle,
    pathTrackLessonCount: trackLessonCount,
    image: GENERATED_CARD_IMAGE,
    format: 'planned',
    sourceLabel: pathRecord.sourceLabel,
    isGeneratedPath: true,
    generationStatus: status,
    title: lesson.title,
    curiosityQuestion: lesson.curiosityQuestion,
    hook: statusLine,
    deck: lesson.curiosityQuestion,
    domain: trackTitle ?? 'Learning path',
    sources: [],
    youtubeId: null,
    videoSearchQuery: lesson.lessonBrief?.videoSearchQuery ?? null,
  }
}

export function plannedLessonsForActiveTrack(pathRecord) {
  if (!pathRecord?.course || !pathRecord.activeTrackId) return []
  const track = pathRecord.course.tracks.find((t) => t.id === pathRecord.activeTrackId)
  if (!track) return []
  return track.lessons.map((lesson) =>
    lessonToDisplayCard({
      pathRecord,
      trackId: track.id,
      lesson,
      trackTitle: track.title,
      trackLessonCount: track.lessons.length,
    }),
  )
}
