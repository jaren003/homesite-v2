import { NextResponse } from 'next/server'
import { getReminderLists } from '@/lib/eventkit/client'

export async function GET() {
  try {
    const lists = await getReminderLists()
    return NextResponse.json({ lists })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
