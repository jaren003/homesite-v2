const BRAVE_URL = 'https://api.search.brave.com/res/v1/web/search'

export interface SearchResult {
  title: string
  url: string
  description: string
}

export async function webSearch(query: string): Promise<SearchResult[]> {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY ?? ''
  if (!BRAVE_API_KEY) throw new Error('BRAVE_API_KEY is not set')

  const url = new URL(BRAVE_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('count', '5')

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_API_KEY,
    },
  })

  if (!res.ok) throw new Error(`Brave Search error: ${res.status}`)

  const data = (await res.json()) as {
    web?: { results?: Array<{ title: string; url: string; description: string }> }
  }

  return (data.web?.results ?? []).map(r => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }))
}

export const WEB_SEARCH_TOOL = {
  name: 'web_search' as const,
  description: 'Search the web for current information. Use when the user asks about recent events, news, or facts that may have changed.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'The search query' },
    },
    required: ['query'],
  },
}
