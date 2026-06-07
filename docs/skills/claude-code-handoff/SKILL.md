---
name: claude-code-handoff
description: Generate a self-contained Claude Code session prompt from a pipeline issue. Use whenever the user types /claude-code-handoff, says "hand this off to Claude Code", "give me a Claude Code prompt for {slug}", "start Claude Code on this", or "I want to open this in Claude Code". Reads the pipeline spec, repo context, and open GitHub issues, then outputs a ready-to-paste block for a new Claude Code terminal session.
---

# /claude-code-handoff — Generate a Claude Code Session Prompt

This skill assembles everything Claude Code needs to start work on a pipeline issue: repo context, spec, acceptance criteria, open issues, and a clear instruction. The output is a single copy-pasteable block.

## What to do

### 1. Identify the issue

The user provides a slug, issue number, or describes what they want to hand off.

- If a **slug** is given, look in `~/pipeline/02-ready/{slug}/` or `~/pipeline/03-active/{slug}/`
- If an **issue number** is given, scan `github.md` files to match it
- If **no specific slug**, list specs in `02-ready/` and ask the user to pick one

Read `spec.md` (required). Read `github.md` and `dev-notes.md` if they exist.

### 2. Gather repo context

Read these files from the repo (path from `github.md` or ask):
- `CLAUDE.md` or `AGENTS.md` — agent rules and domain glossary
- `CONTEXT.md` — project domain context
- Any relevant PRD from `docs/` if referenced in the spec

Also collect the list of **open GitHub issues** for the repo (use the GitHub connector if available, or note the repo URL so Claude Code can check itself).

### 3. Determine pipeline stage action

- If the issue is in `02-ready/`, move its folder to `03-active/` and create `dev-notes.md` (see template below)
- If already in `03-active/`, just update `dev-notes.md` with a new handoff entry
- Append to `~/pipeline/_log.md`:
  ```
  [{timestamp}] CLAUDE CODE HANDOFF: {slug} | {github issue URL or "no issue yet"}
  ```

**dev-notes.md template:**
```markdown
# Dev Notes: {Title}

**Issue:** {GitHub URL or "— no issue yet"}
**Handed to Claude Code:** {YYYY-MM-DD}

---

## Progress Log

_Claude Code writes here as work progresses_

## Blockers

_Note any blockers_

## Decisions Made

_Record key implementation decisions and why_
```

### 4. Output the Claude Code prompt block

Produce a formatted markdown block the user can paste as the **first message** in a new Claude Code terminal session (`claude` CLI). Make it completely self-contained — Claude Code has no memory of prior conversations.

Use this structure:

---

```
## Claude Code Session: {Title}

**Repo:** {absolute path on disk, e.g. ~/Projects/Homesite-v2}
**GitHub Issue:** {URL} (open — do not close it yourself)
**Pipeline folder:** ~/pipeline/03-active/{slug}/

---

### Project context

{2–4 sentence summary from CONTEXT.md covering: what the project is, the key architecture (EventKit bridge, Next.js, etc.), and the domain glossary terms most relevant to this issue}

### Agent rules (from CLAUDE.md / AGENTS.md)

{Paste the full content of CLAUDE.md / AGENTS.md verbatim, or the most critical sections if very long}

---

### What you're building

{Summary paragraph from spec.md}

### Acceptance criteria (your definition of done)

{Numbered list from spec.md — every item must be met before you consider this done}

### Files likely affected

{List from spec.md}

### Technical approach hints

{Technical notes section from spec.md}

### Test cases to write

{From spec.md}

---

### Open GitHub issues (for context — do not open new issues without asking)

{List of open issue numbers + titles from the repo, e.g.:
- #13 Live acceptance testing (ready-for-human)
- #15 Merge PR #14 and pull to mac mini (infra)
}

---

### Your job

1. Read `CLAUDE.md` / `AGENTS.md` at the repo root before writing any code.
2. Work through every acceptance criterion above.
3. Write or update tests as specified.
4. Log progress and decisions in `~/pipeline/03-active/{slug}/dev-notes.md`.
5. When all ACs are met and tests pass, tell the user so they can run `/test-handoff`.

Do NOT close the GitHub issue — that happens after human sign-off.
```

---

### 5. Confirm to the user

Tell the user:
- The block above is ready to paste into a new `claude` CLI session in the repo directory
- The pipeline folder has been moved to `03-active/` (or was already there)
- `dev-notes.md` is created and ready for Claude Code to fill in
- Remind them: after Claude Code says it's done, run `/test-handoff` in Cowork

## Notes

- If `spec.md` is missing or the slug isn't found, tell the user which stage the issue might be stuck at and what's needed to move it forward.
- If CLAUDE.md / AGENTS.md is very long (>200 lines), summarize the most relevant sections and note the full path so Claude Code can read it directly.
- This skill does **not** write code. Its value is a single, complete, copy-pasteable context block that eliminates back-and-forth at the start of a Claude Code session.
- The open issues list prevents Claude Code from creating duplicate issues or working blind to in-flight work.
- If the user has the GitHub connector active in Cowork, fetch the live open issues list. Otherwise, use the last-known list from memory or ask the user to paste it.
