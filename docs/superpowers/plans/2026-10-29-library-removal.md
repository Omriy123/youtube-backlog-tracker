# Recoverable list deletion and matching cleanup implementation plan

> Execute task by task using the approved installed-extension/browser-persistence testing seam. The approved implementation request authorizes execution; no new workflow interview is needed.

**Goal:** Delete a whole custom list or remove only its current matches with explicit confirmation, coherent recovery and correct browse/selection outcomes.

**Architecture:** Add a focused removal preview/apply module consumed by the existing organization transaction. A removal dialog renders explicit effects and frozen affected titles; Library composition supplies complete browse filters and repairs both active scope and return origin after success.

**Spec:** `docs/specs/library-organization.md`; ticket #56. Supporting preparation: root `.scratch/implementation-context/organization-56-browse.md`.

## Constraints

- Inbox/Backlog permanent; explicit whole-list move may choose Inbox; matching cleanup cannot.
- Whole preview derives every active source member, including hidden records. Matching cleanup derives actual complete current results including selected-only, never selection panel scope or DOM rows.
- No effect/destination defaults. Empty deletion has explicit confirmation without nonexistent-video placement choices.
- Freeze filter/selected-ID context; refresh relevant changed membership/labels/targets and require renewed confirmation. Unrelated decisions remain independent.
- One durable action/history write; no record erasure. Recovery preserves list identity/importance/order/dates and newer unrelated authorship/metadata.

## Review focus

- Whole deletion cannot silently exclude pending rows; dismiss itself may resolve dismissal.
- Scope and originating return list both need effect-aware repair, including Library-wide browsing.
- Persistence failure preserves selection and retryable dialog; no optimistic completion.
- Restored names cannot overwrite another identity, including case/whitespace collisions.
- Relevant later/ABA ownership prevents unsafe recovery while metadata and Personal titles remain independent.

## Task 1: Explicit previews and coherent service transaction

Files: create `extension/removal-service.js`; extend `extension/organization-service.js`; tests `tests/browser/removal.spec.js`.

- [x] Write installed-command/browser tests for whole hidden members versus selected-only matching set, no default effect/target, permanent-list denial, Inbox exception, empty deletion and no-op dates.
- [x] Run tests and observe missing command/control failures.
- [x] Implement `removalPreview`/`removalCommit` inside existing organization history/write transaction; pure helper derives preview/signature and applies move/dismiss/delete using supplied order/date-fitting helpers.
- [x] Verify relevant stale membership/target/title changes refresh without mutation, pending whole move gates, and explicit dismiss resolves pending.
- [x] Verify single action changes/recovery, deterministic failure/retry and restart; reject name/ownership conflicts without partial restoration.

## Task 2: Cleanup dialog and browse/selection integration

Files: create `extension/removal-ui.js`; extend `extension/library.js`, `extension/organization-ui.js` and minimal styles.

- [x] Write tests for explicit full/matching effects/counts/titles, per-group actions, selection cleanup and all navigation cases.
- [x] Implement `showRemoval({listId,scope,recordIds,filterContext}, {onCompleted,onChanged})`; preview supplies current lists/rows/choices and never preselects destructive options.
- [x] Feed complete `selection.currentResults` and frozen selection/filter context; call `selection.processed(processedIds)` only on success.
- [x] Repair scopeId/originListId if deleted current/return list: move -> explicit target; dismiss/empty -> Entire Library with safe Inbox return. Preserve query/channel/selected-only/preferences. Unrelated deletion leaves current valid view.
- [x] Verify pending review -> refresh -> separate confirmation, stale revalidation, failures and keyboard access.

## Task 3: Combined workload and responsive evidence

Files: `tests/browser/removal-scale.spec.js`, `docs/validation/list-removal.md`.

- [x] Run installed Chrome combined save/find/select/arrange/move/delete/open/recover across ~1000 active/100 channels and ~3000 total/up-to550 channels including retained history/missing metadata/skewed lists.
- [x] Measure actual interaction durations and CSS viewports 2560x1440,1440x900,1280x500,390x844,768x1200 plus Chrome125%/150% zoom; verify readable preview and keyboard/non-drag access.
- [x] Save raw metrics/screenshots at root `.scratch/validation/organization-removal` before worktree cleanup. Explicitly report physical-device/automation evidence limits.
- [x] Run focused and full existing checks/build, merge current integration tip and hand off committed work for independent integration reviews.
