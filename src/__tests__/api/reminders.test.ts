import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/eventkit/client', () => ({
  getReminderLists: vi.fn(),
  getReminders: vi.fn(),
  completeReminder: vi.fn(),
}))

import { getReminderLists, getReminders, completeReminder } from '@/lib/eventkit/client'
import { BridgeError } from '@/lib/eventkit/bridge'
import type { ReminderList, Reminder } from '@/lib/eventkit/types'

const mockGetLists     = vi.mocked(getReminderLists)
const mockGetReminders = vi.mocked(getReminders)
const mockComplete     = vi.mocked(completeReminder)

const sampleList: ReminderList = { id: 'list-1', name: 'Personal', color: '#FF9500' }

const sampleReminder: Reminder = {
  id: 'rem-1', title: 'Buy milk', listId: 'list-1', listName: 'Personal',
  listColor: '#FF9500', isCompleted: false, hasDueTime: false, priority: 0,
}

// ── GET /api/reminder-lists ───────────────────────────────────────────────────

describe('GET /api/reminder-lists', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with lists array', async () => {
    mockGetLists.mockResolvedValueOnce([sampleList])
    const { GET } = await import('@/app/api/reminder-lists/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.lists).toEqual([sampleList])
  })

  it('returns 502 on bridge error', async () => {
    mockGetLists.mockRejectedValueOnce(new BridgeError('failed'))
    const { GET } = await import('@/app/api/reminder-lists/route')
    const res = await GET()
    expect(res.status).toBe(502)
  })
})

// ── GET /api/reminders ────────────────────────────────────────────────────────

describe('GET /api/reminders', () => {
  beforeEach(() => vi.clearAllMocks())

  function makeRequest(params: Record<string, string> = {}) {
    const url = new URL('http://localhost/api/reminders')
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return new NextRequest(url)
  }

  it('returns 200 with reminders (defaults to incomplete)', async () => {
    mockGetReminders.mockResolvedValueOnce([sampleReminder])
    const { GET } = await import('@/app/api/reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reminders).toEqual([sampleReminder])
    expect(body.cachedAt).toBeDefined()
  })

  it('passes listIds param correctly', async () => {
    mockGetReminders.mockResolvedValueOnce([])
    const { GET } = await import('@/app/api/reminders/route')
    await GET(makeRequest({ listIds: 'list-1,list-2' }))
    expect(mockGetReminders).toHaveBeenCalledWith(
      expect.objectContaining({ listIds: ['list-1', 'list-2'] }),
    )
  })

  it('passes completed=both correctly', async () => {
    mockGetReminders.mockResolvedValueOnce([])
    const { GET } = await import('@/app/api/reminders/route')
    await GET(makeRequest({ completed: 'both' }))
    expect(mockGetReminders).toHaveBeenCalledWith(
      expect.objectContaining({ completed: 'both' }),
    )
  })

  it('returns 400 for invalid completed value', async () => {
    const { GET } = await import('@/app/api/reminders/route')
    const res = await GET(makeRequest({ completed: 'maybe' }))
    expect(res.status).toBe(400)
  })

  it('returns 504 on bridge timeout', async () => {
    mockGetReminders.mockRejectedValueOnce(new BridgeError('timed out after 10000ms'))
    const { GET } = await import('@/app/api/reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(504)
  })

  it('returns 502 on general bridge error', async () => {
    mockGetReminders.mockRejectedValueOnce(new BridgeError('permission denied'))
    const { GET } = await import('@/app/api/reminders/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(502)
  })
})

// ── POST /api/reminders/[id]/complete ────────────────────────────────────────

describe('POST /api/reminders/[id]/complete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with success:true on completion', async () => {
    mockComplete.mockResolvedValueOnce(true)
    const { POST } = await import('@/app/api/reminders/[id]/complete/route')
    const res = await POST({} as NextRequest, { params: Promise.resolve({ id: 'rem-1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mockComplete).toHaveBeenCalledWith('rem-1')
  })

  it('returns 422 when bridge reports success:false', async () => {
    mockComplete.mockResolvedValueOnce(false)
    const { POST } = await import('@/app/api/reminders/[id]/complete/route')
    const res = await POST({} as NextRequest, { params: Promise.resolve({ id: 'rem-999' }) })
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it('returns 504 on bridge timeout', async () => {
    mockComplete.mockRejectedValueOnce(new BridgeError('timed out after 10000ms'))
    const { POST } = await import('@/app/api/reminders/[id]/complete/route')
    const res = await POST({} as NextRequest, { params: Promise.resolve({ id: 'rem-1' }) })
    expect(res.status).toBe(504)
  })

  it('returns 502 on general bridge error', async () => {
    mockComplete.mockRejectedValueOnce(new BridgeError('not found'))
    const { POST } = await import('@/app/api/reminders/[id]/complete/route')
    const res = await POST({} as NextRequest, { params: Promise.resolve({ id: 'rem-1' }) })
    expect(res.status).toBe(502)
  })
})
