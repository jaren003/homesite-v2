// ── Event Notes API ───────────────────────────────────────────────────────────
// Persists user-entered notes for calendar events to data/event-notes.json.
// EventKit events are read-only; this provides a local sidecar store.

import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const DATA_DIR   = join(process.cwd(), 'data')
const NOTES_FILE = join(DATA_DIR, 'event-notes.json')

async function readAllNotes(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(NOTES_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeAllNotes(notes: Record<string, string>): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8')
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const all = await readAllNotes()
  return NextResponse.json({ notes: all[id] ?? null })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json() as { notes: string | null }
  const all = await readAllNotes()

  if (!body.notes || body.notes.trim() === '') {
    delete all[id]
  } else {
    all[id] = body.notes.trim()
  }

  await writeAllNotes(all)
  return NextResponse.json({ success: true })
}
