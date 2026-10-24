import { describe, expect, it } from 'vitest'
import { normalizePlanShape } from './normalizePlanShape.js'

const lesson = (n) => ({ id: `l${n}`, order: n, title: `Lesson ${n}` })
const track = (id, count) => ({ id, title: id, lessons: Array.from({ length: count }, (_, i) => lesson(i + 1)) })
const plan = (scopeDecision, tracks) => ({ scopeDecision, course: { tracks } })

describe('normalizePlanShape', () => {
  it('drops the course when the topic needs narrowing', () => {
    const out = normalizePlanShape(plan('needs_narrowing', [track('a', 5)]), { requestedLength: 5 })
    expect(out.course).toBeNull()
  })

  it.each([3, 4, 5])('trims a single path to the requested length (%i)', (requestedLength) => {
    const out = normalizePlanShape(plan('single_path', [track('a', 6)]), { requestedLength })
    expect(out.course.tracks[0].lessons).toHaveLength(requestedLength)
  })

  it('keeps only the first track for a single path', () => {
    const out = normalizePlanShape(plan('single_path', [track('a', 5), track('b', 5)]), { requestedLength: 5 })
    expect(out.course.tracks.map((t) => t.id)).toEqual(['a'])
  })

  it('downgrades multi_track with one track to single_path', () => {
    const out = normalizePlanShape(plan('multi_track', [track('a', 5)]), { requestedLength: 5 })
    expect(out.scopeDecision).toBe('single_path')
  })

  it('caps multi_track at 4 tracks of 5 lessons', () => {
    const tracks = ['a', 'b', 'c', 'd', 'e'].map((id) => track(id, 7))
    const out = normalizePlanShape(plan('multi_track', tracks), { requestedLength: 5 })
    expect(out.course.tracks).toHaveLength(4)
    expect(out.course.tracks.every((t) => t.lessons.length === 5)).toBe(true)
  })

  it('rejects plans with too few lessons', () => {
    expect(() => normalizePlanShape(plan('single_path', [track('a', 2)]), { requestedLength: 5 })).toThrow(
      expect.objectContaining({ code: 'PLAN_SHAPE' }),
    )
    expect(() =>
      normalizePlanShape(plan('multi_track', [track('a', 5), track('b', 2)]), { requestedLength: 5 }),
    ).toThrow(expect.objectContaining({ code: 'PLAN_SHAPE' }))
  })

  it('does not mutate its input', () => {
    const input = plan('single_path', [track('a', 6)])
    normalizePlanShape(input, { requestedLength: 3 })
    expect(input.course.tracks[0].lessons).toHaveLength(6)
  })
})
