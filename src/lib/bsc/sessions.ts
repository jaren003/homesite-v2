// ── BSC session & schedule definitions ───────────────────────────────────────

import { EX } from './exercises'
import type { Session, Preset } from './types'

export const SESSION_A: Session = {
  type: 'A', label: 'Session A — Pull', color: '#f0c040',
  exercises: ['Band pull-apart','Band face pull','KB swing (two-hand)','Hip thrust (bench)','KB single-arm row','Dead bug','Band Pallof press'].map(n => EX[n]),
}

export const SESSION_B: Session = {
  type: 'B', label: 'Session B — Push', color: '#6dbf8f',
  exercises: ['Band pull-apart','Band external rotation','Push-up (standard/incline)','KB overhead press','KB goblet squat','Plank (standard/RKC)','Bird dog'].map(n => EX[n]),
}

export const SESSION_C: Session = {
  type: 'C', label: 'Session C — Conditioning', color: '#c88cf0',
  exercises: ['Band pull-apart','KB Turkish get-up','KB clean (single arm)','KB swing + squat complex','KB suitcase carry','Band seated row',"KB farmer's carry"].map(n => EX[n]),
}

export const SESSION_REST: Session = {
  type: 'REST', label: 'Rest Day', color: 'rgba(180,178,169,0.5)',
  exercises: ['Walk 15–30 min','Couch stretch','Thoracic rotations','Band pull-aparts (rest)'].map(n => EX[n]),
}

/** Mon–Sun schedule for each preset */
export const PRESET_SCHEDULES: Record<Preset, Session[]> = {
  '2day': [SESSION_REST, SESSION_A, SESSION_REST, SESSION_B, SESSION_REST, SESSION_REST, SESSION_REST],
  '3day': [SESSION_A, SESSION_REST, SESSION_B, SESSION_REST, SESSION_C, SESSION_REST, SESSION_REST],
  '4day': [SESSION_A, SESSION_B, SESSION_REST, SESSION_C, SESSION_A, SESSION_REST, SESSION_REST],
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export const GEAR_COLORS: Record<string, { bg: string; color: string }> = {
  KB:    { bg: 'rgba(232,201,106,0.15)', color: '#e8c96a' },
  Band:  { bg: 'rgba(109,191,143,0.15)', color: '#6dbf8f' },
  BW:    { bg: 'rgba(180,178,169,0.12)', color: '#aaa' },
  Bench: { bg: 'rgba(240,153,123,0.15)', color: '#f0997b' },
}

export const PRIORITY_LABELS: Record<string, string> = { h: 'Primary', m: 'Secondary', l: 'Accessory' }

export const PRIORITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  h: { bg: 'rgba(240,192,64,0.12)',  color: '#f0c040', border: 'rgba(240,192,64,0.3)' },
  m: { bg: 'rgba(240,104,40,0.10)',  color: '#f06828', border: 'rgba(240,104,40,0.25)' },
  l: { bg: 'rgba(180,178,169,0.08)', color: '#888',    border: 'rgba(180,178,169,0.2)' },
}

export const SESSION_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  A:    { bg: 'rgba(240,192,64,0.15)',  color: '#f0c040' },
  B:    { bg: 'rgba(109,191,143,0.15)', color: '#6dbf8f' },
  C:    { bg: 'rgba(200,140,240,0.15)', color: '#c88cf0' },
  REST: { bg: 'rgba(180,178,169,0.08)', color: '#888' },
}
