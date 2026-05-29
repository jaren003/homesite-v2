// Dashboard home — server component, fetches today's events + urgent reminders
import { getEvents, getReminders } from '@/lib/eventkit/client'
import EventCard from '@/components/calendar/EventCard'
import ReminderItem from '@/components/reminders/ReminderItem'
import { isOverdue, isDueToday } from '@/lib/utils/date'
import Link from 'next/link'

function todayRange(): { start: string; end: string } {
  const d = new Date()
  const start = d.toISOString().slice(0, 10)
  return { start, end: start }
}

export default async function DashboardPage() {
  const { start, end } = todayRange()

  const [events, reminders] = await Promise.allSettled([
    getEvents(start, end),
    getReminders({ completed: 'false' }),
  ])

  const todayEvents  = events.status === 'fulfilled' ? events.value : []
  const allReminders = reminders.status === 'fulfilled' ? reminders.value : []

  const urgentReminders = allReminders
    .filter(r => r.dueDate && (isOverdue(r.dueDate) || isDueToday(r.dueDate)))
    .sort((a, b) => {
      const aOver = a.dueDate ? isOverdue(a.dueDate) : false
      const bOver = b.dueDate ? isOverdue(b.dueDate) : false
      if (aOver && !bOver) return -1
      if (!aOver && bOver) return 1
      return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
    })

  const bridgeError = events.status === 'rejected' || reminders.status === 'rejected'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--hb-text)' }}>
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric',
        })}
      </h1>

      {bridgeError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--hb-coral)', color: '#fff' }}>
          ⚠ EventKit bridge unavailable. Build it:{' '}
          <code className="font-mono text-xs">./scripts/eventkit-bridge/build.sh</code>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's events */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
                style={{ color: 'var(--hb-textSub)' }}>
              Today's Events
            </h2>
            <Link href="/calendar" className="text-xs" style={{ color: 'var(--hb-accent)' }}>
              View all →
            </Link>
          </div>
          {todayEvents.length === 0
            ? <EmptyState label="Nothing scheduled today" />
            : <div className="flex flex-col gap-2">{todayEvents.map(e => (
                <EventCard key={e.id} event={e} href={`/event/${encodeURIComponent(e.id)}?date=${start}`} />
              ))}</div>
          }
        </section>

        {/* Urgent reminders */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
                style={{ color: 'var(--hb-textSub)' }}>
              Due Today &amp; Overdue
            </h2>
            <Link href="/reminders" className="text-xs" style={{ color: 'var(--hb-accent)' }}>
              View all →
            </Link>
          </div>
          {urgentReminders.length === 0
            ? <EmptyState label="All clear ✓" />
            : <div className="flex flex-col gap-2">{urgentReminders.map(r => <ReminderItem key={r.id} reminder={r} />)}</div>
          }
        </section>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-sm py-6 text-center rounded-xl border border-dashed"
       style={{ color: 'var(--hb-muted)', borderColor: 'var(--hb-border)' }}>
      {label}
    </p>
  )
}
