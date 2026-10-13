# Issue tracker: GitHub Issues

Tasks, bugs, acceptance criteria, dependencies, and task discussion live in GitHub Issues. Determine the repository from the `origin` remote. Use the connected GitHub tools or authenticated `gh` CLI to read and update it.

Durable specs live in `docs/specs/`. The current product spec is `docs/specs/video-backlog.md`. Issues link to specs; do not maintain duplicate task status in `.scratch/`.

## Issue contents

Include the concrete problem or outcome, scope, acceptance criteria, relevant spec links, dependencies, and validation expectations. Record task kind in the body when useful (research, prototype, grilling, or implementation).

Use the five triage labels defined in `triage-labels.md`. Keep one current triage role per open issue. GitHub open/closed state records completion or disposition; do not invent `claimed` or `resolved` triage labels.

Before starting, read the issue, linked spec, and dependencies. Identify ongoing ownership through its assignee, linked branch/PR, and latest comments so parallel sessions do not duplicate work. Record material findings and handoffs in issue comments. Link the implementation PR to its issue, and close the issue only when its criteria are met or an explicit decision makes it non-actionable.

## Temporary local work

Use ignored `.scratch/` for experiments, imported samples, and drafts awaiting publication. If GitHub is unavailable, keep any unpublished draft clearly marked and report that it has not been published. Do not treat a draft as a second authoritative tracker.

Early interview tickets under `.scratch/video-backlog/issues/` are historical. The layout prototype's outcome is recorded in `docs/design/library-layout.md`, with source archival described in `docs/prototypes/library-layout.md`.
