import { NextResponse } from 'next/server'
import { readWeekCompletions, setCompletion } from '@/lib/fun-corner/data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const week = searchParams.get('week')
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: 'week param required (YYYY-MM-DD)' }, { status: 400 })
  }
  const completions = readWeekCompletions(week)
  return NextResponse.json(completions)
}

export async function POST(req: Request) {
  const body = await req.json() as { choreId: string; date: string; completed: boolean }
  const { choreId, date, completed } = body
  if (!choreId || !date) {
    return NextResponse.json({ error: 'choreId and date required' }, { status: 400 })
  }
  const updated = setCompletion(choreId, date, completed)
  return NextResponse.json({ ok: true, day: updated[date] ?? [] })
}
