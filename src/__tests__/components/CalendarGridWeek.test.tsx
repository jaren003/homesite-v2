import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarGridWeek from '@/components/calendar/CalendarGridWeek'
import type { CalendarEvent, Calendar } from '@/lib/eventkit/types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const cal: Calendar = { id: 'cal-1', name: 'Work', color: '#378ADD', type: 'local' }

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-1',
    title: 'Standup',
    startDate: '2026-06-03T09:00:00+0000',
    endDate: '2026-06-03T09:30:00+0000',
    isAllDay: false,
    calendarId: 'cal-1',
    calendarName: 'Work',
    calendarColor: '#378ADD',
    isRecurring: false,
    ...overrides,
  }
}

// Pin "today" to Wednesday 2026-06-03
// Sunday on or before 2026-06-03 is 2026-05-31
// Week: May 31 – Jun 6
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-06-03T12:00:00')) })
afterEach(() => { vi.useRealTimers() })

// ── 1. Week structure ─────────────────────────────────────────────────────────


describe('week structure', () => {
  it('renders exactly 7 day columns for the current Sun–Sat week', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    const cells = screen.getAllByRole('link', { name: /\d/ })
    expect(cells).toHaveLength(7)
  })

  it('first column is the Sunday on or before today', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    const links = screen.getAllByRole('link', { name: /\d/ })
    expect(links[0]).toHaveAttribute('href', '/day/2026-05-31')
  })

  it('last column is Saturday 6 days after Sunday', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    const links = screen.getAllByRole('link', { name: /\d/ })
    expect(links[6]).toHaveAttribute('href', '/day/2026-06-06')
  })
})

// ── 2. Today highlight ───────────────────────────────────────────────────────

describe('today highlight', () => {
  it('marks today column with data-today="true"', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    const todayCells = document.querySelectorAll('[data-today="true"]')
    expect(todayCells).toHaveLength(1)
  })

  it('does not mark today when viewing a different week', () => {
    // Provide a weekSunday that does not include today (2026-06-03)
    render(<CalendarGridWeek events={[]} calendars={[]} weekSunday="2026-06-07" />)
    const todayCells = document.querySelectorAll('[data-today="true"]')
    expect(todayCells).toHaveLength(0)
  })
})

// ── 4. Event card layout ──────────────────────────────────────────────────────

