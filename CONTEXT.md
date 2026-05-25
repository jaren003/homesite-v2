# Homesite-v2 — Domain Context

## What this project is

A **local-first home dashboard** running on a Mac Mini. It displays iCloud **Calendar events** and **Reminders** from the Mac's native EventKit framework. There is no cloud relay, no external API key, no authentication UI — all data stays on-device.

Scope is intentionally narrow: **Calendar + Reminders only**. Previous functionality (groceries, floor plan, AI chat, movies, etc.) lives in homebase-v1 and is not part of this project.

## Core concepts and glossary

| Term | Definition | Don't say |
|------|-----------|-----------|
| **EventKit** | The macOS framework (`import EventKit`) used to read Calendar and Reminders data | "iCloud API", "CalDAV", "the server" |
| **EventKit bridge** | The compiled Swift CLI at `scripts/eventkit-bridge/eventkit-bridge` that reads EventKit and outputs JSON to stdout | "the proxy", "the backend", "the daemon" |
| **Calendar** | An `EKCalendar` with type `.event`; TypeScript type `Calendar` | "feed", "subscription" |
| **Calendar event** | An `EKEvent`; TypeScript type `CalendarEvent` | "appointment", "gcal event" |
| **Reminder** | An `EKReminder`; TypeScript type `Reminder` | "task", "todo", "checklist item" |
| **Reminder list** | An `EKCalendar` with type `.reminder`; TypeScript type `ReminderList` | "project", "inbox" |
| **Complete** | `EKReminder.isCompleted = true` — the act of checking off a reminder | "finish", "check", "tick off" |
| **Lane** | A UI grouping of events or reminders by urgency: `overdue`, `soon`, `week`, `later` | "bucket", "column", "section" |
| **Cache** | The in-memory `TTLCache` in `lib/eventkit/cache.ts` — avoids re-spawning the bridge on every request | "store", "state" |
| **TTL** | Time-to-live for a cache entry; configured via `CALENDAR_CACHE_TTL_S` and `REMINDERS_CACHE_TTL_S` env vars | — |
| **Bridge error** | A `BridgeError` thrown when the Swift binary exits non-zero, times out, or returns invalid JSON | — |

## Architecture in one paragraph

The **Next.js** app (App Router) serves both the React frontend and the API routes. When a route needs data, it checks the **Cache**. On a miss, it spawns the **EventKit bridge** via `child_process.execFile`, parses the JSON stdout, stores the result in cache, and returns it. The bridge reads macOS EventKit directly — no network, no credentials. Permissions are granted once via macOS system dialogs.

## What we keep from v1

- **Lane grouping** (overdue → soon → week → later) for both Calendar and Reminders
- **Card design** with colored left stripe and relative urgency label
- **Relative date labels**: Today / Tomorrow / Yesterday / N days ago
- **Schedule vs Backlog split** for Reminders (dated items vs undated items)

## What we dropped from v1

- CalDAV proxy with Apple ID credentials (replaced by EventKit bridge — no credentials needed)
- iCal webcal feed management UI
- All non-Calendar/Reminders modules
- Read-only reminders (v2 supports marking complete)
