/**
 * Tests for the event-lookup logic that underpins the Event Detail page.
 *
 * Resolution path:
 *   1. (queryDate, nextDay) query → find by ID
 *   2. wider ±2-day fallback for timezone boundary edge cases
 *   3. bridgeError flag when the bridge throws
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CalendarEvent } from '@/lib/eventkit/types'
import { shiftDay } from '@/lib/utils/date'

// ── Fixture ───────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-abc123',
    title: 'Doctor appointment',
    startDate: '2026-06-05T10:00:00+0000',
    endDate:   '2026-06-05T11:00:00+0000',
    isAllDay: false,
    calendarId: 'cal-1',
    calendarName: 'Personal',
    calendarColor: '#378ADD',
    isRecurring: false,
    ...overrides,
  }
}

// ── Mock setup ────────────────────────────────────────────────────────────────

vi.mock('@/lib/eventkit/client', () => ({
  getEvents: vi.fn(),
}))

import { getEvents } from '@/lib/eventkit/client'
const mockGetEvents = vi.mocked(getEvents)

import { BridgeError } from '@/lib/eventkit/bridge'

// ── Mirror the findEvent helper from the page ─────────────────────────────────

async function findEvent(
  eventId: string,
  queryDate: string,
): Promise<{ event: CalendarEvent | null; bridgeError: boolean }> {
  try {
    const nextDay = shiftDay(queryDate, 1)
    const events  = await getEvents(queryDate, nextDay)
    let event     = events.find(e => e.id === eventId) ?? null

    if (!event) {
      const wider = await getEvents(shiftDay(queryDate, -1), shiftDay(queryDate, 2))
      event = wider.find(e => e.id === eventId) ?? null
    }

    return { event, bridgeError: false }
  } catch {
    return { event: null, bridgeError: true }
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => { mockGetEvents.mockReset() })

describe('primary query (date → nextDay)', () => {
  it('returns the event when found in the primary window', async () => {
    const ev = makeEvent()
    mockGetEvents.mockResolvedValue([ev])

    const result = await findEvent('evt-abc123', '2026-06-05')

    expect(result.event?.id).toBe('evt-abc123')
    expect(result.bridgeError).toBe(false)
  })

  it('queries (queryDate, nextDay) — not a zero-duration window', async () => {
    mockGetEvents.mockResolvedValue([makeEvent()])

    await findEvent('evt-abc123', '2026-06-05')

    expect(mockGetEvents).toHaveBeenCalledWith('2026-06-05', '2026-06-06')
  })
})

describe('±1-day fallback', () => {
  it('finds the event via wider window when primary query misses', async () => {
    const ev = makeEvent()
    mockGetEvents
      .mockResolvedValueOnce([])    // primary miss
      .mockResolvedValueOnce([ev]) // wider hit

    const result = await findEvent('evt-abc123', '2026-06-05')

    expect(result.event?.id).toBe('evt-abc123')
    expect(result.bridgeError).toBe(false)
    expect(mockGetEvents).toHaveBeenCalledTimes(2)
    expect(mockGetEvents).toHaveBeenNthCalledWith(2, '2026-06-04', '2026-06-07')
  })

  it('returns null event (not bridgeError) when missing from both windows', async () => {
    mockGetEvents.mockResolvedValue([])

    const result = await findEvent('evt-abc123', '2026-06-05')

    expect(result.event).toBeNull()
    expect(result.bridgeError).toBe(false)
  })
})

describe('bridge error', () => {
  it('sets bridgeError=true when getEvents throws BridgeError', async () => {
    mockGetEvents.mockRejectedValue(new BridgeError('Bridge timed out'))

    const result = await findEvent('evt-abc123', '2026-06-05')

    expect(result.event).toBeNull()
    expect(result.bridgeError).toBe(true)
  })

  it('sets bridgeError=true for any thrown error', async () => {
    mockGetEvents.mockRejectedValue(new Error('ENOENT'))

    const result = await findEvent('evt-abc123', '2026-06-05')

    expect(result.bridgeError).toBe(true)
  })
})

describe('event ID encoding', () => {
  it('finds events whose ID contains a colon (common in iCloud EventKit IDs)', async () => {
    const ev = makeEvent({ id: 'UUID:OCCURRENCE-20260605' })
    mockGetEvents.mockResolvedValue([ev])

    const result = await findEvent('UUID:OCCURRENCE-20260605', '2026-06-05')

    expect(result.event?.id).toBe('UUID:OCCURRENCE-20260605')
  })
})
