// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = vi.fn()
const mockFetch = vi.mocked(global.fetch)

const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function ollamaChatResponse(content: string) {
  return Promise.resolve(
    new Response(
      JSON.stringify({ message: { role: 'assistant', content } }),
      { headers: { 'Content-Type': 'application/json' } },
    ),
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

import { dispatch } from '@/lib/chat/dispatcher'

describe('dispatch', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('Ollama path (non-claude models)', () => {
    it('sends chat request to Ollama and returns response text', async () => {
      mockFetch.mockReturnValueOnce(ollamaChatResponse('The answer is 42.'))
      const result = await dispatch('What is the answer?', 'gemma4:4b')
      expect(result).toBe('The answer is 42.')
      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toMatch(/\/api\/chat$/)
      const body = JSON.parse(init.body as string)
      expect(body.model).toBe('gemma4:4b')
      expect(body.messages[0].content).toBe('What is the answer?')
      expect(body.stream).toBe(false)
    })

    it('uses the model specified in the call', async () => {
      mockFetch.mockReturnValueOnce(ollamaChatResponse('ok'))
      await dispatch('Hello', 'gemma4:26b')
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(JSON.parse(init.body as string).model).toBe('gemma4:26b')
    })

    it('propagates error when Ollama is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await expect(dispatch('hi', 'gemma4:4b')).rejects.toThrow()
    })
  })

  describe('Anthropic path (claude-* models)', () => {
    it('calls Anthropic messages.create and returns text content', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Here is my answer.' }],
      })
      const result = await dispatch('Explain recursion', 'claude-sonnet-4-6')
      expect(result).toBe('Here is my answer.')
      expect(mockCreate).toHaveBeenCalledOnce()
      const call = mockCreate.mock.calls[0][0]
      expect(call.model).toBe('claude-sonnet-4-6')
      expect(call.messages[0].content).toBe('Explain recursion')
    })

    it('throws if Anthropic returns a non-text content block', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }],
      })
      await expect(dispatch('hi', 'claude-sonnet-4-6')).rejects.toThrow('Unexpected')
    })
  })
})
