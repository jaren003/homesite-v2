// Calendar page — server component. Reads ?week=YYYY-MM-DD to support
// Link-based prev/next navigation that works on iPad Safari.
import { getEvents, getCalendars } from '@/lib/eventkit/client'
import CalendarGridWeek from '@/components/calendar/CalendarGridWeek'

interface Props {
  searchParams: Promise<{ week?: string }>
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Returns the Sunday of the week for the given ?week param (or today's week). */
function resolveWeekSunday(week?: string): Date {
  let base: Date | null = null
  if (week) {
    const parsed = new Date(week + 'T12:00:00')
    if (!isNaN(parsed.getTime())) base = parsed
  }
  if (!base) base = new Date()
  const sun = new Date(base)
  sun.setDate(base.getDate() - base.getDay())
  sun.setHours(0, 0, 0, 0)
  return sun
}

/** Fetch window: 4 weeks before and 5 weeks after the displayed Sunday. */
function fetchRange(sunday: Date): { start: string; end: string } {
  const start = new Date(sunday)
  start.setDate(sunday.getDate() - 28)
  const end = new Date(sunday)
  end.setDate(sunday.getDate() + 35)
  return { start: isoDate(start), end: isoDate(end) }
}

export default async function CalendarPage({ searchParams }: Props) {
  const { week } = await searchParams
  const sunday = resolveWeekSunday(week)
  const { start, end } = fetchRange(sunday)

  const [eventsResult, calendarsResult] = await Promise.allSettled([
    getEvents(start, end),
    getCalendars(),
  ])

  const events    = eventsResult.status === 'fulfilled'    ? eventsResult.value    : []
  const calendars = calendarsResult.status === 'fulfilled' ? calendarsResult.value : []
  const bridgeError = eventsResult.status === 'rejected' || calendarsResult.status === 'rejected'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--hb-text)' }}>
        Calendar
      </h1>

      {bridgeError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--hb-coral)', color: '#fff' }}>
          ⚠ EventKit bridge unavailable. Build it:{' '}
          <code className="font-mono text-xs">./scripts/eventkit-bridge/build.sh</code>
        </div>
      )}

      <CalendarGridWeek
        events={events}
        calendars={calendars}
        weekSunday={isoDate(sunday)}
      />
    </div>
  )
}
