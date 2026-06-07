const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'

/**
 * Dispatch a chat message to the appropriate model.
 *
 * - Models starting with "claude-" → Anthropic SDK (imported lazily to avoid
 *   bundling the SDK when not needed).
 * - All other models → Ollama /api/chat (non-streaming).
 *
 * Returns the assistant's response text.
 */
export async function dispatch(message: string, model: string): Promise<string> {
  if (model.startsWith('claude-')) {
    return dispatchAnthropic(message, model)
  }
  return dispatchOllama(message, model)
}

async function dispatchOllama(message: string, model: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as { message: { content: string } }
  return data.message.content
}

async function dispatchAnthropic(message: string, model: string): Promise<string> {
  // Lazy import so the Anthropic SDK is only required when T4 is actually used.
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic()

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected Anthropic response content type: ' + block.type)
  }
  return block.text
}
