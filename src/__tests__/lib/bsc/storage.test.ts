// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}))

import * as fs from 'node:fs'
const mockFs = vi.mocked(fs)

import {
  readCompletions,
  setCompletion,
  readNotes,
  setNote,
} from '@/lib/bsc/storage'

// ── readCompletions ───────────────────────────────────────────────────────────

describe('readCompletions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns {} when completions file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(readCompletions('2026-06-02')).toEqual({})
  })

  it('returns only the requested week slice from the stored map', () => {
    const stored = {
      '2026-06-02': { '2026-06-02::KB swing (two-hand)': true },
      '2026-05-26': { '2026-05-26::Dead bug': true },
    }
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(stored))
    const result = readCompletions('2026-06-02')
    expect(result).toEqual({ '2026-06-02::KB swing (two-hand)': true })
    // other week's data must NOT leak in
    expect(result).not.toHaveProperty('2026-05-26::Dead bug')
  })
})

// ── setCompletion ─────────────────────────────────────────────────────────────

describe('setCompletion', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves a checked exercise and returns the updated week map', () => {
    mockFs.existsSync.mockReturnValue(false) // no existing file
    const result = setCompletion('2026-06-02', '2026-06-02::Dead bug', true)
    expect(result).toEqual({ '2026-06-02::Dead bug': true })
    // file was written
    expect(mockFs.writeFileSync).toHaveBeenCalledOnce()
    const [, written] = mockFs.writeFileSync.mock.calls[0]
    const persisted = JSON.parse(String(written))
    expect(persisted['2026-06-02']['2026-06-02::Dead bug']).toBe(true)
  })

  it('removes a key when checked is false', () => {
    const existing = { '2026-06-02': { '2026-06-02::Dead bug': true, '2026-06-02::Plank (standard/RKC)': true } }
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(existing))

    const result = setCompletion('2026-06-02', '2026-06-02::Dead bug', false)
    expect(result).not.toHaveProperty('2026-06-02::Dead bug')
    expect(result).toHaveProperty('2026-06-02::Plank (standard/RKC)', true)
  })

  it('creates the data directory before writing', () => {
    mockFs.existsSync.mockReturnValue(false)
    setCompletion('2026-06-02', '2026-06-02::Bird dog', true)
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('bsc'),
      { recursive: true },
    )
  })
})

// ── readNotes ─────────────────────────────────────────────────────────────────

describe('readNotes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns {} when notes file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(readNotes()).toEqual({})
  })

  it('returns parsed notes object when file exists', () => {
    const stored = { 'KB swing (two-hand)': 'hinge, not squat', 'Dead bug': 'press low back flat' }
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(stored))
    expect(readNotes()).toEqual(stored)
  })
})

// ── setNote ───────────────────────────────────────────────────────────────────

describe('setNote', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves a note and returns the updated notes map', () => {
    mockFs.existsSync.mockReturnValue(false)
    const result = setNote('KB swing (two-hand)', '32 kg · hip hinge focus')
    expect(result).toEqual({ 'KB swing (two-hand)': '32 kg · hip hinge focus' })
    expect(mockFs.writeFileSync).toHaveBeenCalledOnce()
  })

  it('deletes the key when an empty string is provided', () => {
    const existing = { 'KB swing (two-hand)': 'old note', 'Dead bug': 'press back' }
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(existing))

    const result = setNote('KB swing (two-hand)', '')
    expect(result).not.toHaveProperty('KB swing (two-hand)')
    expect(result).toHaveProperty('Dead bug', 'press back')
  })

  it('creates the data directory before writing', () => {
    mockFs.existsSync.mockReturnValue(false)
    setNote('Bird dog', 'slow and controlled')
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('bsc'),
      { recursive: true },
    )
  })
})
