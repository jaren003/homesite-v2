// Event detail page — shows all EventKit fields + user-editable notes sidecar.
// Route: /event/[id]?date=YYYY-MM-DD
// The `date` search param tells us which day to query so we can find the event.
//
// Layout (matches mockup):
//   Top bar:   ← back link (left)          attendee circles stub (right)
//   Section A: full-width title card
//   Section B|C: two-column — B=details+notes (~70%), C=reserved placeholder (~30%)

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvents } from '@/lib/eventkit/client'
import { formatEventTime, formatRelativeDate } from '@/lib/utils/date'
import EventNotesClient from '@/components/event/EventNotesClient'
import AttendeeCirclesStub from '@/components/event/AttendeeCirclesStub'
import type { CalendarEvent } from '@/lib/eventkit/types'
import { shiftDay } from '@/lib/utils/date'
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

async function findEvent(
  eventId: string,
  queryDate: string,
): Promise<{ event: CalendarEvent | null; bridgeError: boolean }> {
  try {
    // Use (queryDate, nextDay) — same range the day page uses — so we share
    // the cache entry and correctly find timed events (zero-duration window misses them).
    const nextDay = shiftDay(queryDate, 1)
    const events  = await getEvents(queryDate, nextDay)
    let event     = events.find(e => e.id === eventId) ?? null

    // ±1 day fallback: handles events that sit at a day boundary (timezone edge cases)
    // or stale links from a date that differs slightly from the event's start day.
    if (!event) {
      const wider = await getEvents(shiftDay(queryDate, -1), shiftDay(queryDate, 2))
      event = wider.find(e => e.id === eventId) ?? null
    }

    return { event, bridgeError: false }
  } catch {
    return { event: null, bridgeError: true }
  }
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { id }   = await params
  const { date } = await searchParams
  const eventId  = decodeURIComponent(id)

  const queryDate = date ?? new Date().toLocaleDateString('en-CA')
  const backHref  = date ? `/day/${date}` : '/calendar'

  const { event, bridgeError } = await findEvent(eventId, queryDate)

  // Bridge down → show error banner (not a 404 — the event may well exist)
  if (bridgeError) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <Link href={backHref}
              className="text-sm w-fit hover:opacity-70 transition-opacity"
              style={{ color: 'var(--hb-accent)' }}>
          ← {date ? 'Day' : 'Calendar'}
        </Link>
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background: 'var(--hb-coral)', color: '#fff' }}>
          ⚠ EventKit bridge unavailable — cannot load event details. Build it:{' '}
          <code className="font-mono text-xs">./scripts/eventkit-bridge/build.sh</code>
        </div>
      </div>
    )
  }

  // Bridge available but event not found → genuine 404
  if (!event) notFound()

  const savedNotes   = await getSavedNotes(eventId)
  const timeStr      = formatEventTime({ startDate: event.startDate, endDate: event.endDate, isAllDay: event.isAllDay })
  const relDate      = formatRelativeDate(event.startDate)
  const startDisplay = new Date(event.startDate + (event.isAllDay ? 'T12:00:00' : '')).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* ── Top bar: ← back (left)  attendee circles (right) ── */}
      <div className="flex items-center justify-between">
        <Link href={backHref}
              className="text-sm w-fit hover:opacity-70 transition-opacity"
              style={{ color: 'var(--hb-accent)' }}>
          ← {date ? 'Day' : 'Calendar'}
        </Link>
        {/* Attendee circles stub — TODO: wire to attendee/user data */}
        <AttendeeCirclesStub />
      </div>

      {/* ── Section A: full-width title card ── */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--hb-border)' }}>
        <div className="h-1.5 w-full" style={{ background: event.calendarColor }} />
        <div className="px-5 py-4 flex flex-col gap-1" style={{ background: 'var(--hb-card)' }}>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold leading-snug" style={{ color: 'var(--hb-text)' }}>
              {event.title}
            </h1>
            <span className="text-xs font-mono font-semibold shrink-0 mt-1"
                  style={{
                    color: relDate.includes('ago') ? 'var(--hb-coral)'
                      : relDate === 'Today'    ? 'var(--hb-amber)'
                      : relDate === 'Tomorrow' ? 'var(--hb-accent)'
                      : 'var(--hb-textSub)',
                  }}>
              {relDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: event.calendarColor }} />
            <span className="text-xs" style={{ color: 'var(--hb-textSub)' }}>
              {event.calendarName}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sections B + C: two-column below title ── */}
      {/* Use explicit percentage widths — avoids untested arbitrary flex values */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Section B — event details + notes, ~70% on desktop */}
        <div className="flex flex-col gap-5 w-full md:w-[70%] min-w-0">
          <div className="flex flex-col gap-3">
            <DetailRow label="Date"      value={startDisplay} />
            <DetailRow label="Time"      value={timeStr} />
            {event.location    && <DetailRow label="Location"  value={event.location} />}
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

          <EventNotesClient eventId={eventId} initialNotes={savedNotes} />
        </div>

        {/* Section C — reserved for future key details, ~30% on desktop */}
        <div className="w-full md:w-[28%] rounded-xl border min-h-[200px]"
             style={{ borderColor: 'var(--hb-border)', background: 'var(--hb-card)' }}
             data-section="c"
             aria-label="Reserved panel" />
      </div>

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
