import Anthropic from '@anthropic-ai/sdk'
import type { Message } from './ollama.ts'
import { webSearch, WEB_SEARCH_TOOL } from './search.ts'

const client = new Anthropic()

export function createClaudeStream(messages: Message[], useSearch = false): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      try {
        await runTurn(
          messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          useSearch,
          controller,
        )
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

async function runTurn(
  messages: Anthropic.MessageParam[],
  useSearch: boolean,
  controller: ReadableStreamDefaultController<string>,
  depth = 0,
): Promise<void> {
  if (depth > 4) {
    controller.close()
    return
  }

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages,
    ...(useSearch ? { tools: [WEB_SEARCH_TOOL] } : {}),
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      controller.enqueue(event.delta.text)
    }
  }

  const finalMsg = await stream.finalMessage()

  if (finalMsg.stop_reason !== 'tool_use') {
    controller.close()
    return
  }

  const toolUseBlock = finalMsg.content.find(b => b.type === 'tool_use')
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    controller.close()
    return
  }

  const toolInput = toolUseBlock.input as { query?: string }
  let toolResult = 'Search unavailable.'

  if (toolUseBlock.name === 'web_search' && toolInput.query) {
    try {
      const results = await webSearch(toolInput.query)
      toolResult = results
        .map(r => `**${r.title}**\n${r.url}\n${r.description}`)
        .join('\n\n')
    } catch {
      toolResult = 'Search unavailable.'
    }
  }

  await runTurn(
    [
      ...messages,
      { role: 'assistant', content: finalMsg.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result' as const,
            tool_use_id: toolUseBlock.id,
            content: toolResult,
          },
        ],
      },
    ],
    useSearch,
    controller,
    depth + 1,
  )
}
