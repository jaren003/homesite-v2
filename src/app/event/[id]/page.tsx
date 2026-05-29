// Event detail page — shows all EventKit fields + user-editable notes sidecar.
// Route: /event/[id]?date=YYYY-MM-DD
// The `date` search param tells us which day to query so we can find the event.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvents } from '@/lib/eventkit/client'
import { formatEventTime, formatRelativeDate } from '@/lib/utils/date'
import EventNotesClient from '@/components/event/EventNotesClient'
import { readFile } from 'fs/promises'
import { join } from 'path'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}

async function getSavedNotes(eventId: string): Promise<string | null> {
  try {
    const raw = await readFile(join(process.cwd(), 'data', 'event-notes.json'), 'utf-8')
    const all = JSON.parse(raw) as Record<string, string>
    return all[eventId] ?? null
  } catch {
    return null
  }
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { id }   = await params
  const { date } = await searchParams
  const eventId  = decodeURIComponent(id)

  // We need a date range to query — fall back to today if not supplied
  const queryDate = date ?? new Date().toLocaleDateString('en-CA')

  let event = null
  try {
    const events = await getEvents(queryDate, queryDate)
    event = events.find(e => e.id === eventId) ?? null

    // If not found on exact date, try a wider ±1 day window (handles timezone edge cases)
    if (!event) {
      const d      = new Date(queryDate + 'T12:00:00')
      const before = new Date(d); before.setDate(d.getDate() - 1)
      const after  = new Date(d); after.setDate(d.getDate() + 1)
      const wider  = await getEvents(
        before.toISOString().slice(0, 10),
        after.toISOString().slice(0, 10),
      )
      event = wider.find(e => e.id === eventId) ?? null
    }
  } catch {
    // Bridge unavailable — fall through to error UI below
  }

  if (!event) notFound()

  const savedNotes = await getSavedNotes(eventId)
  const timeStr    = formatEventTime({ startDate: event.startDate, endDate: event.endDate, isAllDay: event.isAllDay })
  const relDate    = formatRelativeDate(event.startDate)

  const startDisplay = new Date(event.startDate + (event.isAllDay ? 'T12:00:00' : '')).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const backHref = date ? `/day/${date}` : '/calendar'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back link */}
      <Link href={backHref}
            className="text-sm w-fit hover:opacity-70 transition-opacity"
            style={{ color: 'var(--hb-accent)' }}>
        ← {date ? startDisplay : 'Calendar'}
      </Link>

      {/* Event header card */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--hb-border)' }}>
        {/* Colored stripe */}
        <div className="h-1.5 w-full" style={{ background: event.calendarColor }} />

        <div className="px-5 py-4 flex flex-col gap-1"
             style={{ background: 'var(--hb-card)' }}>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold leading-snug" style={{ color: 'var(--hb-text)' }}>
              {event.title}
            </h1>
            <span className="text-xs font-mono font-semibold shrink-0 mt-1"
                  style={{
                    color: relDate.includes('ago') ? 'var(--hb-coral)'
                      : relDate === 'Today'   ? 'var(--hb-amber)'
                      : relDate === 'Tomorrow' ? 'var(--hb-accent)'
                      : 'var(--hb-textSub)',
                  }}>
              {relDate}
            </span>
          </div>

          {/* Calendar name */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: event.calendarColor }} />
            <span className="text-xs" style={{ color: 'var(--hb-textSub)' }}>
              {event.calendarName}
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="flex flex-col gap-3">
        <DetailRow label="Date" value={startDisplay} />
        <DetailRow label="Time" value={timeStr} />
        {event.location && <DetailRow label="Location" value={event.location} />}
        {event.isRecurring && <DetailRow label="Recurring" value="Yes" />}
        {event.url && (
          <div className="flex gap-3">
            <span className="text-xs font-mono uppercase tracking-wider w-20 shrink-0 mt-0.5"
                  style={{ color: 'var(--hb-textSub)' }}>
              URL
            </span>
            <a href={event.url} target="_blank" rel="noopener noreferrer"
               className="text-sm break-all hover:opacity-70 transition-opacity"
               style={{ color: 'var(--hb-accent)' }}>
              {event.url}
            </a>
          </div>
        )}
      </div>

      {/* EventKit notes (read-only) */}
      {event.notes && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
              style={{ color: 'var(--hb-textSub)' }}>
            Event Notes
          </h2>
          <div className="rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
               style={{ background: 'var(--hb-card)', color: 'var(--hb-text)', border: '1px solid var(--hb-border)' }}>
            {event.notes}
          </div>
        </section>
      )}

      {/* User notes (editable, persisted locally) */}
      <EventNotesClient eventId={eventId} initialNotes={savedNotes} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-mono uppercase tracking-wider w-20 shrink-0 mt-0.5"
            style={{ color: 'var(--hb-textSub)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--hb-text)' }}>
        {value}
      </span>
    </div>
  )
}
