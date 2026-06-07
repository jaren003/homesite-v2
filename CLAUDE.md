@AGENTS.md

## Server

The dev server runs via **PM2** and survives terminal closure / reboots automatically.

- **Check status:** `pm2 status`
- **Restart:** `pm2 restart homesite`
- **Live logs:** `pm2 logs homesite`
- **Stop:** `pm2 stop homesite`
- **Config:** `ecosystem.config.cjs` at repo root (runs `next dev` on port 3000)

Do **not** tell the user to run `npm run dev` — PM2 manages the process. If the site is down, tell the user to run `pm2 restart homesite` or check `pm2 logs homesite` for errors.

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues at **jaren003/homesite-v2**; use `gh issue create/view/list/edit`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Additional: `epic`, `feature`, `story`, `calendar`, `reminders`, `infra`, `tdd`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. Key terms: EventKit bridge, Calendar event, Reminder, lane. See `docs/agents/domain.md`.

---

## Pipeline skill overrides

**IMPORTANT — these instructions OVERRIDE the default pipeline skill behavior. Follow them exactly.**

Pipeline ideas use **stage folders** inside `~/pipeline/`. Each idea is a single flat file (`{YYYY-MM-DD}-{slug}.md`) that lives in the current stage folder and moves between folders as it progresses. Each skill moves the file and updates the `**Stage:**` header line.

Stage folders:
- `~/pipeline/00-briefs/` — created at `/brief`
- `~/pipeline/01-ideas/` — moved here at `/refine`
- `~/pipeline/02-ready/` — moved here at `/spec`
- `~/pipeline/03-active/` — moved here at `/to-issue`
- `~/pipeline/04-test/` — moved here at `/test-handoff`
- `~/pipeline/05-done/` — moved here when shipped

### File format

```markdown
# {Title}

**Slug:** {slug}
**Created:** {YYYY-MM-DD}
**Stage:** brief | idea | ready | active | test | done
**GitHub:** {issue URL — added when stage moves to active}

---

## Brief
{brief content}

---

## Idea
{idea content — appended by /refine}

---

## Spec
{spec content — appended by /spec}

---

## Dev Notes
{dev notes — appended by /dev-handoff}

---

## Test Report
{test report — appended by /test-handoff}
```

### /brief

1. Derive a 2–4 word kebab-case slug from the idea. Show it and confirm.
2. File path: `~/pipeline/00-briefs/{YYYY-MM-DD}-{slug}.md`. Create the folder if missing (`mkdir -p ~/pipeline/00-briefs/`).
3. Write the file with the header block and a `## Brief` section (Problem/Opportunity, Who it's for, Success looks like, Known constraints, Raw notes). Mark unknowns `TBD`.
4. Append to `~/pipeline/_log.md`: `[{timestamp}] BRIEF CREATED: {date}-{slug} → 00-briefs`
5. Confirm the file path. Suggest `/refine` when ready.

### /refine

1. Find the file: `ls ~/pipeline/00-briefs/ | grep "{slug}"` — file name is `{date}-{slug}.md`.
2. Read it.
3. Have a conversation to gather: Refined Problem Statement, Proposed Solution, Scope In/Out, Dependencies, Open Questions, Effort (S/M/L/XL), Priority (Impact × Urgency).
4. Update `**Stage:** brief` → `**Stage:** idea`, append a `## Idea` section, then move the file: `mv ~/pipeline/00-briefs/{date}-{slug}.md ~/pipeline/01-ideas/` (create folder if needed).
5. Append to `_log.md`: `[{timestamp}] STAGE: {date}-{slug} → 01-ideas`
6. Confirm and suggest `/spec`.

### /spec

1. Find the file: `ls ~/pipeline/01-ideas/ | grep "{slug}"`.
2. Read it.
3. Draft the spec (Summary, Acceptance Criteria, Technical Notes, Files Likely Affected, Test Cases, GitHub Labels) — present to user for review.
4. Update `**Stage:** idea` → `**Stage:** ready`, append a `## Spec` section, then move the file: `mv ~/pipeline/01-ideas/{date}-{slug}.md ~/pipeline/02-ready/` (create folder if needed).
5. Append to `_log.md`: `[{timestamp}] STAGE: {date}-{slug} → 02-ready`
6. Confirm and suggest `/to-issue`.

### /to-issue

1. Find the file: `ls ~/pipeline/02-ready/ | grep "{slug}"`. Read it. Extract Summary, Acceptance Criteria, Technical Notes, Labels from the `## Spec` section.
2. Ask which GitHub repo if not already known.
3. Create the GitHub issue (use `issue_write` MCP tool or `gh issue create`). Issue body = Summary + Acceptance Criteria + Technical Notes + files affected + test cases + `*Generated from pipeline: {date}-{slug}*`.
4. Update `**Stage:** ready` → `**Stage:** active`, add `**GitHub:** {issue URL}` to the header block, append a `## GitHub` section, then move the file: `mv ~/pipeline/02-ready/{date}-{slug}.md ~/pipeline/03-active/` (create folder if needed).
5. Append to `_log.md`: `[{timestamp}] GITHUB ISSUE CREATED: {date}-{slug} → 03-active | {issue URL}`
6. Show the issue URL. Suggest `/dev-handoff {slug}`.

### /dev-handoff

1. Find the file: `ls ~/pipeline/03-active/ | grep "{slug}"`. Read it. Get the GitHub URL from `**GitHub:**` in the header.
2. Append a `## Dev Notes` section to the file:
   ```markdown
   ## Dev Notes

   **Started:** {YYYY-MM-DD}

   ### Progress Log

   _(Developer writes here as work progresses)_

   ### Blockers

   ### Decisions Made
   ```
3. Output the dev context preamble (what to build, acceptance criteria, files affected, technical notes).
4. Append to `_log.md`: `[{timestamp}] DEV HANDOFF: {date}-{slug}`
5. Remind to run `/test-handoff` when done.

### /test-handoff

1. Find the file: `ls ~/pipeline/03-active/ | grep "{slug}"`. Read it.
2. Run available tests/linters. Check each acceptance criterion (✅ / ❌ / ⚠️).
3. Update `**Stage:** active` → `**Stage:** test`, append a `## Test Report` section (criteria table, test output, issues found, recommendation: Ship / Fix / Revisit), then move the file: `mv ~/pipeline/03-active/{date}-{slug}.md ~/pipeline/04-test/` (create folder if needed).
4. Post a summary comment to the GitHub issue.
5. Append to `_log.md`: `[{timestamp}] TEST REPORT: {date}-{slug} → 04-test | {recommendation}`
6. If recommendation is Ship: update `**Stage:** test` → `**Stage:** done`, move file to `~/pipeline/05-done/`, and close the GitHub issue.

### /pipeline-status

1. List all `*.md` files across all stage folders:
   ```bash
   find ~/pipeline/0* -name "*.md" 2>/dev/null
   ```
2. For each file, read the header lines to extract: Slug, Created date, Stage, GitHub URL.
3. Output a status table:

   ```
   ## Pipeline Status — {current date}

   | Stage  | Slug | Created | Days in Stage | GitHub |
   |--------|------|---------|---------------|--------|
   | brief  | ... | ...     | ...           | —      |
   | active | ... | ...     | ...           | #42    |
   ```

4. Flag ⚠️ any idea stuck in a pre-active stage for >14 days, or active for >21 days without a test report section.
5. Summary: `{N} ideas in flight | {K} stale`
