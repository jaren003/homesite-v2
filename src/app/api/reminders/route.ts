import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getReminders } from '@/lib/eventkit/client'

const querySchema = z.object({
  listIds:   z.string().optional(),
  completed: z.enum(['true', 'false', 'both']).default('false'),
})

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    const message = parsed.error.errors.map(e => e.message).join('; ')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { listIds, completed } = parsed.data
  const ids = listIds ? listIds.split(',').filter(Boolean) : undefined

  try {
    const reminders = await getReminders({ listIds: ids, completed })
    return NextResponse.json({
      reminders,
      cachedAt: new Date().toISOString(),
      fromCache: false,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isTimeout = message.toLowerCase().includes('timed out')
    return NextResponse.json({ error: message }, { status: isTimeout ? 504 : 502 })
  }
}
