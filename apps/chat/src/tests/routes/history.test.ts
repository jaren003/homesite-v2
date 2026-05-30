// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('$lib/history.ts')

import { loadConversation, saveConversation } from '$lib/history.ts'
import { GET, POST } from '../../routes/api/history/+server.ts'

const mockLoad = vi.mocked(loadConversation)
const mockSave = vi.mocked(saveConversation)

function makeGet(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/history')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { url, request: new Request(url) } as any
}

describe('GET /api/history', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with conversation JSON when found', async () => {
    const conversation = { id: 'abc', messages: [{ role: 'user' as const, content: 'hi' }] }
    mockLoad.mockResolvedValueOnce(conversation)

    const response = await GET(makeGet({ id: 'abc' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(conversation)
    expect(mockLoad).toHaveBeenCalledWith('abc')
  })

  it('returns 404 when conversation does not exist', async () => {
    mockLoad.mockResolvedValueOnce(null)

    const response = await GET(makeGet({ id: 'missing' }))

    expect(response.status).toBe(404)
  })

  it('returns 400 when id query param is missing', async () => {
    const response = await GET(makeGet())

    expect(response.status).toBe(400)
    expect(mockLoad).not.toHaveBeenCalled()
  })
})

function makePost(body: unknown) {
  return {
    request: new Request('http://localhost/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  } as any
}

describe('POST /api/history', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 and saves conversation when body is valid', async () => {
    mockSave.mockResolvedValueOnce(undefined)
    const conversation = { id: 'xyz', messages: [{ role: 'user' as const, content: 'hi' }] }

    const response = await POST(makePost({ conversation }))

    expect(response.status).toBe(200)
    expect(mockSave).toHaveBeenCalledWith(conversation)
  })

  it('returns 400 when conversation key is missing from body', async () => {
    const response = await POST(makePost({ wrong: 'shape' }))

    expect(response.status).toBe(400)
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('returns 400 when body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const response = await POST({ request } as any)

    expect(response.status).toBe(400)
    expect(mockSave).not.toHaveBeenCalled()
  })
})
