import { classifyPrompt } from './routing.ts'
import { createOllamaStream } from './ollama.ts'
import { createClaudeStream } from './claude.ts'
import type { Message } from './ollama.ts'

export async function dispatch(prompt: string, history: Message[]): Promise<ReadableStream<string>> {
  const decision = await classifyPrompt(prompt)
  const messages: Message[] = [...history, { role: 'user', content: prompt }]

  if (decision.tier === 'T3') {
    return createClaudeStream(messages)
  }

  return createOllamaStream(decision.model, messages)
}
