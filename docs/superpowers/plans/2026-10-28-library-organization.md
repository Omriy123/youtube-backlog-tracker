# Library organization implementation plan

> **For agentic workers:** Use the user-invoked implement-spec workflow: implement each delivery ticket in its own branch/worktree, merge into `implement/library-organization`, then review the complete integration branch.

**Goal:** Deliver the approved organization contract through GitHub issues #52–#56.

**Architecture:** Extend the existing vanilla JavaScript Chrome extension and serialized Library command queue. Keep organization changes and their recoverable history in the existing coherent browser persistence boundary. UI modules share a single current-result set, identity-based selection, destination identities, and explicit prepared affected sets.

**Tech Stack:** JavaScript ES modules, Chrome extension APIs, Node 24, Playwright 1.61.1.

**Spec:** `docs/specs/library-organization.md`; agreed delivery criteria in GitHub #52–#56 supersede the spec's historical not-yet-ticketed note.

## Global constraints

- Preserve one record per upload and one active destination; Entire Library contains active records only.
- Ordinary Move excludes Inbox; full custom-list deletion may explicitly move to Inbox.
- Missing provider information remains unknown. No provider acquisition, imports, bulk tab groups, theme pass, snapshots or cloud backup.
- Reuse the approved installed-extension/browser-persistence test seam. Do not add private-helper test seams.
- Report success only after durable completion. Failed persistence must preserve retryable affected sets and coherent prior organization/history.
- Retain prior capture, title search, opening, review and opening-repair behavior across destinations and restarts.

## Review focus

- Old previews after review, opening, rename, target-order or membership changes must require renewed confirmation; unrelated edits must remain safe.
- Split swaps must compute arrivals against surviving target baselines, not partially updated destinations.
- Recovery must protect newer relevant changes, including order and list-name conflicts, while retaining unrelated decisions and automatic observations.
- Growing a selection panel must not move a result out from under the pointer; offscreen results belong to Select all and Ctrl+drag.
- Missing/tied dates and channels, retained metadata versions, zero-result filters and narrow windows must remain usable and truthful.

## Task 1: Create watch lists and move videos (#52)

**Files:** Create `extension/organization-service.js`, `extension/organization-ui.js`, `tests/browser/organization.spec.js`, `tests/organization-boundary.test.js`; modify `extension/library-service.js`, `extension/library.js`, `extension/library.html`, `extension/styles.css` and existing title/review restrictions where required.

**Interfaces:** Library list responses expose permanent and custom destinations with stable IDs, importance, saved Manual order and publication direction. Commands include `createList`, `renameList`, `setListImportance`, `organizationPreview`, `organizationCommit`, and `organizationUndo`. Preparation returns explicit Video/From/To rows and relevant-state tokens; commit checks those tokens before writing.

- [ ] Write an installed-browser failing workflow for create/rename/name conflict, rank, previewed single move and persistent recovery.
- [ ] Run it and confirm failure because the controls are absent.
- [ ] Implement destinations, validation, coherent change history, explicit preview/reconfirmation, pending review gates and selective recovery. Preserve legacy records without fabricating dates.
- [ ] Extend public-command boundary fixtures for Jan 1/10/5/20 + Jan 7 arrival, descending/equal/unknown dates, no-op dates/history, relevant/unrelated changes, write rejection and recovery conflict.
- [ ] Run focused browser/boundary checks and existing workflows; commit the ticket.

## Task 2: Sort and arrange videos (#53, depends on #52)

**Files:** Add focused sorting/arranging modules beside organization modules, installed-browser sort/arrange workflows and public-command persistence checks; integrate `library.js/html`, styles and organization history.

**Interfaces:** A shared view pipeline supplies displayed per-destination order and current result IDs. Saved arrangement commands use explicit displayed order and relevant destination baseline; temporary order is UI state keyed to current view meaning. Preferences store sort/direction/overview separately from saved Manual and importance.

