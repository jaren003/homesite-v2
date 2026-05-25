# PRD: Reminders Module — Homesite-v2

**Status:** Draft  
**Author:** Juan  
**Last updated:** 2026-05-25

---

## Problem Statement

Reminders are the most-checked feature of a home dashboard but v1 buried them under too many views. We want a clean, always-visible reminders list that surfaces what's due today and overdue — pulled directly from iCloud Reminders via EventKit.

---

## Goals

- Display reminders from iCloud Reminders, grouped by list
- Prominently surface overdue and due-today items
- Mark reminders complete directly from the dashboard
- Load fast, stay in sync with Reminders.app changes

## Non-Goals (v2.0)

- Creating new reminders from the dashboard
- Setting due dates or priorities from the dashboard
- Subtasks / checklists
- Shared reminder lists
- Notifications / alerts

---

## Users

Single user: Juan, running Homesite locally on a Mac Mini.

---

## Functional Requirements

### FR-REM-01: Reminder Fetching
- The system SHALL fetch reminders from macOS EventKit via the local Swift CLI bridge
- Both incomplete and recently-completed reminders SHALL be fetched (completed in last 7 days)
- Cache TTL: 30 seconds (configurable via `REMINDERS_CACHE_TTL_S`)
- The cache SHALL be invalidated and refetched after a completion action

### FR-REM-02: Reminder Lists Sidebar
- The system SHALL list all available iCloud reminder lists with their EventKit colors
- Toggling a list SHALL show/hide its reminders
- "All" toggle SHALL select/deselect all lists
- Selection SHALL persist in `localStorage`

### FR-REM-03: Reminders Display
- Reminders SHALL be grouped by list by default
- Within each group, sort order: overdue → due today → upcoming → no due date
- Each reminder row SHALL show: checkbox, title, due date (relative: "Today", "Tomorrow", "2 days ago"), priority indicator (if set)
- Overdue items SHALL have a red due date label
- Due-today items SHALL have an orange due date label

### FR-REM-04: Complete Action
- Clicking a reminder's checkbox SHALL optimistically mark it complete in the UI
- The system SHALL call the EventKit bridge `complete` command
- On success: the reminder moves to a "Completed" section (or disappears after 2s animation)
- On failure: the checkbox reverts and an error toast appears

### FR-REM-05: Today Panel
- The dashboard home page SHALL show a "Due Today & Overdue" panel
- This panel SHALL aggregate across all lists (respecting sidebar selections)
- Items SHALL be sorted: overdue first (oldest first), then due today

### FR-REM-06: Completed Section
- A collapsible "Completed" section SHALL show reminders completed in the last 7 days
- It SHALL be collapsed by default
- Completed items SHALL show a strikethrough title and completion date

### FR-REM-07: Quick Filter
- A search/filter input SHALL filter the visible reminders by title (case-insensitive, substring)
- Filtering SHALL be instant (client-side, no re-fetch)

---

## Non-Functional Requirements

### NFR-REM-01: Performance
- Reminder list render: < 500ms on cached data
- Complete action response: optimistic update in < 16ms (one frame)

### NFR-REM-02: Reliability
- If the bridge fails on completion, the UI SHALL revert and show an error
- The bridge SHALL time out after 10s

### NFR-REM-03: Accessibility
- Checkboxes SHALL have ARIA labels including the reminder title
- Color SHALL NOT be the only indicator of urgency (text label always shown)

---

## Data Model

```typescript
interface Reminder {
  id: string                    // EventKit EKReminder.calendarItemIdentifier
  title: string
  listId: string
  listName: string
  listColor: string             // hex
  isCompleted: boolean
  completionDate?: string       // ISO 8601
  dueDate?: string              // ISO 8601 (date only if no time set)
  hasDueTime: boolean           // true if a specific time is set
  priority: 0 | 1 | 5 | 9      // 0=none, 1=high, 5=medium, 9=low (EventKit values)
  notes?: string
  url?: string
}

interface ReminderList {
  id: string                    // EventKit EKCalendar.calendarIdentifier (reminders source)
  name: string
  color: string                 // hex
}
```

---

## API Endpoints

### `GET /api/reminder-lists`
Returns all available reminder lists.

**Response:**
```json
{ "lists": [{ "id": "...", "name": "Personal", "color": "#FF9500" }] }
```

### `GET /api/reminders`
Returns reminders.

**Query params:**
- `listIds` (optional): comma-separated list IDs; omit for all lists
- `completed` (optional): `"true"` | `"false"` | `"both"` (default: `"both"`)

**Response:**
```json
{ "reminders": [...], "cachedAt": "...", "fromCache": true }
```

### `POST /api/reminders/[id]/complete`
Marks a reminder as complete.

**Body:** `{}`

**Response:**
```json
{ "success": true }
```

**Error:**
```json
{ "success": false, "error": "Bridge timeout" }
```

---

## UI Wireframe (description)

```
┌──────────────────────────────────────────────────────────┐
│ Reminders                          [🔍 Filter...]        │
├──────────┬───────────────────────────────────────────────┤
│ Lists    │ ⚠️  Overdue (2)                               │
│ ✓ All    │ ☐  Pick up prescription     2 days ago  🔴   │
│ ✓ Personal│☐  Call dentist             Yesterday   🔴   │
│ ✓ Work   │                                               │
│ ✓ Shopping│📅 Due Today (3)                              │
│          │ ☐  Team standup                    Today      │
│          │ ☐  Groceries                       Today      │
│          │ ☐  Review PR                       Today      │
│          │                                               │
│          │ 📋 Personal                                   │
│          │ ☐  Read book                  No due date     │
│          │ ☐  Book flights               Jun 10          │
│          │                                               │
│          │ ▶ Completed (5)                               │
└──────────┴───────────────────────────────────────────────┘
```

---

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-REM-01 | Opening `/reminders` shows all incomplete reminders grouped by list |
| AC-REM-02 | Overdue items appear at the top with a red date label |
| AC-REM-03 | Due-today items appear second with an orange date label |
| AC-REM-04 | Checking a checkbox optimistically completes the reminder and moves it to Completed |
| AC-REM-05 | If completion fails, the checkbox reverts and a toast appears |
| AC-REM-06 | Filter input narrows the list client-side without re-fetching |
| AC-REM-07 | Toggling a list off hides its reminders instantly |
| AC-REM-08 | "Completed" section is collapsed by default and shows items from last 7 days |
| AC-REM-09 | Dashboard home shows a "Due Today & Overdue" panel aggregating all lists |

---

## Open Questions

1. Should completing a reminder also trigger a full re-fetch (to catch changes made in Reminders.app concurrently)? Leaning yes — invalidate cache on complete.
2. Should we support un-completing a reminder? EventKit supports it — include in v2.0.
