// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('$lib/dispatch.ts')

import { dispatch } from '$lib/dispatch.ts'
import { POST } from '../routes/api/chat/+server.ts'

const mockDispatch = vi.mocked(dispatch)

function textStream(chunks: string[]): ReadableStream<string> {
  let i = 0
  return new ReadableStream({
    pull(ctrl) {
      if (i < chunks.length) ctrl.enqueue(chunks[i++])
      else ctrl.close()
    },
  })
}

describe('POST /api/chat', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with content-type text/event-stream', async () => {
    mockDispatch.mockResolvedValueOnce(textStream(['hello']))

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi', history: [] }),
    })

    const response = await POST({ request } as any)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
  })

  it('body contains SSE data lines for each streamed chunk', async () => {
    mockDispatch.mockResolvedValueOnce(textStream(['hello', ' world']))

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi', history: [] }),
    })

    const response = await POST({ request } as any)
    const text = await response.text()

    expect(text).toContain('data: hello')
    expect(text).toContain('data:  world')
  })

  it('passes prompt and history to dispatch', async () => {
    mockDispatch.mockResolvedValueOnce(textStream([]))

    const history = [{ role: 'assistant' as const, content: 'hey' }]
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'follow up', history }),
    })

    await POST({ request } as any)

    expect(mockDispatch).toHaveBeenCalledWith('follow up', history)
  })
})