- [ ] Write/run a failing installed-browser test for clickable title/publication/Library-date headers and non-drag Place adopting the current unfiltered sort.
- [ ] Implement missing-last comparisons, per-list publication directions, overview order/statistics, Manual restoration and persisted preferences.
- [ ] Write/run a failing filtered 1,5 → 5,1 workflow; clearing restores 1,2,3,4,5 without changing dates/history.
- [ ] Implement exact drag insertion and equivalent keyboard Place with temporary lifetime rules, durable unfiltered arrangements and selective recovery.
- [ ] Verify source-order fixtures, stale saves, failed writes and restart; record physical-drag evidence limits; commit.

## Task 3: Browse lists/channels (#54, depends on #52; parallel with #53)

**Files:** Add focused browsing/view-state module and `tests/browser/browsing.spec.js`; integrate Library render/navigation, retained description matching and presentation styles.

**Interfaces:** One result pipeline combines `{listId, returnListId, query, titleScopes, channelId}` with later selected-only IDs. Channel counts substitute each button's identity while preserving other filters; explicit navigation anchors the shortlist. Sorting supplies per-destination displayed order, and grouping consumes sidebar order.

- [ ] Write/run a failing installed-browser scope/query/channel workflow using same-name distinct creators and unknown identity.
- [ ] Implement independent retained search scopes, reversible Library scope controls, stable five-channel shortcuts/counts and clearable zero-result states.
- [ ] Implement grouped destination headings, remembered Rows/Columns and Thumbnails/Compact with keyboard and responsive access.
- [ ] Verify restart preferences and baseline/growth fixtures, recording CSS viewport, zoom and measured latency without inventing a numerical requirement; commit.

## Task 4: Collect selections and organize batches (#55, depends on #53 and #54)

**Files:** Add selection/batch UI module and installed-browser selection workflows; extend organization preview/commit for frozen split requests and arrangement groups.

**Interfaces:** Selection is a transient ordered identity set. All/Matches panel actions freeze explicit IDs; Ctrl+drag always intersects selected IDs with all current main results. Move returns processed/excluded/no-op IDs for truthful selection cleanup.

- [ ] Write/run a failing cross-search/list selection test, including partial Select all, offscreen results and zero matches.
- [ ] Implement compact main-area In here/Elsewhere rows after results, per-row deselection, All/Matches, Clear and selected-only without pointer movement.
- [ ] Write/run split-swap, per-row Keep, pending exclusion and same-target no-op workflows; implement atomic batch arrival fitting and safe recovery.
- [ ] Add Ctrl+drag/group Place using displayed relative order and temporary-vs-saved rules. Explain outside-result Place sets rather than silently pruning them.
- [ ] Verify failure/retry and newer-decision conflicts; preserve selection after arrange and opened-but-unsaved repair; commit.

## Task 5: Delete lists and remove matches (#56, depends on #55)

**Files:** Add deletion UI and installed-browser removal workflows; extend organization preparation/commit/recovery and browse navigation.

**Interfaces:** Delete preparation freezes full custom-list contents independently of filters. Matching removal freezes current result IDs. Explicit effect/destination are required; permanent destinations reject deletion. Results provide processed IDs and deleted destination ID for selection/navigation updates.

- [ ] Write/run a failing full-delete preview test with hidden members, no default destructive choice and an explicit Inbox target.
- [ ] Implement empty/full deletion and matching-only move/dismiss, review gates, affected-state reconfirmation, coherent history and conflict-safe list recreation.
- [ ] Verify filters/return-list navigation, selected-only/zero results, permanent destinations, failure retention, restart and unrelated-list behavior.
- [ ] Run combined installed-Chrome save/find/organize/open/recover at approved baseline/growth distributions and responsive dimensions, recording actual evidence and limits; commit.

## Integration and completion

- [ ] Merge completed ticket branches through merger agents, refresh dependent branches from integration and open/update a draft PR with closing references #52–#56 after the first implementation merge.
- [ ] Run `npm test`, `npm run build` and appropriate installed Chrome validation with local Node and browser cache configured.
- [ ] Run independent Standards and Spec reviews against `main...HEAD`; fix reported issues in an implementer branch and rerun affected checks.
- [ ] Mark the PR ready only when implementation and automated checks are complete; keep any unmet physical-device evidence explicit. Clean up implementer worktrees after integration.
