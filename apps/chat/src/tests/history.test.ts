// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'chat-history-'))
  process.env.CONVERSATIONS_DIR = tempDir
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
  delete process.env.CONVERSATIONS_DIR
})

import { saveConversation, loadConversation } from '$lib/history.ts'

describe('conversation history', () => {
  it('persists a conversation and loads it back', async () => {
    const conversation = {
      id: 'test-123',
      messages: [
        { role: 'user' as const, content: 'hello' },
        { role: 'assistant' as const, content: 'hi there' },
      ],
    }

    await saveConversation(conversation)
    const loaded = await loadConversation('test-123')

    expect(loaded).toEqual(conversation)
  })

  it('returns null for a conversation that does not exist', async () => {
    const result = await loadConversation('nonexistent-id')
    expect(result).toBeNull()
  })

  it('overwrites an existing conversation on save', async () => {
    const initial = { id: 'conv-1', messages: [{ role: 'user' as const, content: 'first' }] }
    await saveConversation(initial)

    const updated = {
      id: 'conv-1',
      messages: [
        { role: 'user' as const, content: 'first' },
        { role: 'assistant' as const, content: 'response' },
        { role: 'user' as const, content: 'second' },
      ],
    }
    await saveConversation(updated)

    const loaded = await loadConversation('conv-1')
    expect(loaded?.messages).toHaveLength(3)
    expect(loaded?.messages[2].content).toBe('second')
  })
})
