// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/routing/index', () => ({
  classifyPrompt: vi.fn(),
}))

import { classifyPrompt } from '@/lib/routing/index'

const mockClassify = vi.mocked(classifyPrompt)

describe('POST /api/classify', () => {
  beforeEach(() => vi.clearAllMocks())

  function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('returns tier decision for a valid prompt', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T1', model: 'gemma4:2b', reason: 'SIMPLE' })
    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ prompt: 'What is 2+2?' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ tier: 'T1', model: 'gemma4:2b', reason: 'SIMPLE' })
    expect(mockClassify).toHaveBeenCalledWith('What is 2+2?')
  })

  it('returns 400 when prompt is missing', async () => {
    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when prompt is not a string', async () => {
    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ prompt: 42 }))
    expect(res.status).toBe(400)
  })

  it('returns 500 when routing engine throws', async () => {
    mockClassify.mockRejectedValueOnce(new Error('Ollama unreachable'))
    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ prompt: 'hello' }))
    expect(res.status).toBe(500)
  })
})
