// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from '@/lib/fun-corner/pin'

describe('hashPin', () => {
  it('returns a 64-char hex string (SHA-256)', () => {
    const h = hashPin('1234')
    expect(h).toHaveLength(64)
    expect(h).toMatch(/^[0-9a-f]+$/)
  })

  it('is deterministic — same input always produces same output', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'))
  })

  it('different PINs produce different hashes', () => {
    expect(hashPin('1234')).not.toBe(hashPin('5678'))
  })
})

describe('verifyPin', () => {
  it('returns true when input matches stored hash', () => {
    const stored = hashPin('9999')
    expect(verifyPin('9999', stored)).toBe(true)
  })

  it('returns false when input does not match stored hash', () => {
    const stored = hashPin('9999')
    expect(verifyPin('0000', stored)).toBe(false)
  })

  it('returns false for empty input against non-empty hash', () => {
    const stored = hashPin('1234')
    expect(verifyPin('', stored)).toBe(false)
  })
})
