# Issue tracker: GitHub Issues

Tasks, bugs, acceptance criteria, dependencies, and task discussion live in GitHub Issues. Determine the repository from the `origin` remote. Use the connected GitHub tools or authenticated `gh` CLI to read and update it.

Durable specs live in `docs/specs/`. The current product spec is `docs/specs/video-backlog.md`. Issues link to specs; do not maintain duplicate task status in `.scratch/`.

## Issue contents

Include the concrete problem or outcome, scope, acceptance criteria, relevant spec links, dependencies, and validation expectations. Record task kind in the body when useful (research, prototype, grilling, or implementation).

Use the five triage labels defined in `triage-labels.md` for delivery tasks. Keep one current triage role per open delivery issue. Wayfinder planning issues use the separate labels below. GitHub open/closed state records completion or disposition; do not invent `claimed` or `resolved` triage labels.

Before starting, read the issue, linked spec, and dependencies. Identify ongoing ownership through its assignee, linked branch/PR, and latest comments so parallel sessions do not duplicate work. Record material findings and handoffs in issue comments. Link the implementation PR to its issue, and close the issue only when its criteria are met or an explicit decision makes it non-actionable.

## Wayfinding operations

For wayfinder sessions, start at [the video Library planning map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10), or find maps with `gh issue list --state all --label 'wayfinder:map'`. Its body holds Destination, Notes, a named index of closed decisions, Not yet specified, and Out of scope. Open questions live as native child issues, queried rather than copied into the map body.

- Labels: the map carries only `wayfinder:map`; decision tickets carry one of `wayfinder:grilling`, `wayfinder:prototype`, `wayfinder:research`, or `wayfinder:task`. These planning issues use no delivery triage labels. Existing implementation and roadmap issues retain their triage roles and native parents.
- Children: use GitHub's native sub-issue relationship. List with `gh api repos/OWNER/REPO/issues/MAP_NUMBER/sub_issues --paginate`. Add with a POST to that endpoint using the child's numeric database `sub_issue_id`, not its issue number. Create issues before wiring relationships.
- Blocking: use native issue dependencies. Read `issues/NUMBER/dependencies/blocked_by`; add a blocker with a POST to that endpoint using the blocker's numeric database `issue_id`. A decision may depend on an existing implementation issue without reparenting it. See the [GitHub sub-issue API](https://docs.github.com/en/rest/issues/sub-issues) and [dependency API](https://docs.github.com/en/rest/issues/issue-dependencies).
- Frontier: in native child order, select open, unassigned children whose native blockers are all closed. Check the full blocker list, including blockers outside the map; body links alone do not establish blocking. Assign the chosen ticket to the dev driving the session before working it.
- Resolution: keep the question in the body; put the answer and evidence/spec/asset pointers in a resolution comment, close the issue, and add one named gist/link to the map's Decisions so far. Human decisions resolve through the human exchange; research facts do not substitute for approval.

The retrospective map imports answers already recorded in approved specs, issue discussions, and accepted prototype feedback. Its historical resolution comments identify their sources and evidence limits. Read those answers before asking questions. The map indexes planning; `docs/specs/` remains the durable specification, and the existing remaining-scope roadmap tracks delivery. Future sessions work unresolved tickets under the map's Notes; the backfill itself starts no new interviews or research.

## Temporary local work

Use ignored `.scratch/` for experiments, imported samples, and drafts awaiting publication. If GitHub is unavailable, keep any unpublished draft clearly marked and report that it has not been published. Do not treat a draft as a second authoritative tracker.

Early interview tickets under `.scratch/video-backlog/issues/` are historical. The layout prototype's outcome is recorded in `docs/design/library-layout.md`, with source archival described in `docs/prototypes/library-layout.md`.
