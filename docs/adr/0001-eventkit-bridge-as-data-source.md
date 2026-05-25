# ADR-0001: Use EventKit bridge as the sole data source

**Date:** 2026-05-25  
**Status:** Accepted

## Context

v1 (homebase-v1) sourced calendar data via iCal webcal feed URLs and a CalDAV proxy that stored Apple ID credentials server-side. This required the user to manage app-specific passwords, configure environment variables, and run a separate proxy server. Reminders were read-only.

## Decision

Use a compiled Swift CLI (`scripts/eventkit-bridge/eventkit-bridge`) that reads macOS EventKit directly, as the **sole** data source for both Calendar and Reminders.

The bridge:
- Is spawned by Next.js API routes via `child_process.execFile`
- Outputs structured JSON to stdout
- Requires macOS Calendar and Reminders permissions (granted once via system dialog)
- Supports reading and writing (marking reminders complete)

## Consequences

**Good:**
- No Apple ID credentials stored anywhere
- Works with any calendar or reminder list the Mac has access to (iCloud, Exchange, local)
- Reminder completion is now possible (EventKit write access)
- No separate proxy server process to manage

**Accepted tradeoffs:**
- Only works on macOS (acceptable — this is a Mac Mini dashboard)
- Requires `swiftc` to build (Xcode Command Line Tools)
- Bridge must be rebuilt if the Swift file changes
- API routes are not independently deployable to a cloud host (acceptable — local-only is a feature)

## Alternatives considered

- Continue with CalDAV proxy — rejected (credential management complexity)
- Use Node-based iCloud library — rejected (fragile, unofficial APIs)
- SwiftUI native app — rejected (no web-based UI, harder to iterate)
