import { loadConversation, saveConversation } from '$lib/history.ts'
import type { RequestEvent } from '@sveltejs/kit'

export async function GET({ url }: Pick<RequestEvent, 'url'>) {
  const id = url.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const conversation = await loadConversation(id)
  if (!conversation) return new Response(null, { status: 404 })
  return Response.json(conversation)
}

export async function POST({ request }: Pick<RequestEvent, 'request'>) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('conversation' in body)) {
    return new Response('Missing conversation', { status: 400 })
  }

  await saveConversation((body as { conversation: Parameters<typeof saveConversation>[0] }).conversation)
  return new Response(null, { status: 200 })
}
