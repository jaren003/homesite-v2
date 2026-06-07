import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DayHeader from '@/components/day/DayHeader'

afterEach(() => { vi.useRealTimers() })

// ── 1. Date label ─────────────────────────────────────────────────────────────

describe('date label', () => {
  it('renders the full formatted date', () => {
    render(<DayHeader date="2026-06-05" />)
    expect(screen.getByTestId('date-label').textContent).toMatch(/June 5, 2026/)
  })
})

// ── 2. Prev / Next navigation ─────────────────────────────────────────────────

describe('prev / next navigation', () => {
  it('prev-day link points to the day before', () => {
    render(<DayHeader date="2026-06-05" />)
    expect(screen.getByRole('link', { name: 'Previous day' }))
      .toHaveAttribute('href', '/day/2026-06-04')
  })

  it('next-day link points to the day after', () => {
    render(<DayHeader date="2026-06-05" />)
    expect(screen.getByRole('link', { name: 'Next day' }))
      .toHaveAttribute('href', '/day/2026-06-06')
  })

  it('handles month boundary correctly — last day of month goes to first of next', () => {
    render(<DayHeader date="2026-06-30" />)
    expect(screen.getByRole('link', { name: 'Next day' }))
      .toHaveAttribute('href', '/day/2026-07-01')
  })

  it('handles month boundary correctly — first day of month goes to last of previous', () => {
    render(<DayHeader date="2026-06-01" />)
    expect(screen.getByRole('link', { name: 'Previous day' }))
      .toHaveAttribute('href', '/day/2026-05-31')
  })
})

// ── 3. Today badge ────────────────────────────────────────────────────────────

describe('Today badge', () => {
  it('shows Today badge when date matches current date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05T12:00:00'))
    render(<DayHeader date="2026-06-05" />)
    expect(screen.getByText('Today')).toBeTruthy()
  })

  it('does not show Today badge when date is not today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05T12:00:00'))
    render(<DayHeader date="2026-06-06" />)
    expect(screen.queryByText('Today')).toBeNull()
  })
})

// ── 4. Calendar back link ─────────────────────────────────────────────────────

describe('Calendar back link', () => {
  it('has a link back to /calendar', () => {
    render(<DayHeader date="2026-06-05" />)
    expect(screen.getByRole('link', { name: /calendar/i }))
      .toHaveAttribute('href', '/calendar')
  })
})
