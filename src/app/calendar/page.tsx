// Calendar page — server component, fetches this month's events + calendar list
import { getEvents, getCalendars } from '@/lib/eventkit/client'
import CalendarGrid from '@/components/calendar/CalendarGrid'

function monthRange(): { start: string; end: string; monthStr: string } {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth()
  const start = new Date(y, m, 1).toISOString().slice(0, 10)
  const end   = new Date(y, m + 1, 0).toISOString().slice(0, 10)
  const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`
  return { start, end, monthStr }
}

export default async function CalendarPage() {
  const { start, end, monthStr } = monthRange()

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

      <CalendarGrid events={events} calendars={calendars} initialMonth={monthStr} />
    </div>
  )
}
