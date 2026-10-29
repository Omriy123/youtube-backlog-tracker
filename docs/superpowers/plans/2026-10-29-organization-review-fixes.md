# Organization final review fixes

> **For agentic workers:** Execute these fixes inline using the approved installed-browser/public-command seam and red/green regressions.

**Goal:** Resolve the final global-sort, unknown-date and shared-order ownership findings.
**Architecture:** Preserve destination-local organization while rendering global value sorts as one ordered result flow outside channel grouping. Separate initial-decision eligibility from a nullable historical timestamp, with additive state and recovery-aware legacy inference. Share one in-transaction Manual-order setter.
**Tech stack:** Existing MV3 JavaScript extension and installed-Chrome Playwright runner.
**Spec:** `docs/specs/library-organization.md`, glossary First Inbox-exit meaning, opening/status and recovery contracts.

## Constraints and review focus

- Channel-scoped Library groups retain sidebar order, controls, Rows/Columns and per-list sorting.
- Manual remains destination-local; publication retains remembered per-list direction.
- Unknown dates stay unknown through custom moves, deletion-to-Inbox, status, opening and rediscovery.
- A genuine first Inbox decision records its actual time; Undo restores future eligibility.
- Reads do not migrate or rewrite factual user data; unrelated actions remain recoverable.

## Task 1: Render global value sorts

- [ ] Add a failing installed-Chrome workflow that interleaves destinations under Destination, Title, duration and Library-date sorts in both directions.
- [ ] Render ordinary Entire Library/All channels value sorts in their actual global order, preserving channel-group/sidebar and destination-local Manual/publication behavior.
- [ ] Verify selection, row actions, matched cleanup and arranging remain available in both render paths.

## Task 2: Distinguish unknown historical dates from initial decisions

- [ ] Add failing public/browser cases for unknown custom-list records moved, manually marked, opened, returned to Inbox by deletion and rediscovered.
- [ ] Add `initialPlacementComplete` plus a pure recovery-aware inference and mutation helper. Apply before movement/status/opening/deletion/rediscovery and preserve it in organization recovery snapshots.
- [ ] Verify initial Inbox transitions record dates, known dates remain unchanged, and Undo of initial move/status/open restores eligibility without blanket history inference.

## Task 3: Share Manual-order persistence and verify

- [ ] Replace permanent/custom Manual writes in arranging, moves and removal with one mutation helper inside the existing transaction.
- [ ] Run targeted installed-Chrome/public regressions, full boundary/browser suites and build. Record results and limits.
- [ ] Merge current integration, check the diff, commit and hand off for reviewer recheck.
