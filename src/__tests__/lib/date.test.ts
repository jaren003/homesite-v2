import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeDate, isOverdue, isDueToday, formatEventTime } from '@/lib/utils/date'

// Pin "today" to a known date for deterministic tests
const TODAY = new Date('2026-05-25T10:00:00')

beforeEach(() => { vi.setSystemTime(TODAY) })
afterEach(() => { vi.useRealTimers() })

describe('formatRelativeDate', () => {
  it('returns "Today" for today\'s date', () => {
    expect(formatRelativeDate('2026-05-25')).toBe('Today')
  })

  it('returns "Tomorrow" for tomorrow', () => {
    expect(formatRelativeDate('2026-05-26')).toBe('Tomorrow')
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(formatRelativeDate('2026-05-24')).toBe('Yesterday')
  })

  it('returns "2 days ago" for 2 days back', () => {
    expect(formatRelativeDate('2026-05-23')).toBe('2 days ago')
  })

  it('returns a formatted date for distant future', () => {
    const result = formatRelativeDate('2026-06-10')
    expect(result).toBe('Jun 10')
  })

  it('handles timed ISO strings by treating them as the local date', () => {
    expect(formatRelativeDate('2026-05-25T14:30:00Z')).toBe('Today')
  })
})

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    expect(isOverdue('2026-05-20')).toBe(true)
  })

  it('returns false for today', () => {
    expect(isOverdue('2026-05-25')).toBe(false)
  })

  it('returns false for future dates', () => {
    expect(isOverdue('2026-06-01')).toBe(false)
  })

  it('returns true for a past timed reminder', () => {
    expect(isOverdue('2026-05-25T08:00:00')).toBe(true)   // 08:00 < 10:00 (now)
  })

  it('returns false for a future timed reminder', () => {
    expect(isOverdue('2026-05-25T12:00:00')).toBe(false)  // 12:00 > 10:00 (now)
  })
})

describe('isDueToday', () => {
  it('returns true when the date is today', () => {
    expect(isDueToday('2026-05-25')).toBe(true)
  })

  it('returns false for tomorrow', () => {
    expect(isDueToday('2026-05-26')).toBe(false)
  })

  it('returns false for yesterday', () => {
    expect(isDueToday('2026-05-24')).toBe(false)
  })
})

describe('formatEventTime', () => {
  it('returns "All day" for all-day events', () => {
    expect(formatEventTime({ startDate: '2026-05-25', isAllDay: true })).toBe('All day')
  })

  it('formats timed events as "HH:MM – HH:MM"', () => {
    const result = formatEventTime({
      startDate: '2026-05-25T14:00:00',
      endDate: '2026-05-25T15:30:00',
      isAllDay: false,
    })
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
