'use client'

import { formatRelativeDate, formatEventTime } from '@/lib/utils/date'
import type { CalendarEvent } from '@/lib/eventkit/types'

interface Props {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  compact?: boolean   // true in month grid cells
}

export default function EventCard({ event, onClick, compact = false }: Props) {
  const urgency = formatRelativeDate(event.startDate)
  const timeStr = formatEventTime({
    startDate: event.startDate,
    endDate: event.endDate,
    isAllDay: event.isAllDay,
  })

  const urgencyColor =
    urgency.includes('ago') ? 'text-hb-coral' :
    urgency === 'Today'     ? 'text-hb-amber'  :
    urgency === 'Tomorrow'  ? 'text-hb-accent'  :
    'text-hb-textSub'

  return (
    <button
      onClick={() => onClick?.(event)}
      className="w-full flex items-stretch rounded-xl bg-hb-card border border-hb-border
                 overflow-hidden cursor-pointer hover:border-hb-muted transition-colors
                 active:scale-[0.99] text-left"
    >
      {/* Colored left stripe from calendar color */}
      <div
        data-testid="calendar-color-stripe"
        data-color={event.calendarColor}
        className="w-1 shrink-0"
        style={{ background: event.calendarColor }}
      />

      <div className="flex-1 px-3 py-2.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold text-hb-text leading-snug flex-1 truncate ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            {event.title}
          </p>
          <span className={`text-xs font-mono shrink-0 font-semibold ${urgencyColor}`}>
            {urgency}
          </span>
        </div>

        {!compact && (
          <>
            <p className="text-xs text-hb-textSub mt-0.5">{timeStr}</p>
            <p className="text-[10px] text-hb-muted mt-0.5">{event.calendarName}</p>
            {event.location && (
              <p className="text-xs text-hb-textSub mt-0.5 truncate">
                📍 {event.location}
              </p>
            )}
          </>
        )}

        {compact && event.isAllDay && (
          <p className="text-[9px] text-hb-muted mt-0.5 font-mono">all day</p>
        )}
        {compact && !event.isAllDay && (
          <p className="text-[9px] text-hb-textSub mt-0.5 font-mono">{timeStr}</p>
        )}
      </div>
    </button>
  )
}
