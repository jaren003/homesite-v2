'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { CalendarEvent, Calendar } from '@/lib/eventkit/types'
import EventCard from './EventCard'

interface Props {
  events: CalendarEvent[]
  calendars: Calendar[]
  initialMonth?: string // 'YYYY-MM'
}

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1)
  const end   = new Date(year, month + 1, 0)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(start), end: fmt(end) }
}

function buildGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7))
  return weeks
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function eventDay(e: CalendarEvent): string {
  return e.startDate.slice(0, 10)
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarGrid({ events, calendars, initialMonth }: Props) {
  const today = new Date()
  const [year,  setYear]  = useState(() => initialMonth ? parseInt(initialMonth.slice(0,4)) : today.getFullYear())
  const [month, setMonth] = useState(() => initialMonth ? parseInt(initialMonth.slice(5,7)) - 1 : today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string>(() => isoDate(today))
  const [hiddenCalIds, setHiddenCalIds] = useState<Set<string>>(new Set())
  const [fetchedEvents, setFetchedEvents] = useState<CalendarEvent[]>(events)

  // Re-fetch events from the API whenever the displayed month changes.
  // The server only pre-fetches the initial month; navigation requires a client fetch.
  useEffect(() => {
    const { start, end } = monthRange(year, month)
    fetch(`/api/calendar?start=${start}&end=${end}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.events)) setFetchedEvents(data.events) })
      .catch(() => {/* keep existing events on error */})
  }, [year, month])

  const visibleEvents = useMemo(
    () => fetchedEvents.filter(e => !hiddenCalIds.has(e.calendarId)),
    [fetchedEvents, hiddenCalIds]
  )

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    visibleEvents.forEach(e => {
      const d = eventDay(e)
      if (!map[d]) map[d] = []
      map[d].push(e)
    })
    return map
  }, [visibleEvents])

  const grid = useMemo(() => buildGrid(year, month), [year, month])

  const todayStr = isoDate(today)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const selectedEvents = eventsByDay[selectedDay] ?? []

  function toggleCalendar(id: string) {
    setHiddenCalIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        {/* Sidebar — calendar filter */}
        <aside className="hidden md:flex flex-col gap-2 w-44 shrink-0">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider mb-1"
             style={{ color: 'var(--hb-textSub)' }}>
            Calendars
          </p>
          {calendars.map(cal => {
            const hidden = hiddenCalIds.has(cal.id)
            return (
              <button
                key={cal.id}
                onClick={() => toggleCalendar(cal.id)}
                className="flex items-center gap-2 text-sm text-left transition-opacity"
                style={{ opacity: hidden ? 0.4 : 1 }}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: cal.color }} />
                <span style={{ color: 'var(--hb-text)' }}>{cal.name}</span>
              </button>
            )
          })}
        </aside>

        {/* Main grid */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth}
                    className="px-2 py-1 rounded text-sm hover:opacity-70"
                    style={{ color: 'var(--hb-accent)' }}>‹</button>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--hb-text)' }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth}
                    className="px-2 py-1 rounded text-sm hover:opacity-70"
                    style={{ color: 'var(--hb-accent)' }}>›</button>
          </div>

          {/* Grid */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--hb-border)' }}>
            {/* Day headers */}
            <div className="grid grid-cols-7"
                 style={{ background: 'var(--hb-surface)', borderBottom: '1px solid var(--hb-border)' }}>
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs font-mono font-semibold py-2 uppercase tracking-wider"
                     style={{ color: 'var(--hb-textSub)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7"
                   style={{ borderTop: wi === 0 ? undefined : '1px solid var(--hb-border)' }}>
                {week.map((day, di) => {
                  if (!day) return (
                    <div key={di} className="h-16 md:h-20"
                         style={{ background: 'var(--hb-bg)', borderLeft: di > 0 ? '1px solid var(--hb-border)' : undefined }} />
                  )
                  const dayStr    = isoDate(day)
                  const isToday   = dayStr === todayStr
                  const isSelected = dayStr === selectedDay
                  const dayEvents  = eventsByDay[dayStr] ?? []
                  const dots       = dayEvents.slice(0, 3)

                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDay(dayStr)}
                      className="h-16 md:h-20 flex flex-col items-center pt-1.5 gap-0.5 transition-colors relative"
                      style={{
                        background: isSelected ? 'var(--hb-surface)' : 'var(--hb-bg)',
                        borderLeft: di > 0 ? '1px solid var(--hb-border)' : undefined,
                      }}
                    >
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full`}
                            style={{
                              background: isToday ? 'var(--hb-accent)' : 'transparent',
                              color: isToday ? '#fff' : 'var(--hb-text)',
                            }}>
                        {day.getDate()}
                      </span>
                      <div className="flex gap-0.5 flex-wrap justify-center px-1">
                        {dots.map((e, i) => (
                          <span key={i} className="inline-block w-1.5 h-1.5 rounded-full"
                                style={{ background: e.calendarColor }} />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] leading-none" style={{ color: 'var(--hb-muted)' }}>
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Selected day events */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--hb-textSub)' }}>
                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <Link href={`/day/${selectedDay}`}
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--hb-accent)' }}>
                View day →
              </Link>
            </div>
            {selectedEvents.length === 0
              ? <p className="text-sm py-4 text-center rounded-xl border border-dashed"
                   style={{ color: 'var(--hb-muted)', borderColor: 'var(--hb-border)' }}>
                  No events
                </p>
              : <div className="flex flex-col gap-2">
                  {selectedEvents.map(e => (
                    <EventCard
                      key={e.id}
                      event={e}
                      href={`/event/${encodeURIComponent(e.id)}?date=${selectedDay}`}
                    />
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