describe('event card layout', () => {
  it('renders the event title as the primary visible text', () => {
    const event = makeEvent({ title: 'Team Standup', startDate: '2026-06-03T09:00:00+0000' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    expect(screen.getByText('Team Standup')).toBeTruthy()
  })

  it('renders event time in a data-time element (de-emphasized)', () => {
    const event = makeEvent({ title: 'Team Standup', startDate: '2026-06-03T09:00:00+0000' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    const timeEl = document.querySelector('[data-time]')
    expect(timeEl).not.toBeNull()
    expect(timeEl?.textContent).toMatch(/9:00/)
  })

  it('shows "All day" in the time slot for all-day events', () => {
    const event = makeEvent({ title: 'Holiday', startDate: '2026-06-03', isAllDay: true })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    const timeEl = document.querySelector('[data-time]')
    expect(timeEl?.textContent?.toLowerCase()).toContain('all day')
  })
})

// ── 5. All-day events appear before timed events ──────────────────────────────

describe('all-day events ordering', () => {
  it('renders all-day events before timed events in the same day', () => {
    const timed = makeEvent({ id: 'timed', title: 'Morning Call', startDate: '2026-06-03T08:00:00+0000', isAllDay: false })
    const allDay = makeEvent({ id: 'allday', title: 'Company Holiday', startDate: '2026-06-03', isAllDay: true })
    render(<CalendarGridWeek events={[timed, allDay]} calendars={[cal]} />)

    const titles = screen.getAllByText(/Morning Call|Company Holiday/)
    // allDay should appear before timed in DOM order
    expect(titles[0].textContent).toBe('Company Holiday')
    expect(titles[1].textContent).toBe('Morning Call')
  })
})

// ── 6. Event overflow ─────────────────────────────────────────────────────────

describe('event overflow', () => {
  it('shows all events when 4 or fewer', () => {
    const events = Array.from({ length: 4 }, (_, i) =>
      makeEvent({ id: `e${i}`, title: `Event ${i}`, startDate: '2026-06-03T09:00:00+0000' })
    )
    render(<CalendarGridWeek events={events} calendars={[cal]} />)
    for (let i = 0; i < 4; i++) expect(screen.getByText(`Event ${i}`)).toBeTruthy()
    expect(screen.queryByText(/\+\d+ more/)).toBeNull()
  })

  it('shows first 4 and "+N more" when 5+ events', () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      makeEvent({ id: `e${i}`, title: `Event ${i}`, startDate: '2026-06-03T09:00:00+0000' })
    )
    render(<CalendarGridWeek events={events} calendars={[cal]} />)
    expect(screen.getByText('Event 0')).toBeTruthy()
    expect(screen.getByText('Event 3')).toBeTruthy()
    expect(screen.queryByText('Event 4')).toBeNull()
    expect(screen.getByText('+2 more')).toBeTruthy()
  })
})

// ── 7. Calendar filter ────────────────────────────────────────────────────────

describe('calendar filter', () => {
  it('hides events from a toggled-off calendar', () => {
    const event = makeEvent({ calendarId: 'cal-1', title: 'Work event' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    expect(screen.getByText('Work event')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Work/i }))
    expect(screen.queryByText('Work event')).toBeNull()
  })

  it('restores events when calendar is toggled back on', () => {
    const event = makeEvent({ calendarId: 'cal-1', title: 'Work event' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    fireEvent.click(screen.getByRole('button', { name: /Work/i }))
    fireEvent.click(screen.getByRole('button', { name: /Work/i }))
    expect(screen.getByText('Work event')).toBeTruthy()
  })
})

// ── 8. Local time display ─────────────────────────────────────────────────────

describe('local time display', () => {
  it('formats timed event as h:mmam/pm', () => {
    // 14:30 UTC → "2:30pm" in local (UTC test env)
    const event = makeEvent({ title: 'Lunch', startDate: '2026-06-03T14:30:00+0000' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    const timeEl = document.querySelector('[data-time]')
    expect(timeEl?.textContent).toBe('2:30pm')
  })

  it('formats midnight as 12:00am', () => {
    const event = makeEvent({ title: 'Midnight', startDate: '2026-06-03T00:00:00+0000' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    const timeEl = document.querySelector('[data-time]')
    expect(timeEl?.textContent).toBe('12:00am')
  })

  it('formats noon as 12:00pm', () => {
    const event = makeEvent({ title: 'Noon', startDate: '2026-06-03T12:00:00+0000' })
    render(<CalendarGridWeek events={[event]} calendars={[cal]} />)
    const timeEl = document.querySelector('[data-time]')
    expect(timeEl?.textContent).toBe('12:00pm')
  })
})

// ── 3. Week navigation ────────────────────────────────────────────────────────
// Navigation is now URL-based (<Link href>) — tests verify href attributes
// rather than click-driven state changes.

describe('week navigation', () => {
  it('Prev week link points to the previous Sunday', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} weekSunday="2026-05-31" />)
    expect(screen.getByRole('link', { name: /prev week/i }))
      .toHaveAttribute('href', '/calendar?week=2026-05-24')
  })

  it('Next week link points to the following Sunday', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} weekSunday="2026-05-31" />)
    expect(screen.getByRole('link', { name: /next week/i }))
      .toHaveAttribute('href', '/calendar?week=2026-06-07')
  })

  it('Today link points to /calendar (no week param)', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    expect(screen.getByRole('link', { name: /today/i }))
      .toHaveAttribute('href', '/calendar')
  })

  it('displays the week date range in the header', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} />)
    expect(screen.getByText(/May 31.*Jun 6/i)).toBeTruthy()
  })

  it('renders the correct week when weekSunday prop changes', () => {
    render(<CalendarGridWeek events={[]} calendars={[]} weekSunday="2026-06-07" />)
    const links = screen.getAllByRole('link', { name: /\d/ })
    expect(links[0]).toHaveAttribute('href', '/day/2026-06-07')
    expect(links[6]).toHaveAttribute('href', '/day/2026-06-13')
  })
})
