import { describe, expect, it } from 'vitest'
import { assignStablePlanIds } from './planIds.js'

const modelPlan = {
  normalizedTopic: 'RBI monetary policy',
  clarification: null,
  course: {
    id: 'model-course',
    recommendedTrackId: 'model-track-2',
    tracks: [
      { id: 'model-track-1', title: 'Basics', order: 1, lessons: [{ id: 'x', order: 1, title: 'Same' }, { id: 'x', order: 2, title: 'Same' }] },
      { id: 'model-track-2', title: 'Tools', order: 2, lessons: [{ id: 'x', order: 1, title: 'Same' }] },
    ],
  },
}

describe('assignStablePlanIds', () => {
  it('replaces model IDs with unique URL-safe IDs', () => {
    const out = assignStablePlanIds(modelPlan, { requestId: 'abc123' })
    const lessonIds = out.course.tracks.flatMap((t) => t.lessons.map((l) => l.id))
    expect(new Set(lessonIds).size).toBe(lessonIds.length)
    for (const id of [out.course.id, ...lessonIds, ...out.course.tracks.map((t) => t.id)]) {
      expect(id).toMatch(/^[a-z]+-[a-z0-9-]+$/)
      expect(id.length).toBeLessThanOrEqual(80)
    }
  })

  it('remaps the recommended track to its new ID', () => {
    const out = assignStablePlanIds(modelPlan, { requestId: 'abc123' })
    expect(out.course.recommendedTrackId).toBe(out.course.tracks[1].id)
  })

  it('produces different IDs for different requests', () => {
    const a = assignStablePlanIds(modelPlan, { requestId: 'one' })
    const b = assignStablePlanIds(modelPlan, { requestId: 'two' })
    expect(a.course.id).not.toBe(b.course.id)
  })

  it('handles clarification-only plans', () => {
    const out = assignStablePlanIds(
      {
        normalizedTopic: 'Rome',
        course: null,
        clarification: { question: 'Which Rome?', options: [{ label: 'Republic' }, { label: 'Empire' }] },
      },
      { requestId: 'r' },
    )
    expect(out.course).toBeNull()
    expect(out.clarification.options.map((o) => o.id)).toHaveLength(2)
    expect(out.clarification.options[0].id).not.toBe(out.clarification.options[1].id)
  })
})
