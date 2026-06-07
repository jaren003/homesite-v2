'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CalendarEvent, Calendar } from '@/lib/eventkit/types'

interface Props {
  events: CalendarEvent[]
  calendars: Calendar[]
  /** ISO date string (YYYY-MM-DD) of the Sunday that starts the displayed week.
   *  Defaults to the Sunday of the current week if omitted. */
  weekSunday?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Returns the URL for a week offset from the given Sunday string. */
function weekUrl(sundayStr: string, delta: number): string {
  const d = new Date(sundayStr + 'T12:00:00')
  d.setDate(d.getDate() + delta * 7)
  return `/calendar?week=${isoDate(d)}`
}

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) return 'All day'
  const d = new Date(event.startDate)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${m}${ampm}`
}

function eventDay(e: CalendarEvent): string {
  return e.startDate.slice(0, 10)
}

function todayWeekSunday(): string {
  const today = new Date()
  const sun = new Date(today)
  sun.setDate(today.getDate() - today.getDay())
  sun.setHours(0, 0, 0, 0)
  return isoDate(sun)
}

function buildWeek(sundayStr: string): Date[] {
  const base = new Date(sundayStr + 'T12:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d
  })
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE = 4

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalendarGridWeek({ events, calendars, weekSunday: weekSundayProp }: Props) {
  const router = useRouter()
  const today = new Date()
  const todayStr = isoDate(today)

  // Fall back to today's week when prop is omitted (e.g., in tests)
  const weekSunday = weekSundayProp ?? todayWeekSunday()

  const [hiddenCalIds, setHiddenCalIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // URL targets — same pattern as DayHeader's ← / → links
  const prevUrl  = weekUrl(weekSunday, -1)
  const nextUrl  = weekUrl(weekSunday,  1)
  const todayUrl = '/calendar'  // no param → resolves to today's week

  const days = useMemo(() => buildWeek(weekSunday), [weekSunday])

  const weekLabel = useMemo(() => {
    const start = days[0]
    const end   = days[6]
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
  }, [days])

  const visibleEvents = useMemo(
    () => events.filter(e => !hiddenCalIds.has(e.calendarId)),
    [events, hiddenCalIds]
  )

  const eventsByDay = useMemo(() => {
    const map: Record<string, { allDay: CalendarEvent[]; timed: CalendarEvent[] }> = {}
    visibleEvents.forEach(e => {
      const d = eventDay(e)
      if (!map[d]) map[d] = { allDay: [], timed: [] }
      if (e.isAllDay) map[d].allDay.push(e)
      else map[d].timed.push(e)
    })
    return map
  }, [visibleEvents])

  function toggleCalendar(id: string) {
    setHiddenCalIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Swipe-to-navigate (iPad / touch) — uses router.push so URL stays in sync
  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (swipeStartX.current === null || swipeStartY.current === null) return
    const dx = e.changedTouches[0].clientX - swipeStartX.current
    const dy = e.changedTouches[0].clientY - swipeStartY.current
    swipeStartX.current = null
    swipeStartY.current = null
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      router.push(dx < 0 ? nextUrl : prevUrl)
    }
  }

  // ── Shared nav-arrow style (mirrors DayHeader's accent-coloured Link arrows)
  const arrowLinkClass =
    'flex items-center justify-center min-w-[44px] min-h-[36px] rounded-lg text-base font-semibold ' +
    'active:opacity-60 hover:opacity-80 transition-opacity shrink-0 no-underline'
  const arrowLinkStyle = {
    color: 'var(--hb-text)',
    border: '1px solid var(--hb-border)',
    background: 'var(--hb-card)',
    textDecoration: 'none',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        {/* Calendar filter sidebar */}
        <aside className="hidden md:flex flex-col gap-2 shrink-0 transition-[width]"
               style={{ width: sidebarOpen ? '11rem' : '3rem' }}>
          <div className="flex items-center justify-between mb-1">
            {sidebarOpen && (
              <p className="text-xs font-mono font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--hb-textSub)' }}>
                Calendars
              </p>
            )}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Collapse calendars' : 'Expand calendars'}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded hover:opacity-70 active:opacity-60 transition-opacity ml-auto text-base"
              style={{ color: 'var(--hb-textSub)', touchAction: 'manipulation' }}
            >
              {sidebarOpen ? '‹' : '›'}
            </button>
          </div>
          {sidebarOpen && calendars.map(cal => {
            const hidden = hiddenCalIds.has(cal.id)
            return (
              <button
                key={cal.id}
                onClick={() => toggleCalendar(cal.id)}
                aria-label={cal.name}
                className="flex items-center gap-2 text-sm text-left transition-opacity min-h-[44px] px-1 rounded active:opacity-50 hover:opacity-70"
                style={{ opacity: hidden ? 0.4 : 1 }}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: cal.color }} />
                <span style={{ color: 'var(--hb-text)' }}>{cal.name}</span>
              </button>
            )
          })}
        </aside>

        {/* Outer card — no overflow-hidden so iOS Safari doesn't clip touch events
            near rounded corners. Top clips via rounded-t-xl on nav bar;
            bottom clips via overflow-hidden rounded-b-xl on the day grid wrapper. */}
        <div className="flex flex-col flex-1 min-w-0 rounded-xl border"
             style={{ borderColor: 'var(--hb-border)' }}>

          {/* Week nav bar — arrows are <Link> elements, same as DayHeader */}
          <div className="flex items-center gap-2 px-3 rounded-t-xl"
               style={{ background: 'var(--hb-surface)', borderBottom: '1px solid var(--hb-border)', minHeight: 52 }}>

            <Link href={prevUrl} aria-label="Prev week"
                  className={arrowLinkClass} style={arrowLinkStyle}>
              ‹
            </Link>

            <div className="flex-1 flex items-center justify-center gap-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--hb-text)' }}>
                {weekLabel}
              </span>
              <Link href={todayUrl} aria-label="Today"
                    className="flex items-center justify-center min-h-[36px] px-3 rounded-lg text-xs font-semibold active:opacity-60 hover:opacity-80 transition-opacity shrink-0 no-underline"
                    style={{
                      color: 'var(--hb-textSub)',
                      border: '1px solid var(--hb-border)',
                      background: 'var(--hb-card)',
                      textDecoration: 'none',
                    }}>
                Today
              </Link>
            </div>

            <Link href={nextUrl} aria-label="Next week"
                  className={arrowLinkClass} style={arrowLinkStyle}>
              ›
            </Link>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7"
               style={{ background: 'var(--hb-surface)', borderBottom: '1px solid var(--hb-border)' }}>
            {DAY_LABELS.map(d => (
              <div key={d}
                   className="text-center text-xs font-mono font-semibold py-2 uppercase tracking-wider"
                   style={{ color: 'var(--hb-textSub)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* 7 day columns — swipe left/right navigates weeks on touch devices */}
          <div className="overflow-hidden rounded-b-xl"
               onTouchStart={handleTouchStart}
               onTouchEnd={handleTouchEnd}>
            <div className="grid grid-cols-7">
              {days.map((day, di) => {
                const dayStr = isoDate(day)
                const isToday = dayStr === todayStr

                return (
                  <Link
                    key={dayStr}
                    href={`/day/${dayStr}`}
                    className="flex flex-col gap-2 p-3 min-h-80 transition-colors hover:opacity-90"
                    data-today={isToday ? 'true' : undefined}
                    style={{
                      background: 'var(--hb-bg)',
                      borderLeft: di > 0 ? '1px solid var(--hb-border)' : undefined,
                    }}
                  >
                    {/* Date number */}
                    <span className="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full self-center"
                          style={{
                            background: isToday ? 'var(--hb-accent)' : 'transparent',
                            color:      isToday ? '#fff'              : 'var(--hb-text)',
                          }}>
                      {day.getDate()}
                    </span>

                    {/* Events */}
                    {(() => {
                      const { allDay = [], timed = [] } = eventsByDay[dayStr] ?? {}
                      const all     = [...allDay, ...timed]
                      const visible = all.slice(0, MAX_VISIBLE)
                      const overflow = all.length - MAX_VISIBLE
                      return (
                        <div className="flex flex-col gap-1">
                          {visible.map(e => (
                            <div key={e.id}
                                 className="flex flex-col gap-0.5 rounded-md px-1.5 py-1"
                                 style={{ background: 'var(--hb-surface)', borderLeft: `3px solid ${e.calendarColor}` }}>
                              <span className="text-xs font-semibold leading-tight overflow-hidden"
                                    style={{ color: 'var(--hb-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {e.title}
                              </span>
                              <span data-time className="text-[10px] leading-none"
                                    style={{ color: 'var(--hb-textSub)' }}>
                                {formatEventTime(e)}
                              </span>
                            </div>
                          ))}
                          {overflow > 0 && (
                            <span className="text-[10px] px-1" style={{ color: 'var(--hb-textSub)' }}>
                              +{overflow} more
                            </span>
                          )}
                        </div>
                      )
                    })()}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder section — to be built out */}
      <div className="rounded-xl border p-4 min-h-40 flex items-center justify-center"
           style={{ borderColor: 'var(--hb-border)', borderStyle: 'dashed' }}>
        <p className="text-sm font-mono" style={{ color: 'var(--hb-textSub)' }}>
          — section coming soon —
        </p>
      </div>
    </div>
  )
}
