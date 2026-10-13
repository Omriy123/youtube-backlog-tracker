# Personal video backlog tracker

Design status: open decisions remain; production implementation is not yet approved.

This design is being developed through an interview. Confirmed requirements below do not constitute approval of a complete design or implementation.

## Purpose

Keep up with saved videos, replace a large accumulation of open tabs, and make it easy to decide what to watch next. Trust that saved videos will not be lost is central.

Two workflows have equal importance:

- Load the existing backlog.
- Continually save new videos manually.

## Confirmed requirements

- Initially a desktop browser extension for one person. The user prefers browser-agnostic support if practical, with Chrome-only initially acceptable if supporting other browsers is substantially more work. The initial browser support commitment remains to be settled.
- The main Library page includes Inbox, Backlog, and all watch lists; the toolbar popup handles quick capture. Refined prototype A is the selected layout reference, as detailed below.
- Adding videos from mobile would be useful later. Public release is a possibility, not an initial requirement.
- Library means the whole collection. Each active saved video belongs to exactly one list; watched and dismissed videos remain recorded but leave active lists.
- Inbox holds videos awaiting a placement decision, normally new videos the user has not reviewed. Once a video leaves Inbox, ordinary moves and repeat saves cannot return it. Two explicit exceptions allow return: Undo of an accidental departure, and choosing Inbox as the destination when deleting a custom list. This supersedes the earlier initial-review-only and Undo-only formulations.
- Backlog holds reviewed videos deliberately put at the back of the generic pile. It remains distinct from Inbox.
- Watch lists represent videos the user intends to watch soon, not videos currently in playback.
- Playback progress tracking is not needed; the user relies on YouTube for that.
- The user will continue to have some video tabs open alongside the tracker.
- Channel views must work within a specific list and across the Library without changing list membership.
- Watch lists have a human-defined importance order, not arbitrary numeric priority scores. Videos have no priority score. This supersedes the earlier interpretation of numeric priorities.
- Lists can be viewed by importance order, name, video count, total known duration, or most recent addition. Alternative views do not redefine importance order or change quick-save shortcuts. Display how many videos have unknown duration alongside duration totals.
- Inbox and Backlog are permanent destinations. They can be emptied through batch actions but cannot be deleted.
- Deleting a custom watch list offers two explicit choices: delete and dismiss all its remaining videos, or delete and move them to a chosen destination list, including Inbox or Backlog. Do not automatically choose Backlog. Prior history remains available.
- Videos can be sorted by release/upload date, first saved date, first Inbox-exit date, latest list-entry date, duration, and saved manual order. Release-date order defaults to oldest first, with an oldest/newest toggle remembered separately for each list. Timestamp behavior for direct-to-list saves remains to be specified. Unknown dates sort last.
- First saved date remains fixed for the video; first Inbox-exit date records its first move out of Inbox; latest list-entry date records its most recent entry into a list. Release/upload dates describe the source video, not its addition to the extension.
- Manual video order follows release-date order until manually rearranged, then retains the user's arrangement and appends new arrivals. Switching to a date-based view does not overwrite the manual order. Whether users can reset a manual arrangement remains to be specified.
- Channel filtering is compatible with both chronological and manual views.
- Saving must support the current video tab, a video link/thumbnail without opening it, and multiple tabs in the current window.
- Right-click capture and toolbar quick-save offer the top three watch lists by saved importance order, Backlog, and a default save action that sends to Inbox. These shortcuts are not based on temporary display sorting or usage frequency. Frequency-based shortcuts were considered but not selected for the initial version.
- The extension toolbar offers capture of the current video/tab and all tabs in the window. Generic saving defaults to Inbox; a chosen destination bypasses Inbox.
- Saving a mixed window shows a preview with recognized video links selected and other pages unchecked. The user can include an unrecognized video page using its URL/title fallback. A future quick-add mode with website filters and no preview is deferred.
- Saving leaves existing tabs open, with closing as a separate explicit action, as accepted in the second interview round.
- Multi-select supports moving, dismissing, marking watched, and opening videos together, including selecting all matches for the current filter. Batch changes support Undo.
- The current backlog includes Chrome tab groups whose grouping must be preserved during import. Each group defaults to a same-named list; an import preview allows mapping it to an existing list or Inbox. Preserve within-group order where the source supplies it, and resolve duplicate destinations in the preview. OneTab and Session Buddy imports are also requested; exact formats and precedence of imported order versus release-date initialization remain unresolved.
- The same video must not appear multiple times in the Library. Saving an active duplicate reports it as already saved and preserves its list and position.
- Saving a previously watched video shows a review prompt with its previous list and watch dates, offering queue again or ignore. Queue again requires a destination outside Inbox; ignore leaves the existing record and history unchanged. Imports surface these decisions in the import review. Previously watched videos must not be silently skipped.
- A video has one record and may have multiple watch events. Rediscovery alone does not create another watch event; ignoring a rediscovery preserves its existing watch history, while genuinely watching again adds another watch event. The previously proposed Inbox destination for this review is superseded by the one-way Inbox rule.
- References to the same underlying upload are deduplicated automatically. Different uploads that look similar may produce possible-duplicate suggestions, with the user deciding whether to keep or dismiss the new upload. Do not automatically merge different uploads based on metadata similarity.
- The main open action opens the video in a new tab, marks it watched, and removes it from its active list. It does not wait for playback or require the user to return and confirm completion.
- Explicitly marking a video watched is also required, including after watching on another device. Dismissing unwanted videos is supported.
- Watched and dismissed videos remain in history and are excluded from ordinary views unless explicitly requested.
- History must make it possible to determine where a video was before an accidental move or removal. Exact undo and restoration behavior remain to be settled.
- The user accepted local storage, persistent change history with restoration, automatic local recovery snapshots, downloadable complete backups, and backup reminders as an initial baseline, with cloud sync deferred. Backups include lists, ordering, video records, and history. Recovery after whole-profile loss depends on an external backup. Retention and backup scheduling remain to be designed.
- Opening an entire watch list opens each video in its own tab, together in a tab group. Show a notice when opening more than 10 tabs that many tabs will open and the operation may take time. This is not a playlist feature.
- Bulk opening is the batch equivalent of single-video opening, marking successfully opened videos watched and supporting restoration of their former placement. Known-unavailable videos are also opened and marked watched; creating the browser tab must succeed, but successful playback is not required. If the video becomes available later, it can be queued again through repeat-save review.
- Metadata includes title, channel/creator, thumbnail, duration, and upload/release date where obtainable. A saved URL and editable title provide a fallback. Missing metadata must not block saving; unknown dates sort last.
- Include descriptions where obtainable, searchable and displayed in an expandable details area. Treat fetched descriptions as refreshable metadata; indefinite preservation after source disappearance remains subject to retrieval and retention constraints.
- The YouTube API key is optional and configured by the user for this personal version. Saving and organizing links must work without it; connected API access enriches accessible videos, including imported links. Without the connection, metadata and associated sort views may be incomplete.
- Videos may become deleted, private, or otherwise unavailable after being saved. Keep their records and display an availability badge; offer retry, open anyway, and dismiss. Do not silently remove them or infer unavailability merely from a network error.
- Opening an entire list must include known-unavailable videos rather than skip them. The user explicitly rejected skipping unavailable videos during bulk opening. Precise cause labels are used only when known; availability checks and fetched-metadata preservation remain to be designed.
- Twitch VODs and other non-YouTube videos must be supported. A manually sorted list is an acceptable fallback if needed; exact metadata expectations are unresolved.
- Automatic discovery from channels or subscriptions can follow later. Humans decide watch-list placement.

