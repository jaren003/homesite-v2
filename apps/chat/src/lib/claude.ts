import Anthropic from '@anthropic-ai/sdk'
import type { Message } from './ollama.ts'

const client = new Anthropic()

export function createClaudeStream(messages: Message[]): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(event.delta.text)
        }
      }

      controller.close()
    },
  })
}
