import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TTLCache } from '@/lib/eventkit/cache'

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined on a cold cache', () => {
    const cache = new TTLCache<string>(1000)
    expect(cache.get('any-key')).toBeUndefined()
  })

  it('returns a stored value before TTL expires', () => {
    const cache = new TTLCache<string>(5000)
    cache.set('key', 'hello')
    vi.advanceTimersByTime(4999)
    expect(cache.get('key')).toBe('hello')
  })

  it('returns undefined after TTL expires', () => {
    const cache = new TTLCache<string>(5000)
    cache.set('key', 'hello')
    vi.advanceTimersByTime(5001)
    expect(cache.get('key')).toBeUndefined()
  })

  it('invalidate removes a specific key', () => {
    const cache = new TTLCache<string>(5000)
    cache.set('a', 'alpha')
    cache.set('b', 'beta')
    cache.invalidate('a')
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('beta')
  })

  it('invalidateAll clears every key', () => {
    const cache = new TTLCache<string>(5000)
    cache.set('a', 'alpha')
    cache.set('b', 'beta')
    cache.invalidateAll()
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBeUndefined()
  })

  it('overwrites an existing entry and resets TTL', () => {
    const cache = new TTLCache<string>(5000)
    cache.set('key', 'v1')
    vi.advanceTimersByTime(4000)
    cache.set('key', 'v2')           // reset TTL
    vi.advanceTimersByTime(4000)     // 8s total from first set, 4s from second
    expect(cache.get('key')).toBe('v2')  // still alive (4s < 5s TTL)
  })

  it('supports different value types', () => {
    const cache = new TTLCache<number[]>(1000)
    cache.set('nums', [1, 2, 3])
    expect(cache.get('nums')).toEqual([1, 2, 3])
  })
})
