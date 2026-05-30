// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('$lib/routing.ts')
vi.mock('$lib/ollama.ts')
vi.mock('$lib/claude.ts')

import { classifyPrompt } from '$lib/routing.ts'
import { createOllamaStream } from '$lib/ollama.ts'
import { createClaudeStream } from '$lib/claude.ts'
import { dispatch } from '$lib/dispatch.ts'

const mockClassify = vi.mocked(classifyPrompt)
const mockOllama = vi.mocked(createOllamaStream)
const mockClaude = vi.mocked(createClaudeStream)

function fakeStream(text: string): ReadableStream<string> {
  return new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(text)
      ctrl.close()
    },
  })
}

describe('dispatch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('routes T1 → Ollama, Claude not called', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T1', model: 'phi3:mini', reason: 'SIMPLE' })
    mockOllama.mockReturnValueOnce(fakeStream('hello'))

    const stream = await dispatch('What is 2+2?', [])

    expect(mockOllama).toHaveBeenCalledWith('phi3:mini', expect.any(Array))
    expect(mockClaude).not.toHaveBeenCalled()
    expect(stream).toBeInstanceOf(ReadableStream)
  })

  it('routes T2 → Ollama with T2 model, Claude not called', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T2', model: 'llama3:8b', reason: 'COMPLEX' })
    mockOllama.mockReturnValueOnce(fakeStream('detailed answer'))

    await dispatch('Explain monads', [])

    expect(mockOllama).toHaveBeenCalledWith('llama3:8b', expect.any(Array))
    expect(mockClaude).not.toHaveBeenCalled()
  })

  it('routes T3 → Claude, Ollama not called', async () => {
    mockClassify.mockResolvedValueOnce({ tier: 'T3', model: 'claude-sonnet-4-6', reason: 'TOOL' })
    mockClaude.mockReturnValueOnce(fakeStream('claude response'))

    await dispatch('search for latest news', [])

    expect(mockClaude).toHaveBeenCalledWith(expect.any(Array), true)
    expect(mockOllama).not.toHaveBeenCalled()
  })
})
