#!/usr/bin/env bash
# =============================================================================
# create-github-issues.sh
# Creates all Homesite-v2 epics, features, and user stories as GitHub issues.
#
# Prerequisites:
#   brew install gh
#   gh auth login
#   gh repo create jaren003/homesite-v2 --private  (or set REPO below)
#
# Usage:
#   chmod +x scripts/create-github-issues.sh
#   ./scripts/create-github-issues.sh
# =============================================================================

set -euo pipefail

REPO="${GITHUB_REPO:-jaren003/homesite-v2}"

echo "Creating labels..."
gh label create "epic"     --color "#7057ff" --description "Top-level epic" --repo "$REPO" 2>/dev/null || true
gh label create "feature"  --color "#0075ca" --description "Feature story"  --repo "$REPO" 2>/dev/null || true
gh label create "story"    --color "#e4e669" --description "User story"      --repo "$REPO" 2>/dev/null || true
gh label create "calendar" --color "#d93f0b" --description "Calendar module" --repo "$REPO" 2>/dev/null || true
gh label create "reminders" --color "#f9d0c4" --description "Reminders module" --repo "$REPO" 2>/dev/null || true
gh label create "infra"    --color "#bfd4f2" --description "Infrastructure / setup" --repo "$REPO" 2>/dev/null || true
gh label create "tdd"      --color "#c2e0c6" --description "Test-Driven Development" --repo "$REPO" 2>/dev/null || true

echo ""
echo "=== EPIC 1: Infrastructure & EventKit Bridge ==="
EPIC_INFRA=$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Infrastructure & EventKit Bridge" \
  --label "epic,infra" \
  --body "## Overview
Set up the Homesite-v2 project foundation: Next.js + TypeScript scaffold, Vitest TDD setup, and the Swift EventKit bridge that connects the app to iCloud Calendar and Reminders.

## Features
- [ ] Next.js project scaffold with TypeScript + Tailwind
- [ ] Vitest + React Testing Library TDD setup
- [ ] Swift EventKit bridge CLI tool
- [ ] Local development script & README

