import { describe, expect, it } from 'vitest'
import { extractSourcesFromResponse } from './extractResearchFromResponse.js'

describe('extractSourcesFromResponse', () => {
  it('merges web search sources and citations, de-duplicated by URL', () => {
    const response = {
      output: [
        {
          type: 'web_search_call',
          action: { type: 'search', sources: [{ url: 'https://www.rbi.org.in/a' }, { url: 'not a url' }] },
        },
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              annotations: [
                { type: 'url_citation', url: 'https://www.rbi.org.in/a', title: 'Dup' },
                { type: 'url_citation', url: 'https://example.edu/b', title: 'Paper' },
              ],
            },
          ],
        },
      ],
    }
    expect(extractSourcesFromResponse(response)).toEqual([
      { url: 'https://www.rbi.org.in/a', title: 'rbi.org.in', publisher: undefined },
      { url: 'https://example.edu/b', title: 'Paper', publisher: undefined },
    ])
  })

  it('returns an empty list for responses without output', () => {
    expect(extractSourcesFromResponse({})).toEqual([])
  })
})
