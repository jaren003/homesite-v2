# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — domain language, key concepts, what this app is for
- **`docs/adr/`** — architectural decision records. Read ADRs touching the area you're about to work in.

If these files don't exist yet, proceed silently. Don't flag their absence.

## File structure

Single-context layout (this repo):

```
/
├── CONTEXT.md           ← domain glossary + project overview
├── docs/
│   ├── adr/             ← architectural decisions
│   │   └── 0001-*.md
│   ├── agents/          ← agent configuration (this folder)
│   ├── architecture.md  ← system design
│   ├── prd-calendar.md  ← Calendar PRD
│   └── prd-reminders.md ← Reminders PRD
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in `CONTEXT.md`. Key terms for this repo:

- **EventKit** — the macOS framework used to read Calendar and Reminders data; not "CalDAV" or "iCloud API"
- **EventKit bridge** — the Swift CLI binary at `scripts/eventkit-bridge/eventkit-bridge`; not "the server" or "the proxy"
- **Calendar event** — an `EKEvent` from EventKit; type is `CalendarEvent` in TypeScript
- **Reminder** — an `EKReminder` from EventKit; type is `Reminder` in TypeScript
- **Calendar** — an `EKCalendar` of type `.event`; type is `Calendar` in TypeScript
- **Reminder list** — an `EKCalendar` of type `.reminder`; type is `ReminderList` in TypeScript
- **Lane** — grouping of events/reminders by urgency: `overdue | soon | week | later`
- **Complete** (verb) — marking a reminder done via `EKReminder.isCompleted = true`

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it:

> _Contradicts ADR-0001 (EventKit-only data source) — worth discussing because…_
