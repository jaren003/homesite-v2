// ── TTL Cache ─────────────────────────────────────────────────────────────────
// Simple in-memory Map-based cache with per-key TTL.
// Used by API routes to avoid spawning the EventKit bridge on every request.

interface Entry<T> {
  value: T
  expiresAt: number
}

export class TTLCache<T> {
  private readonly ttlMs: number
  private readonly store = new Map<string, Entry<T>>()

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidateAll(): void {
    this.store.clear()
  }
}
