// ── BSC (Backyard Strength & Conditioning) domain types ──────────────────────

export interface Alternative {
  name: string
  prescription: string
  whenToUse: string
}

export interface Exercise {
  name: string
  prescription: string
  gear: string[]
  priority: 'h' | 'm' | 'l'
  primaryMuscle: string
  secondaryMuscle: string
  muscleView: 'front' | 'back' | 'both'
  muscleReg: Record<string, string>
  alternatives: Alternative[]
}

export type SessionType = 'A' | 'B' | 'C' | 'REST'

export interface Session {
  type: SessionType
  label: string
  color: string
  exercises: Exercise[]
}

export type Preset = '2day' | '3day' | '4day'
