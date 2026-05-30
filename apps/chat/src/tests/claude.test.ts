// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk')
vi.mock('$lib/search.ts')

import Anthropic from '@anthropic-ai/sdk'
import { webSearch } from '$lib/search.ts'
import { createClaudeStream } from '$lib/claude.ts'

const mockWebSearch = vi.mocked(webSearch)

function makeFakeStream(events: object[]) {
  let i = 0
  return {
    [Symbol.asyncIterator]() {
      return {
        next: async () =>
          i < events.length
            ? { value: events[i++], done: false }
            : { value: undefined, done: true },
      }
    },
    finalMessage: vi.fn(),
  }
}

describe('createClaudeStream', () => {
  beforeEach(() => vi.clearAllMocks())

  it('streams text chunks when stop_reason is end_turn', async () => {
    const fakeStream = makeFakeStream([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
      { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } },
    ])
    fakeStream.finalMessage.mockResolvedValue({ stop_reason: 'end_turn', content: [] })
    vi.mocked(Anthropic).prototype.messages = {
      stream: vi.fn().mockReturnValue(fakeStream),
    } as any

    const stream = createClaudeStream([{ role: 'user', content: 'hi' }])
    const reader = stream.getReader()
    const chunks: string[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    expect(chunks).toEqual(['Hello', ' world'])
  })

  it('calls webSearch and continues when stop_reason is tool_use', async () => {
    const toolUseBlock = {
      type: 'tool_use',
      id: 'tu_1',
      name: 'web_search',
      input: { query: 'latest news' },
    }

    const firstStream = makeFakeStream([])
    firstStream.finalMessage.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [toolUseBlock],
    })

    const secondStream = makeFakeStream([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Result' } },
    ])
    secondStream.finalMessage.mockResolvedValueOnce({ stop_reason: 'end_turn', content: [] })

    const mockStream = vi.fn()
      .mockReturnValueOnce(firstStream)
      .mockReturnValueOnce(secondStream)

    vi.mocked(Anthropic).prototype.messages = { stream: mockStream } as any
    mockWebSearch.mockResolvedValue([
      { title: 'News', url: 'https://example.com', description: 'A story' },
    ])

    const stream = createClaudeStream([{ role: 'user', content: 'latest news' }], true)
    const reader = stream.getReader()
    const chunks: string[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    expect(mockWebSearch).toHaveBeenCalledWith('latest news')
    expect(chunks).toEqual(['Result'])
    expect(mockStream).toHaveBeenCalledTimes(2)
  })

  it('falls back gracefully when webSearch throws', async () => {
    const toolUseBlock = {
      type: 'tool_use',
      id: 'tu_2',
      name: 'web_search',
      input: { query: 'query' },
    }

    const firstStream = makeFakeStream([])
    firstStream.finalMessage.mockResolvedValueOnce({
      stop_reason: 'tool_use',
      content: [toolUseBlock],
    })

    const secondStream = makeFakeStream([
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Fallback' } },
    ])
    secondStream.finalMessage.mockResolvedValueOnce({ stop_reason: 'end_turn', content: [] })

    vi.mocked(Anthropic).prototype.messages = {
      stream: vi.fn()
        .mockReturnValueOnce(firstStream)
        .mockReturnValueOnce(secondStream),
    } as any
    mockWebSearch.mockRejectedValue(new Error('API down'))

    const stream = createClaudeStream([{ role: 'user', content: 'query' }], true)
    const reader = stream.getReader()
    const chunks: string[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    expect(chunks).toEqual(['Fallback'])
  })
})
