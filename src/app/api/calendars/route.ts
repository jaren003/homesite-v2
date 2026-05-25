import { NextResponse } from 'next/server'
import { getCalendars } from '@/lib/eventkit/client'
import { BridgeError } from '@/lib/eventkit/bridge'

export async function GET() {
  try {
    const calendars = await getCalendars()
    return NextResponse.json({ calendars })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
