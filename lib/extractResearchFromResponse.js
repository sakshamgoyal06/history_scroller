/**
 * Pull URLs from a Responses API payload (web_search_call sources + url_citation annotations).
 * @param {import('openai/resources/responses/responses').Response} response
 */
export function extractSourcesFromResponse(response) {
  /** @type {Map<string, { url: string, title: string, publisher?: string }>} */
  const byUrl = new Map()

  const add = (url, title, publisher) => {
    if (!url || typeof url !== 'string') return
    try {
      const normalized = new URL(url).toString()
      if (!byUrl.has(normalized)) {
        byUrl.set(normalized, {
          url: normalized,
          title: title?.trim() || titleFromUrl(normalized),
          publisher: publisher?.trim() || undefined,
        })
      }
    } catch {
      /* ignore invalid urls */
    }
  }

  const output = response.output ?? []
  for (const item of output) {
    if (item.type === 'web_search_call' && item.action?.type === 'search') {
      for (const src of item.action.sources ?? []) {
        if (src?.url) add(src.url, titleFromUrl(src.url))
      }
    }
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part.type !== 'output_text') continue
        for (const ann of part.annotations ?? []) {
          if (ann.type === 'url_citation' && ann.url) {
            add(ann.url, ann.title)
          }
        }
      }
    }
  }

  return [...byUrl.values()]
}

function titleFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
