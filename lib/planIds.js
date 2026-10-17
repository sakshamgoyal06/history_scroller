import { slugId } from './serverUtils.js'

/**
 * Rewrite model-provided IDs with stable app-generated URL-safe IDs.
 * @param {import('zod').infer<typeof import('./learningPathSchemas.js').ModelPlanResponseSchema>} modelPlan
 * @param {{ requestId: string }} ctx
 */
export function assignStablePlanIds(modelPlan, ctx) {
  const courseId = slugId('course', ctx.requestId, modelPlan.normalizedTopic)

  const clarification = modelPlan.clarification
    ? {
        question: modelPlan.clarification.question,
        options: modelPlan.clarification.options.map((opt, idx) => ({
          ...opt,
          id: slugId('narrow', courseId, String(idx), opt.label),
        })),
      }
    : null

  if (!modelPlan.course) {
    return { ...modelPlan, clarification, course: null }
  }

  const tracks = modelPlan.course.tracks.map((track, tIdx) => {
    const order = track.order ?? tIdx + 1
    const trackId = slugId('track', courseId, String(order), track.title)
    const lessons = track.lessons.map((lesson, lIdx) => ({
      ...lesson,
      id: slugId(
        'lesson',
        ctx.requestId,
        String(tIdx),
        String(lesson.order ?? lIdx + 1),
        lesson.title,
      ),
      order: lesson.order ?? lIdx + 1,
    }))
    return { ...track, id: trackId, order, lessons }
  })

  const trackIdByOld = new Map()
  modelPlan.course.tracks.forEach((oldTrack, tIdx) => {
    trackIdByOld.set(oldTrack.id, tracks[tIdx].id)
    trackIdByOld.set(oldTrack.title, tracks[tIdx].id)
  })

  const recommendedTrackId =
    trackIdByOld.get(modelPlan.course.recommendedTrackId) ?? tracks[0]?.id ?? ''

  return {
    ...modelPlan,
    clarification,
    course: {
      ...modelPlan.course,
      id: courseId,
      recommendedTrackId,
      tracks,
    },
  }
}
