# Watch lists and placement Implementation Plan

> **For agentic workers:** Use executing-plans to implement this ticket task by task.

**Goal:** Deliver issue #52 watch lists, importance, individual move previews and durable selective recovery.
**Architecture:** Extend the queued Library command boundary with an organization module. Store stable list identities, manual arrangement, and recoverable before/after deltas together with records/history in one durable write. UI consumes explicit previews and re-confirms affected changes.
**Tech Stack:** MV3 extension, JavaScript modules, Playwright installed Chromium.
**Spec:** docs/specs/library-organization.md; GitHub issue #52.

## Global Constraints

- Inbox and Backlog are permanent; ordinary Move excludes Inbox.
- A record has one active destination; no-op moves change no dates/history/order.
- Preserve existing records/history and automatic metadata observations.
- Test only the already approved installed-browser/persistence seam.

## Review Focus

- Case/whitespace list collisions retain identity and existing data.
- Older recovery conflicts with relevant newer decisions but preserves unrelated edits.
- Unknown/equal/reverse-date arrivals preserve existing Manual order.
- Pending review and stale previews never silently execute moves.
- Failed persistence never announces success or changes durable organization/history.

### Task 1: Create, rename and rank lists

Files: extension/organization-service.js, extension/organization-ui.js; extension/library-service.js, library.js, library.html, styles.css; tests/browser/organization.spec.js.
Interfaces: organizationLists(state), executeOrganization(state,browser,command); createList(name), renameList(listId,name), setListImportance(listIds), organizationUndo(actionId).
- [x] Write/run failing browser workflow for names, stable identity, importance and restart.
- [x] Add organization module, sidebar, keyboard list controls and recoverable delta history.
- [x] Run workflow and existing browser/boundary tests; commit.

### Task 2: Individual moves and selective recovery

Interfaces: organizationPreview({rows:[{recordId,to}]}), organizationCommit({preview}); previews freeze affected user records and target lists, not unrelated state.
- [x] Write/run failing installed browser workflow for preview, Inbox exclusion, dates/no-op and durable Undo.
- [x] Implement atomic movement and direction-aware insertion after the last earlier/equal anchor, preserving surviving destination order.
- [x] Add browser cases for stale affected/unrelated changes, pending review, failed writes, recovery conflicts and metadata preservation.
- [x] Run browser suite, boundary suite and build. Record evidence limits; commit.
