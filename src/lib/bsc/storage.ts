// ── BSC server-side persistence ───────────────────────────────────────────────
// Replaces localStorage. All data lives in data/bsc/ on the Mac Mini.
//
// completions.json  →  { [weekMonday: YYYY-MM-DD]: Record<exerciseKey, boolean> }
//   exerciseKey format: "YYYY-MM-DD::Exercise Name"
//
// notes.json        →  Record<exerciseName, string>

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), 'data', 'bsc')
const COMPLETIONS_PATH = join(DATA_DIR, 'completions.json')
const NOTES_PATH = join(DATA_DIR, 'notes.json')

function ensureDir(): void {
  mkdirSync(DATA_DIR, { recursive: true })
}

// ── Types ─────────────────────────────────────────────────────────────────────

/** Full completions file: outer key = weekMonday (YYYY-MM-DD) */
type CompletionsFile = Record<string, Record<string, boolean>>

/** Public shape returned to callers: just the week's exercise key → checked map */
export type WeekCompletions = Record<string, boolean>

export type Notes = Record<string, string>

// ── Completions ───────────────────────────────────────────────────────────────

/** Read all completions from disk, returning an empty object if the file doesn't exist. */
function readAllCompletions(): CompletionsFile {
  if (!existsSync(COMPLETIONS_PATH)) return {}
  return JSON.parse(readFileSync(COMPLETIONS_PATH, 'utf8')) as CompletionsFile
}

/**
 * Return the exercise completion map for a single week.
 * @param weekMonday - ISO date string (YYYY-MM-DD) of the Monday that starts the week
 */
export function readCompletions(weekMonday: string): WeekCompletions {
  const all = readAllCompletions()
  return all[weekMonday] ?? {}
}

/**
 * Toggle one exercise key within a week.
 * Returns the updated week map (not the entire file).
 */
export function setCompletion(
  weekMonday: string,
  key: string,
  checked: boolean,
): WeekCompletions {
  ensureDir()
  const all = readAllCompletions()
  const week = { ...(all[weekMonday] ?? {}) }

  if (checked) {
    week[key] = true
  } else {
    delete week[key]
  }

  all[weekMonday] = week
  writeFileSync(COMPLETIONS_PATH, JSON.stringify(all, null, 2), 'utf8')
  return week
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Read all exercise notes from disk. */
export function readNotes(): Notes {
  if (!existsSync(NOTES_PATH)) return {}
  return JSON.parse(readFileSync(NOTES_PATH, 'utf8')) as Notes
}

/**
 * Set or delete a note for an exercise.
 * Passing an empty string deletes the key.
 * Returns the updated notes map.
 */
export function setNote(exerciseName: string, note: string): Notes {
  ensureDir()
  const notes = readNotes()

  if (note === '') {
    delete notes[exerciseName]
  } else {
    notes[exerciseName] = note
  }

  writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2), 'utf8')
  return notes
}
