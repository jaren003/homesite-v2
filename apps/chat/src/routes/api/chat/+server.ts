import { dispatch } from '$lib/dispatch.ts'
import type { RequestEvent } from '@sveltejs/kit'

export async function POST({ request }: Pick<RequestEvent, 'request'>) {
  const { prompt, history } = await request.json()
  const stream = await dispatch(prompt, history ?? [])

  const enc = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        controller.enqueue(enc.encode(`data: ${value}\n\n`))
      }
      controller.close()
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
