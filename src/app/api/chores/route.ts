import { NextResponse } from 'next/server'
import { readChores, writeChores } from '@/lib/fun-corner/data'
import type { Chore } from '@/lib/fun-corner/types'
import { randomUUID } from 'node:crypto'

export async function GET() {
  const chores = readChores()
  return NextResponse.json(chores)
}

export async function POST(req: Request) {
  const body = await req.json() as Partial<Chore>
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }
  const chore: Chore = {
    id: randomUUID(),
    title: body.title.trim(),
    emoji: body.emoji?.trim() || '✨',
    points: typeof body.points === 'number' ? body.points : 1,
    days: Array.isArray(body.days) ? body.days : [],
  }
  const chores = readChores()
  chores.push(chore)
  writeChores(chores)
  return NextResponse.json(chore, { status: 201 })
}
