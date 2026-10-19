# Bulk opening and watched/dismissed history

Design status: **settled contract formalized on 2026-10-18 through the user-invoked to-spec handoff**, after completed Q1–Q8 discussion, accepted prototype feedback and a fresh builder check. This is a bounded planning contract, not production implementation, a delivery breakdown, or a decision to ship this scope next.

Planning question: [Specify bulk opening failures and watched-history controls](https://github.com/Omriy123/youtube-backlog-tracker/issues/26). Parent: [approved product design](video-backlog.md). Apply the [first-slice contract](first-end-to-end-slice.md), [expanded capture contract](expanded-capture.md), [shared recovery contract](library-recovery.md), [feature ownership](../design/feature-map.md), and [glossary](../../GLOSSARY.md).

## Problem Statement

The user wants to open selected videos or a whole list together without losing their saved records or having to reconstruct which tabs opened. Pending rediscovery reviews must be resolved before opening if those videos are to join the same ordered group. Failed openings, failed grouping, and a tab whose watched update could not be saved have different recovery needs.

Explicit watched/dismissed controls and repeated-watch details must also make retained history useful without leaving completed videos in ordinary active lists. Opening records an action, not verified playback.

## Solution

Extend the real save/find/open/recover path with named bulk tab groups, review-before-opening, per-record results, ordered retry into the same group, explicit status and repeat-watch actions, and a complete per-video information popup. Keep the Library focused for bulk opening. Successful tab creation remains the watched trigger, including for known-unavailable videos.

The scope can be delivered through several later vertical workflows. It does not require imports, provider enrichment, broader browsing, or every recovery screen to ship together. Choose delivery scope and agree workflow tickets at the existing working-build checkpoint.

## User Stories

1. As a Library user, I want Open selected to show the exact affected videos, so that selections outside the current view are not silently omitted.
2. As a Library user, I want the opening request to show source destinations, so that a mixed-list selection is understandable.
3. As a Library user, I want Open entire list to include active records hidden by filters, so that its full-list scope is reliable.
4. As a Library user, I want the actual requested count displayed, so that I know how many videos the action affects.
5. As a Library user, I want each record targeted once, so that repeated references do not accidentally create duplicate openings.
6. As a Library user, I want to name the tab group with Selected videos as the default, so that the opened collection is identifiable.
7. As a Library user, I want the final requested order shown before opening, so that the tabs match the sequence I confirm.
8. As a Library user, I want bulk opening to keep the Library focused, so that I can inspect progress and results.
9. As a Library user, I want an explicit Go to opened tabs action, so that I decide when to switch away from the Library.
10. As a Library user, I want unrelated/source tabs and groups preserved, so that opening does not disrupt other browsing.
11. As a Library user, I want single-video opening to keep its focused new-tab behavior, so that the established quick-open workflow stays predictable.
12. As a Library user, I want the notice above ten included tabs before confirmation, so that a large opening is deliberate.
13. As a Library user, I want known-unavailable videos included, so that I can still open their saved pages explicitly.
14. As a Library user, I want playback left unverified, so that watched accurately describes the tracker action rather than claiming completion.
15. As a Library user, I want pending previous-activity reviews handled before initial tab creation, so that reviewed videos can join the same ordered group.
16. As a Library user, I want to inspect all available prior activity during review, so that keeping or dismissing a rediscovered video is informed.
17. As a Library user, I want Keep in Inbox or Leave here to resolve review without opening, so that final group confirmation remains deliberate.
18. As a Library user, I want Dismiss during review to exclude the video and preserve history, so that declining it does not erase my record.
19. As a Library user, I want Leave in review for now, so that I can exclude an unresolved video without deciding its future.
20. As a Library user, I want final included/excluded titles and counts, so that the resulting group matches my review choices.
21. As a Library user, I want cancelling the opening to create no tabs, so that preparing a request has no unintended browser effect.
22. As a Library user, I want confirmed review decisions retained after cancellation, so that opening cancellation does not erase deliberate choices.
23. As a Library user, I want completed openings removed from active lists, so that my watch queue reflects what remains to handle.
24. As a Library user, I want successfully opened videos retained in history, so that their previous placements and events remain recoverable.
25. As a Library user, I want failed tab creations to preserve active placement without adding events, so that an unsuccessful opening does not lose a video.
26. As a Library user, I want partial failures reported per video, so that successful openings are not confused with unsuccessful ones.
27. As a Library user, I want an opened tab whose watched update was not saved labelled clearly, so that browser success is not mistaken for a completed Library change.
28. As a Library user, I want retrying the watched write to create no additional tab or event, so that recovering persistence does not duplicate watching.
29. As a Library user, I want failed tab creation retried into the original named group, so that retries do not scatter the collection into another group.
30. As a Library user, I want retried tabs inserted at their requested relative positions, so that a partial failure does not change the intended sequence.
31. As a Library user, I want grouping-only repair to use already-open viewing tabs, so that a grouping error does not create duplicate tabs.
32. As a Library user, I want to approve recreation of a missing group using its previous name, so that missing browser state is not replaced silently.
33. As a Library user, I want deliberately closed successful tabs left closed, so that retry respects later browser decisions.
34. As a Library user, I want uncertain interrupted outcomes explained, so that I can recover without automatic duplicate opening or invented history.
35. As a Library user, I want to inspect tabs or explicitly open/mark watched after an unknown outcome, so that the recovery choice is mine.
36. As a Library user, I want Mark watched without opening, so that watching elsewhere can update the Library.
37. As a Library user, I want Dismiss without a watch event, so that declining a video is distinct from handling it for viewing.
38. As a Library user, I want individual and selected status controls, so that several videos can be handled together.
39. As a Library user, I want status actions to respect pending review, so that selection never silently means Keep.
40. As a Library user, I want completed status actions removed from ordinary active views, so that retained records do not clutter active lists.
41. As a Library user, I want Open again in retained history, so that a deliberate repeat opening creates another event while preserving previous ones.
42. As a Library user, I want Record another watch without a tab, so that a repeat watch elsewhere can be recorded explicitly.
43. As a Library user, I want a successfully repeated watch of a dismissed record to mark it watched outside active lists, so that current status matches the new decision without requeueing it.
44. As a Library user, I want first-save and placement dates preserved unless placement actually changes, so that repeat watching does not rewrite organization history.
45. As a Library user, I want one retained-video row with watch count and latest time, so that repeated events remain easy to browse.
46. As a Library user, I want all retained watch events with source/time/context in the popup, so that I can understand repeated activity.
47. As a Library user, I want dismissal and correction details available separately, so that status changes do not hide earlier watches.
48. As a Library user, I want all available video information in the popup, so that titles, metadata, dates, destinations and history can be inspected together.
49. As a Library user, I want missing or expired metadata shown honestly, so that unknown information does not erase my saved link or fabricate facts.
50. As a Library user, I want readable keyboard-accessible controls and non-color status cues, so that results and history remain understandable.
51. As a Library user, I want safe batch recovery preserving prior state and newer decisions, so that correcting one action does not overwrite unrelated work.
52. As a Library user, I want Undo to leave browser tabs alone and preserve older events, so that Library recovery has no unexpected browser side effects.
53. As a Library user, I want progress/results recoverable across reopening and restart, so that interrupted work does not become blind replay.
54. As a Library user, I want the actual installed extension validated with browser tabs and persisted records, so that simulator behavior is not treated as proof of the real workflow.

## Implementation Decisions

### Request scope and order

- **Open selected** consumes the explicit record set supplied by browsing/selection controls. Preserve selection across browsing as agreed by the organization feature; never silently reduce the request to only currently visible rows. Show the actual affected titles, source destinations, count, and order before grouped opening.
- **Open entire list** targets the list's active contents, including records hidden by text/channel filters and pending-review records. Show the full count. Retained watched/dismissed records outside active membership are not silently included.
- Organization owns selection scopes and how its current view supplies the initial ordered set, including temporary filtered order and mixed-source selections. Opening owns preserving the exact order shown in its confirmed request. It does not turn a temporary view arrangement into saved Manual order or decide the still-live organization ticket's cross-source ordering algorithm.
- Repeated references to the same saved record produce one target in an opening request. Preserve the one-record/one-active-destination invariant.
- Known-unavailable records remain eligible. Tab creation, not successful playback, determines the opening outcome. A failed browser or storage action does not establish provider unavailability.

### Named groups and focus

- A multi-video opening request prompts for a tab-group name, default **Selected videos**, for both selected and whole-list requests. The user may change it before opening. Create one group for that confirmed request.
- The naming/review step is preparation: no viewing tabs are created until explicit final Open. Cancelling creates no tabs. Already confirmed review decisions remain saved as their own user choices.
- Keep focus on the Library for grouped opening; offer an explicit **Go to opened tabs** action. Do not successively focus each created tab.
- Preserve existing/source tabs and unrelated groups. Ordinary opening creates new viewing tabs; it does not deduplicate them against other already-open tabs, reuse source tabs, or close them.
- A genuine single-video request retains the settled focused new-tab behavior, without a group/name prompt. If a multi-video request is reduced by review to one included video, retain its explicitly prepared group/name rather than silently changing the confirmed workflow. If none remain, create no tabs or empty group.
- Before confirming an opening of more than ten included videos, show the actual tab count and the established notice that many tabs will open and the operation may take time. Leaving records in review changes the included count; do not omit the notice when it is still above ten.

### Review before opening

- Reuse capture's pending-review state, prior-activity details, and clickable review dialogs. Generic rediscoveries are already active in Inbox; explicit shortcuts retain their chosen destination. Opening does not change these placement rules.
- If any requested records need review, pause the entire initial opening before creating tabs. Resolve each relevant review, or explicitly choose **Leave in review for now** to exclude that record from this opening. Selection is never Keep/Leave here.
- Generic review keeps **Dismiss / Keep in Inbox**. Destination review keeps **Dismiss / Leave here**. Keep/Leave here clears pending review without opening or inventing another list entry/date. Dismiss records the deliberate dismissal, retains history, and excludes that record from opening.
- In the group workflow, review returns to the ordered request and the final group Open. Do not launch a separate single tab from an intermediate review choice. The independently approved standalone destination action **Leave here & open** remains available in its single-video context.
- After reviewing, show the included/excluded titles and final order, group name, count and applicable many-tabs notice. Final explicit Open starts the grouped operation. Included, reviewed videos keep their positions relative to the other included videos.
- Records explicitly left in review remain active and flagged, unopened and outside this group. Reviewing/opening them later is a separate deliberate opening; do not silently append them to a completed group.
- Closing an individual review without choosing leaves it pending. Failed review persistence preserves the previous saved state/flag and prevents that record becoming eligible through an optimistic UI result.
- Undo opening restores the reviewed pre-open state, rather than reviving a review already resolved before opening. Review and opening remain distinguishable user actions.

### Results, failures and retries

Provide persistent, discoverable operation results with per-record titles/outcomes and an accurate summary. Distinguish:

| Outcome | Library/history effect | Recovery action |
| --- | --- | --- |
| Tab created; watched update saved | Mark watched, remove active membership, add one watch event coherently | Normal safe Undo opening/History recovery |
| Tab creation failed | Preserve prior active record/placement; no new watch event | Retry only failed tab creations |
| Tab created; Library update not saved | Preserve a recoverable record; explain that the tab exists but watched status/history is incomplete | Retry the Library write without another tab or duplicate event |
| Left in review | Preserve active pending record; no new tab/event | Review later, then explicitly open separately |
| Dismissed during review | Retain dismissed record/history outside active lists; no new tab/event | Shared recovery of that dismissal |
| Grouping failed | Keep actual created tabs and their independently successful watched updates; explain that grouping is incomplete | Retry grouping without recreating viewing tabs |
| Opening outcome unknown after interruption | Preserve recoverable record and known evidence; do not claim success/failure or invent an event | Inspect tabs or explicitly choose Open again / Mark watched |

- Continue processing the confirmed eligible request when an individual tab creation fails. A partial opening must not be reported as complete success, and successful tabs are not closed as rollback.
- Watched status, membership removal, new watch event and recovery information persist coherently. A storage failure must not leave partial status/history or falsely remove the only recoverable record. Explain **Tab open — Library update not saved** instead of the unclear generic “tracking failed.”
- A failed watched write is an exception to completed active-row removal: keep the incomplete operation/record visibly recoverable until it is resolved. No action should appear durably successful merely because a tab exists or a popup temporarily changed.
- Retrying tab creation affects only known failed openings. Revalidate the record and insert the newly created tabs into the original group at the original requested relative positions. Do not create a new **Retry failed opening** group.
- If the original group is gone, ask before recreating it using its previous name. Collect still-open viewing tabs from that request and include newly successful retries in the original relative order. Never reopen earlier successful tabs that the user deliberately closed. Grouping-only repair creates no tabs and no watch events.
- Preserve unrelated browser tabs/groups. Verify that tabs attributed to the request are still the relevant viewing tabs before regrouping; a reused identifier or navigated unrelated page is not permission to move it.
- Retrying a watched write uses known tab-creation evidence for that attempt and adds its event only once. A match on URL alone is not proof that this operation created a particular tab.
- After interruption/restart, distinguish known completed, known failed, known opened-but-unsaved, and uncertain attempts. Reconcile durable progress before any retry. Unknown outcomes require an explicit user choice; no blind replay.
- For an uncertain outcome, inspecting tabs does not itself fabricate a watch event. An explicit new opening creates a new known attempt and may create a duplicate tab; explain that uncertainty before the user chooses it. Explicit Mark watched records that manual action without inventing an earlier opening time.

### Explicit status and repeat watches

- Active rows and explicit selected sets offer **Mark watched** and **Dismiss**. Completed status changes remove affected records from ordinary active Library/list/channel/search results. The records remain in retained history; this is not permanent deletion.
- Mark watched creates one watch event per affected video without opening a tab. Dismiss creates no watch event and preserves earlier watch events, along with the new dismissal fact/time and prior destination.
- Pending review gates Mark watched as it gates opening. Use the same review-before-action or explicit-exclusion principle; never infer Keep from selection. Explicit Dismiss can itself resolve the pending dismissal decision without a second redundant dismissal prompt.
- Retained watched/dismissed browsing offers **Open again** and **Record another watch**. Open again creates a new focused viewing tab for a single record and adds one event after tab creation. Record another watch creates one explicit manual event without a tab. Neither action queues the video into an active list.
- After either repeat-watch action succeeds, the retained record is watched, including when previously dismissed. Keep earlier watch/dismissal facts. Rediscovery alone still creates no watch event.
- Ordinary active Mark watched must not silently become another-watch recording merely because a stale request now targets a retained record. Revalidate it and use the explicit retained action if another event is intended.
- Preserve first saved and original first Inbox-exit dates. Removing active membership or recording another retained watch does not invent a new list entry. Capture's deliberate requeueing continues to own actual latest list-entry changes.
- Record the action source and time honestly: opening events describe successful tab creation, manual events describe the explicit marking action. Neither establishes when playback occurred or completed. A delayed save does not replace an established original tab-creation time with an invented viewing time.

### Complete information popup

- Show one row per retained video, with current status, watch count and latest watch time. Expand via the established clickable detail/review presentation into a readable, scrollable popup.
- Include all available record information: personal/display/automatic titles and saved link; channel, thumbnail, duration, publication date and full description where usable; availability observation with known source/check time; current destination/status/pending decision; first-save/Inbox-exit/latest list-entry dates; previous destinations; watch and dismissal information; and relevant action/correction history.
- Show all retained watch events newest first, including known time, **Opened from Library** versus **Marked watched**, and the historical destination/context where known. Distinguish current placement from an earlier destination. Show dismissal details separately; dismissal does not erase watches.
- Reversed watch events do not contribute to the current count/latest-watch summary, but their correction remains discoverable in the action audit. Preserve earlier unaffected events.
- “All available” does not authorize new provider acquisition, raw provider-payload copying, new analytics, or stale metadata revival. Respect provenance and latest-valid-or-missing metadata throughout history/recovery. Unknown historical fields remain unknown; absence is not a fabricated zero-duration/date/source.
- The later [approved enrichment/history contract](provider-enrichment.md) owns retrieved Original / Latest / History values, all retained title/description/image versions, honest check evidence and reversible clearing. Consume those views within the information dialog without adding a playback/deletion classifier or changing tab-creation watched semantics. Retained metadata history is not a rollback of current automatic values or an additional watch event.
- Use readable text, keyboard-accessible controls, and labels/symbols independent of color. Keep this aligned with capture's accepted pill/dialog direction and refined A; do not reopen the deferred theme decision.

### Recovery and bounded builder defaults

Apply the shared recovery contract rather than implementing the simulator's memory snapshots as a storage design:

- Each completed user mutation preserves enough prior state and an audit for safe reversal. A bulk opening's committed Library changes form one recoverable action; failed/excluded/no-op inputs do not acquire invented mutations. Independent prior review decisions are not reversed merely by Undo opening.
- Preserve prior placement/order/status/user dates, earlier watch events and personal titles. Browser tabs remain as they are. Automatic metadata remains latest valid or missing.
- Protect newer conflicting user decisions; reject the entire unsafe selected action/batch reversal rather than partially undoing it. Sequential reversal of real dependencies must remain possible as specified by recovery. No new retention cap is introduced.

The following bounded defaults carry the settled behavior into implementation planning. They are explicit builder guidance, not separate historical interview answers or a storage/framework selection:

- Freeze the explicit requested IDs/order for the operation; show origin and included/excluded counts. Do not add later list arrivals or expand the set because browsing filters changed. Revalidate before starting; if meaningful record/review/placement changes make the preview stale, refresh it and obtain confirmation of the changed request.
- After opening starts, recheck unprocessed targets and refuse conflicting writes rather than overwrite a later Keep/Dismiss/edit. Report an affected record's conflict and preserve its recoverable state; unrelated eligible targets can finish. An incomplete watched-write repair must not overwrite newer decisions.
- Disable duplicate submission while an opening/status attempt is in progress. A later deliberate Open again / Record another watch is a new event, not an accidental replay of that attempt.
- Use the Library's browser window for grouped openings and preserve unrelated tabs. Retry uses the original group identity where it survives, including the user's current group name. If browser edits make original positioning incompatible, explain the proposed grouping result before changing those edited arrangements.
- Trim an empty/whitespace group name back to Selected videos. Do not create an empty group when no videos are included. Maintain the prepared group for a multi-video request reduced to one included video. Exact dialog dimensions and control placement are builder choices.
- Preserve sufficient request/progress attribution across Library reopening and restart for honest results/retry. If minimum safe preparation cannot be saved, do not begin new browser side effects. Operation identifiers, tab association, scheduling and transaction mechanics belong to implementation planning and real-browser validation.
- Persist a pure Library Mark watched/Dismiss batch and its history coherently; a failed status-batch write applies none of that batch. Actual browser opening remains per-record partial-success capable because external tabs cannot be rolled back as Library transactions.
- Retry/repair is a subsequent linked recovery action for its newly committed changes, rather than silently rewriting earlier history or adding already-recorded events again. Preserve the existing first-slice most-recent-opening recovery route and broader selected-action dependency protections.
- Keep results accessible after active rows disappear. Expose only implemented retained-history/status/recovery controls. The information popup may use readable sections without hiding retained details behind a fixed event-count cutoff. No arbitrary backdating or editing of old events is introduced.

## Testing Decisions

Extend the approved installed-Chrome workflow boundary: visible Library/review/results, actual browser tabs/groups/focus, durable records/history, reopening/restart and safe recovery. Use deterministic failures at the existing browser/persistence integration boundary where necessary. Test runner, supported URL fixtures, browser permissions and failure mechanics remain delivery-plan choices. No helper-only check or simulator walkthrough proves the real extension.

Exercise opening/status/history and their browser, review and persistence integration together through the observable workflow. Assert user-visible results, actual tabs/groups and durable state/events; do not assert internal schemas, helper functions, private methods or component structure. The approved first-slice installed-browser workflow is the existing testing precedent and confirmed expectation; this specification introduces no new lower-level seam or renewed testing interview. There is no production test suite to cite as an existing implementation.

- Open a real selected set and whole list, including filtered-out selections/contents and known-unavailable records. Confirm scope, ordered preview, edited/default group name, actual group order and Library focus. Preserve existing/source tabs and unrelated groups. Single-video behavior stays unchanged.
- Exercise ten versus eleven included tabs, then review exclusions reducing the actual count. Cancel before opening and verify no viewing tabs/events.
- Review pending Inbox and explicit-destination rediscoveries; test Keep/Leave here, Dismiss, closing review, failed review write, explicit leave-in-review exclusion and final grouped confirmation. Preserve pending flags, prior details and relative positions. Undo opening must not revive an already-resolved review.
- Mix successful tab creation, failed tab creation and failed watched writes. Assert distinct visible outcomes, coherent status/history, recoverable active failures and no playback inference. Retry tab failures into the same group/order; retry watched writes without another tab/event.
- Fail grouping alone; retry grouping without reopening. Remove the original group before retry; approve/cancel recreation with the previous name. Preserve deliberately closed successful tabs and unrelated browser edits.
- Reopen/restart during processing. Cover known completed/failed/unsaved and uncertain outcomes; no blind replay, invented event, false success or unsafe tab attribution. Exercise explicit uncertain-outcome Open again/Mark watched.
- Mark watched and dismiss single/selected active videos. Verify completed rows disappear from ordinary active views but remain discoverable in retained history. Pending review is not bypassed; dismissal preserves prior watches.
- Open again and manually record another watch for retained watched/dismissed records. Verify current watched status, no new active membership, stable first-save/placement dates, and complete repeat-event details. Repeated unfinished submissions must not duplicate events.
- Undo a bulk opening/status batch, restart, preserve earlier events/browser tabs, reject unsafe partial reversal, and reverse a retry followed by its earlier dependent action. Exercise newer edits and stale requests/repair conflicts.
- Inspect complete popup data, unknown fields, long descriptions/event history, readable narrow/desktop layouts, keyboard use and non-color status cues. Corrected events remain audited while count/latest excludes reversed events; metadata remains latest valid or missing.

At formalization there is no production extension or automated production test suite. The prototype was walked through in local Chrome at desktop/narrow sizes, with fictional state only. It shows accepted interaction direction, not production persistence, tab association, grouping failure recovery, crash handling or scale evidence.

## Out of Scope

- Production implementation, framework/storage/schema choice, or selecting this entire area as one delivery ticket.
- Replacing the settled single-video focus/Undo contract, verified playback/progress, or a playlist feature.
- New capture/import parsers, metadata acquisition/similarity detection, provider-retention exemptions, or Chrome tab-group import conversion.
- Re-deciding organization controls/cross-source ordering, general list management, full restoration/snapshots/backups, theme, cloud synchronization, mobile or simultaneous non-Chrome releases.
- Automatic reopening of successful tabs deliberately closed by the user, blind retries of uncertain outcomes, permanent deletion of watched/dismissed records, fixed history caps, arbitrary historical event editing or promotion of prototype code into production.

## Further Notes

### Handoff and decision evidence

- [Specify bulk opening failures and watched-history controls](https://github.com/Omriy123/youtube-backlog-tracker/issues/26) owns this bounded spec. The resolution comment links this published contract and source/evidence; the wayfinder map indexes the named decision rather than storing a duplicate answer. Planning closure does not mean the feature has shipped.
- [Track remaining product scope after the first usable slice](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) remains open. [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) retains the actual scope/ticket-order decision. Later agree vertical workflow tickets and native blockers, then prepare implementation plans; this contract does not create an unagreed build breakdown.
- Organization supplies explicit sets/order and consumes status-removal/results behavior. Capture supplies pending review and consumes retained-event details; imports/provider decisions keep their owners. Recovery owns reversal/retention; this feature records the changes it produces. No new provider or import question is resolved here.
- Accepted sources: [historical opening/history](https://github.com/Omriy123/youtube-backlog-tracker/issues/16#issuecomment-6234606422), [first-slice approval](https://github.com/Omriy123/youtube-backlog-tracker/issues/21#issuecomment-6234607828), [expanded capture resolution](https://github.com/Omriy123/youtube-backlog-tracker/issues/24#issuecomment-6240079525), and [approved recovery resolution](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238880289).
- Live discussion: [requested examples and popup requirement](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240486982), [naming/review-first/same-group corrections](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240773794), [accepted revised flow](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240828194), and [accepted Q6–Q8](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240974905). Explicit corrections outrank the earlier ready-records-proceed and separate-retry-group mock defaults.
- [Prototype archive and evidence guide](../prototypes/opening-history.md) points to [pinned throwaway source](https://github.com/Omriy123/youtube-backlog-tracker/tree/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history) on a separate, unmerged branch. It illustrates naming, review-first, same-group ordered retry, status removal and information presentation. The later accepted missing-group/unknown-outcome policies are specified here, not proven by that simulator.
- A fresh independent builder check reported **nothing important left** against the assembled contract and accepted sources. After completing Q1–Q8, accepting the corrected prototype flow and seeing the complete draft with its marked defaults, the user explicitly invoked **to-spec** to formalize/publish this synthesis without another interview. This records the accepted behavior and bounded builder guidance; it does not claim each default was a separate historical answer.
- To-spec supplies the problem/solution, extensive user stories, implementation/testing decisions, scope and notes structure. This effort's explicit wayfinder-only planning labels take precedence over its generic ready-for-agent instruction. Keep the question body and wayfinder type, publish the named resolution, update map/consumer handoffs and stop this ticket. Delivery scope/tickets and implementation plans retain the existing working-build checkpoint.
