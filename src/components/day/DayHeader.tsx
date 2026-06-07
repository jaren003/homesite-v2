import Link from 'next/link'
import { shiftDay } from '@/lib/utils/date'

interface Props {
  date: string  // YYYY-MM-DD
}

export default function DayHeader({ date }: Props) {
  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const today = new Date().toLocaleDateString('en-CA')
  const isToday = date === today

  return (
    <div className="flex flex-col gap-1">
      {/* Secondary back link */}
      <Link
        href="/calendar"
        className="text-xs w-fit hover:opacity-70 transition-opacity"
        style={{ color: 'var(--hb-accent)' }}
      >
        ← Calendar
      </Link>

      {/* Centered date nav: ← [Date] → */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/day/${shiftDay(date, -1)}`}
          aria-label="Previous day"
          className="text-xl px-2 py-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--hb-accent)' }}
        >
          ←
        </Link>

        <div className="flex items-center gap-2" data-testid="date-label">
          <h1 className="text-lg font-bold text-center" style={{ color: 'var(--hb-text)' }}>
            {displayDate}
          </h1>
          {isToday && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'var(--hb-accent)', color: '#fff' }}
            >
              Today
            </span>
          )}
        </div>

        <Link
          href={`/day/${shiftDay(date, 1)}`}
          aria-label="Next day"
          className="text-xl px-2 py-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--hb-accent)' }}
        >
          →
        </Link>
      </div>
    </div>
  )
}
