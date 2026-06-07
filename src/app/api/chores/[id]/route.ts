import { NextResponse } from 'next/server'
import { readChores, writeChores, readCompletions, writeCompletions } from '@/lib/fun-corner/data'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const chores = readChores()
  const idx = chores.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })

  chores.splice(idx, 1)
  writeChores(chores)

  // Remove this chore from all completion entries
  const completions = readCompletions()
  for (const date of Object.keys(completions)) {
    completions[date] = completions[date].filter(cid => cid !== id)
  }
  writeCompletions(completions)

  return NextResponse.json({ ok: true })
}
