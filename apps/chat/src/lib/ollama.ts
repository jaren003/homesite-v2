export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'

export function createOllamaStream(model: string, messages: Message[]): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true }),
      })

      if (!res.ok || !res.body) {
        controller.error(new Error(`Ollama error: ${res.status}`))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.trim()) continue
          try {
            const json = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
            if (json.message?.content) controller.enqueue(json.message.content)
          } catch {
            // skip malformed lines
          }
        }
      }

      controller.close()
    },
  })
}
