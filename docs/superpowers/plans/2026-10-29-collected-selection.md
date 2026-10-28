# Collected selection and split actions implementation plan

> **For agentic workers:** Use executing-plans with the approved installed-browser/persistence seam. Execution is authorized; implement task by task.

**Goal:** Deliver issue #55: persistent-in-page identity selection, explicit scoped batch moves/status, group arranging and safe recovery.
**Architecture:** A page-local selection controller consumes the complete browse result pipeline and resolves current records from the latest active snapshot. The existing organization preview/transaction/recovery module owns atomic batch actions. The existing arrangement controller owns saved versus temporary ordering.
**Tech Stack:** MV3 JavaScript modules, Chrome extension storage, Playwright installed Chrome.
**Spec:** docs/specs/library-organization.md; docs/specs/opening-and-watch-history.md; issue #55.

## Global constraints

- Selection and selected-only reset on reopening; preferences retain their existing persistence.
- Ordinary Move excludes Inbox. No new bulk-tab group feature.
- Complete matches define action scope, including offscreen records.
- Selection never resolves pending review. Exclusion is explicit and retryable.
- A failed write preserves durable records/history and selection together.
- Filtered group arrangements remain temporary; grouping has no global saved order.

## Review focus

1. Panel growth must preserve clicked row position and checkbox keyboard focus.
2. Selected-only checkbox edits retain surviving temporary order and stable channel anchors.
3. Split swaps use surviving destination baselines, preserving no-op dates and incoming tie order.
4. Pending/excluded/failed/stale rows retain selection; only durable processed outcomes deselect.
5. Opened-but-unsaved remains selected/recoverable; tab existence is not durable status success.

### Task 1: Collect and inspect selections

Files: create extension/selection-ui.js; modify extension/library.js, styles.css; tests/browser/organization-selection.spec.js.
Interfaces: createSelectionController({onChanged,onMove,onPlace,onStatus}) exposes selectedIds, selectedOnly, update(snapshot,currentResults,context), enhanceRow(row,record), processed(ids), affected(), renderControls/panel. Use complete deriveBrowse selected predicate and pre-selected-filter contentRecords.
- [ ] Add/run red installed-browser cross-search collection, Select all partial/all/offscreen, All/Matches counts and pointer-stable checkbox workflow.
- [ ] Implement session identity state, live compact Video/From panel AFTER results, individual/clear/scoped deselection and selected-only.
- [ ] Verify zero-match reachability, checkbox focus and same-position toggle; reopening clears transient state.

### Task 2: Explicit split moves and review exclusions

Files: extension/organization-ui.js, organization-service.js and selection browser tests.
Interfaces: showMove(records,lists,{onChanged,onProcessed,initialDestination}) freezes supplied ordered IDs; shared destination control, per-row choices, explicit exclude/review. Existing organizationPreview/Commit retains one atomic transaction.
- [ ] Add/run red browser split-table/shared-destination/per-row override and explicit pending-row exclusion tests.
- [ ] Source-order previews by sidebar and per-source displayed sort, not Set chronology. Refresh preserves valid overrides and exposes invalid destinations.
- [ ] Keep selection on failure/stale/exclusion; subtract only processedIds after durable success; Keep/Leave here refreshes but does not commit.
- [ ] Verify split swaps, equal/unknown dates, no-op storage, one batch Undo, unrelated later edits and newer conflict protection.

### Task 3: Group Place/drag and opening/status outcomes

Files: extension/arrangement-ui.js, selection-ui.js, library.js, organization-service.js, organization-ui.js, opening-ui.js as needed.
Interfaces: getMovedIds(event,record,records), existing arrange/showPlace; selection processed callback. Add statusPreview({recordIds,effect})/statusCommit({preview}) using atomic organization history. Explicit selected Mark watched/Dismiss comes from existing opening/status contract; keep single Open and defer bulk tabs.
- [ ] Add/run red browser group Place, ordinary/Ctrl drag, offscreen current-result membership and mismatch-action tests.
- [ ] Group Place retains selection; outside-results set offers Matches or explicit Move. Mixed destinations require Move. Cross-destination drop opens explicit preview.
- [ ] Add/run red selected Mark watched/Dismiss tests for explicit affected titles, dates/events, pending gates/exclusion, write failure and batch recovery.
- [ ] Implement status preview/commit and recoverable one-write batch. Dismiss may resolve pending decision; Mark watched requires review. No tabs for either status action.
- [ ] Verify single Open/failed tab/opened-but-unsaved repair selection behavior against complete active snapshot; no optimistic deselection.

### Task 4: Integrated evidence and handoff

- [ ] Run actual Chrome targeted suite, relevant regressions, full boundary suite and build; record actual outputs.
- [ ] Exercise baseline ~1000 active/100 channels and growth ~3000 total/up to550 channels at actual CSS viewports and record observed timings without invented budgets.
- [ ] Record evidence limits for physical gestures/hardware/zoom not performed; document #56 hooks for actual currentResults, selectedIds, processedIds and filter context.
- [ ] Merge integration tip, verify clean diff, commit completed ticket and report commit/evidence.