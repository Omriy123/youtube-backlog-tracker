# Backlog import, reconciliation, and recovery

Status: approved, 2026-10-19. After the Q1-Q19 exchange and review of this complete written specification, the human answered "good", approving the contract including its marked bounded builder defaults. [Decide import reconciliation, mapping, accounting, and retry behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/29) records the planning resolution. This is planning, not production delivery or an agreed implementation-ticket split.

## Problem Statement

Bring grouped saved links into the Library without losing their supplied boundaries/order, creating duplicate upload records or memberships, hiding previous activity, or requiring blind retries after interruption. A source reference is not necessarily a new video; preview and results must explain the difference.

## Solution

Import one source at a time through a persistent preview. Map its groups to new/existing lists or Inbox, resolve repeated uploads in a per-group table, optionally review watched/dismissed activity using capture's existing behavior, then confirm one coherent and recoverable batch. Preserve actual source lineage separately from the final exclusive placement. Results account for every input and expose the actual persisted outcome.

## User Stories

1. Start Import without changing the Library, or Import here from Inbox, Backlog or a watch list to prefill its preview destination.
2. Choose one supported source acquisition for an import, containing one or several source groups.
3. See named groups propose new same-named watch lists, and unnamed groups propose Inbox.
4. Override each group to an existing destination or a new named list, including when Import here prefilled the current list.
5. See existing exact/similar list-name suggestions with explicit Add to existing list / New list choices and valid editable new names.
6. Select source references, inspect unsupported entries, and deliberately include a usable non-video web link through URL/title fallback.
7. Preserve supplied source boundaries and within-group sequence even when several groups map to one Library destination.
8. See already-active and repeated upload references in an actual Video / Current destination / Incoming destination / Choice table for each incoming group.
9. Leave active videos where they are by default, or explicitly Move here per row or for the shown active-conflict set.
10. See earlier provisional decisions reflected in later groups without performing intermediate Library moves.
11. Inspect prior watched/dismissed details in the same table and optionally stage capture-style review choices.
12. Finish importing without deciding every previous-activity review; the same records remain pending in their final mapped destinations.
13. Keep one upload record and at most one active destination across repeated URLs, groups, earlier imports and existing Library records.
14. Initialize newly created imported lists in surviving source sequence; preserve existing saved Manual relative order when fitting arrivals into existing destinations.
15. Keep unknown titles/dates/channel information honest and preserve original automatic information and authored Personal titles.
16. Confirm the final affected titles, destinations, new lists, statuses and meaningful order effects before saving.
17. Apply the entire confirmed import and its recovery history, or leave the Library unchanged if it cannot be saved safely.
18. Cancel an uncommitted preview without Library mutation, or recover a completed import through Undo import and History after restart.
19. Resume an unfinished preview with saved choices after restart, rechecking current records and destinations before confirmation.
20. Retry an uncommitted failed import without replaying a completed one, changing unrelated records, or duplicating dates/events/lists.
21. See counts for source references and distinct videos, plus every reference's final disposition and destination.
22. Distinguish new saves, rediscoveries, existing moves/no-ops, repeated references, intentional exclusions/dismissals and unsupported inputs.
23. Acquire selected open Chrome groups with readable window context, starting with the current window and allowing other open windows.
24. Import without a YouTube key, metadata lookup, source-tab closing or fabricated watching; use optional enrichment independently under its approved contract.

## Implementation Decisions

### Binding contracts and explicit scope

