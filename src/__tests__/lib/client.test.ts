import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the bridge module — client calls bridge functions, not the binary directly
vi.mock('@/lib/eventkit/bridge', () => ({
  execBridge: vi.fn(),
  BridgeError: class BridgeError extends Error {
    constructor(msg: string) { super(msg); this.name = 'BridgeError' }
  },
}))

import { execBridge, BridgeError } from '@/lib/eventkit/bridge'
import {
  getCalendars,
  getEvents,
  getReminderLists,
  getReminders,
  completeReminder,
  clearCalendarCache,
  clearRemindersCache,
} from '@/lib/eventkit/client'
import type { Calendar, CalendarEvent, ReminderList, Reminder } from '@/lib/eventkit/types'

const mockBridge = vi.mocked(execBridge)

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockCalendar: Calendar = {
  id: 'cal-1', name: 'Home', color: '#FF3B30', type: 'calDAV',
}

const mockEvent: CalendarEvent = {
  id: 'evt-1', title: 'Doctor', startDate: '2026-05-25T10:00:00+0000',
  endDate: '2026-05-25T11:00:00+0000', isAllDay: false,
  calendarId: 'cal-1', calendarName: 'Home', calendarColor: '#FF3B30',
  isRecurring: false,
}

const mockList: ReminderList = { id: 'list-1', name: 'Personal', color: '#FF9500' }

const mockReminder: Reminder = {
  id: 'rem-1', title: 'Buy milk', listId: 'list-1', listName: 'Personal',
  listColor: '#FF9500', isCompleted: false, hasDueTime: false, priority: 0,
}

// ── getCalendars ──────────────────────────────────────────────────────────────

describe('getCalendars', () => {
  beforeEach(() => { clearCalendarCache(); vi.clearAllMocks() })

  it('calls bridge with "calendars" and returns typed array', async () => {
    mockBridge.mockResolvedValueOnce({ calendars: [mockCalendar] })
    const result = await getCalendars()
    expect(mockBridge).toHaveBeenCalledWith(['calendars'], expect.any(Object))
    expect(result).toEqual([mockCalendar])
  })

  it('returns cached result on second call', async () => {
    mockBridge.mockResolvedValueOnce({ calendars: [mockCalendar] })
    await getCalendars()
    await getCalendars()
    expect(mockBridge).toHaveBeenCalledTimes(1)
  })

  it('re-fetches after cache is cleared', async () => {
    mockBridge.mockResolvedValue({ calendars: [mockCalendar] })
    await getCalendars()
    clearCalendarCache()
    await getCalendars()
    expect(mockBridge).toHaveBeenCalledTimes(2)
  })

  it('propagates BridgeError on failure', async () => {
    mockBridge.mockRejectedValueOnce(new BridgeError('permission denied'))
    await expect(getCalendars()).rejects.toBeInstanceOf(BridgeError)
  })
})

// ── getEvents ─────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  beforeEach(() => { clearCalendarCache(); vi.clearAllMocks() })

  it('calls bridge with correct args for date range', async () => {
    mockBridge.mockResolvedValueOnce({ events: [mockEvent] })
    const result = await getEvents('2026-05-01', '2026-05-31')
    expect(mockBridge).toHaveBeenCalledWith(
      ['events', '--start', '2026-05-01', '--end', '2026-05-31'],
      expect.any(Object),
    )
    expect(result).toEqual([mockEvent])
  })

  it('appends --calendar-ids when calendarIds are given', async () => {
    mockBridge.mockResolvedValueOnce({ events: [] })
    await getEvents('2026-05-01', '2026-05-31', ['cal-1', 'cal-2'])
    expect(mockBridge).toHaveBeenCalledWith(
      ['events', '--start', '2026-05-01', '--end', '2026-05-31', '--calendar-ids', 'cal-1,cal-2'],
      expect.any(Object),
    )
  })

  it('caches by date range key', async () => {
    mockBridge.mockResolvedValue({ events: [mockEvent] })
    await getEvents('2026-05-01', '2026-05-31')
    await getEvents('2026-05-01', '2026-05-31')
    expect(mockBridge).toHaveBeenCalledTimes(1)
  })

  it('uses separate cache entries for different date ranges', async () => {
    mockBridge.mockResolvedValue({ events: [] })
    await getEvents('2026-05-01', '2026-05-31')
    await getEvents('2026-06-01', '2026-06-30')
    expect(mockBridge).toHaveBeenCalledTimes(2)
  })

  it('propagates BridgeError', async () => {
    mockBridge.mockRejectedValueOnce(new BridgeError('timeout'))
    await expect(getEvents('2026-05-01', '2026-05-31')).rejects.toBeInstanceOf(BridgeError)
  })
})

