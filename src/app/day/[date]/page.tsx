// Day detail page — lists all events and reminders for a specific date.
// Route: /day/[date]  where date is YYYY-MM-DD
import { notFound } from 'next/navigation'
import { getEvents, getReminders } from '@/lib/eventkit/client'
import EventCard from '@/components/calendar/EventCard'
import DayHeader from '@/components/day/DayHeader'
import DayRemindersClient from '@/components/day/DayRemindersClient'
import AttendeeCirclesStub from '@/components/event/AttendeeCirclesStub'
import { shiftDay, eventStartDay } from '@/lib/utils/date'
import type { Reminder } from '@/lib/eventkit/types'

interface Props {
  params: Promise<{ date: string }>
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function filterRemindersForDay(reminders: Reminder[], date: string): Reminder[] {
  return reminders.filter(r => {
    if (!r.dueDate) return false
    const dueLocal = r.dueDate.startsWith(date.slice(0, 10))
      ? date
      : new Date(r.dueDate).toLocaleDateString('en-CA')
    return dueLocal === date
  })
}

export default async function DayPage({ params }: Props) {
  const { date } = await params

  if (!ISO_DATE.test(date)) notFound()

  // Query [date, nextDay) so the bridge returns all events that start on `date`.
  // Using (date, date) is a zero-duration window that misses timed events.
  const nextDay = shiftDay(date, 1)

  const [eventsResult, remindersResult] = await Promise.allSettled([
    getEvents(date, nextDay),
    getReminders({ completed: 'false' }),
  ])

  // Filter to events that actually start on `date` (the wider query may include
  // events at the midnight boundary of the next day).
  const allEvents    = eventsResult.status === 'fulfilled'   ? eventsResult.value    : []
  const events       = allEvents.filter(e => eventStartDay(e.startDate) === date)
  const reminders    = remindersResult.status === 'fulfilled' ? remindersResult.value : []
  const dayReminders = filterRemindersForDay(reminders, date)
  const bridgeError  = eventsResult.status === 'rejected' || remindersResult.status === 'rejected'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header — centered ← [Date] → navigation */}
      <DayHeader date={date} />

      {bridgeError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--hb-coral)', color: '#fff' }}>
          ⚠ EventKit bridge unavailable. Build it:{' '}
          <code className="font-mono text-xs">./scripts/eventkit-bridge/build.sh</code>
        </div>
      )}

      {/* Events section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: 'var(--hb-textSub)' }}>
          Events · {events.length}
        </h2>

        {events.length === 0
          ? (
            <p className="text-sm py-4 text-center rounded-xl border border-dashed"
               style={{ color: 'var(--hb-muted)', borderColor: 'var(--hb-border)' }}>
              Nothing scheduled
            </p>
          )
          : (
            <div className="flex flex-col gap-2">
              {events.map(e => (
                <div key={e.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <EventCard
                      event={e}
                      href={`/event/${encodeURIComponent(e.id)}?date=${date}`}
                    />
                  </div>
                  {/* Attendee stub — TODO: wire to real attendee data */}
                  <AttendeeCirclesStub />
                </div>
              ))}
            </div>
          )
        }
      </section>

      {/* Reminders section */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: 'var(--hb-textSub)' }}>
          Reminders Due · {dayReminders.length}
        </h2>
        <DayRemindersClient initialReminders={dayReminders} />
      </section>
    </div>
  )
}
