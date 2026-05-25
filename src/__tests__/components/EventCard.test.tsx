import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventCard from '@/components/calendar/EventCard'
import type { CalendarEvent } from '@/lib/eventkit/types'

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Team standup',
  startDate: '2026-05-25T09:00:00+0000',
  endDate: '2026-05-25T09:30:00+0000',
  isAllDay: false,
  calendarId: 'cal-1',
  calendarName: 'Work',
  calendarColor: '#378ADD',
  isRecurring: false,
}

describe('EventCard', () => {
  it('renders the event title', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByText('Team standup')).toBeTruthy()
  })

  it('renders the calendar name', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.getByText('Work')).toBeTruthy()
  })

  it('renders location when provided', () => {
    render(<EventCard event={{ ...baseEvent, location: 'Conference Room A' }} />)
    expect(screen.getByText(/Conference Room A/)).toBeTruthy()
  })

  it('does not render location when absent', () => {
    render(<EventCard event={baseEvent} />)
    expect(screen.queryByText(/Conference Room/)).toBeNull()
  })

  it('shows "All day" for all-day events', () => {
    render(<EventCard event={{ ...baseEvent, isAllDay: true, startDate: '2026-05-25' }} />)
    expect(screen.getByText(/all day/i)).toBeTruthy()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<EventCard event={baseEvent} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(baseEvent)
  })

  it('renders colored left stripe using calendar color', () => {
    const { getByTestId } = render(<EventCard event={baseEvent} />)
    const stripe = getByTestId('calendar-color-stripe')
    expect(stripe.getAttribute('data-color')).toBe('#378ADD')
  })

  it('shows urgency label for today event', () => {
    // startDate is 2026-05-25, our test pins "today" to 2026-05-25
    vi.setSystemTime(new Date('2026-05-25T10:00:00'))
    render(<EventCard event={baseEvent} />)
    expect(screen.getByText('Today')).toBeTruthy()
    vi.useRealTimers()
  })
})
