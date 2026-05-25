#!/usr/bin/env bash
# Compiles the EventKit bridge Swift CLI.
# Run from the repo root: ./scripts/eventkit-bridge/build.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$SCRIPT_DIR/eventkit-bridge"

echo "Building EventKit bridge..."
swiftc "$SCRIPT_DIR/main.swift" \
  -framework EventKit \
  -framework Foundation \
  -o "$OUT"

chmod +x "$OUT"
echo "✓ Built: $OUT"
echo ""
echo "On first run, macOS will prompt for Calendar + Reminders permissions."
echo "Test with: $OUT calendars"
