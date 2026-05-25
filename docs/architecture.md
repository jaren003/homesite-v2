# Homesite-v2 Architecture

## Overview

A focused, local-first home dashboard running on a Mac Mini. Scope is intentionally narrow: **Calendar** and **Reminders** only, sourced from iCloud via macOS EventKit.

## What changed from v1

| Aspect | v1 (homebase-v1) | v2 (homesite-v2) |
|--------|-----------------|-----------------|
| Framework | Vite SPA | Next.js 14 (App Router + API routes) |
| Data source | iCal webcal feeds + CalDAV proxy w/ Apple ID creds | Native EventKit via Swift CLI — no credentials |
| Calendar views | Next Up list + 7-day horizontal strip | **Month grid, week timeline, day view** (full calendar) |
| Reminders | Read-only (schedule + backlog panels) | **Interactive** — mark complete from dashboard |
| Scope | 15+ modules (groceries, floor plan, AI, movies…) | Calendar + Reminders only |
| Design tokens | `hb-card`, `hb-accent`, `hb-textSub` etc. (kept) | Same Tailwind token names carried forward |

### Patterns kept from v1
- Lane grouping: **overdue → soon → week → later** (both modules)
- Card design with colored left stripe + urgency label
- Schedule (dated) / Backlog (undated) split for Reminders
- Relative date labels: Today / Tomorrow / N days ago
- Pulse-dot loading animation
- Refresh button + last-fetched timestamp in header

## Guiding Principles

- **Simple over clever** — no unnecessary abstractions
- **Local-first** — all data stays on-device; no cloud relay
- **Fast** — sub-100ms UI response; EventKit data cached and refreshed in background
- **Testable** — every layer has a clear interface; TDD from the start

---

## System Layers

```
┌─────────────────────────────────────────┐
│           Browser (localhost)           │
│         Next.js React Frontend          │
│   CalendarView  │  RemindersView        │
└────────────────┬────────────────────────┘
                 │ HTTP (fetch)
┌────────────────▼────────────────────────┐
│          Next.js API Routes             │
│  /api/calendar  │  /api/reminders       │
│  /api/calendars │  /api/reminder-lists  │
└────────────────┬────────────────────────┘
                 │ JSON via stdout / file
┌────────────────▼────────────────────────┐
│         EventKit Bridge (Swift)         │
│   scripts/eventkit-bridge/main.swift    │
│   Reads macOS EventKit directly         │
│   Outputs JSON to stdout                │
└────────────────┬────────────────────────┘
                 │ macOS EventKit API
┌────────────────▼────────────────────────┐
│            iCloud / macOS               │
│     Calendar.app  │  Reminders.app      │
└─────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | TypeScript-native, API routes included, fast dev cycle |
| Language | TypeScript (strict) | Type safety throughout, shared types between API and UI |
| Styling | Tailwind CSS | Utility-first, no build complexity |
| Testing | Vitest + React Testing Library | Fast, ESM-native, great DX |
| EventKit bridge | Swift (command-line tool) | Native EventKit access, no permissions workarounds |
| Data refresh | Node `child_process` → Swift binary | Simple, reliable, no daemon required |
| Cache | In-memory + optional JSON file | Survives Next.js hot reloads |

---

## Directory Structure

```
homesite-v2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard home (Calendar + Reminders side by side)
│   ├── calendar/
│   │   └── page.tsx              # Full calendar view
│   └── reminders/
│       └── page.tsx              # Full reminders view
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx      # Month/week grid
│   │   ├── EventCard.tsx         # Single event display
│   │   ├── CalendarSidebar.tsx   # Calendar list selector
│   │   └── DayColumn.tsx         # Day view column
│   └── reminders/
│       ├── RemindersList.tsx     # Grouped reminder list
│       ├── ReminderItem.tsx      # Single reminder row
│       └── ListSidebar.tsx       # Reminder list selector
├── lib/
│   ├── eventkit/
│   │   ├── bridge.ts             # Calls Swift binary, parses JSON
│   │   ├── cache.ts              # In-memory cache with TTL
│   │   └── types.ts              # Shared TypeScript types
│   └── utils/
│       ├── date.ts               # Date formatting helpers
│       └── sort.ts               # Sorting utilities
├── app/api/
│   ├── calendar/
│   │   └── route.ts              # GET /api/calendar?start=&end=
│   ├── calendars/
│   │   └── route.ts              # GET /api/calendars
│   ├── reminders/
│   │   └── route.ts              # GET /api/reminders?listId=&completed=
│   └── reminder-lists/
│       └── route.ts              # GET /api/reminder-lists
├── scripts/
│   └── eventkit-bridge/
│       ├── main.swift            # Swift CLI: reads EventKit, outputs JSON
│       ├── build.sh              # Compiles Swift binary
│       └── README.md
├── __tests__/
│   ├── lib/
│   │   ├── bridge.test.ts
│   │   ├── cache.test.ts
│   │   └── date.test.ts
│   ├── api/
│   │   ├── calendar.test.ts
│   │   └── reminders.test.ts
│   └── components/
│       ├── CalendarGrid.test.tsx
│       ├── EventCard.test.tsx
│       ├── RemindersList.test.tsx
│       └── ReminderItem.test.tsx
├── docs/
│   ├── architecture.md           # This file
│   ├── prd-calendar.md
│   ├── prd-reminders.md
│   └── eventkit-bridge.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
└── next.config.ts
```

---

## Data Flow

### Read path (Calendar events)
1. Browser requests `GET /api/calendar?start=2026-05-01&end=2026-05-31`
2. API route checks in-memory cache (TTL: 60s)
3. On miss: `bridge.ts` spawns `./scripts/eventkit-bridge/eventkit-bridge` with args
4. Swift binary reads EventKit, writes JSON to stdout, exits
5. API route parses JSON → returns typed `CalendarEvent[]`
6. React component renders; Tanstack Query refetches on window focus

### Permissions
The Swift binary must be granted Calendar and Reminders permissions on first run. macOS will prompt automatically. The binary is a pre-compiled local tool — no App Store, no code signing required for local use.

---

## EventKit Bridge Contract

### Input (CLI args)
```
eventkit-bridge events --start <ISO8601> --end <ISO8601> [--calendar-ids <id,...>]
eventkit-bridge calendars
eventkit-bridge reminders [--list-ids <id,...>] [--completed <true|false>]
eventkit-bridge reminder-lists
```

### Output (stdout JSON)

```typescript
// events
{ events: CalendarEvent[] }

// calendars
{ calendars: Calendar[] }

// reminders
{ reminders: Reminder[] }

// reminder-lists
{ lists: ReminderList[] }
```

See `lib/eventkit/types.ts` for full type definitions.
