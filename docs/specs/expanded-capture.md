# Expanded capture and pending rediscovery review

Design status: **settled interaction contract formalized on 2026-10-17 through the user-invoked to-spec handoff**, after completed grilling and accepted prototype feedback. Prototype B's badge/dialog interaction is selected, and pill palette A remains provisional. This is a planning specification, not production implementation or an approved delivery breakdown.

Planning question: [Specify expanded capture and pending rediscovery-review interactions](https://github.com/Omriy123/youtube-backlog-tracker/issues/24). Parent: [approved product design](video-backlog.md). Apply [shared feature ownership](../design/feature-map.md), [identity and destination vocabulary](../../GLOSSARY.md), the [first-slice contract](first-end-to-end-slice.md), and the [approved recovery contract](library-recovery.md).

## Problem Statement

The user needs to save a current video, an unopened video link/linked thumbnail, or several open tabs without maintaining those tabs as the only backlog. Saving should be simple: deciding destinations, reviewing previous activity, and considering similar uploads must not become mandatory work before a link is safely kept. Duplicate references, partial failures, lost popup context, unexpected source closing, and status colors that are hard to distinguish must not conceal what actually happened.

## Solution

Use Inbox as the easy default, with optional existing-destination shortcuts and a compact window selection preview in the toolbar popup. Preserve one upload record, make every source-tab outcome explicit, and provide clickable pills/dialogs for optional immediate or later review. A generically rediscovered watched/dismissed video belongs in Inbox with a pending badge; it is not hidden in a separate request queue.

This slice adds toolbar destination shortcuts and an opt-in close preference, right-click linked-video saving, current-window selection/destinations, per-source results and retries, pending rediscovery review, and presentation of possible-duplicate evidence when available. It extends the existing real save/find/open/recover path rather than replacing the Library layout or building import/provider systems.

## User Stories

1. As a Library user, I want the toolbar to open a small popup, so that saving does not open an unrelated browser tab.
2. As a Library user, I want one Save to Inbox action, so that I can keep a new video before deciding where it belongs.
3. As a Library user, I want available title/URL fallback without provider setup, so that missing metadata never prevents saving.
4. As a Library user, I want capture to preserve my personal title, so that automatic source data cannot overwrite my wording.
5. As a Library user, I want the top three watch lists and Backlog as optional shortcuts, so that deliberate placement can be immediate.
6. As a Library user, I want shortcuts ranked by saved list importance, so that temporary sorting does not rearrange them.
7. As a Library user, I want choosing a shortcut to save immediately, so that it does not introduce another confirmation step.
8. As a Library user, I want to save a linked video or thumbnail through right-click, so that I need not open it first.
9. As a Library user, I want linked-video capture to target the video URL, so that an image asset or containing page is not mistaken for the video.
10. As a Library user, I want durable success/failure feedback, so that I know whether the link is safely in my Library.
11. As a Library user, I want Save tabs from this window inside the popup, so that batch saving stays compact.
12. As a Library user, I want recognized videos selected and other pages unchecked initially, so that a mixed window does not automatically save unrelated pages.
13. As a Library user, I want to include an unrecognized page explicitly, so that URL/title fallback remains available.
14. As a Library user, I want All selected → Inbox, so that batch saving can stay one simple placement choice.
15. As a Library user, I want shared and individual destination choices, so that selected videos can go to different lists when useful.
16. As a Library user, I want rows and checkbox labels to be clickable, so that selection does not require a precise checkbox hit.
17. As a Library user, I want destination and badge controls independent of selection, so that inspecting a video does not accidentally uncheck it.
18. As a Library user, I want scroll position preserved during changes and review, so that the list does not jump away from my place.
19. As a Library user, I want repeated links to one upload to share one decision, so that a window batch never creates duplicate records or memberships.
20. As a Library user, I want an active exact duplicate to stay where it is, so that saving again does not rearrange my Library or user dates.
21. As a Library user, I want a generically re-saved watched/dismissed video in Inbox with a badge, so that I can find and review it later.
22. As a Library user, I want previous status, destination and activity details in that review, so that I can make an informed Keep/Dismiss decision.
23. As a Library user, I want Keep in Inbox to confirm its current placement, so that resolving review does not invent a second list entry.
24. As a Library user, I want Dismiss to retain the video and history outside active lists, so that declining rediscovery does not erase my record.
25. As a Library user, I want a destination-shortcut rediscovery to stay in that chosen list with a badge, so that my explicit destination is respected.
26. As a Library user, I want Dismiss / Leave here in destination review, so that the decision matches where the record already is.
27. As a Library user, I want Leave here & open as an explicit third action, so that I can resolve review and then open deliberately.
28. As a Library user, I want ordinary opening to show unresolved review first, so that it cannot silently bypass my pending decision.
29. As a Library user, I want search/navigation/selection to stay uninterrupted, so that merely browsing is not treated as a review decision.
30. As a Library user, I want clearly shaped clickable status pills, so that review/details are discoverable instead of looking like free text.
31. As a Library user, I want optional review before saving and safe deferral afterward, so that Save does not force an organization interview.
32. As a Library user, I want cancelled dialogs to leave decisions pending, so that closing a popup does not silently choose for me.
33. As a Library user, I want pills retained in processed-source results, so that I can inspect or resolve the same issues after saving.
34. As a Library user, I want every source tab accounted for, so that unchecked, failed, duplicate and saved outcomes cannot disappear into one success message.
35. As a Library user, I want duplicate rows to say why no new record was added, so that I understand that the existing saved record is safe.
36. As a Library user, I want a pending Inbox save counted as saved with review pending, so that the result matches its actual Inbox membership.
37. As a Library user, I want failures to remain visible and retryable, so that I can recover the unsaved portion of a batch.
38. As a Library user, I want retry to affect only failed candidates, so that successful saves and review decisions are not repeated.
39. As a Library user, I want reopening to show current remaining source tabs, so that I can continue saving instead of returning to stale results.
40. As a Library user, I want already-saved open sources visible but unchecked on reopening, so that I can distinguish them from unfinished saving.
41. As a Library user, I want explicit access to the latest save receipt, so that fresh capture does not hide the last operation's result.
42. As a Library user, I want ordinary Save to keep source tabs open, so that saving does not unexpectedly interrupt browsing.
43. As a Library user, I want a remembered current-tab close preference, so that I can opt into saving and closing with one action.
44. As a Library user, I want other shortcut buttons to show just the list name, so that the close preference does not clutter every label.
45. As a Library user, I want an explicit window-source closing action, so that I control when successfully handled source tabs disappear.
46. As a Library user, I want failures, unchecked sources and unresolved prior-activity reviews excluded from closing, so that unfinished work remains accessible.
47. As a Library user, I want linked-video saving never to close its containing page, so that an unrelated browsing page stays open.
48. As a Library user, I want a navigated/disappeared source handled safely, so that the extension never closes a replacement or unrelated tab.
49. As a Library user, I want Undo save & choose again, so that I can correct an immediate save instead of making another membership.
50. As a Library user, I want correction to preserve history and later decisions, so that undoing capture cannot overwrite newer work or reopen browser tabs.
51. As a Library user, I want different-upload suggestions shown as comparisons, so that I can decide whether their content is worth keeping separately.
52. As a Library user, I want Keep separate upload / Dismiss new upload, so that similarity never automatically merges or modifies the existing upload.
53. As a Library user, I want late or missing similarity evidence not to block saving/opening, so that uncertain enrichment cannot stop basic Library use.
54. As a colorblind Library user, I want labels, symbols and border patterns independent of color, so that status differences remain understandable.
55. As a Library user, I want palette A kept provisional, so that accepting these pills does not settle the entire product theme.
56. As a Library user, I want saving, review and recovery to survive popup closure/restart coherently, so that the Library is not transient UI state.
57. As a Library user, I want real-browser validation of capture and source closing, so that a simulated prototype is not treated as proof of safe operation.

## Implementation Decisions

### Explicit revision of generic rediscovery

The latest human decision supersedes historical Q44's generic-save placement timing and the earlier proposal to keep a rediscovery request outside active lists:

**A generic save of a watched/dismissed upload immediately places its existing record in Inbox with pending rediscovery review.** It remains in Inbox while review is outstanding. Keep confirms staying there; Dismiss removes it from active lists and retains its history. This is not a second record or an inferred watch event.

An explicit destination shortcut instead places the existing watched/dismissed record in that destination with pending review. Dismiss / Leave here and the explicit Leave here & open action apply there. Ordinary active exact duplicates still stay in their existing destination, including an already-active pending record saved again.

This later contract replaces the generic interaction when expanded capture is delivered. The first-slice spec and its original approval remain the historical baseline, not retroactively rewritten evidence.

### User workflows

#### Save one video simply

- Clicking the extension toolbar opens its small popup, never an automatic Library/browser tab.
- The current tab's link and available title identify the candidate. Save to Inbox saves immediately without a mandatory preview or review dialog.
- Save somewhere else reveals the three most important watch lists, in saved importance order, plus Backlog. Choosing one saves immediately. Temporary list sorts and usage frequency do not rank these shortcuts. Fewer than three watch lists yields fewer shortcuts.
- Confirmation follows durable persistence and names the actual destination/outcome. Open Library / View in Library is explicit navigation, not part of automatic saving.
- URL/title fallback works without an API key or enrichment. Missing title falls back to the URL; unavailable metadata is not invented. Personal titles retain precedence and are never overwritten by capture.
- Right-click a video link or a thumbnail that links to a video to use default Inbox or the same ranked destination shortcuts. Save the linked video URL, not its image asset or containing page. No prior opening of the linked video is required. Do not pretend an arbitrary image URL identifies a video.
- Right-click saving has the same durable success/failure/identity behavior. Its result must be discoverable through the extension's capture feedback/receipt without automatically opening the Library. The minimal browser-appropriate feedback mechanism is left to the builder and must be validated in Chrome.

#### Save tabs from this window

- Save tabs from this window opens a compact selection preview **inside the popup**. It does not open a full Library tab.
- Show source-tab title/URL fallback, selection, proposed destination, and applicable clickable status pills. Recognized video links initially start selected; unrecognized pages start unchecked but may be explicitly included through the supported URL/title fallback.
- Start with Inbox. Provide an easy All selected → Inbox action, a shared existing-destination picker, and per-upload overrides. An active duplicate displays its existing destination and cannot be moved by these capture controls.
- The full row/checkbox text selects the source. Destination controls and badge clicks do not change selection. Changing selection/destination or opening/closing a review dialog preserves the list position.
- Several source tabs referencing one upload share one save/review/destination decision and one Library record. Changing the destination for one eligible repeated reference changes its peers. Do not introduce a chooser for extra memberships.
- Save selected tabs saves the chosen candidates without requiring prior activity, similarity, or placement decisions first. It is valid for selected rows to keep the default Inbox destination and unresolved review.
- Window capture does not import Chrome tab-group structure or create lists. Those conversion/mapping behaviors remain owned by imports/organization.

#### Inspect or defer badges

- Use visually distinct pill-shaped buttons, not status prose that merely looks like a label. Accepted presentation B opens a dialog on click.
- Pills appear in current-tab capture when applicable, window preview, processed-source results, and the actual Library rows. They remain clickable after saving.
- Exact-active and repeated-reference pills explain identity/current placement; they do not offer automatic merging or silently move an active record.
- A watched/dismissed pill shows previous status, prior destination, last relevant watch/dismissal detail, and retained watch-event information. Watched is an opening/status fact, not verified playback completion.
- Optional preview review choices are staged until Save. Dismissing a dialog without choosing changes nothing. If destination changes, invalidate any incompatible staged choice rather than applying it to another placement.
- Ignoring the badge does not block Save: generic rediscovery saves into Inbox with a pending badge; explicit destination rediscovery saves into that destination with a pending badge.

### Identity, status, and dates

| Encounter | Saved outcome | Later review |
| --- | --- | --- |
| New upload, generic Save | One new Inbox record | Ordinary placement later; no rediscovery gate |
| New upload, explicit destination | One record in that destination | No rediscovery gate |
| Exact upload already active | Already saved; preserve destination, position, user dates, and any pending flag | Existing pending review, if any, stays unresolved |
| Watched/dismissed upload, generic Save | Same record becomes active in Inbox with its previous activity preserved | Dismiss / Keep in Inbox |
| Watched/dismissed upload, explicit destination | Same record becomes active there with previous activity preserved | Dismiss / Leave here / Leave here & open |
| Repeated URL references in one window | One upload outcome, associated with every source occurrence | One decision per upload; every source gets an explained result |
| Different upload with similarity evidence | Separate record, never an automatic merge | Optional possible-duplicate comparison |

First saved remains fixed for retained records. Direct first saves set first saved, first Inbox-exit, and latest list-entry together as already agreed. Generic first saves do not invent an Inbox-exit date. Returning a retained watched/dismissed record to an active destination updates latest list-entry at the save; a later Keep/Leave here that only clears review does not pretend it re-entered again or replace its original first Inbox-exit date. Save/rediscovery alone creates no watch event.

Persist the record's placement/status, pending review, previous activity references, relevant user dates, and recovery information coherently. A failed mutation cannot leave placement and history disagreeing. Automatic metadata follows the latest-valid-or-missing rule and never substitutes for user history.

### Review and opening

- Pending generic rediscoveries are real Inbox rows. There is no separate outside-Inbox request queue, hidden second membership, or requirement to decide before they appear.
- Keep in Inbox confirms the current placement and clears the pending flag. Dismiss removes active membership, retains the record/history, and records the deliberate dismissal.
- For an explicitly chosen list, Leave here clears pending review and retains that placement. Dismiss removes active membership with retained history. Leave here & open explicitly resolves review and starts normal single-video opening.
- A badge click only opens review. Clicking the title/thumbnail/Open of a pending record also opens review **before** normal opening. Keep/Leave here alone does not launch a tab; another normal Open is required. Leave here & open is the explicit combined action for destination review.
- Pending review also gates moving, authored editing, and marking watched. Search, navigation, viewing the list, and selection do not trigger modal review. An explicit Dismiss can itself resolve the pending decision; it need not ask for a second dismissal.
- Closing/cancelling the dialog leaves pending review intact. Failed review persistence leaves the prior saved state/flag intact and reports failure.
- After Leave here & open, successful new-tab creation alone marks watched, removes active membership, and adds one watch event. Failed tab creation leaves the reviewed record active with its review resolved. Tracking failure after tab creation preserves the first-slice recoverable/failure contract; do not claim completed tracking or partial history.
- Single opening retains focused new tabs, inclusion of known-unavailable records, and persistent safe Undo opening. Undo opening restores the reviewed pre-open state; it does not revive a review the user already resolved or erase older events.
- Selected/whole-list opening and batch move/status callers must honor this gate and cannot mark unresolved records watched or silently interpret selection as Keep. Their detailed review grouping, focus, tab-group behavior, and partial-open continuation are owned by the existing opening/organization planning questions, not invented in this capture slice.

### Results, failures, and reopening

Account for **every source occurrence**, including unchecked tabs, without describing all processed inputs as newly saved. Keep the same clickable pills in a scrollable result list. Summaries and rows distinguish:

| Result | Required explanation |
| --- | --- |
| Saved/requeued | Actual destination, including pending review when applicable |
| Existing active exact duplicate | Not added: already saved in the existing destination; existing record safe and unchanged |
| Repeated same-upload reference | Not added: another selected source represents this same upload; point to its shared outcome |
| Pending generic rediscovery | Saved to Inbox; previous-activity review pending, with a clickable review pill |
| Explicitly dismissed | Not added to active lists by choice; retained history, not a failed write |
| Failed/unsupported | Not saved; actionable reason and retry/correction where supported |
| Unchecked | Not processed in this attempt; no implicit claim that an already-saved record disappeared |

Successful candidates can finish while others fail; a batch is not falsely reported as all saved. A failed save cannot lose the prior record or create partial history. A repeated reference to a failed candidate must not claim a saved record exists. Retrying operates only on failed candidates and rechecks current identity/state; it does not repeat successful saves, review decisions, or watch events. Receipt rows update when a review/retry changes their outcome.

Done closes the popup. Reopening begins capture against the actual current tab/window, not the old results screen. Refresh source references from the browser: closed sources disappear, failed/unsaved sources remain available, and already-saved sources still open remain visible with status but unchecked. Preserve the explicit ability to include an unrecognized URL/title candidate. An explicit Last save results control accesses the latest receipt; stale results must not be the default capture screen.

#### Closing source tabs

- Ordinary Save keeps browser tabs open. Offer a separate Close saved source tabs action after durable results.
- A remembered Close this tab after saving preference, initially off, is an explicit opt-in for **current-tab toolbar saving only**. Keep that effect visible in the main Save to Inbox & close tab action; other destination buttons show just their list names, as requested. Window saving remains a separate explicit close action.
- Link/thumbnail capture never closes the page containing the link. It is not the captured source-video tab.
- Only successfully saved/requeued or durably verified Already saved sources are eligible to close. Unchecked, failed, explicitly dismissed, and unresolved prior-activity-review sources remain open. Different-upload similarity suggestions alone are not a mandatory prior-activity gate.
- Track each original source occurrence. Close only that tab if it is still the captured page; do not close a reused tab ID, a navigated replacement, an unrelated active tab, or a newly opened viewing tab. If the source disappeared/changed, keep the saved record and explain why source closing was skipped.
- Closing failure is not a saving failure: the persisted record remains, and the result says the source was not closed. Recovery of Library state does not reopen source tabs.

### Possible duplicates and metadata boundary

- Same underlying upload identity, including recognized URL variants, is an exact duplicate. Identical content uploaded under a new identity is a different upload even if its title/duration are identical. Never merge different uploads based on similarity.
- When metadata supplies evidence, show a Possible duplicate — different upload pill and comparison: candidate/existing title and identity/URL, available duration or other relevant evidence, and prior Library status where known. Mark missing/uncertain evidence honestly.
- Keep separate upload retains the candidate as its own record in the chosen destination and resolves the suggestion. Dismiss new upload retains that candidate as dismissed without changing the existing upload. Neither option rewrites the existing video's placement/history.
- Suggestions may be inspected optionally before saving, staged until Save, or reviewed later through Library/result pills. Late suggestions do not retroactively cancel a save or impose the mandatory watched/dismissed review gate.
- This contract presents evidence; it adds no detector, thresholds, enrichment provider, new credential flow, scraping promise, or retention exemption. Without evidence, capture still works through URL/title fallback. Acquisition, confidence, provenance/lifetime, and supported evidence production remain metadata's responsibility.

### Save correction and recovery

The accepted prototype replaces ambiguous Back after saving with **Undo save & choose again**. It reverses the relevant save/placement/review changes and returns to destination selection, rather than silently creating another save/membership.

Apply the approved recovery contract: preserve the action/correction audit, identity, previous status/placement/order/dates/pending decisions, authored values, and earlier watch history. A fresh save reversal restores the pre-save absence while retaining the correction trail. A retained-record reversal restores that record's prior state. Unchanged active duplicates are not removed by an Undo of this capture. Browser tabs remain as they are.

A capture batch groups its committed mutations as one recoverable action; failed/unchecked/no-op inputs do not acquire invented mutations. Protect later conflicting edits and reject unsafe reversal completely with an explanation. Do not implement the prototype's whole-state in-memory snapshot as production recovery. Broader retained history/selective restoration is governed by the recovery spec and need not all ship in this capture slice.

### Presentation and bounded builder defaults

Accepted UI direction: small toolbar popup; compact optional window preview; B's clickable pill/dialog; simple default Inbox; visible complete source outcomes; stable controls/scroll. **Pill palette A (blue/amber) is provisional**, not a broad theme decision. Use text labels, status symbols, and border treatments as independent cues; never require red/green or color perception to distinguish success, duplicate, review, failure, and unchecked states. Checkbox text/rows are usable targets, and interactive descendants retain their own behavior. The real build must support keyboard activation/focus and readable text.

These bounded defaults carry the settled behavior into implementation planning. They are marked builder guidance rather than additional historical interview answers; they do not choose a storage/framework architecture:

- Persist the latest capture receipt and pending review across reopening/restart, including enough per-source attribution for honest results/retry. Receipt retention beyond the latest is supplied by action history, not an invented separate unlimited receipt UI.
- Popup dismissal must not erase safely accepted save work. Reconcile an interrupted attempt with durable state before retrying; never show a transient optimistic success or blindly replay a completed mutation. Background/transaction representation belongs to the builder.
- A preview targets the URL shown to the user. Never silently replace it with a newly navigated page. A changed/missing source is left alone; save/closing outcomes explain what happened. A deleted/stale destination fails that candidate visibly and permits another choice; never silently fall back to Inbox.
- Optional review is per upload. No mandatory batch wizard or new Keep-all control is added beyond the accepted B dialogs. Import reconciliation and bulk-open review presentation remain with their own decision owners.
- Retry is a new capture mutation for recovery. The immediate correction targets the latest safe capture action; earlier actions remain accessible through the shared History contract. Later conflicting review/edit/restore changes invalidate an unsafe shortcut rather than being overwritten.
- Browser popup teardown after source closure cannot erase the durable receipt/correction route. Reopening or explicit Library/History access supplies the result safely; the mock keeping its panel visible after simulated closure is not a browser-lifecycle promise.
- List creation/management, URL-fixture details, least required permissions, packaging, scheduling, responsiveness, and exact popup dimensions are delivery-plan choices constrained by this observable behavior. Do not turn those into a large foundation prerequisite.

## Testing Decisions

Use the **installed Chrome extension** and observable persisted state/browser tabs. Extend the approved first-slice validation boundary; no separate helper-only seam proves capture. Implementation planning chooses automation, supported/negative URL fixtures, browser permissions, and deterministic failures at the real browser/persistence boundary.

Test the integrated capture UI/browser boundary, persisted Library/identity/pending-review state, and its existing opening/recovery behavior through externally observable workflows. Assert visible outcomes, durable records and actual source/viewing tabs, not component structure, private helpers, internal schemas or the storage engine. The already-approved first-slice installed-browser workflow is the prior art and confirmed user expectation; this specification introduces no new lower-level seam or renewed testing interview. There is no production extension/test suite yet, and the mock's browser inspections do not replace installed-extension validation.

- Exercise current-tab, unopened linked-video/thumbnail, right-click Inbox/shortcuts, and mixed-window capture. Verify popup framing, easy all-to-Inbox, individual overrides, fallback, real persistence, and restart.
- Exercise active/watched/dismissed exact duplicates, repeated occurrences and concurrent saves; assert one record/active destination, preserved active placement/dates, pending Inbox or chosen-list placement, prior details, and no discovery watch events.
- Verify optional pre-save review, leaving review unresolved, cancelling dialogs, Keep/Dismiss and Leave here/open, failure during review/opening, and mandatory opening/edit/move/status gates without interrupting browsing/selection.
- Account for every source and distinguish duplicate/no-op, pending, deliberate dismissal, unsupported/unchecked and real persistence failure. Retry only failures, including interruptions and a source whose underlying record changed meanwhile.
- Verify source closing only after durable success/verification, no linked-page closing, navigated/disappeared sources, tab-close failure, and opt-in preference behavior. Reopen the popup after closing some sources and confirm a fresh remaining-source preview.
- Verify result pills remain clickable and update after review/retry; selection/destination/dialog changes preserve scroll. Inspect pills without color and with the user's own perception, plus keyboard/focus/readability in the real build.
- Undo an immediate save and a partial-success batch, restart, and exercise a later conflicting review/edit. Preserve earlier history/metadata non-rewind; never reopen closed tabs or remove unchanged duplicate records.
- With supplied different-upload evidence, compare/keep/dismiss without modifying the existing upload; demonstrate missing evidence and late suggestions without blocking saving/opening.

The [archived comparison and popup mock](../prototypes/capture-review.md) demonstrate only sample presentation/in-memory transitions. Palette A and B's interaction are accepted as provisional presentation evidence. Simulated tab closure, writes, dates, fixtures and similarity evidence do not prove real integration, provenance/lifetime, identity parsing, concurrency, or production recovery. Source is pinned at [`87a71c60fa667a3e9b453e43bdafa302b40c57a4`](https://github.com/Omriy123/youtube-backlog-tracker/tree/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review); production implementation remains separate.

## Out of Scope

Production implementation, promoting mock code, import parsers/tab-group conversion, automatic similar-content merging or detection, provider enrichment/lifetime decisions, full list/bulk-open UI, general backup/restoration UI, preview-free filtered window capture, mobile/live sync, simultaneous other-browser release, and broad theme design. Palette A remains revisitable.

## Further Notes

### Handoff and scope boundaries

This chosen planning ticket ends at an approved focused behavior contract and source/evidence pointers. It does not select expanded capture as the next delivery milestone or create an unagreed build breakdown. Follow the established [next-slice feedback checkpoint](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) and [remaining-scope roadmap](https://github.com/Omriy123/youtube-backlog-tracker/issues/9): choose actual scope using the first working build, agree vertical workflow tickets/native blockers, then prepare implementation plans. The recovery contract follows the same separation.

Opening consumes the pending-review gate but owns bulk continuation/grouping/failures. Imports consumes identity/review outcomes but owns conversion/group mapping/reconciliation/interruption accounting. Metadata supplies similarity evidence and owns its source/lifetime. Organization owns broader list creation/moves/filtered selection. Recovery owns safe historical reversal; capture records its own mutations and source receipts. Update the existing consumers with this contract instead of creating duplicate decision tickets.

### Decision sources and formalization

- [Identity/destinations/dates](https://github.com/Omriy123/youtube-backlog-tracker/issues/12#issuecomment-6234605386), [historical capture/Q44](https://github.com/Omriy123/youtube-backlog-tracker/issues/14#issuecomment-6234605930), [metadata fallback/provenance](https://github.com/Omriy123/youtube-backlog-tracker/issues/19#issuecomment-6234607201), and [first-slice approval](https://github.com/Omriy123/youtube-backlog-tracker/issues/21#issuecomment-6234607828).
- Live accepted interactions and corrections: [initial controls/opening](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6238806254), [simple toolbar/B correction](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6238996115), [correction/checkbox/duplicate feedback](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6239241601), [optional popup badges and stable scrolling](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6239379850), [complete per-source results](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6239497619), and [latest Inbox/reopening/pill accessibility revision](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6239714361).
- Final live prototype response: keep palette A **for now**; the result is good enough to leave the prototype and continue planning. A fresh builder check of the assembled contract reported **nothing important left**. After confirming that the capture grilling was finished, the user explicitly invoked **to-spec** to create/formalize the specification. This publication synthesizes those settled decisions without another interview or claiming the builder defaults were separate historical answers.
- The to-spec template supplies the problem/solution, extensive user stories, implementation/testing decisions, scope and handoff structure. Its generic delivery-triage instruction does not override this effort's explicit wayfinder-only planning labels; publish the answer on the selected planning ticket and retain its question/type. A delivery breakdown and ready-for-agent implementation tickets still require the existing next-slice agreement.