Use the [product design](video-backlog.md), [feature-map handoff](../design/feature-map.md#basis-for-subsequent-feature-specs), [glossary](../../GLOSSARY.md), relevant [ADRs](../adr/), and approved [capture](expanded-capture.md), [organization](library-organization.md), [opening/history](opening-and-watch-history.md), [recovery](library-recovery.md) and [provider](provider-enrichment.md) contracts. Explicit current approvals outrank historical prototype defaults. This specification owns import acquisition/conversion, mapping, reconciliation, accounting and retry; foundation retains shared upload identity.

Active capture duplicates still stay put. This import's deliberately confirmed Move here choice is an explicit import reconciliation action, not an automatic repeat-save move or another membership. Different uploads remain separate; metadata similarity never merges them automatically. Source references/provenance do not create additional destinations.

**Explicit Q19 import exception:** the human chose Inbox to behave like any other import destination: show X already in Y and offer Leave there / Move here, including an explicitly selected Inbox target. This permits a deliberately confirmed import move of an already-active sorted record into Inbox. Update [ADR 0002](../adr/0002-reserve-inbox-for-initial-review.md) accordingly. It does not authorize an automatic duplicate move, a second membership, or a change to ordinary capture/organization controls. First saved and initial-placement dates remain fixed; only an actual destination change updates latest list-entry.

### Bounded supported paths and loss disclosures

The [format-validation research](https://github.com/Omriy123/youtube-backlog-tracker/blob/2945bc72eb38e6439b792cd51041a303c5f953a6/docs/research/import-format-validation.md) and [source inventory](https://github.com/Omriy123/youtube-backlog-tracker/blob/2f937a3afb46a0b2d05cd10cafa9e9f2e0f86311/docs/research/backlog-import-evidence.md) are evidence, not already-executed production compatibility tests. No installed source versions are known and no version range is certified. The selected contract is bounded as follows; delivery must validate its chosen fixtures/acquisition before claiming support.

| Selected path | Preserve and expose | Explicit limitations |
| --- | --- | --- |
| Session Buddy collection JSON | Observed `collections[] -> folders[] -> links[]` boundaries, names/omissions, supplied title/URL values, nested array sequence and factual optional source fields | One real shape observed; original UI order uncorroborated. Numeric `groupId` without name mapping does not recover named native Chrome groups. No native source history/backup restoration. |
| OneTab shared-page copy text | Ordered `URL | title` lines; the first separator identifies the URL/title boundary and later literal separators remain part of the title; supported blank-line group boundaries stay visible | Names/upstream title history are absent. One real shared group and a reproduced copy transformation, not native export or actual clipboard execution. Multiple groups need targeted validation. Embedded line breaks/unescaped ambiguous boundaries are outside the supported grammar; disclose potential source-conversion loss rather than promising reconstruction or perfect detection. |
| Live Chrome groups | Selected open groups, titles when available, member URLs/titles, window/group context and member tab-index order | Browser integration is unexecuted. Missing permissions/fields and concurrent source changes require validation. No direct closed/saved catalog, browser importance order or portable group-ID claim. Reopen a saved group in Chrome first if desired, then use live acquisition. |

For Session Buddy, each folder is a source group under its collection context; equal names do not merge distinct boundaries. Preserve source omissions separately from an empty source title or an edited/generated preview label. Additional compatible unknown fields must not be presented as restored source application state. Reject an unsupported top-level/structural variant instead of opportunistically calling backup extraction complete compatibility. Legacy/native-backup variants require a separate explicit support decision.

OneTab is a deliberately chosen copy-text input; no silent URL scraping, private share-page request, HTML ingestion or native-export guess is added. A blank/absent link title can use URL fallback when its reference boundary is otherwise unambiguous. Do not claim detection of every ambiguity the lossy source has already introduced.

Chrome starts with groups in the current window and allows selecting groups from other open windows. Preserve left-to-right member order within each group. Show window context and the exact proposed group processing order. **Bounded builder default:** order groups within a window by first member tab position, show the current window first and use a stable displayed sequence for other windows; do not describe that cross-window presentation as source importance. No user-controlled group-reordering feature is required by this decision. Ungrouped-window capture remains capture-owned.

Acquire a coherent-enough source snapshot for preview or explain/retry incomplete acquisition; never invent missing URLs or silently certify a partial group as complete. Detectable source membership/navigation changes during acquisition require refresh before treating that acquisition as complete. Once acquired, preview refers to that source snapshot and actual observation time. Later browser-tab changes do not silently rewrite it or authorize closing/navigating tabs. Explicitly refreshing acquisition shows changed input and revalidates choices. Native group colors/collapsed state and source-application presentation are not reproduced as Library list properties; names, selected membership, order and factual context are the bounded conversion contract.

### Entry points, source selection and group mapping

One import preview uses one Session Buddy file, one OneTab paste, or one selected live-Chrome-group acquisition. Another source starts another import and reconciles against current Library state. Do not require combining source types into one batch.

Import and Import here open preview only. Normal Import proposes New list with the supplied name for a named group; an unnamed group proposes Inbox. Import here prefills the currently viewed list for all groups and retains per-group override controls; no save, list creation or implicit review resolution occurs on entry.

Each group can target an existing destination or a newly named watch list. Show exact/similar existing-name suggestions with explicit Add to existing list / New list options. New list remains initially chosen for named groups. A real name collision proposes an editable distinct name such as Courses (2). Apply organization's nonempty, case/whitespace-insensitive unique naming rules, including permanent names. Similarity is a suggestion only; its conservative matching/ranking is builder-owned and never changes destination identity. A rename preserves list identity and must not cause name-only reassignment.

**Bounded builder defaults:** distinguish unnamed groups with source ordinals/context rather than fabricating recovered names; allow another group to select an already proposed new target explicitly; equal proposed names alone never merge targets. Append newly created lists at the end of saved watch-list importance in displayed creation order, leaving existing importance unchanged. Import here does not change importance or temporary overview sorts.

Do not create a group-derived empty list by default when all its references are excluded, already saved elsewhere, deliberately dismissed or ultimately assigned elsewhere. Explicit empty-group list creation is available by deliberate choice. Mapping and final confirmation show which new lists will actually exist.

Recognized video references initially start selected. Other usable HTTP(S) web links start unchecked and may be included explicitly using shared URL/title fallback. Do not identify an upload from an arbitrary thumbnail asset or silently normalize different uploads by metadata. Malformed, browser-internal and structurally unusable entries receive actionable unsupported outcomes. A known unavailable video remains eligible; reachability/enrichment is not a save prerequisite.

**Bounded builder default:** a malformed overall source prevents trusted preview/commit; an individually identifiable bad reference remains visible and excluded with its reason, while valid selected references can proceed. Selected entries without a valid destination/name or unresolved required movement review must be corrected or explicitly excluded. Never silently discard selected input. Count trustworthy parsed references only; a failed source parse must not invent an exact total from unknown boundaries.

### Reconciliation tables and final exclusive placement

Process source groups in their shown sequence. Each group's table exposes title/URL fallback, source context, current actual/provisional destination, incoming mapped destination, selection, relevant clickable pills and the explicit choice. Several references to one upload share one Library identity and prior-activity review; every occurrence remains traceable.

| Encounter | Initial behavior | Deliberate choices |
| --- | --- | --- |
| New upload | Proposed mapped placement | Change source selection/mapping; final placement remains exclusive |
| Active in a different destination before import | Leave there, retaining position/dates/pending state | Move here explicitly; Leave all there / Move all here apply to the shown eligible active-conflict rows |
| Provisionally assigned by an earlier source group | Leave there by default; show the earlier proposed destination | Move here changes final proposed placement, not live Library state |
| Already in intended destination | Already here; preserve actual position/dates | No fabricated conflict, duplicate record or implicit re-entry |
| Retained watched/dismissed record | Requeue the same record in the mapped destination with capture-style pending review | Optional staged Keep in Inbox / Leave here or Dismiss, with prior details |

The human rejected automatic first-occurrence-wins as sufficient reconciliation and approved explicit per-group tables, including already-active pre-import records. Controls act on the explicit displayed affected set; changing selection must not invisibly enlarge a confirmed bulk choice. Mixed watched/dismissed rows are not silently included in an active-row Move all here or treated as acknowledged by that command.

Later groups reflect earlier provisional choices. If a new upload first proposes Courses and later Move here chooses Weekend, save it directly in Weekend. Retain both source references without inventing an intermediate Courses placement/date/history event. If the upload was actually in Courses before the import, record the real final Courses-to-Weekend change. Changing earlier mapping/selection invalidates downstream choices whose prerequisites changed; retain compatible choices, explain affected rows and require final confirmation of the recomputed result.

### Capture-style rediscovery, pending review and dates

Previously watched/dismissed records show actual prior status, destination/activity dates and watch details in the same table, using capture's clickable pills/dialogs. Import into Inbox uses Dismiss / Keep in Inbox; an explicit list uses Dismiss / Leave here. Ignoring the badge does not block initial requeue: the same record becomes active in its final destination with review pending. Optional preview choices remain staged until import confirmation. No import review action opens a tab; subsequent opening follows the approved opening gate and explicit actions.

**Bounded builder defaults applying capture's shared per-upload review:** keep review choices shared across repeated references; a staged Dismiss applies to that upload throughout this import until explicitly changed. A later repeated reference must not silently revive it. A changed final destination invalidates an incompatible staged Leave here choice and returns that choice to pending rather than acknowledging another destination. Already-active pending repeats preserve their pending state; a deliberate move of such a pre-existing record requires explicit resolution of its movement gate or exclusion/Leave there. Browsing/selection alone never acknowledges review.

Keep first saved and original first Inbox-exit for existing records. Actual final requeue/move updates latest list-entry once at the durable action time; same-destination/no-op repeats change no placement dates. First saves directly to Backlog/watch lists set all three dates together; first Inbox saves leave first Inbox-exit unknown. Clearing pending review without re-entry does not set another list-entry date. Import/review/retry does not create watch events or erase earlier events.

### Final order, supplied titles and enrichment

For a newly created imported list, initialize saved Manual from surviving source sequence after selection and reconciliation, not publication date. **Bounded builder default:** for each finally placed upload use its earliest selected occurrence among groups proposing that final target, then keep the displayed group/within-group sequence and suppress later same-target occurrences. Thus an upload ultimately moved to Weekend appears at its source position in Weekend, rather than retaining a position in Courses. If several groups explicitly share one new target, concatenate their shown sequence and deduplicate by upload. Metadata arriving later never rewrites that Manual arrangement.

For destinations that existed before this import, use the complete approved [organization arrival-fitting rule](library-organization.md#move-preview-and-destination-arrival-order): remove outgoing records first; preserve surviving saved Manual relative order; fit known-date arrivals by remembered publication direction; unknown dates append; equal/unknown incoming ties follow source-preview order. Already-in-target/Leave there rows keep positions/dates. Do not apply date fitting to the initial creation of a new imported list. Temporary displayed sorting remains separate from saved Manual.

Preserve every accepted source observation with actual import format/context/observation time and unknown upstream facts where absent. Supplied titles, including edited-looking text or documented optional original-title fields, do not automatically become authored Personal titles or confirmed browser/API observations. Exact duplicates do not reset existing original information, authored values or valid current provider information. Differing supplied titles remain attributable import observations, not proof of chronological title changes or YouTube's current title. Use the approved provider contract for displayed title precedence and retained historical search.

Import works without a key. Enqueue optional supported YouTube enrichment after durable import when permitted; respect global automatic-off, per-video pauses, existing freshness and independent acquisition failures. Do not make lookup success part of import success. Never change placement/user dates, invent a new observation age, or rewind saved Manual from enrichment.

### Confirmation, cancellation, persistence and recovery

Show the final selected/unique affected set, actual versus final destinations, new lists and names, retained/pending/dismissed effects and meaningful order changes. Confirm explicitly. An old preview cannot overwrite newer relevant Library decisions: revalidate affected identity/status/placement/order/targets and names before commit, refresh changed effects, and obtain renewed confirmation. Unrelated changes do not interrupt; provider-only changes do not invalidate placement unless they materially change a proposed order effect. Preserve compatible choices and never choose a missing destination fallback silently.

Before a mutating import, durably create the required recovery safety snapshot with no invented size threshold. If this or required action history cannot be saved, stop with the prior Library intact. Apply all confirmed list/membership/status/review/date/order/provenance user changes and their recovery information as one coherent batch or apply none, including after interruption/restart. A failed final save must not leave empty orphan lists, partial history, duplicate dates or a subset of imported videos. Storage/schema/transaction/operation identifiers remain delivery-plan choices.

Cancel/discard before commit leaves the Library unchanged. **Bounded builder default:** once the coherent commit has started, report finishing/checking its outcome rather than promise a late cancellation that could leave partial state. After success offer Undo import and retain it in History across restart. Reverse actual changes together, including new lists and prior placement/order/review state; preserve unrelated later decisions and current automatic metadata under recovery. Conflicting later edits block that selected reversal with explanation and no partial undo. Recovery does not reopen/close source tabs.

An informational no-op receipt must not pretend it created new videos or placement history. **Bounded builder default:** if no recoverable Library user changes occur, show Nothing changed and no fabricated Undo action; preserve the source accounting/observations under their factual provenance contracts. The safety-snapshot obligation applies to mutating imports, not an unchanged preview/no-op.

### Durable previews, restart and retry

Preserve unfinished source snapshot/normalized references, mapping/selection/reconciliation choices and meaningful progress locally across popup/page closure and browser restart. Offer Resume preview / Discard, never automatic commit. Do not silently reread a changed file/clipboard/live browser source as the old input. Refreshing source is explicit and revalidates dependent choices. Do not require keeping the original browser tabs open to resume acquired input.

Reconcile durable operation outcome before any replay. Known completed imports show their existing receipt; known uncommitted failures retain useful choices and may retry the uncommitted batch after revalidation. If storage is unreadable or outcome cannot yet be established, explain that checking is incomplete and prevent blind re-import as a retry. The durable all-or-none contract still requires eventual recovery to one coherent result, not guessed success or a partial mixture. Reattempting does not replay successful review decisions/watch events or reset original observations/user dates. A deliberately started new import is a new preview reconciled against current state, not an implicit resume.

**Bounded builder defaults:** preserve operation progress/receipt coherently enough to distinguish committed from uncommitted after restart; allow resuming and discarding each discoverable unfinished preview rather than silently replacing it; completed mutating-import receipts remain reachable from their retained History action. Local uncommitted previews are not committed Library state and are not a new cross-installation draft-sync/backup requirement. Do not persist credentials or depend on unvalidated native source-application IDs as Library identity.

### Results and input accounting

Show both source-reference counts and distinct selected-upload counts. Every source reference gets a row containing source group/context, final destination/status and an explanation. Distinct-upload outcomes count a new/requeued/moved/unchanged/dismissed upload once, with pending review as a visible attribute. Additional selected occurrences link to that upload's shared final outcome and are explicitly repeated references, never additional saves. Excluded/unsupported input is not counted as a saved upload. Never label the whole source saved when only a selected subset was eligible.

| Reference outcome | Required explanation |
| --- | --- |
| Newly saved | One new upload record, final destination; direct first-save dates are actual commit time |
| Returned watched/dismissed record | Same retained record, final destination and resolved/pending review; no new watch event |
| Existing record moved | Actual old/final destinations; deliberate confirmed move |
| Existing record left/already here | Preserved actual destination/order/dates/pending state |
| Additional same-upload reference | Shared record/outcome and source occurrence; not another save or move |
| Explicitly dismissed | Deliberate retained-only result, not failed persistence |
| Unchecked/excluded | Not processed; never imply an existing Library record disappeared |
| Unsupported/bad source entry | Actionable reason and correction/exclusion path; not hidden in a success count |
| Commit failed/uncommitted or checking outcome | No false saved claim; explain retry/check state without labeling a repeated reference successful |

Example: Courses has A and already-saved B; Weekend has A again and previously watched C. Choosing A's final destination as Weekend, leaving B in Research and requeueing C pending yields 4 source references / 3 distinct videos: 1 new A, 1 unchanged B, 1 returned C, plus 1 additional repeated occurrence of A. Both A rows point to the same final Weekend record. Do not count its provisional change as an actual intermediate move.

Expose the same clickable prior-activity and result pills as capture, with readable text/symbol cues independent of color. A reference to a shared failed operation must not claim its upload was saved. Source-only invalid lines that cannot be identified as trusted references need their own parse diagnostics, not fabricated exact upload counts. **Bounded builder default:** retain the actual at-import receipt while its linked review pill reflects current review state; later review resolution must not falsely rewrite what the original import committed.

Receipts/source observations follow the approved metadata backup inclusion rules: automatic source titles/history cannot survive an exclusion hidden in receipts, recovery labels, indexes or embedded snapshots. Retain structural lineage/URLs and user-state recovery without falsely reclassifying automatic text as authored values. Ordinary Library backup upload remains recovery, not this import parser; Session Buddy backups are not Library backups.

### Builder-owned mechanics

Exact control placement, conservative name-suggestion ranking, default diagnostic phrasing, accessibility implementation, responsive layout, acquisition permissions/packaging, schema/storage, encoding/resource guards, deterministic fault injection, migration and runner choices belong to delivery plans. Defaults explicitly marked here were included in the approved complete contract; they are builder guidance rather than separately quoted historical answers. They must preserve keyboard-operable tables/choices, stable selection/scroll, readable context, reachable actions across window sizes and the approved Chrome-first browser adaptation boundary.

## Testing Decisions

Use the existing real installed-extension/browser-persistence workflow as the primary validation boundary. No new lower-level seam, framework or numeric performance budget is selected by this specification. Small focused fixtures are preferred for routine correctness. The supplied source examples are not the owner's intended actual import backlog; they may be used for testing, with private raw material staying ignored/local and publication limited to approved sanitized evidence.

Validate the selected source contract before claiming support: bounded Session Buddy structure/optional and missing names/titles; OneTab first-separator preservation (including real literal-separator cases), explicit group boundaries and unsupported ambiguity; Chrome actual member ordering, multiwindow context, missing permissions/fields and concurrent source changes. Use targeted fixtures for multiple groups, repeated/equal names, empty groups, Unicode/quotes/newlines and invalid URLs without asserting that synthetic cases prove installed-export compatibility.

Exercise through observable persisted Library/history and actual source/browser state:

1. Import versus Import here are preview-only; named/unnamed defaults, mapping overrides, exact/similar names, shared proposed targets, empty/no-op cases and list importance.
2. Repeats within/across groups and prior Library records; table defaults/all-row scopes, final placement changes, every occurrence and distinct-upload accounting; canonical upload identity versus distinct similar uploads.
3. Watched/dismissed and already-pending records, ignored/staged/shared reviews, explicit Dismiss, changed destinations, no watch events and preserved prior history/user dates.
4. New-list surviving source order versus existing date-fitting Manual, unknown/equal/reversed dates, real versus provisional moves, outgoing records first, swaps and enrichment arriving independently.
5. Relevant stale decisions/renames/deleted targets versus unrelated changes; correct refresh and confirmation without silent fallbacks or source rereads.
6. Cancel/discard, closed UI/restart/resume, snapshot failure, deterministic persistence failure/interruption before/during/after commit, uncertain read-back, retry and completed-operation rediscovery. Assert all-or-none state/history and no orphan list/event/date duplication.
7. Undo import and retained History recovery after restart, new-list reversal, later conflicting/unrelated edits and existing provider non-rewind rules.
8. URL/title fallback with enrichment absent/off/paused/failing, factual imported title histories, backup automatic-field exclusion across receipts/derived copies and separate full-Library restoration.

Also perform representative-scale end-to-end validation with recorded workload distribution, hardware/viewports and measured preview/reconciliation/commit/resume/recovery usability. The observed 678 Session Buddy and 407 OneTab references are examples, not approved import capacity targets or counts of eligible videos. Existing organization fixtures (approximately 1,000 active records/100 channels and rounded 3,000 total/up-to-550 channels) may inform existing-Library integration, not an invented import-size promise. Obtain/record a representative real workload at delivery before broader capacity claims; no 10,000-record requirement or universal latency guarantee is imported.

## Out of Scope

- Production parsers, browser integration, storage/framework selection, shipping, a chosen next delivery slice or implementation-ticket agreement in this planning session.
- Session Buddy CSV/text/HTML, native/legacy/complete backups, native OneTab exports, share-page HTML ingestion, generic CSV/bookmarks/manual grouped-format expansion and direct closed/saved Chrome-group enumeration.
- Claims of complete native application state recovery, installed-version compatibility ranges, source UI order where unobserved, recovered names/upstream title age where missing, or lossless conversion of ambiguous OneTab text.
- Combining source types into one import, a global saved cross-window/group importance order, automatic source-tab closing, tab reopening by Undo import, playback verification or metadata-based upload merging.
- Revising ordinary capture's active-duplicate default or bypassing pending-review, exclusive membership, authored-title/provenance, metadata backup inclusion or recovery safeguards.
- Real-use metadata/recovery retention review decisions already owned by their separate follow-ups, automatic data pruning, multi-installation synchronization, public/mobile expansion and unrelated theme work.

## Further Notes

### Decision provenance and approval

The live exchange accepted bounded paths (Q1), group mapping (Q2 with later unnamed-to-Inbox correction), explicit reconciliation in place of first-occurrence-wins (Q3, Q9, Q10), existing arrival fitting (Q4), selection/fallback (Q5), all-or-none recoverable commit (Q6), capture-style previous-activity review (Q7/Q11 clarification), small-fixture preference and no invented import target (Q8 clarification), preview-only Import here (Q12), explicit name suggestions (Q13), final-only provisional placement (Q14), one source per import (Q15), current/other open-window groups (Q16), separate source-reference/unique-video accounting (Q17), durable preview/resume/retry (Q18), and explicit import movement into Inbox like any other destination (Q19).

The [planning checkpoint](https://github.com/Omriy123/youtube-backlog-tracker/issues/29#issuecomment-6268889953) records the earlier accepted direction. Later live answers and explicit corrections supersede its then-open items. A fresh builder check found no material questions beyond the then-open Inbox boundary; the human answered that boundary explicitly with the Q19 exception above. A follow-up consistency check found no material findings. The human then reviewed the complete specification, was explicitly asked to approve its marked bounded builder defaults, and answered "good". That approves this full written contract; it neither selects the next shipment nor approves implementation tickets or completed browser/parser compatibility.

### Delivery handoff

Hand the approved contract to [Track remaining product scope after the first usable slice](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) and [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32). Agree vertical workflow tickets/native prerequisites at that checkpoint; do not treat this area contract as one pre-approved build ticket. Acquisition/parser, preview/reconciliation and coherent commit/resume/recovery are behavior areas to carry into that discussion, not an agreed horizontal delivery split. Keep source-evidence limits distinct from product choices and actual installed-browser validation.
