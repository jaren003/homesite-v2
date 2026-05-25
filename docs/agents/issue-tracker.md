# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub Issues at **jaren003/homesite-v2**. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..." --label "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open --json number,title,body,labels --jq '[.[] | {number, title, body, labels: [.labels[].name]}]'` with `--label` and `--state` filters as needed.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

The repo is **jaren003/homesite-v2**. Pass `--repo jaren003/homesite-v2` to `gh` commands if not run inside a clone with that remote set.

## Issue hierarchy

This repo uses a three-level hierarchy. When creating issues, use these title prefixes and labels:

- `[EPIC] ...` — top-level epic, label `epic`
- `[FEATURE] ...` — feature story under an epic, label `feature`
- User stories / tasks — no prefix, label `story`

Cross-reference parent epics in the issue body: `Closes part of #<epic-number>`

## When a skill says "publish to the issue tracker"

Create a GitHub issue with the appropriate prefix and labels.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments --repo jaren003/homesite-v2`.
