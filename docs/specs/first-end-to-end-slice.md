# First end-to-end save/find/open/recover slice

Design status: the original slice and five-ticket breakdown were approved on 2026-10-14. On 2026-10-19 the owner explicitly requested five replacement implementation tickets preserving those workflows while taking later accepted wayfinder decisions wherever they contradict the originals, and closing the originals as superseded. This revision applies that instruction; no production implementation has started.

Parent: [approved product design](video-backlog.md). Scope ownership: [feature-design map](../design/feature-map.md). Delivery parent: [First end-to-end save/find/open/recover: approved spec](https://github.com/Omriy123/youtube-backlog-tracker/issues/3). This document holds the current durable slice specification.

Decision precedence: the owner's replacement instruction brings the relevant [pending rediscovery review](expanded-capture.md), [original/title-history and search rules](provider-enrichment.md), and [opening failure/retry safeguards](opening-and-watch-history.md) into these five bounded workflows now. Earlier phase notes preserving the pre-save review or latest-only title fallback remain historical evidence, not current delivery instructions. The [wayfinder map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10) indexes accepted decisions; it does not add every later capability to this slice. Provider acquisition, imports, full organization, bulk opening and broader recovery/backups remain later scope.

## Problem Statement

The user has accumulated saved video tabs and needs a trustworthy way to save a video, find it later, open it, and recover an accidental change. The existing layout prototype uses fictional data and simulated opening; it does not establish that actual browser capture, persistence, tab creation, and recovery work together.

Waiting for complete technical layers or all feature areas before testing would delay learning about the real workflow. The user needs a small working extension that can be tried end to end early.

## Solution

Deliver a Chrome-first test build that saves the current video tab into Inbox, finds persisted records in a minimal refined-A Library view, opens a real browser tab and marks the video watched, and supports persistent Undo opening. Use URL/title fallback without requiring an API key or provider enrichment.

Keep a deliberate personal title separate from automatic source metadata. Preserve one record per underlying upload and at most one active destination. Apply the settled watched/dismissed rediscovery review when an included save action encounters a retained record.

This is one bounded first milestone that can be divided into several vertical tickets. Each ticket must expose a verifiable user workflow; the first working path should connect save, find, open, and recovery before the other areas are completed.

## Approved delivery slicing

The user approved splitting the initial build into save/find followed by open/recover, keeping each ticket small enough to verify independently. UI work is part of the relevant workflow ticket, not a separate prerequisite layer:

1. [Save and find with retained capture titles in a real Chrome extension](https://github.com/Omriy123/youtube-backlog-tracker/issues/36): toolbar popup, durable capture/title observations, minimal Library/Inbox/search, identity protection and save failures.
2. [Open videos with safe tracking repair and persistent Undo](https://github.com/Omriy123/youtube-backlog-tracker/issues/37): focused tabs, coherent watched transitions, durable Undo, safe write repair and uncertain outcomes. This completes the first usable save/find/open/recover path.
3. [Handle URL variants and pending Inbox rediscovery review](https://github.com/Omriy123/youtube-backlog-tracker/issues/38): URL boundaries, immediate pending Inbox requeue, prior-details Keep/Dismiss and action gates.
4. [Edit personal titles and search retained capture-title history](https://github.com/Omriy123/youtube-backlog-tracker/issues/39): authored editing, Original/Latest fallback, historical title search/independent scopes and bounded version inspection; independent of opening/rediscovery after save/find.
5. [Verify recovery across pending review, title history and failures](https://github.com/Omriy123/youtube-backlog-tracker/issues/40): integrated review/edit/open/Undo, later-decision protection, retained title observations, restart/failure cases and the completed milestone build.

GitHub Issues hold current task status, acceptance criteria and native blocking relationships. Each ticket includes its own validation; the final workflow does not postpone earlier testing. Opening depends on save/find; rediscovery on opening; title editing on save/find; integrated recovery on rediscovery and title editing. The [next-slice checkpoint](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) waits for the replacement final workflow, and the [remaining-scope roadmap](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) preserves later capabilities. Original implementation issues 4–8 are superseded, not evidence of completed implementation; their historical approvals remain intact.

## User Stories

1. As the user, I want to save the current video through the extension toolbar, so that I can keep it without maintaining an open tab as my only record.
2. As the user, I want a generic save to put the video in Inbox, so that it awaits a placement decision.
3. As the user, I want saving to leave my source tab open, so that capture does not unexpectedly disrupt browsing.
4. As the user, I want URL/title fallback when metadata is missing, so that an API connection is not required to save a link.
5. As the user, I want save success reported only after durable storage accepts the change, so that I can trust the confirmation.
6. As the user, I want saved records to survive closing the popup, reopening the Library, and restarting the browser, so that my collection is not transient.
7. As the user, I want to open the Library from the toolbar, so that I can find what I saved.
8. As the user, I want a minimal real Inbox in the selected layout direction, so that the test build exercises the intended Library experience.
9. As the user, I want to search my personal title, every retained captured-title version, and URL by default, with independent version-scope controls, so that earlier names still find the saved record.
10. As the user, I want unknown enrichment fields shown honestly, so that missing data is not replaced with fictional metadata.
11. As the user, I want to give an active Inbox video a personal title, so that it has a useful name for me.
12. As the user, I want my personal title to take display precedence and survive automatic refresh, so that provider changes do not overwrite my edit.
13. As the user, I want clearing a personal title to restore Original, then Latest, then URL fallback, so that I can return to recognizable source-based display.
14. As the user, I want recognized references to the same upload to resolve to one record, so that URL variants do not create extra active memberships.
15. As the user, I want an active duplicate save to report Already saved and preserve placement, order, and recorded user dates, so that saving again does not rearrange my collection.
16. As the user, I want a repeat save of a watched/dismissed record to show prior status, placement, and watch/dismissal details, so that I can make an informed decision.
17. As the user, I want a generic repeat save to return the existing record to Inbox immediately with pending review, and Keep to confirm staying without another list entry, so that saving does not force a decision first.
18. As the user, I want Dismiss in that review to leave the record outside active lists while preserving history, so that unwanted rediscovery does not clutter Inbox.
19. As the user, I want repeat discovery alone to create no watch event, so that my viewing history remains meaningful.
20. As the user, I want clicking a title or Open action to create a real new browser tab, so that the test build actually opens my saved video.
21. As the user, I want successful tab creation to mark the record watched and remove it from active Inbox, so that I do not need to return and confirm playback completion.
22. As the user, I want failed tab creation to leave the record active, so that an unsuccessful opening does not lose it.
23. As the user, I want a visible tracking failure if persistence fails after a tab opens, so that browser success is not mistaken for a completed Library update.
24. As the user, I want Undo opening to restore the latest opening's prior active placement and reverse its new watched marking, so that I can recover an accidental opening.
25. As the user, I want that Undo to survive restart and preserve earlier watch events, so that recovery is durable and does not rewrite unrelated history.
26. As the user, I want Undo to leave the opened browser tab alone and protect newer user edits, so that recovery of Library state has no unexpected destructive side effects.
27. As the user, I want search/navigation and automatic metadata updates not to invalidate safe Undo, so that browsing alone does not remove recovery.
28. As the user, I want restoration of user decisions/authored fields to use the latest valid automatic metadata or missing values, so that it does not revive stale provider responses.
29. As the user, I want installation/run instructions and a real-browser test build, so that I can try save/find/open/recover before every feature is finished.
30. As the user, I want later browser adaptation to remain straightforward, so that Chrome-first delivery does not require rewriting Library behavior.

## Implementation Decisions

### Scope and shared rules

- Q52 accepts current-tab toolbar capture into Inbox, persistent Library/search, real single-video opening/watched transition, and recovery. Only integration, local persistence, and packaging needed to run that workflow belongs in the first build.
- Foundation owns same-video identity and enforces one record per underlying upload and at most one active destination. Capture owns save/rediscovery interaction. Imports owns source conversion and batch presentation, applying the same contract.
- Different upload identities with similar content are possible reuploads, not automatic exact duplicates. Supported provider URL forms and generic-link fallback must be documented and verified with fixtures during ticket planning/validation.
- Generic saves leave source tabs open. Active duplicates preserve placement, position, and user dates; rediscovery alone creates no watch event.
- A watched/dismissed generic save immediately returns the same record to Inbox with durable pending review and its prior status/destination/activity available through a clickable badge/dialog. Keep in Inbox clears review without opening or a second list entry; Dismiss removes active membership while retaining earlier history. Closing/cancelling or failed review persistence leaves review pending. First saved and original First Inbox-exit remain fixed; Latest list-entry changes at actual requeue, not again on Keep. Any optional pre-save choices are staged until Save. Destination shortcuts and their separate review/open interaction remain later scope.
- Pending review gates normal title/Open and authored-title edits. Resolve review before the intended action and revalidate it; Keep alone neither opens nor silently commits an edit, and Dismiss stops continuation. Browsing, search, selection and source-history inspection remain uninterrupted. Undo opening restores the reviewed pre-open state rather than reviving a separately resolved review.
- Persist user changes and enough prior state/history to recover opening across restart. Keep storage/interfaces provisional and refine them through workflow feedback. Do not import the prototype's fixed Undo cap or require a complete platform project first.
- Share product/UI logic and isolate browser-specific integration, consistent with the Chrome-first portability decision. No production framework or storage engine has been selected in this spec.

### Personal titles and metadata contract

- Q53 keeps a deliberate Personal title separate from automatic page/provider titles and gives it display precedence. Later accepted title rules refine the fallback to usable Original title, then Latest title, then saved URL. Preserve the first usable captured automatic title and every accepted intermediate/latest observation with actual browser source/time; repeated capture never resets Original or user placement dates. Missing upstream age stays unknown. Differing Latest captured text is labelled as a browser observation, not an API-verified current YouTube title.
- Search saved URL, Personal title and all retained available automatic title versions by default. Provide independent Personal / Original / Intermediate / Latest checkboxes, initially all on; URL matching remains independent and all four off means clearly explained URL-only matching. Return one record even when several categories match. A historical-only match keeps the normal display title and exposes a dated excerpt leading to that retained version. Provide bounded Original / Latest / History inspection for captured titles, with honest source/time/missing values. Reopening clears query and restores default version scopes. No provider descriptions/images or acquisition UI is implied.
- Q54 restores user-controlled organization, placement/order, status, authored edits, and relevant recorded user dates/history. Automatic metadata remains current/valid or missing; restoration must not revive expired/stale historical provider responses.
- Preserve acquisition provenance. A copied fetched value does not become independently authored solely because it is imported or stored in a differently named field.
- This slice does not fetch provider enrichment or implement an availability classifier. An action/network failure is not proof of deletion/private status. Later integrations must specify refresh/removal across current values, history, snapshots, exports, and restoration before storing their responses.

| Field group | First-slice origin/behavior | Historical treatment |
| --- | --- | --- |
| Saved URL and upload identity | User-invoked capture input; recognized identity derived from that URL rather than a fetched title or visual similarity. | Preserve identity/link as part of the user's record and history; metadata loss never erases the record. |
| Inbox membership, lifecycle, order, placement dates, watch events | User choices and application-generated facts/times; save/open/rediscovery changes are durable. | Restorable user Library state; correcting an opening does not rewrite unrelated prior watch events. |
| Personal title | Deliberately authored title, distinct from automatic source data, with display precedence. | Restorable authored edit; retain factual source provenance. |
| Captured tab titles | Browser-observed original/intermediate/latest observations with actual source and observation time from user-invoked capture; URL fallback if absent. No DOM scraping/API response is needed. | Retain every accepted observation separately from user action History. User-state recovery preserves access to later observations and keeps current automatic fields latest applicable or missing; displaying Original does not rewind current fields or claim a provider-retention exemption. |
| Provider title/channel/description/thumbnail/duration/publication | Not fetched in this slice; unknown fields remain unknown. | No provider-response payloads are introduced into initial recovery history; approve lifetime/copy treatment in later integrations. |
| Availability | No provider classifier in this slice; tab/network failures remain action failures. | Do not fabricate history or restore stale observations as current evidence. |
| Imported title/group/order/provenance | Conversion is designed beside capture but not implemented here; unknown source remains unknown. | Later imports preserve source information and apply the same identity/title/provenance contract. |

### Opening and recovery

- Clicking a title or Open action creates a new tab and focuses it. Existing/source tabs are not reused or closed. Single-video opening needs no many-tabs confirmation or tab group.
- Only successful tab creation triggers watched status and a watch event. Playback completion is not checked. Failed tab creation leaves the record active.
- If minimum safe preparation cannot be persisted, do not begin browser side effects. The implementation chooses the preparation/operation representation without weakening the failure safeguards.
- Status, membership, event and recovery updates persist coherently. If storage fails after a known tab creation, preserve a recoverable record and explain **Tab open — Library update not saved**. Repair that Library write without creating another tab or duplicate event, reconcile durable progress after restart/repeated submission, and protect newer relevant user decisions. URL equality alone does not prove attempt/tab attribution.
- An interrupted opening whose outcome cannot be established is uncertain, not an invented success/failure. Explain it, prevent blind replay, and offer inspection or an explicit new opening with possible duplicate-tab consequences explained. Inspection alone records no watch event. General Mark watched/history controls remain later scope.
- Q55 accepts a clearly labelled Undo opening action for the most recent opening, persistent across restart. Restore its prior active placement and reverse that opening's watched marking/watch event while retaining an action/correction audit. Earlier watch events and created browser tabs remain unchanged.
- Offer immediate Undo only when later user edits will not be overwritten; reject/disable unsafe reversal with an explanation. Search/navigation and automatic metadata updates are not user data edits and do not invalidate otherwise-safe Undo.
- General Undo for saves/title editing and broader history restoration are later slices. This does not change the full product recovery requirement or imply a 30-action retention limit.

### Bounded builder defaults

- Follow refined A's layout direction and expose only implemented controls. Use honest missing-data placeholders for unavailable thumbnails/enrichment.
- Provide a small personal-title editor for active Inbox records, consuming the shared pending-review gate. Clearing restores the Personal / Original / Latest / URL precedence above without deleting automatic observations.
- Search the available retained title versions and URL with the independent scopes above. Search/navigation/inspection creates no user edit history. Maintain stable record order when enrichment dates are unknown; no full sort UI is added.
- Show durable success/failure messages and enough prior details for rediscovery/recovery. Save confirmation follows storage success rather than popup-only state.
- Document how to install/run the real Chrome build. Choose the minimal storage/framework and supported-URL fixtures during implementation planning under these contracts.

## Testing Decisions

- The primary testing seam is the real installed extension's observable user workflow: toolbar capture, persisted Library/find, real tab opening/watched transition, and Undo opening. This follows the user's explicit requirement for early end-to-end testing and approval of the slice's real-browser validation target.
- Verify behavior visible to the user, persisted record/state, created browser tabs, and retained/reversed watch events. Do not assert helper functions, internal schema representation, component nesting, private methods, or a chosen storage engine.
- Test persistence across Library reopening and browser restart. Exercise the actual extension/browser/local-storage path rather than treating the in-memory prototype or simulated tabs as production evidence.
- At the same feature/workflow boundary, cover exact duplicate URLs, immediate pending-Inbox rediscovery, prior-activity review/cancellation/failure and open/edit gates; requeue versus Keep date rules; Personal/Original/Latest fallback and all retained title-version search/scope combinations; failure outcomes and safe write repair; Undo conflict protection and automatic metadata's non-rewind/archive-preservation contract. Validate independently delivered title editing and rediscovery in both integration orders.
- Use the already-required browser/persistence integration boundary to deterministically exercise failed save, failed tab creation, and storage failure after tab creation where real-browser induction is impractical. Keep user-facing workflow assertions; do not introduce separate test-only seams throughout the app.
- Use a bounded provider URL fixture matrix, including recognized same-upload forms, timestamp/playlist context, generic-link fallback, and negative/ambiguous inputs. These verify the identity contract rather than duplicate the parser's implementation.
- Test the shared Library behavior and browser/UI integration together through the workflow. Any narrower contract check must justify why the same externally meaningful case is impractical at the primary boundary.
- No production application or automated test suite exists yet. The prototype's recorded browser walkthroughs inform the layout, not the correctness of this real extension. Test runner, automation mechanics, and failure-induction details are implementation-plan decisions.
- Let the user try the working save/find/open/recover build early. Feed actual results into storage/interface refinement and later slices; do not postpone testing until all seven design areas are finished.

## Out of Scope

- Window/link-thumbnail capture, right-click menus, destination shortcuts, and save-and-close controls.
- Full watch-list management, importance/deletion/move controls, manual/date-sort UI, channel browsing, batch organization, and the full layout surface.
- Bulk tab opening/grouping, explicit status controls beyond rediscovery decisions, and playback progress.
- Import parsers/previews for Chrome groups, OneTab, or Session Buddy; import examples inform this contract but the user backlog has not been imported or tested.
- API setup/enrichment, availability classification, metadata refresh UI, and possible-reupload detection/suggestion UI.
- General per-action Undo, selective user-History restoration, full point-in-time UI, automatic/manual snapshot UI, complete backup/export/restore UI, and reminder scheduling. Bounded captured-title version inspection/search above is included; it is distinct from general Library History or a full provider metadata archive UI.
- Simultaneous non-Chrome releases, mobile capture, cloud sync, theme, automatic channel discovery, and preview-free window capture.

All remain in the approved broader product where applicable; this first build is not a scope reduction of that product.

## Further Notes

- Q52-Q55 were accepted on 2026-10-14. The user subsequently accepted the complete presented spec with “ok great” and requested its readiness assessment before to-tickets. This approves the slice design, not a ticket breakdown or production implementation.
- The original draft used grill-with-docs and fresh builder reviews, not to-spec. This revision applies to-spec's structure and explicit user stories/testing decisions without changing the approved scope.
- The test boundary has already been checked against the user's repeated real end-to-end requirement and approved real-browser target; no new testing interface or additional approval gate is introduced by this editorial formalization.
- Fresh builder reviews found no material gaps after Q55. Remaining supported-URL details, storage/framework selection, failure induction, and minimal UI mechanics can be settled during ticket/implementation planning without reopening the product interview.
- [Metadata research](../research/video-metadata-and-identity.md), [early metadata validation](../research/design-constraints-follow-up.md#early-metadata-contract-validation), and [identity/import examples](../research/design-constraints-follow-up.md#first-slice-identity-and-import-examples) distinguish verified source constraints from untested fixtures and unresolved provider interpretations.
- Original planning used synthetic import examples for repeated references/grouping and unknown title provenance. Later source evidence and the [approved import contract](backlog-import.md) are now available, but parser/source compatibility remains outside this slice. Source occurrences do not create memberships, and an edit marker never proves API acquisition provenance or refresh time.
- Replacement provenance, 2026-10-19: the owner instructed creating five new matching tickets and closing the originals, with contradictory later wayfinder decisions taking precedence. This authorizes the included pending-review/title-history/failure changes and supersedes earlier phase-preservation notes; it does not reopen historical approval comments, select a full later feature area, claim implementation or start the later recovery/enrichment real-use review clocks.
- Originally, to-tickets proposed the breakdown, revised the oversized first ticket and published the five original child issues with native blockers. The replacement series above preserves that workflow split under the owner's 2026-10-19 instruction. The delivery parent remains open; the seven design areas are not seven horizontal implementation milestones.
