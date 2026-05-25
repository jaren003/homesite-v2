import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted runs before imports — the mock fn must exist before the module loads
const mockExecFile = vi.hoisted(() => vi.fn())

vi.mock('child_process', () => ({
  default: { execFile: mockExecFile },
  execFile: mockExecFile,
}))

import { execBridge, BridgeError } from '@/lib/eventkit/bridge'

function mockSuccess(stdout: string) {
  mockExecFile.mockImplementation((_bin: string, _args: string[], cb: any) => {
    cb(null, stdout, '')
    return { on: vi.fn(), kill: vi.fn() } as any
  })
}

function mockFailure(code: number, stderr: string) {
  mockExecFile.mockImplementation((_bin: string, _args: string[], cb: any) => {
    const err: any = new Error(stderr)
    err.code = code
    cb(err, '', stderr)
    return { on: vi.fn(), kill: vi.fn() } as any
  })
}

describe('execBridge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses valid JSON stdout', async () => {
    const payload = { calendars: [{ id: 'abc', name: 'Home', color: '#FF3B30', type: 'calDAV' }] }
    mockSuccess(JSON.stringify(payload))

    const result = await execBridge(['calendars'])
    expect(result).toEqual(payload)
  })

  it('throws BridgeError on non-zero exit', async () => {
    mockFailure(1, 'EventKit permission denied')
    await expect(execBridge(['calendars'])).rejects.toBeInstanceOf(BridgeError)
  })

  it('throws BridgeError on invalid JSON', async () => {
    mockSuccess('not json at all')
    await expect(execBridge(['calendars'])).rejects.toBeInstanceOf(BridgeError)
  })

  it('passes args to the binary', async () => {
    mockSuccess(JSON.stringify({ events: [] }))
    await execBridge(['events', '--start', '2026-05-01', '--end', '2026-05-31'])

    expect(mockExecFile).toHaveBeenCalledWith(
      expect.stringContaining('eventkit-bridge'),
      ['events', '--start', '2026-05-01', '--end', '2026-05-31'],
      expect.any(Function),
    )
  })

  it('rejects after timeout', async () => {
    vi.useFakeTimers()
    mockExecFile.mockImplementation(() => {
      // never calls callback — simulates hung process
      return { kill: vi.fn() } as any
    })

    const promise = execBridge(['calendars'], { timeoutMs: 100 })
    vi.advanceTimersByTime(200)
    await expect(promise).rejects.toBeInstanceOf(BridgeError)
    vi.useRealTimers()
  })
})
