// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mock the storage lib ──────────────────────────────────────────────────────

vi.mock('@/lib/bsc/storage', () => ({
  readCompletions: vi.fn(),
  setCompletion:   vi.fn(),
  readNotes:       vi.fn(),
  setNote:         vi.fn(),
}))

import {
  readCompletions,
  setCompletion,
  readNotes,
  setNote,
} from '@/lib/bsc/storage'

const mockReadCompletions = vi.mocked(readCompletions)
const mockSetCompletion   = vi.mocked(setCompletion)
const mockReadNotes       = vi.mocked(readNotes)
const mockSetNote         = vi.mocked(setNote)

function makeRequest(url: string, opts?: { method?: string; body?: string; headers?: Record<string, string> }) {
  return new NextRequest(new URL(url, 'http://localhost'), opts)
}

// ── GET /api/bsc/completions ──────────────────────────────────────────────────

describe('GET /api/bsc/completions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when weekMonday param is missing', async () => {
    const { GET } = await import('@/app/api/bsc/completions/route')
    const res = await GET(makeRequest('http://localhost/api/bsc/completions'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 200 with completion record for the given week', async () => {
    const week = { '2026-06-02::KB swing (two-hand)': true }
    mockReadCompletions.mockReturnValueOnce(week)
    const { GET } = await import('@/app/api/bsc/completions/route')
    const res = await GET(makeRequest('http://localhost/api/bsc/completions?weekMonday=2026-06-02'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.completions).toEqual(week)
    expect(mockReadCompletions).toHaveBeenCalledWith('2026-06-02')
  })
})

// ── POST /api/bsc/completions ─────────────────────────────────────────────────

describe('POST /api/bsc/completions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 { ok: true } on valid body', async () => {
    const updated = { '2026-06-02::Dead bug': true }
    mockSetCompletion.mockReturnValueOnce(updated)
    const { POST } = await import('@/app/api/bsc/completions/route')
    const req = makeRequest('http://localhost/api/bsc/completions', {
      method: 'POST',
      body: JSON.stringify({ weekMonday: '2026-06-02', key: '2026-06-02::Dead bug', checked: true }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.completions).toEqual(updated)
    expect(mockSetCompletion).toHaveBeenCalledWith('2026-06-02', '2026-06-02::Dead bug', true)
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/bsc/completions/route')
    const req = makeRequest('http://localhost/api/bsc/completions', {
      method: 'POST',
      body: JSON.stringify({ weekMonday: '2026-06-02' }), // missing key + checked
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ── GET /api/bsc/notes ────────────────────────────────────────────────────────

describe('GET /api/bsc/notes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with notes record', async () => {
    const notes = { 'KB swing (two-hand)': '32 kg · hip hinge' }
    mockReadNotes.mockReturnValueOnce(notes)
    const { GET } = await import('@/app/api/bsc/notes/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.notes).toEqual(notes)
  })
})

// ── POST /api/bsc/notes ───────────────────────────────────────────────────────

describe('POST /api/bsc/notes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 { ok: true } with updated notes on valid body', async () => {
    const updated = { 'KB swing (two-hand)': '32 kg' }
    mockSetNote.mockReturnValueOnce(updated)
    const { POST } = await import('@/app/api/bsc/notes/route')
    const req = makeRequest('http://localhost/api/bsc/notes', {
      method: 'POST',
      body: JSON.stringify({ exerciseName: 'KB swing (two-hand)', note: '32 kg' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(mockSetNote).toHaveBeenCalledWith('KB swing (two-hand)', '32 kg')
  })

  it('returns 200 and deletes the note when empty string is passed', async () => {
    mockSetNote.mockReturnValueOnce({})
    const { POST } = await import('@/app/api/bsc/notes/route')
    const req = makeRequest('http://localhost/api/bsc/notes', {
      method: 'POST',
      body: JSON.stringify({ exerciseName: 'KB swing (two-hand)', note: '' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockSetNote).toHaveBeenCalledWith('KB swing (two-hand)', '')
  })

  it('returns 400 when exerciseName is missing', async () => {
    const { POST } = await import('@/app/api/bsc/notes/route')
    const req = makeRequest('http://localhost/api/bsc/notes', {
      method: 'POST',
      body: JSON.stringify({ note: 'some note' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
