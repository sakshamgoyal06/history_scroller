import { describe, expect, it } from 'vitest'
import { buildPathDripFeedItems } from './pathDrip.js'

const path = {
  id: 'course-1',
  preferences: { topic: 'rbi' },
  activeTrackId: 't1',
  completedLessonIds: ['l1'],
  sourceCatalog: {},
  course: {
    title: 'RBI monetary policy',
    tracks: [
      {
        id: 't1',
        title: 'Track',
        lessons: [
          { id: 'l1', order: 1, title: 'One', generationStatus: 'ready' },
          { id: 'l2', order: 2, title: 'Two', generationStatus: 'ready' },
          { id: 'l3', order: 3, title: 'Three', generationStatus: 'planned' },
        ],
      },
    ],
  },
}

describe('buildPathDripFeedItems', () => {
  it('returns nothing when no path is enabled', () => {
    expect(buildPathDripFeedItems([], { paths: [path], enabledIds: [] })).toEqual([])
  })

  it('drips the next unfinished lesson, labelled with the course title', () => {
    const [item] = buildPathDripFeedItems([], { paths: [path], enabledIds: ['course-1'] })
    expect(item.parentCardId).toBe('l2')
    expect(item.pathDripLabel).toBe('RBI monetary policy')
    expect(item.slides[1].body).toContain('RBI monetary policy')
  })
})
