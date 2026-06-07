// Fun_Corner domain types

export interface FunCornerSettings {
  pinHash: string // SHA-256 hex of the admin PIN
  modules: Record<string, boolean> // moduleId → enabled
}

export const DEFAULT_SETTINGS: FunCornerSettings = {
  pinHash: '',
  modules: {
    chores: true,
  },
}

export interface Chore {
  id: string
  title: string
  emoji?: string
  points?: number
  /** Day indices when this chore is due: 0=Sun 1=Mon … 6=Sat. Empty/undefined = every day. */
  days?: number[]
}

export interface ChoreLogEntry {
  choreId: string
  completedAt: string // ISO timestamp
  note?: string
}

/** Keyed by YYYY-MM-DD → array of completed choreIds that day */
export type ChoreCompletions = Record<string, string[]>
