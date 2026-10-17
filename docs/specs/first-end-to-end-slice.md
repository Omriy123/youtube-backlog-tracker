# First end-to-end save/find/open/recover slice

Design status: complete slice design approved on 2026-10-14; formalized with to-spec without adding scope. The five-ticket breakdown was subsequently approved and published under issue #3. No production implementation has started.

Parent: [approved product design](video-backlog.md). Scope ownership: [feature-design map](../design/feature-map.md). Published specification: [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3).

## Problem Statement

The user has accumulated saved video tabs and needs a trustworthy way to save a video, find it later, open it, and recover an accidental change. The existing layout prototype uses fictional data and simulated opening; it does not establish that actual browser capture, persistence, tab creation, and recovery work together.

Waiting for complete technical layers or all feature areas before testing would delay learning about the real workflow. The user needs a small working extension that can be tried end to end early.

## Solution

Deliver a Chrome-first test build that saves the current video tab into Inbox, finds persisted records in a minimal refined-A Library view, opens a real browser tab and marks the video watched, and supports persistent Undo opening. Use URL/title fallback without requiring an API key or provider enrichment.

Keep a deliberate personal title separate from automatic source metadata. Preserve one record per underlying upload and at most one active destination. Apply the settled watched/dismissed rediscovery review when an included save action encounters a retained record.

This is one bounded first milestone that can be divided into several vertical tickets. Each ticket must expose a verifiable user workflow; the first working path should connect save, find, open, and recovery before the other areas are completed.

## Approved delivery slicing

The user approved splitting the initial build into save/find followed by open/recover, keeping each ticket small enough to verify independently. UI work is part of the relevant workflow ticket, not a separate prerequisite layer:

