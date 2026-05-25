// ── EventKit Client ───────────────────────────────────────────────────────────
// Typed wrappers over execBridge + TTLCache.
// API routes import from here — never call execBridge directly.

import { execBridge } from './bridge'
import { TTLCache } from './cache'
import type {
  Calendar,
  CalendarEvent,
  ReminderList,
  Reminder,
  BridgeCalendarsResult,
  BridgeEventsResult,
  BridgeReminderListsResult,
  BridgeRemindersResult,
  BridgeCompleteResult,
} from './types'

// ── Cache instances ───────────────────────────────────────────────────────────

const CALENDAR_TTL = Number(process.env.CALENDAR_CACHE_TTL_S ?? 60) * 1000
const REMINDERS_TTL = Number(process.env.REMINDERS_CACHE_TTL_S ?? 30) * 1000

const calendarCache = new TTLCache<Calendar[]>(CALENDAR_TTL)
const eventsCache = new TTLCache<CalendarEvent[]>(CALENDAR_TTL)
const listsCache = new TTLCache<ReminderList[]>(REMINDERS_TTL)
const remindersCache = new TTLCache<Reminder[]>(REMINDERS_TTL)

/** Exported for testing — clears all calendar-related cache entries. */
export function clearCalendarCache(): void {
  calendarCache.invalidateAll()
  eventsCache.invalidateAll()
}

/** Exported for testing — clears all reminders-related cache entries. */
export function clearRemindersCache(): void {
  listsCache.invalidateAll()
  remindersCache.invalidateAll()
}

// ── Calendar ─────────────────────────────────────────────────────────────────

export async function getCalendars(): Promise<Calendar[]> {
  const cached = calendarCache.get('all')
  if (cached) return cached

  const result = await execBridge<BridgeCalendarsResult>(['calendars'], {})
  calendarCache.set('all', result.calendars)
  return result.calendars
}

export async function getEvents(
  start: string,
  end: string,
  calendarIds?: string[],
): Promise<CalendarEvent[]> {
  const cacheKey = [start, end, ...(calendarIds ?? [])].join('|')
  const cached = eventsCache.get(cacheKey)
  if (cached) return cached

  const args = ['events', '--start', start, '--end', end]
  if (calendarIds && calendarIds.length > 0) {
    args.push('--calendar-ids', calendarIds.join(','))
  }

  const result = await execBridge<BridgeEventsResult>(args, {})
  eventsCache.set(cacheKey, result.events)
  return result.events
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export async function getReminderLists(): Promise<ReminderList[]> {
  const cached = listsCache.get('all')
  if (cached) return cached

  const result = await execBridge<BridgeReminderListsResult>(['reminder-lists'], {})
  listsCache.set('all', result.lists)
  return result.lists
}

export interface GetRemindersOptions {
  listIds?: string[]
  completed?: 'true' | 'false' | 'both'
}

export async function getReminders(options: GetRemindersOptions = {}): Promise<Reminder[]> {
  const { listIds, completed = 'false' } = options
  const cacheKey = [completed, ...(listIds ?? [])].join('|')
  const cached = remindersCache.get(cacheKey)
  if (cached) return cached

  const args = ['reminders', '--completed', completed]
  if (listIds && listIds.length > 0) {
    args.push('--list-ids', listIds.join(','))
  }

  const result = await execBridge<BridgeRemindersResult>(args, {})
  remindersCache.set(cacheKey, result.reminders)
  return result.reminders
}

/**
 * Marks a reminder complete. Invalidates the reminders cache on success.
 * @returns true on success, false if the bridge reports failure.
 * @throws BridgeError on bridge crash or timeout.
 */
export async function completeReminder(id: string): Promise<boolean> {
  const result = await execBridge<BridgeCompleteResult>(['complete', '--id', id], {})
  if (result.success) {
    clearRemindersCache()
  }
  return result.success
}
