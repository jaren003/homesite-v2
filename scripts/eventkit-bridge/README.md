# EventKit Bridge

Swift CLI that reads macOS EventKit and outputs JSON to stdout. The only data source for Homesite-v2's Calendar and Reminders modules.

## Build

```bash
cd <repo-root>
chmod +x scripts/eventkit-bridge/build.sh
./scripts/eventkit-bridge/build.sh
```

Requires Xcode Command Line Tools (`xcode-select --install`).

## Usage

```bash
# List all calendars
./scripts/eventkit-bridge/eventkit-bridge calendars

# Fetch events in a date range
./scripts/eventkit-bridge/eventkit-bridge events --start 2026-05-01 --end 2026-05-31

# Fetch events for specific calendars
./scripts/eventkit-bridge/eventkit-bridge events --start 2026-05-01 --end 2026-05-31 --calendar-ids "id1,id2"

# List reminder lists
./scripts/eventkit-bridge/eventkit-bridge reminder-lists

# Fetch all incomplete reminders
./scripts/eventkit-bridge/eventkit-bridge reminders

# Fetch reminders for specific lists
./scripts/eventkit-bridge/eventkit-bridge reminders --list-ids "id1,id2"

# Fetch completed reminders only
./scripts/eventkit-bridge/eventkit-bridge reminders --completed true

# Fetch both completed and incomplete
./scripts/eventkit-bridge/eventkit-bridge reminders --completed both

# Mark a reminder complete
./scripts/eventkit-bridge/eventkit-bridge complete --id "reminder-id"
```

## Permissions

On first run, macOS will show permission dialogs for Calendar and Reminders. Approve both. Permissions are then remembered by macOS.

If permission is denied: System Settings → Privacy & Security → Calendars / Reminders → enable the terminal app.

## Error handling

- Exit 0 + JSON on success
- Exit 1 + `{ "error": "..." }` on stderr on failure
