#!/bin/bash
REPO="jaren003/homesite-v2"

echo "=== Creating labels if missing ==="
for label in "feature" "story" "calendar" "needs-triage"; do
  gh label create "$label" --repo "$REPO" 2>/dev/null && echo "Created: $label" || echo "Already exists: $label"
done

echo ""
echo "=== Creating issues ==="

gh issue create --repo "$REPO" \
  --title "Show all events for a selected day when clicking on a calendar day" \
  --label "feature,story,calendar,needs-triage" \
  --body "## User Story
As a user, I want to see all events for that day when I click on a Day so I can see the whole information about that given date.

## Acceptance Criteria
- Clicking a day on the calendar navigates to or reveals a list of all events for that day
- Events are shown in chronological order
- If there are no events, a clear empty state is displayed
- Each event shows enough info (title, time, type) to distinguish it at a glance

## Notes
Entry point into the day detail experience. Pairs with the day detail summary issue and the navigation issue."

gh issue create --repo "$REPO" \
  --title "Day detail page summarizing all information for a selected date" \
  --label "feature,story,calendar,needs-triage" \
  --body "## User Story
As a user, I want to see a day detail page summarizing everything so I can be informed about a given date.

## Acceptance Criteria
- Day detail page aggregates all relevant content for the date: calendar events, reminders, shared list items due/relevant that day
- Page has a clear heading with the date
- Each section (events, reminders, lists) is clearly labeled and scannable
- Page is useful even when some sections are empty

## Notes
Summary/hub view for a day. Related to the 'click day to see events' story and the navigation story."

gh issue create --repo "$REPO" \
  --title "Navigation between calendar view, day detail, and event detail" \
  --label "feature,story,calendar,needs-triage" \
  --body "## User Story
As a user, I want to be able to navigate between calendar view, day detail, and event detail view easily so I can move through the app without friction.

## Acceptance Criteria
- From calendar → tap a day → goes to day detail
- From day detail → tap an event → goes to event detail
- From event detail → can go back to day detail
- From day detail → can go back to calendar
- Back navigation is consistent and intuitive (breadcrumb, back button, or swipe)
- Active/current view is always clear to the user

## Notes
Core navigation flow for the calendar section. Depends on both the day events list and day detail page stories."

echo ""
echo "=== Done! Verifying ==="
gh issue list --repo "$REPO"
