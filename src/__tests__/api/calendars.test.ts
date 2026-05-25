import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/eventkit/client', () => ({
  getCalendars: vi.fn(),
  getEvents: vi.fn(),
  clearCalendarCache: vi.fn(),
}))

import { getCalendars, getEvents } from '@/lib/eventkit/client'
import { BridgeError } from '@/lib/eventkit/bridge'
import type { Calendar, CalendarEvent } from '@/lib/eventkit/types'

const mockGetCalendars = vi.mocked(getCalendars)
const mockGetEvents = vi.mocked(getEvents)

const sampleCalendar: Calendar = {
  id: 'cal-1', name: 'Home', color: '#FF3B30', type: 'calDAV',
}

const sampleEvent: CalendarEvent = {
  id: 'evt-1', title: 'Standup', startDate: '2026-05-25T09:00:00+0000',
  endDate: '2026-05-25T09:30:00+0000', isAllDay: false,
  calendarId: 'cal-1', calendarName: 'Home', calendarColor: '#FF3B30',
  isRecurring: false,
}

// ── GET /api/calendars ────────────────────────────────────────────────────────

describe('GET /api/calendars', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with calendars array', async () => {
    mockGetCalendars.mockResolvedValueOnce([sampleCalendar])
    const { GET } = await import('@/app/api/calendars/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.calendars).toEqual([sampleCalendar])
  })

  it('returns 502 when bridge throws BridgeError', async () => {
    mockGetCalendars.mockRejectedValueOnce(new BridgeError('bridge failed'))
    const { GET } = await import('@/app/api/calendars/route')
    const res = await GET()
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})

// ── GET /api/calendar ─────────────────────────────────────────────────────────

describe('GET /api/calendar', () => {
  beforeEach(() => vi.clearAllMocks())

  function makeRequest(params: Record<string, string>) {
    const url = new URL('http://localhost/api/calendar')
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return new NextRequest(url)
  }

  it('returns 200 with events for a valid date range', async () => {
    mockGetEvents.mockResolvedValueOnce([sampleEvent])
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: '2026-05-01', end: '2026-05-31' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.events).toEqual([sampleEvent])
    expect(body.fromCache).toBeDefined()
    expect(body.cachedAt).toBeDefined()
  })

  it('passes calendarIds to getEvents when provided', async () => {
    mockGetEvents.mockResolvedValueOnce([])
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: '2026-05-01', end: '2026-05-31', calendarIds: 'cal-1,cal-2' })
    await GET(req)
    expect(mockGetEvents).toHaveBeenCalledWith('2026-05-01', '2026-05-31', ['cal-1', 'cal-2'])
  })

  it('returns 400 when start param is missing', async () => {
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ end: '2026-05-31' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when end param is missing', async () => {
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: '2026-05-01' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid date format', async () => {
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: 'not-a-date', end: '2026-05-31' })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 504 on bridge timeout', async () => {
    const timeoutErr = new BridgeError('timed out after 10000ms')
    mockGetEvents.mockRejectedValueOnce(timeoutErr)
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: '2026-05-01', end: '2026-05-31' })
    const res = await GET(req)
    expect(res.status).toBe(504)
  })

  it('returns 502 on general bridge error', async () => {
    mockGetEvents.mockRejectedValueOnce(new BridgeError('permission denied'))
    const { GET } = await import('@/app/api/calendar/route')
    const req = makeRequest({ start: '2026-05-01', end: '2026-05-31' })
    const res = await GET(req)
    expect(res.status).toBe(502)
  })
})
