import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { readCompletions, setCompletion } from '@/lib/bsc/storage'

export function GET(req: NextRequest) {
  const weekMonday = req.nextUrl.searchParams.get('weekMonday')
  if (!weekMonday) {
    return NextResponse.json({ error: 'weekMonday param required' }, { status: 400 })
  }
  const completions = readCompletions(weekMonday)
  return NextResponse.json({ completions })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>
  const { weekMonday, key, checked } = body

  if (typeof weekMonday !== 'string' || typeof key !== 'string' || typeof checked !== 'boolean') {
    return NextResponse.json(
      { error: 'weekMonday (string), key (string), and checked (boolean) are required' },
      { status: 400 },
    )
  }

  const completions = setCompletion(weekMonday, key, checked)
  return NextResponse.json({ ok: true, completions })
}
