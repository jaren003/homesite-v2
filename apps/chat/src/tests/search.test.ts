// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { webSearch, WEB_SEARCH_TOOL } from '$lib/search.ts'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function braveResponse(results: Array<{ title: string; url: string; description: string }>) {
  return {
    ok: true,
    json: async () => ({ web: { results } }),
  }
}

describe('webSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BRAVE_API_KEY = 'test-key'
  })

  it('returns mapped results from Brave Search', async () => {
    mockFetch.mockResolvedValueOnce(
      braveResponse([{ title: 'Hello', url: 'https://example.com', description: 'A result' }]),
    )

    const results = await webSearch('hello world')

    expect(results).toEqual([
      { title: 'Hello', url: 'https://example.com', description: 'A result' },
    ])
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('q=hello+world')
    expect((opts.headers as Record<string, string>)['X-Subscription-Token']).toBe('test-key')
  })

  it('throws when BRAVE_API_KEY is not set', async () => {
    process.env.BRAVE_API_KEY = ''
    await expect(webSearch('query')).rejects.toThrow('BRAVE_API_KEY')
  })

  it('throws when Brave returns a non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })
    await expect(webSearch('query')).rejects.toThrow('429')
  })

  it('returns empty array when web.results is absent', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    const results = await webSearch('query')
    expect(results).toEqual([])
  })
})

describe('WEB_SEARCH_TOOL', () => {
  it('has correct name and required query input', () => {
    expect(WEB_SEARCH_TOOL.name).toBe('web_search')
    expect(WEB_SEARCH_TOOL.input_schema.required).toContain('query')
  })
})
