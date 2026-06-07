// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/routing/index', () => ({
  classifyPrompt: vi.fn(),
}))

vi.mock('@/lib/chat/dispatcher', () => ({
  dispatch: vi.fn(),
}))

import { classifyPrompt } from '@/lib/routing/index'
import { dispatch } from '@/lib/chat/dispatcher'

const mockClassify = vi.mocked(classifyPrompt)
const mockDispatch = vi.mocked(dispatch)

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/chat', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns {response, tier, latency_ms} for a valid message', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T2', model: 'gemma4:4b', reason: 'COMPLEX' })
    mockDispatch.mockResolvedValueOnce('The capital of France is Paris.')
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({ message: 'What is the capital of France?' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.response).toBe('The capital of France is Paris.')
    expect(body.tier).toBe('T2')
    expect(typeof body.latency_ms).toBe('number')
  })

  it('returns 400 when message is missing', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is not a string', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({ message: 123 }))
    expect(res.status).toBe(400)
  })

  it('tier in response matches the routing decision', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T4', model: 'claude-sonnet-4-6', reason: 'TOOL' })
    mockDispatch.mockResolvedValueOnce('Result from Claude.')
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({ message: 'Search for latest AI news' }))
    const body = await res.json()
    expect(body.tier).toBe('T4')
  })

  it('latency_ms is a positive number', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T1', model: 'gemma4:2b', reason: 'SIMPLE' })
    mockDispatch.mockResolvedValueOnce('42')
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({ message: 'What is 2+2?' }))
    const body = await res.json()
    expect(body.latency_ms).toBeGreaterThanOrEqual(0)
  })

  it('returns 500 when dispatcher throws', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T2', model: 'gemma4:4b', reason: 'COMPLEX' })
    mockDispatch.mockRejectedValueOnce(new Error('Ollama unreachable'))
    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(makeRequest({ message: 'Hello' }))
    expect(res.status).toBe(500)
  })

  it('calls classifyPrompt with the user message', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T1', model: 'gemma4:2b', reason: 'SIMPLE' })
    mockDispatch.mockResolvedValueOnce('ok')
    const { POST } = await import('@/app/api/chat/route')
    await POST(makeRequest({ message: 'Quick question' }))
    expect(mockClassify).toHaveBeenCalledWith('Quick question')
  })

  it('calls dispatch with the model resolved by the router', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T3', model: 'gemma4:26b', reason: 'COMPLEX' })
    mockDispatch.mockResolvedValueOnce('deep answer')
    const { POST } = await import('@/app/api/chat/route')
    await POST(makeRequest({ message: 'Plan my week' }))
    expect(mockDispatch).toHaveBeenCalledWith('Plan my week', 'gemma4:26b')
  })
})