## Acceptance Criteria
- \`npm run dev\` starts the app on localhost
- \`npm test\` runs all tests
- \`./scripts/eventkit-bridge/eventkit-bridge calendars\` outputs valid JSON
- All layers testable in isolation" \
  --json number --jq '.number')
echo "Created Epic #$EPIC_INFRA: Infrastructure"

echo ""
echo "=== Features for Epic 1 ==="

F1=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Next.js + TypeScript project scaffold" \
  --label "feature,infra" \
  --body "## Parent Epic
Closes part of #$EPIC_INFRA

## Description
Initialize the Homesite-v2 Next.js app with strict TypeScript, Tailwind CSS, and the project directory structure as defined in \`docs/architecture.md\`.

## User Stories
- As a developer, I can run \`npm run dev\` and see a working home page
- As a developer, I have a typed project structure ready for features

## Technical Tasks
- [ ] \`npx create-next-app@latest\` with TypeScript + Tailwind + App Router
- [ ] Configure strict TypeScript (\`tsconfig.json\`)
- [ ] Set up path aliases (\`@/components\`, \`@/lib\`)
- [ ] Create directory skeleton: \`components/calendar/\`, \`components/reminders/\`, \`lib/eventkit/\`
- [ ] Add \`.env.local.example\` with \`CALENDAR_CACHE_TTL_S\`, \`REMINDERS_CACHE_TTL_S\`

## Acceptance Criteria
- \`npm run build\` passes with zero type errors
- \`npm run lint\` passes
- Directory structure matches \`docs/architecture.md\`" \
  --json number --jq '.number')
echo "Created Feature #$F1"

F2=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Vitest + React Testing Library TDD setup" \
  --label "feature,infra,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_INFRA

## Description
Configure Vitest as the test runner with React Testing Library for component tests. Establish the red-green-refactor workflow from day one.

## User Stories
- As a developer, I can run \`npm test\` and see a passing baseline test
- As a developer, \`npm test -- --watch\` reruns tests on file save

## Technical Tasks
- [ ] Install vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/user-event, jsdom
- [ ] Configure \`vitest.config.ts\` with jsdom environment + path aliases
- [ ] Add \`setupTests.ts\` with RTL matchers
- [ ] Write a trivial baseline test that asserts \`1 + 1 === 2\`
- [ ] Add \`npm test\`, \`npm run test:coverage\` scripts

## Acceptance Criteria
- \`npm test\` runs and exits 0
- Coverage report generated in \`coverage/\`" \
  --json number --jq '.number')
echo "Created Feature #$F2"

F3=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Swift EventKit bridge CLI" \
  --label "feature,infra" \
  --body "## Parent Epic
Closes part of #$EPIC_INFRA

## Description
Build the Swift command-line tool that reads macOS EventKit and outputs JSON to stdout. This is the sole data source for both Calendar and Reminders modules.

## User Stories
- As the app, I can call the bridge binary with args and receive structured JSON
- As a developer, I can run the bridge manually to verify EventKit data

## Technical Tasks
- [ ] Create \`scripts/eventkit-bridge/main.swift\`
- [ ] Implement \`calendars\` subcommand → outputs \`{ calendars: [...] }\`
- [ ] Implement \`events --start --end [--calendar-ids]\` subcommand
- [ ] Implement \`reminder-lists\` subcommand
- [ ] Implement \`reminders [--list-ids] [--completed]\` subcommand
- [ ] Implement \`complete --id <reminder-id>\` subcommand
- [ ] Create \`build.sh\` that compiles to \`scripts/eventkit-bridge/eventkit-bridge\`
- [ ] Handle EventKit permission request gracefully (prompt on first run)
- [ ] Write \`docs/eventkit-bridge.md\` with usage examples

## Acceptance Criteria
- \`./scripts/eventkit-bridge/eventkit-bridge calendars\` returns valid JSON array
- \`./scripts/eventkit-bridge/eventkit-bridge events --start 2026-05-01 --end 2026-05-31\` returns events
- \`./scripts/eventkit-bridge/eventkit-bridge reminders\` returns all incomplete reminders
- All subcommands exit 0 on success, 1 on error with error JSON" \
  --json number --jq '.number')
echo "Created Feature #$F3"

F4=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] EventKit bridge TypeScript client + cache layer" \
  --label "feature,infra,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_INFRA

## Description
TypeScript wrapper (\`lib/eventkit/bridge.ts\`) that spawns the Swift binary and parses its output. Includes an in-memory cache with configurable TTL.

## User Stories
- As an API route, I can call \`getEvents(start, end)\` and receive typed \`CalendarEvent[]\`
- As an API route, I receive cached data instantly if within TTL

## Technical Tasks
- [ ] Define types in \`lib/eventkit/types.ts\` (CalendarEvent, Calendar, Reminder, ReminderList)
- [ ] Implement \`bridge.ts\`: spawns binary, captures stdout, JSON.parses, throws on non-zero exit
- [ ] Implement \`cache.ts\`: Map-based TTL cache keyed by request args
- [ ] Write unit tests for \`bridge.ts\` (mock child_process)
- [ ] Write unit tests for \`cache.ts\` (TTL expiry, cache hit/miss)

## Acceptance Criteria
- All tests pass
- \`getEvents\` returns correct types validated by TypeScript
- Cache hit serves data without spawning a process
- Cache miss spawns the binary and populates the cache" \
  --json number --jq '.number')
echo "Created Feature #$F4"

echo ""
echo "=== EPIC 2: Calendar Module ==="
EPIC_CAL=$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Calendar Module" \
  --label "epic,calendar" \
  --body "## Overview
Full-featured read-only calendar view sourcing events from iCloud via EventKit. Supports month, week, and day views with calendar filtering.

See: \`docs/prd-calendar.md\`

## Features
- [ ] Calendar API routes (/api/calendar, /api/calendars)
- [ ] Month view
- [ ] Week view
- [ ] Day view
- [ ] Calendar sidebar (filter by calendar)
- [ ] Event detail popover
- [ ] Keyboard navigation

## Acceptance Criteria
Per \`docs/prd-calendar.md\` AC-CAL-01 through AC-CAL-07" \
  --json number --jq '.number')
echo "Created Epic #$EPIC_CAL: Calendar"

echo ""
echo "=== Features for Epic 2 ==="

F5=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Calendar API routes" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
Next.js API routes for calendar data: \`GET /api/calendars\` and \`GET /api/calendar\`.

## User Stories
- As the frontend, I can fetch all available calendars with their colors
- As the frontend, I can fetch events for a date range, optionally filtered by calendar IDs

## Technical Tasks
- [ ] TDD: write tests for \`/api/calendars\` (mock bridge)
- [ ] Implement \`app/api/calendars/route.ts\`
- [ ] TDD: write tests for \`/api/calendar\` (date range, calendarIds filter, cache behavior)
- [ ] Implement \`app/api/calendar/route.ts\`
- [ ] Handle bridge timeout (504) and bridge error (502)
- [ ] Validate query params with Zod

## Acceptance Criteria
- AC-CAL-01: events returned for correct date range
- AC-CAL-06: 504 returned on bridge timeout; error JSON body included
- All route tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F5"

F6=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Calendar month view" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
Standard month grid calendar view — the default view when opening \`/calendar\`.

## User Stories
- As Juan, I can see all my events laid out in a month grid
- As Juan, I can navigate to previous/next months
- As Juan, days with more than 3 events show a '+N more' indicator

## Technical Tasks
- [ ] TDD: write tests for \`CalendarGrid\` (renders correct days, event chips, overflow)
- [ ] Implement \`components/calendar/CalendarGrid.tsx\`
- [ ] TDD: write tests for \`EventCard\` (title, color, all-day indicator)
- [ ] Implement \`components/calendar/EventCard.tsx\`
- [ ] Highlight today's date cell
- [ ] Previous/next month navigation + 'Today' button
- [ ] '+N more' overflow with click-to-expand side panel
- [ ] Multi-day events render as horizontal bars

## Acceptance Criteria
- AC-CAL-01, AC-CAL-07 pass
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F6"

F7=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Calendar week view" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
7-day week view with hourly time slots and collision-aware event layout.

## User Stories
- As Juan, I can see my week at a glance with events positioned by time
- As Juan, overlapping events appear side by side (not on top of each other)
- As Juan, all-day events appear in a dedicated row at the top

## Technical Tasks
- [ ] TDD: write tests for \`DayColumn\` (event positioning, overlap layout)
- [ ] Implement \`components/calendar/DayColumn.tsx\`
- [ ] Build week grid layout with 7 DayColumn instances
- [ ] Compute event overlap columns (interval graph coloring)
- [ ] All-day events row
- [ ] Current time indicator line
- [ ] Previous/next week navigation

## Acceptance Criteria
- Overlapping events displayed side-by-side without overlap
- All-day events in dedicated row
- Component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F7"

F8=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Calendar day view" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
Single-day timeline view with hourly slots.

## User Stories
- As Juan, I can view a single day's events in a detailed timeline

## Technical Tasks
- [ ] Implement day view page using \`DayColumn\` component (single instance)
- [ ] Current time indicator
- [ ] Previous/next day navigation

## Acceptance Criteria
- Day view renders events correctly on the hourly timeline
- Component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F8"

F9=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Calendar sidebar + filtering" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
Sidebar listing all iCloud calendars with toggle controls to show/hide events per calendar.

## User Stories
- As Juan, I can hide specific calendars (e.g., Birthdays) to reduce noise
- As Juan, my calendar selections persist when I refresh the page

## Technical Tasks
- [ ] TDD: write tests for \`CalendarSidebar\` (render, toggle, persistence)
- [ ] Implement \`components/calendar/CalendarSidebar.tsx\`
- [ ] Persist selection in localStorage
- [ ] Pass selected calendar IDs as filter to \`/api/calendar\`

## Acceptance Criteria
- AC-CAL-02, AC-CAL-03 pass
- Selection persists across page reload
- Component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F9"

F10=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Event detail popover + keyboard nav" \
  --label "feature,calendar,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_CAL

## Description
Clicking an event shows a detail popover. Keyboard shortcuts navigate and dismiss.

## User Stories
- As Juan, I can click any event to see full details (location, notes, URL)
- As Juan, I can use keyboard shortcuts to navigate without touching the mouse

## Technical Tasks
- [ ] TDD: write tests for event detail popover (renders fields, dismisses)
- [ ] Implement event detail popover component
- [ ] Keyboard handler: T (today), M/W/D (view switch), ←/→ (navigate), Escape (close)
- [ ] ARIA labels on all interactive elements

## Acceptance Criteria
- AC-CAL-04, AC-CAL-05 pass
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F10"

echo ""
echo "=== EPIC 3: Reminders Module ==="
EPIC_REM=$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Reminders Module" \
  --label "epic,reminders" \
  --body "## Overview
Read-write reminders view sourcing from iCloud via EventKit. Surfaces overdue and due-today items prominently. Supports marking reminders complete from the dashboard.

See: \`docs/prd-reminders.md\`

## Features
- [ ] Reminders API routes
- [ ] Reminders list view with grouping
- [ ] Overdue / due-today panels
- [ ] Complete reminder action
- [ ] List sidebar + filtering
- [ ] Quick filter input
- [ ] Completed section

## Acceptance Criteria
Per \`docs/prd-reminders.md\` AC-REM-01 through AC-REM-09" \
  --json number --jq '.number')
echo "Created Epic #$EPIC_REM: Reminders"

echo ""
echo "=== Features for Epic 3 ==="

F11=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Reminders API routes" \
  --label "feature,reminders,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_REM

## Description
API routes: \`GET /api/reminder-lists\`, \`GET /api/reminders\`, \`POST /api/reminders/[id]/complete\`.

## Technical Tasks
- [ ] TDD: tests for \`/api/reminder-lists\`
- [ ] Implement \`app/api/reminder-lists/route.ts\`
- [ ] TDD: tests for \`/api/reminders\` (list filter, completed filter, cache)
- [ ] Implement \`app/api/reminders/route.ts\`
- [ ] TDD: tests for \`POST /api/reminders/[id]/complete\` (success, bridge failure, timeout)
- [ ] Implement \`app/api/reminders/[id]/complete/route.ts\`
- [ ] Invalidate reminders cache on successful complete

## Acceptance Criteria
- All route tests pass
- Complete endpoint returns \`{ success: true }\` on success
- Complete endpoint returns \`{ success: false, error: '...' }\` on bridge failure" \
  --json number --jq '.number')
echo "Created Feature #$F11"

F12=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Reminders list view with grouping + sorting" \
  --label "feature,reminders,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_REM

## Description
Main reminders page: items grouped by list, sorted overdue → due today → upcoming → no due date.

## User Stories
- As Juan, I can see all my reminders organized by list
- As Juan, overdue items are immediately visible at the top in red

## Technical Tasks
- [ ] TDD: tests for \`RemindersList\` (grouping, sort order, overdue styling)
- [ ] Implement \`components/reminders/RemindersList.tsx\`
- [ ] TDD: tests for \`ReminderItem\` (checkbox, title, due date display, priority)
- [ ] Implement \`components/reminders/ReminderItem.tsx\`
- [ ] Relative date labels: 'Today', 'Tomorrow', 'Yesterday', 'N days ago', 'Jun 10'
- [ ] Red label for overdue, orange for due today

## Acceptance Criteria
- AC-REM-01, AC-REM-02, AC-REM-03 pass
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F12"

F13=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Complete reminder action (optimistic UI)" \
  --label "feature,reminders,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_REM

## Description
Clicking a checkbox optimistically marks the reminder complete in the UI, calls the API, and reverts on failure.

## User Stories
- As Juan, checking a reminder off feels instant — no loading spinner
- As Juan, if the completion fails I see an error and the checkbox reverts

## Technical Tasks
- [ ] TDD: tests for optimistic complete (mock fetch, success path, failure path)
- [ ] Wire checkbox click → optimistic state update → POST /api/reminders/[id]/complete
- [ ] On success: move item to Completed section with fade animation
- [ ] On failure: revert checkbox state + show error toast
- [ ] Invalidate and refetch reminders list after success

## Acceptance Criteria
- AC-REM-04, AC-REM-05 pass
- Checkbox update visible in < 16ms (one frame)
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F13"

F14=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Reminders sidebar + quick filter" \
  --label "feature,reminders,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_REM

## Description
Sidebar with list toggles (with 'All' shortcut) and a search input for client-side filtering.

## User Stories
- As Juan, I can hide noisy lists (e.g., Shopping) when I just want to see Work reminders
- As Juan, I can type to filter reminders by name without waiting for a network request

## Technical Tasks
- [ ] TDD: tests for \`ListSidebar\` (render, toggle, 'All' behavior, persistence)
- [ ] Implement \`components/reminders/ListSidebar.tsx\`
- [ ] Persist selection in localStorage
- [ ] Filter input: controlled input → filter applied client-side
- [ ] Debounce filter input (150ms) for performance

## Acceptance Criteria
- AC-REM-06, AC-REM-07 pass
- Selection persists across page reload
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F14"

F15=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Completed section + Dashboard Today panel" \
  --label "feature,reminders,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_REM

## Description
Collapsible 'Completed (last 7 days)' section, plus the dashboard home 'Due Today & Overdue' panel.

## User Stories
- As Juan, I can review what I've already completed this week
- As Juan, the home dashboard shows me what needs attention today

## Technical Tasks
- [ ] TDD: tests for Completed section (collapsed by default, shows last 7 days)
- [ ] Implement collapsible Completed section in \`RemindersList\`
- [ ] TDD: tests for DueTodayPanel (aggregates across lists, sorts correctly)
- [ ] Implement \`components/reminders/DueTodayPanel.tsx\`
- [ ] Render DueTodayPanel on \`app/page.tsx\` (dashboard home)

## Acceptance Criteria
- AC-REM-08, AC-REM-09 pass
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F15"

echo ""
echo "=== EPIC 4: Dashboard Home ==="
EPIC_DASH=$(gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Dashboard Home Page" \
  --label "epic" \
  --body "## Overview
The \`/\` home page: a combined at-a-glance view showing today's calendar events alongside due-today and overdue reminders.

## Features
- [ ] Today's agenda (events for today)
- [ ] Due Today & Overdue reminders panel
- [ ] Navigation to full Calendar and Reminders views

## Acceptance Criteria
- Home page loads in < 1s on cached data
- Shows today's events and urgent reminders without navigating away" \
  --json number --jq '.number')
echo "Created Epic #$EPIC_DASH: Dashboard"

F16=$(gh issue create \
  --repo "$REPO" \
  --title "[FEATURE] Dashboard home: Today's agenda + urgent reminders" \
  --label "feature,tdd" \
  --body "## Parent Epic
Closes part of #$EPIC_DASH

## Description
The home page combines today's calendar events (day view lite) with the Due Today & Overdue reminders panel side by side.

## Technical Tasks
- [ ] TDD: tests for home page layout (renders both panels, passes correct data)
- [ ] Implement \`app/page.tsx\`: two-column layout
- [ ] Left column: today's events in time order (reuse EventCard)
- [ ] Right column: DueTodayPanel (reuse from Reminders module)
- [ ] 'View full calendar' and 'View all reminders' nav links

## Acceptance Criteria
- Home page shows today's events and urgent reminders
- All component tests pass" \
  --json number --jq '.number')
echo "Created Feature #$F16"

echo ""
echo "============================================"
echo "✅ Done! Created:"
echo "   4 Epics: #$EPIC_INFRA, #$EPIC_CAL, #$EPIC_REM, #$EPIC_DASH"
echo "   12 Features: #$F1 through #$F16"
echo ""
echo "Next: run TDD bootstrap (issue #$F2)"
echo "============================================"
