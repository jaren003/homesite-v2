import { NextRequest, NextResponse } from 'next/server'
import { completeReminder } from '@/lib/eventkit/client'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  try {
    const success = await completeReminder(id)
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found or already completed' },
        { status: 422 },
      )
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isTimeout = message.toLowerCase().includes('timed out')
    return NextResponse.json({ error: message, success: false }, { status: isTimeout ? 504 : 502 })
  }
}
