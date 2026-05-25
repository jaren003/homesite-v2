// ── EventKit shared types ─────────────────────────────────────────────────────
// Single source of truth for all Calendar and Reminders data shapes.
// Matches the JSON contract of scripts/eventkit-bridge/main.swift.

// ── Calendar ─────────────────────────────────────────────────────────────────

export type CalendarType = 'local' | 'calDAV' | 'exchange' | 'subscription' | 'birthday'

export interface Calendar {
  /** EKCalendar.calendarIdentifier */
  id: string
  name: string
  /** Hex color string e.g. "#FF3B30" */
  color: string
  type: CalendarType
}

export interface CalendarEvent {
  /** EKEvent.calendarItemIdentifier */
  id: string
  title: string
  /** ISO 8601: "YYYY-MM-DD" for all-day, "YYYY-MM-DDTHH:MM:SSZ" for timed */
  startDate: string
  /** ISO 8601 */
  endDate: string
  isAllDay: boolean
  calendarId: string
  calendarName: string
  /** Hex color inherited from the parent Calendar */
  calendarColor: string
  location?: string
  notes?: string
  url?: string
  isRecurring: boolean
}

// ── Reminders ─────────────────────────────────────────────────────────────────

/** EventKit EKReminder priority values */
export type ReminderPriority = 0 | 1 | 5 | 9  // 0=none 1=high 5=medium 9=low

export interface ReminderList {
  /** EKCalendar.calendarIdentifier (reminders source) */
  id: string
  name: string
  /** Hex color */
  color: string
}

export interface Reminder {
  /** EKReminder.calendarItemIdentifier */
  id: string
  title: string
  listId: string
  listName: string
  listColor: string
  isCompleted: boolean
  completionDate?: string  // ISO 8601
  /**
   * ISO 8601 date string.
   * If hasDueTime is false this is a date-only string "YYYY-MM-DD".
   */
  dueDate?: string
  hasDueTime: boolean
  priority: ReminderPriority
  notes?: string
  url?: string
}

// ── API response envelopes ────────────────────────────────────────────────────

export interface CalendarsResponse {
  calendars: Calendar[]
}

export interface EventsResponse {
  events: CalendarEvent[]
  cachedAt: string   // ISO 8601
  fromCache: boolean
}

export interface ReminderListsResponse {
  lists: ReminderList[]
}

export interface RemindersResponse {
  reminders: Reminder[]
  cachedAt: string
  fromCache: boolean
}

export interface CompleteReminderResponse {
  success: boolean
  error?: string
}

// ── Bridge command result types ───────────────────────────────────────────────

export interface BridgeCalendarsResult {
  calendars: Calendar[]
}

export interface BridgeEventsResult {
  events: CalendarEvent[]
}

export interface BridgeReminderListsResult {
  lists: ReminderList[]
}

export interface BridgeRemindersResult {
  reminders: Reminder[]
}

export interface BridgeCompleteResult {
  success: boolean
  error?: string
}
