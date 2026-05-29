// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('node:fs', () => ({
  appendFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}))

vi.mock('/Users/dahub/Projects/Homesite-v2/config/tiers.json', () => ({
  default: {
    T1: { role: 'Simple Q&A', model: 'phi3:mini' },
    T2: { role: 'Complex / fallback', model: 'llama3:8b' },
    T3: { role: 'Deep reasoning / tool use', model: 'claude-sonnet-4-6' },
  },
}))

global.fetch = vi.fn()
const mockFetch = vi.mocked(global.fetch)

// ── Helpers ───────────────────────────────────────────────────────────────────

function ollamaResponse(word: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ response: word }), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

// ── Import after mocks ────────────────────────────────────────────────────────

import { classifyPrompt } from '@/lib/routing/index'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('classifyPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Tool-use escalation via keyword detection (Ollama never called)
  describe('tool-use keyword escalation', () => {
    const toolPrompts = [
      'search for the latest AI papers',
      'look up the weather in Tokyo',
      'what is the current price of BTC?',
      'find online stores selling this item',
      "what's in today's news?",
    ]

    it.each(toolPrompts)('escalates to T3 for: "%s"', async (prompt) => {
      const result = await classifyPrompt(prompt)
      expect(result.tier).toBe('T3')
      expect(result.model).toBe('claude-sonnet-4-6')
      expect(result.reason).toBe('TOOL')
      // Ollama should not be called for keyword-matched tool prompts
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  // Task type → tier mapping via Ollama classifier
  describe('Ollama classifier task types', () => {
    it('routes SIMPLE → T1', async () => {
      mockFetch.mockReturnValueOnce(ollamaResponse('SIMPLE'))
      const result = await classifyPrompt('What is 2 + 2?')
      expect(result).toEqual({ tier: 'T1', model: 'phi3:mini', reason: 'SIMPLE' })
    })

    it('routes COMPLEX → T2', async () => {
      mockFetch.mockReturnValueOnce(ollamaResponse('COMPLEX'))
      const result = await classifyPrompt('Explain the trade-offs between microservices and monoliths')
      expect(result).toEqual({ tier: 'T2', model: 'llama3:8b', reason: 'COMPLEX' })
    })

    it('routes TOOL (from classifier) → T3', async () => {
      mockFetch.mockReturnValueOnce(ollamaResponse('TOOL'))
      const result = await classifyPrompt('Tell me something interesting')
      expect(result).toEqual({ tier: 'T3', model: 'claude-sonnet-4-6', reason: 'TOOL' })
    })

    it('falls back to COMPLEX for unknown classifier output', async () => {
      mockFetch.mockReturnValueOnce(ollamaResponse('GIBBERISH'))
      const result = await classifyPrompt('Some ambiguous prompt')
      expect(result.tier).toBe('T2')
      expect(result.reason).toBe('COMPLEX')
    })
  })

  // Timeout / unavailability fallback
  describe('classifier unavailable fallback', () => {
    it('falls back to T2 when Ollama times out (AbortError)', async () => {
      mockFetch.mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
      )
      const result = await classifyPrompt('What is the meaning of life?')
      expect(result).toEqual({
        tier: 'T2',
        model: 'llama3:8b',
        reason: 'classifier_unavailable',
      })
    })

    it('falls back to T2 when Ollama is unreachable (fetch error)', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      const result = await classifyPrompt('Draft a poem about autumn')
      expect(result).toEqual({
        tier: 'T2',
        model: 'llama3:8b',
        reason: 'classifier_unavailable',
      })
    })
  })

  // Logging
  describe('decision logging', () => {
    it('logs each decision to routing.jsonl', async () => {
      const { appendFileSync } = await import('node:fs')
      mockFetch.mockReturnValueOnce(ollamaResponse('SIMPLE'))
      await classifyPrompt('Quick question')
      expect(appendFileSync).toHaveBeenCalledOnce()
      const [, line] = vi.mocked(appendFileSync).mock.calls[0]
      const entry = JSON.parse(String(line))
      expect(entry).toMatchObject({
        tier: 'T1',
        model: 'phi3:mini',
        reason: 'SIMPLE',
      })
      expect(entry.ts).toBeDefined()
      expect(entry.promptHash).toHaveLength(16)
    })

    it('logs tool-use escalation decisions', async () => {
      const { appendFileSync } = await import('node:fs')
      await classifyPrompt('search for latest news')
      expect(appendFileSync).toHaveBeenCalledOnce()
      const [, line] = vi.mocked(appendFileSync).mock.calls[0]
      const entry = JSON.parse(String(line))
      expect(entry.tier).toBe('T3')
      expect(entry.reason).toBe('TOOL')
    })

    it('does not throw if logging fails', async () => {
      const { appendFileSync } = await import('node:fs')
      vi.mocked(appendFileSync).mockImplementationOnce(() => { throw new Error('disk full') })
      mockFetch.mockReturnValueOnce(ollamaResponse('SIMPLE'))
      await expect(classifyPrompt('Hello')).resolves.toBeDefined()
    })
  })
})
