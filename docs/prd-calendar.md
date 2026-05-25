# PRD: Calendar Module — Homesite-v2

**Status:** Draft  
**Author:** Juan  
**Last updated:** 2026-05-25

---

## Problem Statement

The existing Homesite-v1 calendar view is overloaded with features that slow it down and add visual noise. We want a clean, fast calendar that shows iCloud events at a glance from the Mac Mini dashboard — nothing more.

---

## Goals

- Display upcoming and past calendar events sourced from iCloud via EventKit
- Support month, week, and day views
- Filter by calendar (show/hide individual iCloud calendars)
- Load fast: events visible within 1 second of page open
- No CRUD — read-only to start (editing stays in Calendar.app)

## Non-Goals (v2.0)

- Creating, editing, or deleting events
- Invitations / RSVP
- Recurring event editing
- Notifications / alerts
- Sync with non-iCloud providers (Google Calendar, Outlook)

---

## Users

Single user: Juan, running Homesite locally on a Mac Mini. No auth, no multi-user.

---

## Functional Requirements

### FR-CAL-01: Event Fetching
- The system SHALL fetch events from macOS EventKit via a local Swift CLI bridge
- Events SHALL be fetched for a rolling window: 3 months back, 12 months forward by default
- Fetching SHALL be non-blocking; a stale cache SHALL be shown while fresh data loads
- Cache TTL: 60 seconds (configurable via env var `CALENDAR_CACHE_TTL_S`)

### FR-CAL-02: Month View (default)
- The system SHALL render a standard month grid (7 columns, Sun–Sat)
- Each day cell SHALL display up to 3 event chips; overflow SHALL show "+N more"
- Clicking a day SHALL expand to show all events for that day in a side panel
- The current day SHALL be visually highlighted
- Navigation: previous/next month arrows + "Today" button

### FR-CAL-03: Week View
- The system SHALL render a 7-day week grid with hourly time slots (00:00–23:59)
- Events SHALL be positioned by start time and sized by duration
- Overlapping events SHALL be laid out in adjacent columns (no overlap)
- All-day events SHALL appear in a dedicated row above the time grid
- Navigation: previous/next week + "Today"

### FR-CAL-04: Day View
- The system SHALL render a single-day hourly timeline
- Current time SHALL be marked with a horizontal line
- Events SHALL show: title, start–end time, calendar color dot, location (if set)
- Navigation: previous/next day + "Today"

### FR-CAL-05: Calendar Sidebar
- The system SHALL list all available iCloud calendars
- Each calendar SHALL show its EventKit color and name
- Toggling a calendar SHALL immediately filter events in the current view
- Selection SHALL persist in `localStorage`

### FR-CAL-06: Event Detail
- Clicking any event SHALL show a popover with: title, date/time, calendar, location, notes, URL
- The popover SHALL be dismissible by clicking outside or pressing Escape

### FR-CAL-07: Keyboard Navigation
- `←` / `→`: previous / next period
- `T`: jump to today
- `M` / `W` / `D`: switch to month / week / day view
- `Escape`: close popover or side panel

---

## Non-Functional Requirements

### NFR-CAL-01: Performance
- Time-to-first-event-render: < 1s on cached data
- EventKit fetch round-trip: < 3s for 90-day window

### NFR-CAL-02: Reliability
- If the EventKit bridge fails, the UI SHALL show a non-blocking error banner and display cached data if available
- The bridge SHALL time out after 10s; the API route SHALL return a 504

### NFR-CAL-03: Accessibility
- All interactive elements SHALL have ARIA labels
- Color SHALL NOT be the only indicator of calendar identity (name label always shown)

---

## Data Model

```typescript
interface CalendarEvent {
  id: string                  // EventKit EKEvent.calendarItemIdentifier
  title: string
  startDate: string           // ISO 8601
  endDate: string             // ISO 8601
  isAllDay: boolean
  calendarId: string
  calendarName: string
  calendarColor: string       // hex color from EventKit
  location?: string
  notes?: string
  url?: string
  isRecurring: boolean
}

interface Calendar {
  id: string                  // EventKit EKCalendar.calendarIdentifier
  name: string
  color: string               // hex
  type: 'local' | 'calDAV' | 'exchange' | 'subscription' | 'birthday'
}
```

---

## API Endpoints

### `GET /api/calendars`
Returns all available calendars.

**Response:**
```json
{ "calendars": [{ "id": "...", "name": "Home", "color": "#FF3B30", "type": "calDAV" }] }
```

### `GET /api/calendar`
Returns events in a date range.

**Query params:**
- `start` (required): ISO 8601 date
- `end` (required): ISO 8601 date
- `calendarIds` (optional): comma-separated calendar IDs

**Response:**
```json
{ "events": [...], "cachedAt": "2026-05-25T10:00:00Z", "fromCache": true }
```

---

## UI Wireframe (description)

```
┌─────────────────────────────────────────────────────────┐
│ [◀ May 2026 ▶]  [Today]          [Month] [Week] [Day]   │
├──────────┬──────────────────────────────────────────────┤
│ Calendars│       Mon  Tue  Wed  Thu  Fri  Sat  Sun       │
│ ✓ Home   │  1    2    3    4    5    6    7              │
│ ✓ Work   │  8    9   10   11   12   13   14             │
│ ✓ Family │  ...event chips...                            │
│          │ 25   26   27   28   29   30   31             │
└──────────┴──────────────────────────────────────────────┘
```

---

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-CAL-01 | Opening `/calendar` shows the current month with all iCloud events rendered correctly |
| AC-CAL-02 | Toggling a calendar off removes its events instantly from the view |
| AC-CAL-03 | Switching month/week/day preserves the selected calendars |
| AC-CAL-04 | Clicking an event shows a popover with all available fields |
| AC-CAL-05 | Keyboard shortcuts T, M, W, D, ←, → work correctly |
| AC-CAL-06 | If the bridge is unavailable, a banner shows and cached data is preserved |
| AC-CAL-07 | Month view shows "+N more" when a day has > 3 events |

---

## Open Questions

1. Should all-day events spanning multiple days render as a horizontal bar in month view? (Leaning yes — matches Calendar.app convention)
2. Should we support drag-to-create in a future read-write phase? Design should not preclude it.
