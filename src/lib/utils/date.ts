// ── Date utilities ────────────────────────────────────────────────────────────
// Pure functions for date formatting and comparison.
// All functions treat "today" as the current system date at call time,
// making them trivially testable via vi.setSystemTime().

/**
 * Returns the YYYY-MM-DD string for the day after the given date string.
 * Uses noon anchor to avoid DST edge cases.
 */
export function shiftDay(date: string, delta: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

/**
 * Returns the YYYY-MM-DD for the day that an event starts on (local-ish).
 * Uses the ISO string prefix so all-day and timed events are handled uniformly.
 * Note: for timed events stored as UTC this matches the UTC date, not local.
 * That is consistent with how CalendarGridTwoWeek bins events.
 */
export function eventStartDay(startDate: string): string {
  return startDate.slice(0, 10)
}

/**
 * Returns the local YYYY-MM-DD string for an ISO date/datetime string.
 */
function toLocalDateStr(iso: string): string {
  // For date-only strings, avoid timezone shift by parsing as local
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  return new Date(iso).toLocaleDateString('en-CA') // "YYYY-MM-DD"
}

/**
 * Returns today's YYYY-MM-DD in the local timezone.
 */
function todayStr(): string {
  return new Date().toLocaleDateString('en-CA')
}

/**
 * Formats a date string relative to today.
 * Examples: "Today", "Tomorrow", "Yesterday", "2 days ago", "Jun 10"
 */
export function formatRelativeDate(iso: string): string {
  const dateStr = toLocalDateStr(iso)
  const today = todayStr()

  if (dateStr === today) return 'Today'

  const d = new Date(dateStr + 'T00:00:00')
  const t = new Date(today + 'T00:00:00')
  const diffDays = Math.round((d.getTime() - t.getTime()) / 86_400_000)

  if (diffDays === 1)  return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < -1)  return `${Math.abs(diffDays)} days ago`

  // Future dates beyond tomorrow: "Jun 10"
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Returns true if the given date/datetime is strictly in the past.
 * For date-only strings (no time), uses end-of-day (23:59:59) as the boundary.
 */
export function isOverdue(iso: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    // date-only: overdue only if the day itself is before today
    return toLocalDateStr(iso) < todayStr()
  }
  return new Date(iso) < new Date()
}

/**
 * Returns true if the date string falls on today (local time).
 */
export function isDueToday(iso: string): boolean {
  return toLocalDateStr(iso) === todayStr()
}

interface EventTimeable {
  startDate: string
  endDate?: string
  isAllDay: boolean
}

/**
 * Formats a calendar event's time range as a human-readable string.
 * All-day → "All day"
 * Timed   → "2:00 PM – 3:30 PM"
 */
export function formatEventTime(event: EventTimeable): string {
  if (event.isAllDay) return 'All day'

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const start = fmt(event.startDate)
  if (!event.endDate) return start
  return `${start} – ${fmt(event.endDate)}`
}
