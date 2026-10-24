import { describe, expect, it } from 'vitest'
import { parseHash } from './routing.js'

describe('parseHash', () => {
  it.each([
    ['', { view: 'feed', id: null }],
    ['#unknown', { view: 'feed', id: null }],
    ['#feed/feed-roman-concrete', { view: 'feed', id: 'feed-roman-concrete' }],
    ['#story/alexandria', { view: 'story', id: 'alexandria' }],
    ['#zones', { view: 'zones' }],
    ['#zone/money-basics', { view: 'zone', id: 'money-basics' }],
    ['#learn', { view: 'learnHome' }],
    ['#learn/path/course-abc', { view: 'learnPath', id: 'course-abc' }],
    ['#path/course-abc', { view: 'learnPath', id: 'course-abc' }],
    ['#library', { view: 'library' }],
  ])('parses %s', (hash, expected) => {
    expect(parseHash(hash)).toEqual(expected)
  })

  it('decodes encoded IDs and ignores malformed escapes', () => {
    expect(parseHash('#feed/a%20b')).toEqual({ view: 'feed', id: 'a b' })
    expect(parseHash('#feed/%E0%A4%A')).toEqual({ view: 'feed', id: null })
  })
})
