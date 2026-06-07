import { NextRequest, NextResponse } from 'next/server'
import { classifyPrompt } from '@/lib/routing/index'
import { dispatch } from '@/lib/chat/dispatcher'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).message !== 'string'
  ) {
    return NextResponse.json({ error: 'message must be a string' }, { status: 400 })
  }

  const { message } = body as { message: string }

  const start = Date.now()
  try {
    const decision = await classifyPrompt(message)
    const response = await dispatch(message, decision.model)
    const latency_ms = Date.now() - start

    return NextResponse.json({ response, tier: decision.tier, latency_ms })
  } catch {
    return NextResponse.json({ error: 'Chat engine error' }, { status: 500 })
  }
}
