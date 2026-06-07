import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FunCornerSettings, Chore, ChoreLogEntry, ChoreCompletions } from './types'
import { DEFAULT_SETTINGS } from './types'

const DATA_DIR = join(process.cwd(), 'data', 'fun-corner')
const SETTINGS_PATH = join(DATA_DIR, 'settings.json')
const CHORES_PATH = join(DATA_DIR, 'chores.json')
const CHORE_LOG_PATH = join(DATA_DIR, 'chore-log.jsonl')
const COMPLETIONS_PATH = join(DATA_DIR, 'completions.json')

function ensureDir(): void {
  mkdirSync(DATA_DIR, { recursive: true })
}

export function readSettings(): FunCornerSettings {
  if (!existsSync(SETTINGS_PATH)) return { ...DEFAULT_SETTINGS }
  return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8')) as FunCornerSettings
}

export function writeSettings(settings: FunCornerSettings): void {
  ensureDir()
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8')
}

export function readChores(): Chore[] {
  if (!existsSync(CHORES_PATH)) return []
  return JSON.parse(readFileSync(CHORES_PATH, 'utf8')) as Chore[]
}

export function writeChores(chores: Chore[]): void {
  ensureDir()
  writeFileSync(CHORES_PATH, JSON.stringify(chores, null, 2), 'utf8')
}

export function appendChoreLog(entry: ChoreLogEntry): void {
  ensureDir()
  appendFileSync(CHORE_LOG_PATH, JSON.stringify(entry) + '\n', 'utf8')
}

// ── Completions (per-day completion state) ─────────────────────────────────

export function readCompletions(): ChoreCompletions {
  if (!existsSync(COMPLETIONS_PATH)) return {}
  return JSON.parse(readFileSync(COMPLETIONS_PATH, 'utf8')) as ChoreCompletions
}

export function writeCompletions(completions: ChoreCompletions): void {
  ensureDir()
  writeFileSync(COMPLETIONS_PATH, JSON.stringify(completions, null, 2), 'utf8')
}

/**
 * Toggle a single chore's completion for a given date.
 * Returns the updated full completions map.
 */
export function setCompletion(
  choreId: string,
  date: string,
  completed: boolean,
): ChoreCompletions {
  const completions = readCompletions()
  const day = completions[date] ?? []
  if (completed) {
    if (!day.includes(choreId)) completions[date] = [...day, choreId]
  } else {
    completions[date] = day.filter(id => id !== choreId)
  }
  writeCompletions(completions)
  return completions
}

/**
 * Returns completions for the 7 days starting at weekStart (YYYY-MM-DD).
 */
export function readWeekCompletions(weekStart: string): ChoreCompletions {
  const all = readCompletions()
  const result: ChoreCompletions = {}
  const start = new Date(weekStart + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    result[key] = all[key] ?? []
  }
  return result
}