## Decisions still open

- Production details of the selected layout, including preference persistence, filter/reorder semantics, and configurable channel shortlist size. Color and theme are deferred.
- Direct-to-list timestamp semantics and resetting manual arrangements.
- List-deletion Undo details and explicit save-and-close interactions.
- Import formats and scale, default-order precedence, and destination conflict resolution when a video appears in multiple groups.
- Duplicate identity across URL variants and providers, possible-duplicate suggestion criteria, and handling previously dismissed videos when saved again.
- Open behavior exceptions, history retention, undo, and restoration destinations.
- Backup scheduling and history/snapshot retention within the accepted local-first baseline.
- Channel ranking and filtering details, including missing metadata; stable controls and scoped navigation are settled by the layout feedback.
- Grouped opening details and how the tracker coexists with existing video tabs.
- Metadata retrieval and refresh, availability checks, and support boundaries for each video provider.
- Application form, storage, browser permissions, and delivery.

## Selected Library layout

The user completed the prototype and selected refined A as the visual and interaction reference, incorporating C's channel controls and density options and B's destination-grouped Library results. The [layout feedback](../design/library-layout.md) is the detailed record and links to the runnable throwaway prototype.

- Use a persistent sidebar with separated Inbox, watch-list, and Backlog sections; Backlog is last. Watch-list importance can be rearranged in the GUI.
- Thumbnails are the default density, with Compact available. Clicking a video title or thumbnail opens it.
- Keep whole-list opening near the video content, not in the sidebar.
- Use clickable sorting headers in both densities. The video-order dropdown and video reorder arrows were rejected. Keep Manual near the table.
- Dragging videos shows an exact insertion marker and automatically switches to Manual; users do not have to select Manual before rearranging.
- Show a most-videos-first channel shortlist with expansion. Keep the reversible Across Library toggle beside the selected channel.
- Group Library-wide channel results by destination. The final preview uses vertical columns; horizontal rows remain an alternative, not a separately settled production preference.
- Put search beneath the list heading, initially scoped to the selected list. Keep the entire-Library on/off toggle in a fixed position; query and channel filters survive scope changes and can return to the originating list.
- Provide a clear Select all control with result count. The final reference uses contextual batch actions after selection and supports dragging selected videos between lists; the exact selection treatment was not separately specified.
- Keep controls anchored while scopes change: channel buttons must not reorder or move, and scope toggles must not shift the layout.
- Hide the root page scrollbar while preserving native scrolling. This does not specify hiding nested scrollbars.

The prototype's five-channel cutoff, exact ranking algorithm, adoption of the visible sort when starting a drag, Undo retention, and other mock implementation defaults remain proposals. Prototype completion does not turn these into hard requirements or authorize production implementation. Color and theme remain deferred.

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
