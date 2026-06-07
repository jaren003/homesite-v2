import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { readNotes, setNote } from '@/lib/bsc/storage'

export function GET() {
  const notes = readNotes()
  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>
  const { exerciseName, note } = body

  if (typeof exerciseName !== 'string' || !exerciseName.trim()) {
    return NextResponse.json({ error: 'exerciseName (string) is required' }, { status: 400 })
  }
  if (typeof note !== 'string') {
    return NextResponse.json({ error: 'note (string) is required' }, { status: 400 })
  }

  const notes = setNote(exerciseName, note)
  return NextResponse.json({ ok: true, notes })
}
