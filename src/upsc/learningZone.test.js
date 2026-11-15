import { describe, expect, it } from 'vitest'
import {
  SUBJECTS,
  addDays,
  chapterProblems,
  dueCards,
  findChapter,
  gradeCard,
  isChapterReady,
  sampleRevisionState,
  scheduleChapter,
} from './learningZone.js'
import { UPSC_SAMPLE_POSTS } from './upscContent.js'

const today = '2026-11-15'

describe('Learning Zone content (FR-UPSC-08..10, D-12)', () => {
  it('every written chapter passes the publish rule', () => {
    const ready = SUBJECTS.flatMap((s) => s.chapters).filter(isChapterReady)
    expect(ready.length).toBeGreaterThan(0)
    for (const ch of ready) expect(chapterProblems(ch), ch.id).toEqual([])
  })

  it('names no books or publishers', () => {
    const text = JSON.stringify(SUBJECTS)
    expect(text).not.toMatch(/laxmikanth|spectrum|ncert class|tata mcgraw/i)
  })

  it('flags thin or uncited decks', () => {
    const ch = { summary: 's', cards: [{ type: 'x', title: 't', body: 'b', cite: '' }] }
    expect(chapterProblems(ch)).toEqual(['cards: need 8–20', 'card 1: no citation'])
  })

  it('every current-affairs chapter link points at a ready chapter (FR-UPSC-12)', () => {
    for (const post of UPSC_SAMPLE_POSTS.filter((p) => p.chapterId)) {
      expect(isChapterReady(findChapter(post.chapterId)?.chapter), post.id).toBe(true)
    }
  })
})

describe('revision scheduling (FR-UPSC-11)', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 21)).toBe('2027-01-21')
  })

  it('schedules every card for tomorrow when a chapter is finished, without resetting existing ones', () => {
    const s = scheduleChapter({ 'polity-governor#0': { step: 2, due: '2026-11-20' } }, 'polity-governor', 3, today)
    expect(s['polity-governor#0']).toEqual({ step: 2, due: '2026-11-20' })
    expect(s['polity-governor#1']).toEqual({ step: 0, due: '2026-11-16' })
    expect(Object.keys(s)).toHaveLength(3)
  })

  it('moves through 1, 3, 7, 21 days and retires after the last', () => {
    let s = scheduleChapter({}, 'polity-governor', 1, today)
    const key = 'polity-governor#0'
    s = gradeCard(s, key, true, '2026-11-16')
    expect(s[key]).toEqual({ step: 1, due: '2026-11-19' })
    s = gradeCard(s, key, true, '2026-11-19')
    expect(s[key]).toEqual({ step: 2, due: '2026-11-26' })
    s = gradeCard(s, key, true, '2026-11-26')
    expect(s[key]).toEqual({ step: 3, due: '2026-12-17' })
    s = gradeCard(s, key, true, '2026-12-17')
    expect(s[key]).toBeUndefined()
  })

  it('"Again" brings a card back tomorrow at the first step', () => {
    const s = gradeCard({ 'polity-governor#0': { step: 2, due: today } }, 'polity-governor#0', false, today)
    expect(s['polity-governor#0']).toEqual({ step: 0, due: '2026-11-16' })
  })

  it('lists due cards oldest first, capped', () => {
    const s = {
      'polity-governor#1': { step: 0, due: '2026-11-14' },
      'polity-governor#2': { step: 0, due: '2026-11-15' },
      'geography-climate#0': { step: 0, due: '2026-11-13' },
      'polity-governor#3': { step: 0, due: '2026-11-16' },
    }
    const due = dueCards(s, today, 2)
    expect(due.map((d) => d.key)).toEqual(['geography-climate#0', 'polity-governor#1'])
    expect(due[0].card.title).toBe('A monsoon climate')
  })

  it('sample state yields three due cards today', () => {
    expect(dueCards(sampleRevisionState(today), today)).toHaveLength(3)
  })
})