1. [#4: Save and find in a real Chrome extension](https://github.com/Omriy123/youtube-backlog-tracker/issues/4): toolbar popup, durable capture, minimal Library/Inbox/search, basic identity protection, and save failures.
2. [#5: Open videos and recover accidental openings](https://github.com/Omriy123/youtube-backlog-tracker/issues/5): real focused tabs, watched transitions/history, persistent Undo opening, and opening/tracking failure feedback. This completes the first usable save/find/open/recover path.
3. [#6: URL variants and watched/dismissed repeat-save review](https://github.com/Omriy123/youtube-backlog-tracker/issues/6): supported URL boundaries and the prior-details Keep/Dismiss UI.
4. [#7: Personal-title editing and search](https://github.com/Omriy123/youtube-backlog-tracker/issues/7): durable authored-title editing, clearing/fallback, and search; this can proceed from the save/find build independently of opening and rediscovery.
5. [#8: Recovery across rediscovery, edits, and failures](https://github.com/Omriy123/youtube-backlog-tracker/issues/8): combined interactions, newer-edit protection, restart/failure cases, and the completed milestone build.

GitHub Issues hold current task status, acceptance criteria, and native blocking relationships. Each ticket includes its own validation; #8 does not postpone all testing. [Roadmap issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) preserves the remaining product scope, with the next feedback checkpoint after the series.

## User Stories

1. As the user, I want to save the current video through the extension toolbar, so that I can keep it without maintaining an open tab as my only record.
2. As the user, I want a generic save to put the video in Inbox, so that it awaits a placement decision.
3. As the user, I want saving to leave my source tab open, so that capture does not unexpectedly disrupt browsing.
4. As the user, I want URL/title fallback when metadata is missing, so that an API connection is not required to save a link.
5. As the user, I want save success reported only after durable storage accepts the change, so that I can trust the confirmation.
6. As the user, I want saved records to survive closing the popup, reopening the Library, and restarting the browser, so that my collection is not transient.
7. As the user, I want to open the Library from the toolbar, so that I can find what I saved.
8. As the user, I want a minimal real Inbox in the selected layout direction, so that the test build exercises the intended Library experience.
9. As the user, I want to search my personal/display title, available automatic title, and URL, so that I can find a saved video using the information available.
10. As the user, I want unknown enrichment fields shown honestly, so that missing data is not replaced with fictional metadata.
11. As the user, I want to give an active Inbox video a personal title, so that it has a useful name for me.
12. As the user, I want my personal title to take display precedence and survive automatic refresh, so that provider changes do not overwrite my edit.
13. As the user, I want clearing a personal title to restore the automatic title or URL fallback, so that I can return to source-based display.
14. As the user, I want recognized references to the same upload to resolve to one record, so that URL variants do not create extra active memberships.
15. As the user, I want an active duplicate save to report Already saved and preserve placement, order, and recorded user dates, so that saving again does not rearrange my collection.
16. As the user, I want a repeat save of a watched/dismissed record to show prior status, placement, and watch/dismissal details, so that I can make an informed decision.
17. As the user, I want Keep in generic rediscovery to return the existing record to Inbox, so that I can make a new placement decision without losing history.
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
- Watched/dismissed generic rediscovery uses the already-settled prior-details Dismiss/Keep prompt. Keep returns the same record to Inbox; Dismiss retains history outside active lists. Destination shortcuts and their separate warning/review interaction are later scope.
- Persist user changes and enough prior state/history to recover opening across restart. Keep storage/interfaces provisional and refine them through workflow feedback. Do not import the prototype's fixed Undo cap or require a complete platform project first.
- Share product/UI logic and isolate browser-specific integration, consistent with the Chrome-first portability decision. No production framework or storage engine has been selected in this spec.

### Personal titles and metadata contract

- Q53 keeps a deliberate personal title separate from automatic page/provider title and prefers it for display. Automatic refresh never overwrites it. Without a personal title, show the latest valid automatic title or URL fallback.
- Q54 restores user-controlled organization, placement/order, status, authored edits, and relevant recorded user dates/history. Automatic metadata remains current/valid or missing; restoration must not revive expired/stale historical provider responses.
- Preserve acquisition provenance. A copied fetched value does not become independently authored solely because it is imported or stored in a differently named field.
- This slice does not fetch provider enrichment or implement an availability classifier. An action/network failure is not proof of deletion/private status. Later integrations must specify refresh/removal across current values, history, snapshots, exports, and restoration before storing their responses.

| Field group | First-slice origin/behavior | Historical treatment |
| --- | --- | --- |
| Saved URL and upload identity | User-invoked capture input; recognized identity derived from that URL rather than a fetched title or visual similarity. | Preserve identity/link as part of the user's record and history; metadata loss never erases the record. |
| Inbox membership, lifecycle, order, placement dates, watch events | User choices and application-generated facts/times; save/open/rediscovery changes are durable. | Restorable user Library state; correcting an opening does not rewrite unrelated prior watch events. |
| Personal title | Deliberately authored title, distinct from automatic source data, with display precedence. | Restorable authored edit; retain factual source provenance. |
| Captured tab title | Browser-observed title and observation time from user-invoked capture; URL fallback if absent. No DOM scraping/API response is needed. | Automatic information resolved from its latest valid value during restoration; no blanket indefinite-retention exemption is claimed. |
| Provider title/channel/description/thumbnail/duration/publication | Not fetched in this slice; unknown fields remain unknown. | No provider-response payloads are introduced into initial recovery history; approve lifetime/copy treatment in later integrations. |
| Availability | No provider classifier in this slice; tab/network failures remain action failures. | Do not fabricate history or restore stale observations as current evidence. |
| Imported title/group/order/provenance | Conversion is designed beside capture but not implemented here; unknown source remains unknown. | Later imports preserve source information and apply the same identity/title/provenance contract. |

### Opening and recovery

- Clicking a title or Open action creates a new tab and focuses it. Existing/source tabs are not reused or closed. Single-video opening needs no many-tabs confirmation or tab group.
- Only successful tab creation triggers watched status and a watch event. Playback completion is not checked. Failed tab creation leaves the record active.
- Status and history updates are persisted together. If storage fails after a tab opens, preserve a recoverable record and explain that tracking failed rather than claiming a successful Library update or silently losing it.
- Q55 accepts a clearly labelled Undo opening action for the most recent opening, persistent across restart. Restore its prior active placement and reverse that opening's watched marking/watch event while retaining an action/correction audit. Earlier watch events and created browser tabs remain unchanged.
- Offer immediate Undo only when later user edits will not be overwritten; reject/disable unsafe reversal with an explanation. Search/navigation and automatic metadata updates are not user data edits and do not invalidate otherwise-safe Undo.
- General Undo for saves/title editing and broader history restoration are later slices. This does not change the full product recovery requirement or imply a 30-action retention limit.

### Bounded builder defaults

- Follow refined A's layout direction and expose only implemented controls. Use honest missing-data placeholders for unavailable thumbnails/enrichment.
- Provide a small personal-title editor for active Inbox records. Clearing it returns display to the latest valid automatic title or URL fallback.
- Search personal/display title, available automatic title, and URL. Search/navigation creates no edit history. Maintain stable record order when enrichment dates are unknown.
- Show durable success/failure messages and enough prior details for rediscovery/recovery. Save confirmation follows storage success rather than popup-only state.
- Document how to install/run the real Chrome build. Choose the minimal storage/framework and supported-URL fixtures during implementation planning under these contracts.

## Testing Decisions

- The primary testing seam is the real installed extension's observable user workflow: toolbar capture, persisted Library/find, real tab opening/watched transition, and Undo opening. This follows the user's explicit requirement for early end-to-end testing and approval of the slice's real-browser validation target.
- Verify behavior visible to the user, persisted record/state, created browser tabs, and retained/reversed watch events. Do not assert helper functions, internal schema representation, component nesting, private methods, or a chosen storage engine.
- Test persistence across Library reopening and browser restart. Exercise the actual extension/browser/local-storage path rather than treating the in-memory prototype or simulated tabs as production evidence.
- At the same feature/workflow boundary, cover exact duplicate URLs, watched/dismissed repeat-save review, personal-title display/clearing/search, failure outcomes, Undo conflict protection, and automatic metadata's non-rewind contract.
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
- General per-action Undo, selective history restoration, full point-in-time UI, automatic/manual snapshot UI, complete backup/export/restore UI, and reminder scheduling.
- Simultaneous non-Chrome releases, mobile capture, cloud sync, theme, automatic channel discovery, and preview-free window capture.

All remain in the approved broader product where applicable; this first build is not a scope reduction of that product.

## Further Notes

- Q52-Q55 were accepted on 2026-10-14. The user subsequently accepted the complete presented spec with “ok great” and requested its readiness assessment before to-tickets. This approves the slice design, not a ticket breakdown or production implementation.
- The original draft used grill-with-docs and fresh builder reviews, not to-spec. This revision applies to-spec's structure and explicit user stories/testing decisions without changing the approved scope.
- The test boundary has already been checked against the user's repeated real end-to-end requirement and approved real-browser target; no new testing interface or additional approval gate is introduced by this editorial formalization.
- Fresh builder reviews found no material gaps after Q55. Remaining supported-URL details, storage/framework selection, failure induction, and minimal UI mechanics can be settled during ticket/implementation planning without reopening the product interview.
- [Metadata research](../research/video-metadata-and-identity.md), [early metadata validation](../research/design-constraints-follow-up.md#early-metadata-contract-validation), and [identity/import examples](../research/design-constraints-follow-up.md#first-slice-identity-and-import-examples) distinguish verified source constraints from untested fixtures and unresolved provider interpretations.
- Synthetic import examples cover repeated watch/short references within a group, the same upload across groups, and edited/missing titles with unknown origin. Preserve source occurrences/group/order separately from exclusive active placement. An edit marker does not prove API acquisition provenance or refresh time. No real private import fixture was found.
- To-tickets was used to propose the breakdown, revise the oversized first ticket, obtain agreement, and publish the five child issues above with native blockers. Parent issue #3 remains the first-slice specification; the seven design areas are not seven horizontal implementation milestones.
