# Personal video backlog tracker

Design status: overarching design approved on 2026-10-14. The first delivery slice and its five implementation tickets are approved. The [broader recovery contract](library-recovery.md) and [expanded capture specification](expanded-capture.md) were settled on 2026-10-17; the [focused opening/history contract](opening-and-watch-history.md) was formalized through to-spec on 2026-10-18. Their delivery slicing is not yet agreed. Other later areas still need focused specifications. Production implementation has not started.

Task tracking: [finalize the design, issue #2](https://github.com/Omriy123/youtube-backlog-tracker/issues/2).

First delivery milestone: [first end-to-end slice, issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3), with its [approved spec and delivery tickets](first-end-to-end-slice.md). Remaining scope and subsequent-slice follow-up: [roadmap issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) and the [feature map](../design/feature-map.md).

The overarching design was approved after the interview and coverage clarification. The detailed feature choices explicitly deferred below still require their own design/spec approval before implementation planning.

## Design scope and approval

Q40-Q49 follow-up changes the scope of issue #2: finalize the overarching product design, obtain approval, then split the work into feature-design areas. Interview the relevant behaviors, write and approve their durable specs/contracts, create focused GitHub tickets, and prepare an implementation plan for each usable delivery slice. Approval of the overarching design does not approve unresolved feature details or production implementation.

This document preserves the settled requirements from the existing interview. Detailed questions already raised are deferred explicitly below, rather than treated as blockers to overarching-design approval. The layout prototype is a visual reference, not an authority for domain logic. Q39's explicit instruction to follow prototype sorting remains valid; other unconfirmed prototype behavior is illustrative and must agree with settled rules.

Approval at this stage covers the overarching product design, settled requirements, selected layout direction, and explicit deferrals. Unconfirmed source-audit logic and proposed detailed safeguards remain inputs to later feature design, not separately approved algorithms. After approval, the next step is feature decomposition and focused interviews; implementation planning follows approval of the relevant slice specs/contracts.

The user requires early real end-to-end testing: an initial usable delivery must save a real video, find the persisted record, open it in a browser tab, and recover the change. Keep foundation small/provisional, define field provenance and metadata lifetime before settling foundation/recovery, bring Imports into design beside Capture, and evolve storage/interfaces through workflow feedback. The seven design areas do not prescribe seven code modules or require full layers to be finished before testing. A slice can cross areas and implement only the approved behavior it needs, while retaining the remaining capabilities in the product scope.

## Overarching product design

- A personal desktop browser extension, with a full Library page and a toolbar popup for quick capture. Chrome is the first tested release. Keep the product and UI shared and browser integration separate so later Edge/Firefox support is intended to be a straightforward port, not a rewrite. Refined A remains the layout reference; color/theme is deferred.
- One Library and one record per underlying upload. Active videos occupy one destination: Inbox, Backlog, or a custom watch list. Channel views and search never create another membership. Retained watched/dismissed records preserve history.
- Support both importing the existing backlog and saving new links. Preserve imported grouping and source order for newly created lists. Active duplicates keep their current list and position.
- Use Inbox for placement and pending rediscovery decisions and Backlog for reviewed videos saved for later. Watch lists express intended viewing, with a user-defined importance order. Under the later [expanded capture contract](expanded-capture.md), generic watched/dismissed repeat saves are in Inbox with pending review; destination shortcuts keep the chosen placement with a visible review warning.
- Organize and browse through list/channel views, search, remembered presentation preferences, date/manual sorting, drag/drop, and batch actions. Opening from the tracker normally marks a video watched after successful tab creation; playback progress remains YouTube's responsibility.
- Keep the Library locally, with persistent change history supporting both step-by-step Undo and restoration of the whole Library to any retained point. Include automatic/manual snapshots, complete manual backup files and optional automatic versioned Google Drive backups under the [approved recovery contract](library-recovery.md). History, snapshots and completed backup versions have indefinite retention until deliberate deletion, with a development-only review after real use. Live synchronization between installations and mobile capture remain deferred.
- Support YouTube, Twitch VODs, and other video links. Saving works with URL/title fallback and incomplete metadata. Optional YouTube API access enriches records. Provider integrations must distinguish durable user organization/history from refreshable fetched metadata; exact retrieval and retention mechanisms belong in their feature specs.
- Continue to keep unavailable videos instead of silently removing them. Preserve their records, show availability information only as reliably known, and allow explicit opening, retry, or dismissal.

Q43 and Q51 settle the final overarching choices. Browser portability is a design requirement: choose compatible extension capabilities and isolate unavoidable browser differences. Exact port effort and supported browser versions must be verified during feature design and browser testing, rather than promised from the layout prototype. Storage technology, permissions, import formats, and detailed interaction rules belong in the feature-design stage.

## Purpose

Keep up with saved videos, replace a large accumulation of open tabs, and make it easy to decide what to watch next. Trust that saved videos will not be lost is central.

Two workflows have equal importance:

- Load the existing backlog.
- Continually save new videos manually.

## Confirmed requirements

- Initially a desktop browser extension for one person. Q51 accepts Chrome first on the condition that adapting it for other desktop browsers stays simple. Use a shared WebExtensions design for product/UI with browser-specific integration isolated, targeting straightforward later Edge/Firefox ports. The initial tested support commitment is Chrome; exact additional browser versions, packaging, and port validation belong in the extension feature spec. See [ADR 0004](../adr/0004-chrome-first-with-shared-browser-design.md).
- The main Library page includes Inbox, Backlog, and all watch lists; the toolbar popup handles quick capture. Refined prototype A is the selected layout reference, as detailed below.
- Adding videos from mobile would be useful later. Public release is a possibility, not an initial requirement.
- Library means the whole collection. Each active saved video belongs to exactly one list; watched and dismissed videos remain recorded but leave active lists.
- Inbox holds videos awaiting placement or rediscovery review. Ordinary moves do not return a sorted video to Inbox. Undo of an accidental departure and choosing Inbox when deleting a custom list remain exceptions. Q44 introduced deliberate generic rediscovery; the [expanded capture revision](expanded-capture.md#explicit-revision-of-generic-rediscovery) now puts the existing watched/dismissed record in Inbox immediately with pending review. Keep confirms it stays; Dismiss removes it from active lists with retained history.
- Backlog holds reviewed videos deliberately put at the back of the generic pile. It remains distinct from Inbox.
- Watch lists represent videos the user intends to watch soon, not videos currently in playback.
- Playback progress tracking is not needed; the user relies on YouTube for that.
- The user will continue to have some video tabs open alongside the tracker.
- Channel views must work within a specific list and across the Library without changing list membership.
- Watch lists have a human-defined importance order, not arbitrary numeric priority scores. Videos have no priority score. This supersedes the earlier interpretation of numeric priorities.
- Lists can be viewed by importance order, name, video count, total known duration, or most recent addition. Alternative views do not redefine importance order or change quick-save shortcuts. Display how many videos have unknown duration alongside duration totals.
- Inbox and Backlog are permanent destinations. They can be emptied through batch actions but cannot be deleted.
- Deleting a custom watch list offers two explicit choices: delete and dismiss all its remaining videos, or delete and move them to a chosen destination list, including Inbox or Backlog. Do not automatically choose Backlog. Prior history remains available.
- Videos can be sorted by release/upload date, first saved date, first Inbox-exit date, latest list-entry date, duration, and saved manual order. Release-date order defaults to oldest first, with an oldest/newest toggle remembered separately for each list. Unknown dates sort last. Q39 adopts the prototype's sorting behavior, including title, channel, and destination header sorts; see the sorting contract below.
- First saved date remains fixed for the video; first Inbox-exit date records its first move out of Inbox; latest list-entry date records its most recent entry into a list. Q38 confirms that a first save directly into Backlog or a watch list sets all three dates to the save time: bypassing Inbox counts as completing initial placement. Ordinary repeat saves change none of these dates; queuing a retained video again updates latest list-entry date. Release/upload dates describe the source video, not its addition to the extension.
- Manual video order follows release-date order until manually rearranged, except that a newly created imported list starts with source order as its saved manual arrangement (Q46). Manual rearrangement retains the user's arrangement and appends new arrivals. Switching to a date-based view does not overwrite a saved manual arrangement, including one initialized from import. Q39 follows the prototype: a drag adopts the current sort of the entire destination list, including filtered-out videos, then applies the before/after insertion and switches to Manual. The prototype has no dedicated reset-manual-order action; do not add the earlier proposed reset button to initial scope.
- Channel filtering is compatible with both chronological and manual views.
- Saving must support the current video tab, a video link/thumbnail without opening it, and multiple tabs in the current window.
- Right-click capture and toolbar quick-save offer the top three watch lists by saved importance order, Backlog, and a default save action that sends to Inbox. These shortcuts are not based on temporary display sorting or usage frequency. Frequency-based shortcuts were considered but not selected for the initial version.
- The extension toolbar offers capture of the current video/tab and all tabs in the window. Generic saving defaults to Inbox; a chosen destination bypasses Inbox.
- Saving a mixed window shows a preview with recognized video links selected and other pages unchecked. The user can include an unrecognized video page using its URL/title fallback. A future quick-add mode with website filters and no preview is deferred.
- Ordinary saving leaves existing tabs open, with a separate explicit source-closing action. The [expanded capture contract](expanded-capture.md) adds an initially-off remembered current-tab toolbar close preference as an explicit opt-in; window closing stays separate, and saving a link/thumbnail never closes its containing page.
- Multi-select supports moving, dismissing, marking watched, and opening videos together, including selecting all matches for the current filter. Batch changes support Undo.
- The current backlog includes Chrome tab groups whose grouping must be preserved during import. Each group defaults to a same-named list; an import preview allows mapping it to an existing list or Inbox. Preserve within-group order where the source supplies it. Q46 confirms that a newly created imported list uses source order as its manual arrangement, with date sorting still available. OneTab and Session Buddy imports are also requested; exact formats belong in their feature spec. Q45 reaffirms that duplicates must not create multiple destination memberships; do not introduce the proposed repeated-destination chooser as an overarching requirement. Import reconciliation details will be designed under the single-record invariant.
- The same video must not appear multiple times in the Library. Saving an active duplicate reports it as already saved and preserves its list and position.
- Q44's generic review timing is explicitly revised by the [expanded capture specification](expanded-capture.md): Save does not force review first. The existing watched/dismissed record appears in Inbox with a clickable pending-review badge and prior status/destination/activity details. Keep in Inbox confirms staying there; Dismiss removes active membership and preserves history. The first-slice pre-save prompt remains its historical baseline until this later behavior is delivered.
- A destination-shortcut repeat save places the existing watched/dismissed record in that destination with a clickable pending-review badge. Dismiss / Leave here and explicit Leave here & open are specified in [expanded capture](expanded-capture.md). Normal opening and relevant user mutations cannot bypass pending review; ordinary browsing/selection remains uninterrupted.
- A video has one record and may have multiple watch events. Rediscovery alone does not create another watch event; prior watch history is preserved, while genuinely watching again adds another watch event. Q44's deliberate repeat-save review supersedes the earlier no-return-to-Inbox rule for generic saves.
- References to the same underlying upload are deduplicated automatically. Different uploads that look similar may produce possible-duplicate suggestions, with the user deciding whether to keep or dismiss the new upload. Do not automatically merge different uploads based on metadata similarity.
- The main open action opens the video in a new tab, marks it watched, and removes it from its active list. It does not wait for playback or require the user to return and confirm completion.
- Explicitly marking a video watched is also required, including after watching on another device. Dismissing unwanted videos is supported.
- Watched and dismissed videos remain in history and are excluded from ordinary views unless explicitly requested.
- History must make it possible to determine where a video was before an accidental move or removal. Q43 confirms persistent recovery through step-by-step Undo and restoring the entire Library to any retained point in history. Representation, retention, selective recovery, and restoration safeguards remain for the recovery feature spec.
- The initial local recovery/backup baseline is refined by the [recovery contract approved on 2026-10-17](library-recovery.md). Retain detailed history, changed-day daily snapshots, pre-import/pre-restoration safety snapshots and manual snapshots indefinitely until deliberate deletion, superseding Q49's former up-to-30 daily-copy cap. Include complete manual download/upload and optional automatic versioned Google Drive backups within five minutes while available, with catch-up, actionable backup health and no unsolicited local file downloads. Whole-profile loss requires an external surviving copy; Google Drive backup is distinct from still-deferred live synchronization. The owner's day-28 retention-review reminder is restricted to the development trial and tracked separately from production behavior. Q43's persistent Undo/retained-point restoration and the first-slice Undo-opening safeguards remain binding.
- Q40 confirms remembering density, current video sort, watch-list overview sort, and Rows/Columns choice across reopening, alongside per-list publication direction. Reopening starts with empty search and selection. The prototype's five-channel shortlist with expansion is the initial presentation; a configurable cutoff is omitted.
- Opening an entire watch list opens each video in its own tab, together in a tab group. Show a notice when opening more than 10 tabs that many tabs will open and the operation may take time. This is not a playlist feature.
- Bulk opening is the batch equivalent of single-video opening, marking successfully opened videos watched and supporting restoration of their former placement. Known-unavailable videos are also opened and marked watched; creating the browser tab must succeed, but successful playback is not required. If the video becomes available later, it can be queued again through repeat-save review.
- Metadata includes title, channel/creator, thumbnail, duration, and upload/release date where obtainable. A saved URL and editable title provide a fallback. Missing metadata must not block saving; unknown dates sort last.
- Include descriptions where obtainable, searchable and displayed in an expandable details area. Treat fetched descriptions as refreshable metadata; indefinite preservation after source disappearance remains subject to retrieval and retention constraints.
- The YouTube API key is optional and configured by the user for this personal version. Saving and organizing links must work without it; connected API access enriches accessible videos, including imported links. Without the connection, metadata and associated sort views may be incomplete.
- Videos may become deleted, private, or otherwise unavailable after being saved. Keep their records and display an availability badge; offer retry, open anyway, and dismiss. Do not silently remove them or infer unavailability merely from a network error.
- Opening an entire list must include known-unavailable videos rather than skip them. The user explicitly rejected skipping unavailable videos during bulk opening. Precise cause labels are used only when known; availability checks and fetched-metadata preservation remain to be designed.
- Twitch VODs and other non-YouTube videos must be supported. A manually sorted list is an acceptable fallback if needed; exact metadata expectations are unresolved.
- Automatic discovery from channels or subscriptions can follow later. Humans decide watch-list placement.

## Overarching approval and next stage

No overarching interview questions remain. Q43 confirms the broad history-restoration contract, and Q51 confirms Chrome first with straightforward later browser adaptation as a design constraint. On 2026-10-14, after clarifying that this document preserves the recorded interview decisions and accepted prototype insights, the user accepted the result and moved to feature decomposition. Approval covers the overarching design and its explicit deferrals, not unconfirmed feature logic. No indefinite retention guarantee, storage implementation, or untested browser-support claim is implied.

The [first-slice spec](first-end-to-end-slice.md) now settles the shared rules, early metadata contract, and limited save/find/open/recover workflow needed for the first delivery milestone. Its approved five-ticket sequence starts with save/find and completes the first working end-to-end path with opening/recovery. Use the [feature map](../design/feature-map.md) and [roadmap issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) to carry remaining requirements into subsequent focused specs, using feedback from the first series. Approval of this slice does not settle every later feature detail.

## Detailed decisions deferred to feature design

These questions will be interviewed, specified, and ticketed after overarching approval. They are not silently settled by prototype code or this deferral; the affected feature must resolve them before implementation planning.

- Foundation's shared identity contract: what counts as the same video across URL variants/providers, one-record/active-destination enforcement, and the distinction between exact duplicates and possible reuploads. Capture owns the save/review interaction; Imports owns source conversion and batch decisions; both apply that contract.
- Capture and rediscovery: the [focused expanded capture specification](expanded-capture.md) now settles toolbar/link/right-click/window saving, optional destinations, source closing, pending Inbox/destination review, complete results/retry/reopening, save correction and possible-duplicate presentation. Choose bounded delivery tickets at the working-build checkpoint; similarity-evidence production still belongs to metadata.
- Organization and Library views: exact filtered drag/selection behavior beyond the adopted sorting contract, channel identity when metadata is absent, shortlist ranking details, and responsive layout. Color/theme remains a later design decision.
- Imports: supported OneTab/Session Buddy formats, reconciliation of repeated references without extra memberships, arrival order in existing destinations, interrupted import recovery, and representative scale validation.
- Opening and watch history: the [focused opening/history contract](opening-and-watch-history.md) now settles named groups/Library focus, review before initial opening with explicit exclusion, same-group ordered retries and missing-group recreation, incomplete-save/unknown outcomes, active status removal, retained repeat watches and full information details. Keep the above-ten notice, unavailable inclusion and first-slice single opening/Undo. Delivery scope and browser implementation/validation remain with the working-build checkpoint and later plans.
- Recovery and backups: the [approved focused recovery contract](library-recovery.md) now settles retention, selective/whole-state restoration, later-edit/missing-destination safeguards, manual files, Google Drive versions and the development-only review. Representation and bounded delivery tickets/plans remain later work; select scope through the working-build checkpoint. This explicitly supersedes Q49's daily-copy retention cap without changing the first-slice contract.
- Metadata contract, discussed early with foundation/recovery: classify user-authored, application-generated, fetched, observed, and imported fields; define refresh/removal for current and historical copies and recovery when fetched data changes or disappears. Provider setup, richer retrieval/enrichment UI, and availability integrations can be specified later.
- Extension implementation and delivery: refine local persistence technology, interfaces, browser integrations, permissions, packaging, migrations, and installation incrementally for usable slices. They are not a large foundation project that must be completed before workflow testing, and are not decisions delegated to prototype scaffolding.

## Selected Library layout

The user completed the prototype and selected refined A as the visual and interaction reference, incorporating C's channel controls and density options and B's destination-grouped Library results. The [layout feedback](../design/library-layout.md) is the detailed record and links to the runnable throwaway prototype.

- Use a persistent sidebar with separated Inbox, watch-list, and Backlog sections; Backlog is last. Watch-list importance can be rearranged in the GUI.
- Thumbnails are the default density, with Compact available. Clicking a video title or thumbnail opens it.
- Keep whole-list opening near the video content, not in the sidebar.
- Use clickable sorting headers in both densities. The video-order dropdown and video reorder arrows were rejected. Keep Manual near the table.
- Dragging videos shows an exact insertion marker and automatically switches to Manual; users do not have to select Manual before rearranging.
- Show a most-videos-first channel shortlist with expansion. Keep the reversible Across Library toggle beside the selected channel.
- Group Library-wide channel results by destination. The approved layout direction carries forward the preview's Columns default and Rows/Columns toggle. Rules for displaying empty destinations and navigating through destination headings remain feature-design details; the source audit below records the preview's behavior.
- Put search beneath the list heading, initially scoped to the selected list. Keep the entire-Library on/off toggle in a fixed position; query and channel filters survive scope changes and can return to the originating list.
- Provide a clear Select all control with result count. The approved layout direction uses contextual batch actions and a partial-selection indicator. Moving selected videos between lists by dragging is supported under the sorting contract below; selection changes and filtered-drop behavior still require feature design.
- Keep controls anchored while scopes change: channel buttons must not reorder or move, and scope toggles must not shift the layout.
- Hide the root page scrollbar while preserving native scrolling. This does not specify hiding nested scrollbars.

Overarching approval covers the visual direction above. Q39 separately adopts the sorting contract below, and Q40 approves presentation persistence. Other interaction details in the source audit remain references for feature interviews unless explicitly settled in the confirmed requirements. This preserves Q45's distinction between the layout reference and domain logic: in-memory Undo limits, simulated tab success, and fixture metadata do not establish production guarantees. Color and theme remain deferred.

### Sorting contract adopted at Q39

- Clickable title, channel, destination, duration, and publication headers are available in both densities. Library date sorts are expandable buttons, and Manual stays beside Select all. Grouped channel results expose Title, Published, and Duration shortcuts plus Library dates and Manual.
- Clicking the current non-Manual sort reverses its direction; selecting a different non-publication sort starts ascending. Publication direction follows the selected list's remembered oldest/newest choice. Choosing publication direction in All active applies that direction to all lists, as the prototype does. Missing values remain last in either direction.
- Manual returns to the saved arrangement, including source order initialized when a new list is imported (Q46). Only lists without an imported or manually rearranged order continue following their publication-date direction in Manual. There is no separate global manual video order; Library-wide Manual keeps each destination's arrangement.
- Dragging one video within a list shows its exact before/after insertion position. It adopts the full current ordering, including hidden records, before moving the video and entering Manual. Changing views later preserves this arrangement; future arrivals append to manually arranged lists.
- Selected videos can be moved between destinations together. Reordering within a destination is one video at a time, matching the prototype.
- Watch-list overview sorts affect only custom watch lists; Inbox remains first and Backlog last. Dragging a watch list from a temporary overview adopts the displayed watch-list order, applies the insertion, saves that importance order, and switches the overview to Importance. Overview sorting alone never changes importance or quick-save destinations.
- A dedicated reset-manual-order command is omitted from initial scope; the prototype's Reset demo resets all fictional data and is not a production command.

### Other demonstrated behavior for feature-design reference

The following is a source audit, not an approval of these algorithms or logical edge cases. Use the user-confirmed rules above as authoritative and resolve remaining details in feature interviews.

- Show five channel shortcuts and an expansion control; keep a selected channel visible beyond the cutoff. Do not add a configurable cutoff initially. Rank by video count in the explicitly selected list or All active view, breaking ties by channel name. Scope toggles retain the ranking anchor; displayed counts follow the current scope and ignore text search. Explicit list navigation establishes a new anchor. Real channel identity and absent metadata remain open.
- Text search matches title, description, channel, and URL, combined with the channel filter. Both scope toggles control the same list-versus-active-Library scope, retain query/channel, and can return to the originating list. Selecting a sidebar list narrows scope while retaining filters. Ordinary search excludes retained history.
- Select all selects all filtered matches. Changing text, channel, or scope clears selection; changing density or video sort preserves it. Data-edit actions clear selection. Batch Move/Open/Watched/Dismiss controls appear only while selection is nonempty.
- Grouped channel results retain Columns and Rows choices, start in Columns, and use the current watch-list overview order between Inbox and Backlog. They show only destinations with matching videos.
- Open entire list includes videos hidden by filters and displays its full count. Open selected includes only the selected videos. The demo's confirmation for every opening and its always-successful simulated tabs are demonstration scaffolding. The later [focused opening/history contract](opening-and-watch-history.md) settles real naming/focus, review-before-grouping, new viewing tabs and distinct partial/grouping/unknown failure handling; it does not change the settled focused single-video opening.
- Undo can reverse a whole batch or custom-list deletion, restoring prior membership, order, list identity, and importance. The demo stores at most 30 full-state snapshots in memory; production retention, persistence, historical restoration, and interaction with later edits remain open.

See the [source audit and question reconciliation](../design/library-layout.md#production-design-follow-up---prototype-source-audit) for which interview questions the prototype answers and which remain open.

## Layout prototype handoff

Completed on 2026-10-13: the user concluded the prototype after refining A with channel navigation and density ideas from C and grouped Library-wide channel results from B. Read the [final layout feedback](../design/library-layout.md) for the consolidated result, original observations, prototype source/run instructions, and remaining implementation assumptions. Color/theme and production implementation are deferred. The result is incorporated above; the throwaway code is a reference, not a production implementation.

The separate session followed the initial local prototype ticket and returned its feedback. Its source and original handoff are preserved through the [prototype archive](../prototypes/library-layout.md). GitHub Issues now track active work.

## Proposed quality safeguards

These are assistant recommendations for the final design, not additional confirmed user decisions:

- Import results account for every input as saved, already present, needing a decision, or failed/unsupported; failures remain visible and retryable.
- Missing or unavailable metadata must not silently discard a saved video. Keep its URL and available title so it can be reviewed or opened later.
- Bulk edits and opening videos preserve enough prior state for restoration. An unsuccessful attempt to open a tab must not silently remove the video from its active list.
- Any explicit save-and-close operation closes a source tab only after its video has been saved successfully.
- Validate backup files on import and verify restoration preserves videos, list membership, order, and history.

## Research constraints awaiting design decisions

See [metadata and identity research](../research/video-metadata-and-identity.md) for primary sources and limits of verification.

- The official YouTube API provides descriptions, duration, and publication time for accessible videos. Publication time can differ from original upload time; the UI should not silently imply access to an unavailable original upload timestamp.
- Public API lookups require an API key; basic browser capture does not by itself supply all metadata fields. The optional user-configured key is accepted; retrieval scheduling and setup details remain to be designed.
- Failed metadata retrieval does not establish that a video is deleted or private, and metadata availability is not a guarantee of playback availability.
- No general public API for arbitrary reupload content matching was found. Same-upload identity can be deduplicated; cross-upload similarity could support suggestions but does not establish safe automatic merging.
- YouTube API metadata has refresh/deletion requirements, so indefinite preservation of fetched descriptions or titles after disappearance is not yet an established capability. The saved user record and history must be distinguished from fetched metadata.

## Comments

### 2026-10-13 - First interview round

The user confirmed exclusive list membership and channel views at both list and Library scope. They clarified that keeping up with videos requires both initial backlog import and ongoing manual additions, that intended viewing is separate from playback progress, and that unreviewed videos must remain distinct from reviewed videos saved for later.

### 2026-10-13 - Second interview round

The user requested both numeric priority and GUI sorting, context-menu and toolbar capture with top-list shortcuts, preservation of Chrome tab groups, and strict prevention of duplicate videos. They chose opening a video as the normal trigger for marking it watched and removing it from its active list, while retaining explicit watched/dismissed actions and hidden history. They want prior locations recoverable from history and asked how OneTab and Session Buddy handle storage and restoration before settling that policy.

### 2026-10-13 - Third interview round

The user prefers browser portability, accepting Chrome-first if necessary. They clarified that priority means a human-defined order of lists, not numeric scores or per-video priority. Videos support multiple date sorts and a persistent manual order initially based on release dates. Previously watched videos found again must be reviewable with their prior list/date, while genuine repeat watches may add history. The user accepted the proposed local recovery and external-backup baseline and import group mapping, and requested opening a whole list into browser tabs; that last behavior remains ambiguous.

### 2026-10-13 - Fourth interview round

The user confirmed one browser tab per video grouped together, a notice above 10 tabs, one video record with multiple genuine watch events, and duration sorting. They added a first Inbox-exit timestamp and prohibited returning anything to Inbox, superseding the earlier repeat-watch Inbox flow. They clarified that manual order continues following release date until actually rearranged, expressed interest in deduplicating genuine reuploads when practical, and raised unavailable videos and optional description storage.

### 2026-10-13 - Fifth interview round

The user accepted repeat-save review without returning watched videos to Inbox, an Undo exception to the one-way Inbox rule, searchable expandable descriptions, possible-duplicate suggestions for reuploads, and optional personal YouTube API-key setup. They accepted availability badges and retry/open-anyway/dismiss actions, but explicitly required opening unavailable videos with the rest of a list instead of skipping them. The watched-status effect for these known-unavailable openings remains unresolved.

### 2026-10-13 - Sixth interview round

The user confirmed that opening a known-unavailable video marks it watched, accepted mixed-window previews and batch operations, and deferred preview-free capture with website filters. They replaced automatic move-to-Backlog on list deletion with explicit delete-and-dismiss-all or delete-and-move-to-a-chosen-list choices, including Inbox as a second return exception. Initial quick-save destinations are the three most important lists plus Backlog and a default Inbox action; usage-based ranking is not selected. The user requested a reminder of the Library/Inbox/Backlog terminology.

### 2026-10-13 - Seventh interview round

The user confirmed permanent Inbox and Backlog destinations, release-date order defaulting to oldest first with a per-list oldest/newest toggle, and list overview sorting by importance, name, video count, total known duration, and most recent addition. Duration totals must disclose the number of videos with unknown duration, and temporary list sorting must not change importance or quick-save shortcuts.

### 2026-10-13 - Layout handoff received; development workflow under discussion

The user returned after completing the layout prototype. The confirmed preferences from layout-feedback.md are incorporated into Selected Library layout, while mock implementation assumptions remain open. The user now wants to decide how development work will be organized and is leaning toward GitHub rather than using `.scratch/` for everything. No tracker migration or remote repository creation has been performed.

### 2026-10-13 - GitHub workflow setup

Durable specifications, research, and layout feedback moved into `docs/`; the former `.scratch/` locations contain compatibility pointers for previous sessions. Agent guidance now uses GitHub Issues for active tasks and the repository for design documents. The completed prototype remains a throwaway reference, separate from production work.

### 2026-10-13 - Interview resumed at Q38; prototype consulted

The user accepted Q38's direct-to-list timestamp rules and instructed Q39 to follow the prototype's sorting. They asked for clearer explanations of Q40 and Q41 and requested a source audit to avoid re-asking behavior already demonstrated. The final prototype source and README were inspected; sorting is now explicit, demonstrated UI behavior is carried forward as identified defaults, and simulation-only or absent features remain open. Q40 and Q41 were not answered yes; the audit narrows Q40 to persistence and explains Q41's existing Columns/Rows choice without removing it. Q42 no longer needs a separate interview question. No approval of the complete design, implementation planning, or production implementation has occurred.

### 2026-10-13 - Overarching scope clarified; feature details deferred

The user accepted Q40 preference persistence and Q46 imported source order. Q44 changes generic rediscovery to a detailed watched/dismissed review with Keep returning the existing record to Inbox; destination shortcuts instead retain their placement with a warning and subsequent Dismiss/Leave here review. Q45 reasserts strict duplicate prevention and clarifies that the prototype is for layout, not domain logic. Q49 accepts the automatic snapshot baseline and adds manually saved snapshots. Q43 asks how retained history differs from Undo and point-in-time restoration; neither a 30-action cap nor indefinite reconstruction has been accepted.

The user requests overarching-design approval first, then feature splitting, a focused interview and spec/ticket for each feature, and implementation planning and work per approved feature. The broad summary and explicit feature deferrals above replace the attempt to finalize every interaction in issue #2. No overarching-design approval or implementation authorization has occurred.

### 2026-10-14 - Final overarching choices settled; approval requested

The user accepted Q43: both step-by-step Undo and whole-Library restoration to a retained history point. Q51 accepts Chrome first provided later browser adaptation stays simple; the design therefore shares product/UI and isolates browser integration rather than selecting a Chrome-only architecture. Exact history retention and browser port validation are deferred to their feature specs. The revised complete overarching design is ready for user review; these individual answers do not constitute approval of the whole document.

### 2026-10-14 - Overarching design accepted; feature breakdown begins

After confirming that the written design includes the recorded decisions through Q51 and accepted prototype insights, with Q1-Q37 preserved as consolidated requirements rather than a verified numbered transcript, the user said "ok then great" and asked whether splitting into features is next. This is recorded as acceptance of the overarching design and continuation into feature decomposition. The proposed feature map is a scope breakdown for review, not an implementation plan or approval of deferred feature details.

### 2026-10-14 - Feature ownership tightened; early end-to-end delivery required

The user requires foundation to remain small/provisional, with storage/interfaces refined through recovery/capture/import needs. Foundation owns same-video identity and enforces one record/active destination; Capture owns save/rediscovery interaction; Imports owns conversion and batch review. Exact duplicates remain distinct from possible reuploads. A concrete early field-provenance and refresh/removal contract must address historical copies before foundation/recovery designs are settled. Imports moves beside Capture in interview order. Feature-design areas do not map one-to-one to modules or milestones. An early usable save/find/open/recover slice, tested in a real browser and by the user, must precede completion of full layers or all areas.

### 2026-10-14 - First slice scope and metadata behavior accepted

Q52 accepts a small current-tab toolbar-save/Inbox/find/open/recover test build with real persistence and Undo surviving restart. Other capabilities are delivered incrementally without changing the full product scope. Q53 accepts a separate personal title that survives automatic refresh and takes display precedence. Q54 accepts restoring user decisions/authored fields while automatic metadata remains current/valid or missing, rather than rewinding stale provider responses. The complete first-slice spec still needs approval; accepted individual answers do not authorize implementation planning yet.

### 2026-10-14 - First-slice recovery scope accepted

Q55 accepts persistent Undo opening for the first test build: restore the latest opening's prior active placement, reverse that opening's watched marking, leave the browser tab open, and avoid overwriting newer edits. Broader Undo/history recovery remains in the full product scope for later slices. All material first-slice questions are settled; the complete written slice spec is awaiting approval before implementation planning.

### 2026-10-14 - First-slice spec approved; spec/ticket workflows adopted

The user accepted the complete first-slice spec with "ok great" and requested a size/context assessment before to-tickets, including whether later areas can be specified after focused grilling. The original draft used grill-with-docs and builder review, not to-spec; the approved content was then formalized with the requested to-spec template and user stories without adding scope. The approved real-browser workflow is the primary testing boundary. The feature map now records established behavior and remaining interview/evidence work for every later area. Next: agree on vertical implementation tickets and their blockers; no ticket breakdown or production implementation is approved by this spec acceptance alone.

### Ticketing and publication follow-up

The user subsequently approved a five-ticket breakdown and it was published as issues #4-#8 under #3. The initial save/find build is separate from opening/recovery, which completes the first end-to-end path before the rest of the milestone. On 2026-10-17, the user requested publication of the complete documentation update and an open roadmap issue for returning to the remaining scope. [Issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) carries that scope across later slices; its next feedback checkpoint follows #8 and its dependencies. These publication changes preserve the approved product and first-slice behavior.
