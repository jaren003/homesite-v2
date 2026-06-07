// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isModuleEnabled, getActiveModules } from '@/lib/fun-corner/modules'
import type { FunCornerSettings } from '@/lib/fun-corner/types'

const base: FunCornerSettings = {
  pinHash: 'irrelevant',
  modules: { chores: true, reading: false, rewards: true },
}

describe('isModuleEnabled', () => {
  it('returns true for an enabled module', () => {
    expect(isModuleEnabled(base, 'chores')).toBe(true)
  })

  it('returns false for a disabled module', () => {
    expect(isModuleEnabled(base, 'reading')).toBe(false)
  })

  it('returns false for a module that is not registered at all', () => {
    expect(isModuleEnabled(base, 'homework')).toBe(false)
  })
})

describe('getActiveModules', () => {
  it('returns only the enabled module IDs', () => {
    const active = getActiveModules(base)
    expect(active).toContain('chores')
    expect(active).toContain('rewards')
    expect(active).not.toContain('reading')
  })

  it('returns empty array when no modules are enabled', () => {
    const allOff: FunCornerSettings = {
      pinHash: '',
      modules: { chores: false, reading: false },
    }
    expect(getActiveModules(allOff)).toEqual([])
  })

  it('returns empty array when modules record is empty', () => {
    const empty: FunCornerSettings = { pinHash: '', modules: {} }
    expect(getActiveModules(empty)).toEqual([])
  })
})
