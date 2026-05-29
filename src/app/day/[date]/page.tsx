// Day detail page — lists all events and reminders for a specific date.
// Route: /day/[date]  where date is YYYY-MM-DD
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvents, getReminders } from '@/lib/eventkit/client'
import EventCard from '@/components/calendar/EventCard'
import DayRemindersClient from '@/components/day/DayRemindersClient'
import type { Reminder } from '@/lib/eventkit/types'

interface Props {
  params: Promise<{ date: string }>
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function prevDay(date: string): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function nextDay(date: string): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

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

  const [eventsResult, remindersResult] = await Promise.allSettled([
    getEvents(date, date),
    getReminders({ completed: 'false' }),
  ])

  const events     = eventsResult.status === 'fulfilled'    ? eventsResult.value    : []
  const reminders  = remindersResult.status === 'fulfilled'  ? remindersResult.value : []
  const dayReminders = filterRemindersForDay(reminders, date)
  const bridgeError  = eventsResult.status === 'rejected' || remindersResult.status === 'rejected'

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const today = new Date().toLocaleDateString('en-CA')
  const isToday = date === today

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/calendar"
                className="text-sm px-2 py-1 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--hb-accent)' }}>
            ← Calendar
          </Link>
          <h1 className="text-xl font-bold" style={{ color: 'var(--hb-text)' }}>
            {displayDate}
            {isToday && (
              <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full align-middle"
                    style={{ background: 'var(--hb-accent)', color: '#fff' }}>
                Today
              </span>
            )}
          </h1>
        </div>

        {/* Prev / Next day nav */}
        <div className="flex items-center gap-1">
          <Link href={`/day/${prevDay(date)}`}
                className="px-2 py-1 rounded text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--hb-accent)' }}>
            ‹
          </Link>
          <Link href={`/day/${nextDay(date)}`}
                className="px-2 py-1 rounded text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--hb-accent)' }}>
            ›
          </Link>
        </div>
      </div>

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
                <EventCard
                  key={e.id}
                  event={e}
                  href={`/event/${encodeURIComponent(e.id)}?date=${date}`}
                />
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