// ── getReminderLists ──────────────────────────────────────────────────────────

describe('getReminderLists', () => {
  beforeEach(() => { clearRemindersCache(); vi.clearAllMocks() })

  it('calls bridge with "reminder-lists"', async () => {
    mockBridge.mockResolvedValueOnce({ lists: [mockList] })
    const result = await getReminderLists()
    expect(mockBridge).toHaveBeenCalledWith(['reminder-lists'], expect.any(Object))
    expect(result).toEqual([mockList])
  })

  it('caches the result', async () => {
    mockBridge.mockResolvedValue({ lists: [mockList] })
    await getReminderLists()
    await getReminderLists()
    expect(mockBridge).toHaveBeenCalledTimes(1)
  })
})

// ── getReminders ──────────────────────────────────────────────────────────────

describe('getReminders', () => {
  beforeEach(() => { clearRemindersCache(); vi.clearAllMocks() })

  it('fetches incomplete reminders by default', async () => {
    mockBridge.mockResolvedValueOnce({ reminders: [mockReminder] })
    const result = await getReminders()
    expect(mockBridge).toHaveBeenCalledWith(
      expect.arrayContaining(['reminders', '--completed', 'false']),
      expect.any(Object),
    )
    expect(result).toEqual([mockReminder])
  })

  it('passes --list-ids when provided', async () => {
    mockBridge.mockResolvedValueOnce({ reminders: [] })
    await getReminders({ listIds: ['list-1', 'list-2'] })
    expect(mockBridge).toHaveBeenCalledWith(
      expect.arrayContaining(['--list-ids', 'list-1,list-2']),
      expect.any(Object),
    )
  })

  it('passes --completed both when requested', async () => {
    mockBridge.mockResolvedValueOnce({ reminders: [] })
    await getReminders({ completed: 'both' })
    expect(mockBridge).toHaveBeenCalledWith(
      expect.arrayContaining(['--completed', 'both']),
      expect.any(Object),
    )
  })

  it('caches by options key', async () => {
    mockBridge.mockResolvedValue({ reminders: [] })
    await getReminders()
    await getReminders()
    expect(mockBridge).toHaveBeenCalledTimes(1)
  })
})

// ── completeReminder ──────────────────────────────────────────────────────────

describe('completeReminder', () => {
  beforeEach(() => { clearRemindersCache(); vi.clearAllMocks() })

  it('calls bridge with complete command and id', async () => {
    mockBridge.mockResolvedValueOnce({ success: true })
    const result = await completeReminder('rem-1')
    expect(mockBridge).toHaveBeenCalledWith(['complete', '--id', 'rem-1'], expect.any(Object))
    expect(result).toBe(true)
  })

  it('invalidates the reminders cache on success', async () => {
    // Prime the cache
    mockBridge.mockResolvedValueOnce({ reminders: [mockReminder] })
    await getReminders()
    expect(mockBridge).toHaveBeenCalledTimes(1)

    // Complete the reminder — should bust the cache
    mockBridge.mockResolvedValueOnce({ success: true })
    await completeReminder('rem-1')

    // Next fetch should hit the bridge again
    mockBridge.mockResolvedValueOnce({ reminders: [] })
    await getReminders()
    expect(mockBridge).toHaveBeenCalledTimes(3)
  })

  it('returns false on bridge failure', async () => {
    mockBridge.mockResolvedValueOnce({ success: false, error: 'not found' })
    const result = await completeReminder('rem-999')
    expect(result).toBe(false)
  })

  it('throws BridgeError on bridge crash', async () => {
    mockBridge.mockRejectedValueOnce(new BridgeError('timeout'))
    await expect(completeReminder('rem-1')).rejects.toBeInstanceOf(BridgeError)
  })
})
