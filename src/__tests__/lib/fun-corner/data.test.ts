// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
}))

import * as fs from 'node:fs'
const mockFs = vi.mocked(fs)

// Import after mocks
import {
  readSettings,
  writeSettings,
  readChores,
  writeChores,
  appendChoreLog,
} from '@/lib/fun-corner/data'
import { DEFAULT_SETTINGS } from '@/lib/fun-corner/types'
import type { FunCornerSettings, Chore, ChoreLogEntry } from '@/lib/fun-corner/types'

// ── Settings ─────────────────────────────────────────────────────────────────

describe('readSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns DEFAULT_SETTINGS when settings file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(readSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('returns parsed settings when file exists', () => {
    const stored: FunCornerSettings = {
      pinHash: 'abc123',
      modules: { chores: false },
    }
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(stored))
    expect(readSettings()).toEqual(stored)
  })
})

describe('writeSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes JSON to the settings file path', () => {
    const settings: FunCornerSettings = { pinHash: 'xyz', modules: { chores: true } }
    writeSettings(settings)
    expect(mockFs.writeFileSync).toHaveBeenCalledOnce()
    const [, content] = mockFs.writeFileSync.mock.calls[0]
    expect(JSON.parse(String(content))).toEqual(settings)
  })

  it('creates the data directory if it does not exist', () => {
    writeSettings(DEFAULT_SETTINGS)
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('fun-corner'), { recursive: true })
  })
})

// ── Chores ────────────────────────────────────────────────────────────────────

describe('readChores', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array when chores file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(readChores()).toEqual([])
  })

  it('returns parsed chore array when file exists', () => {
    const chores: Chore[] = [{ id: '1', title: 'Make bed', emoji: '🛏️' }]
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(JSON.stringify(chores))
    expect(readChores()).toEqual(chores)
  })
})

describe('writeChores', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes chore array as JSON', () => {
    const chores: Chore[] = [{ id: '2', title: 'Feed cat', emoji: '🐱', points: 5 }]
    writeChores(chores)
    expect(mockFs.writeFileSync).toHaveBeenCalledOnce()
    const [, content] = mockFs.writeFileSync.mock.calls[0]
    expect(JSON.parse(String(content))).toEqual(chores)
  })
})

// ── Chore log ─────────────────────────────────────────────────────────────────

describe('appendChoreLog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('appends a newline-delimited JSON entry to the log file', () => {
    const entry: ChoreLogEntry = { choreId: '1', completedAt: '2026-06-04T10:00:00.000Z' }
    appendChoreLog(entry)
    expect(mockFs.appendFileSync).toHaveBeenCalledOnce()
    const [, line] = mockFs.appendFileSync.mock.calls[0]
    const parsed = JSON.parse(String(line).trim())
    expect(parsed).toMatchObject({ choreId: '1', completedAt: '2026-06-04T10:00:00.000Z' })
  })

  it('creates the data directory before appending', () => {
    appendChoreLog({ choreId: 'x', completedAt: new Date().toISOString() })
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('fun-corner'), { recursive: true })
  })
})
