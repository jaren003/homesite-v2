import { NextRequest, NextResponse } from 'next/server'
import { classifyPrompt } from '@/lib/routing/index'

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
    typeof (body as Record<string, unknown>).prompt !== 'string'
  ) {
    return NextResponse.json({ error: 'prompt must be a string' }, { status: 400 })
  }

  const { prompt } = body as { prompt: string }

  try {
    const decision = await classifyPrompt(prompt)
    return NextResponse.json(decision)
  } catch {
    return NextResponse.json({ error: 'Routing engine error' }, { status: 500 })
  }
}
