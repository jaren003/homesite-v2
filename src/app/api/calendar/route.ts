import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getEvents } from '@/lib/eventkit/client'
import { BridgeError } from '@/lib/eventkit/bridge'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T[\d:+Z.-]+)?$/

const querySchema = z.object({
  start: z.string().regex(ISO_DATE, 'start must be a valid date (YYYY-MM-DD or ISO 8601)'),
  end:   z.string().regex(ISO_DATE, 'end must be a valid date (YYYY-MM-DD or ISO 8601)'),
  calendarIds: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    const message = parsed.error.errors.map(e => e.message).join('; ')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { start, end, calendarIds } = parsed.data
  const ids = calendarIds ? calendarIds.split(',').filter(Boolean) : undefined

  try {
    const events = await getEvents(start, end, ids)
    return NextResponse.json({
      events,
      cachedAt: new Date().toISOString(),
      fromCache: false,   // TTLCache is opaque here; always false from route perspective
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isTimeout = message.toLowerCase().includes('timed out')
    return NextResponse.json({ error: message }, { status: isTimeout ? 504 : 502 })
  }
}
