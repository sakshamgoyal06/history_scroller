/**
 * Repair common model mistakes before strict server validation.
 * @param {import('zod').infer<typeof import('./learningPathSchemas.js').ModelPlanResponseSchema>} plan
 * @param {{ requestedLength: 3 | 4 | 5 }} ctx
 */
export function normalizePlanShape(plan, ctx) {
  const next = structuredClone(plan)
  const targetLessons = ctx.requestedLength

  if (next.scopeDecision === 'needs_narrowing') {
    next.course = null
    return next
  }

  if (!next.course?.tracks?.length) {
    throw Object.assign(new Error('Plan missing course tracks'), { code: 'PLAN_SHAPE' })
  }

  if (next.scopeDecision === 'single_path' && next.course.tracks.length > 1) {
    next.course.tracks = [next.course.tracks[0]]
  }

  if (next.scopeDecision === 'multi_track' && next.course.tracks.length < 2) {
    next.scopeDecision = 'single_path'
    next.course.tracks = [next.course.tracks[0]]
  }

  if (next.scopeDecision === 'single_path') {
    const track = next.course.tracks[0]
    const lessons = (track.lessons ?? []).slice(0, targetLessons)
    if (lessons.length < 3) {
      throw Object.assign(new Error('single_path plan has too few lessons'), { code: 'PLAN_SHAPE' })
    }
    next.course.tracks = [{ ...track, lessons }]
    return next
  }

  if (next.scopeDecision === 'multi_track') {
    next.course.tracks = next.course.tracks.slice(0, 4).map((track) => {
      const lessons = (track.lessons ?? []).slice(0, 5)
      if (lessons.length < 3) {
        throw Object.assign(new Error('multi_track plan has a track with too few lessons'), {
          code: 'PLAN_SHAPE',
        })
      }
      return { ...track, lessons }
    })
  }

  return next
}
