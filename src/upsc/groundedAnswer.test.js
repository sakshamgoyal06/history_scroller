import { describe, expect, it } from 'vitest'
import { SAMPLE_ANSWERS, answerQuestion, enforceCitations } from './groundedAnswer.js'

describe('enforceCitations (FR-UPSC-04a)', () => {
  it('drops uncited sentences and sentences citing a missing source', () => {
    const answer = {
      id: 'x',
      title: 'x',
      gs: 'GS2',
      gsArea: 'x',
      sources: [{ title: 's', publisher: 'p', says: 'q' }],
      sections: [
        { heading: 'A', sentences: [{ text: 'kept', cites: [1] }, { text: 'no cite', cites: [] }] },
        { heading: 'B', sentences: [{ text: 'bad cite', cites: [2] }] },
      ],
    }
    const { answer: out, dropped } = enforceCitations(answer)
    expect(dropped).toBe(2)
    expect(out.sections).toHaveLength(1)
    expect(out.sections[0].sentences.map((s) => s.text)).toEqual(['kept'])
  })

  it('every displayed sentence of every sample answer is cited', () => {
    for (const a of Object.values(SAMPLE_ANSWERS)) {
      const { answer } = enforceCitations(a)
      for (const s of answer.sections.flatMap((x) => x.sentences)) expect(s.cites.length, s.text).toBeGreaterThan(0)
    }
  })
})

describe('answerQuestion (FR-UPSC-04b)', () => {
  it('answers a grounded topic with citations', () => {
    const r = answerQuestion('Explain the anti-defection law')
    expect(r.kind).toBe('answer')
    expect(r.dropped).toBe(1)
  })

  it('sends covered topics to reviewed content', () => {
    expect(answerQuestion('What powers does a Governor have over state bills?')).toEqual({
      kind: 'covered',
      explainerId: 'upsc-governor-assent',
      chapterId: 'polity-governor',
    })
  })

  it('says "no source" instead of guessing', () => {
    expect(answerQuestion('Who is the best Polity teacher on YouTube?').kind).toBe('no-source')
    expect(answerQuestion('   ').kind).toBe('no-source')
  })
})
