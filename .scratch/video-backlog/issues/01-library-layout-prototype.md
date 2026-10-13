# Prototype the video Library layout

Record: historical local ticket; active tracking is in GitHub Issues.
Outcome: complete — user concluded the prototype on 2026-10-13; design-interview handoff ready.
Type: prototype

## Answer

The user concluded the prototype on 2026-10-13. Use the final refined A as the layout reference: sidebar navigation; thumbnail default with compact option; header sorting and drag insertion previews; automatic Manual mode; scoped search and reversible channel navigation with stable controls; destination-grouped Library channel results; separated Inbox/watch lists/Backlog; contextual selection; invisible page scrollbar.

The consolidated result and distinctions between explicit preferences and prototype defaults are in [layout-feedback.md](../layout-feedback.md). The runnable source and original comparisons remain in [prototypes/library-layout/](../prototypes/library-layout/README.md). Color/theme and production implementation are deferred.

This historical local ticket is preserved with the source on branch `archive/library-layout`; active task tracking has moved to GitHub Issues. The result has been incorporated into `docs/specs/video-backlog.md`. Production promotion remains deferred.

## Handoff

The user explicitly requested a fresh session using `$prototype` to explore the Library layout. Build the throwaway UI prototype in that session, gather the user's feedback, and return the result to the original design interview. The interview has covered 37 numbered questions; the user is not asking to repeat it or implement the extension yet.

## Read first

1. Root `AGENTS.md` and its domain/issue-tracker guidance.
2. Root [GLOSSARY.md](../../../GLOSSARY.md), [open-means-watched ADR](../../../docs/adr/0001-mark-watched-on-open.md), and [Inbox exceptions ADR](../../../docs/adr/0002-reserve-inbox-for-initial-review.md).
3. [The current design spec](../spec.md), especially Confirmed requirements. Its Comments section is chronological history: later decisions supersede older statements there. Proposed safeguards and open decisions are not approved requirements.
4. `C:/Users/omriy/.codex/skills/prototype/SKILL.md` and its `UI.md` branch. This is a layout question, not a state-machine prototype.

## Question to answer

Which Library layout makes it easiest to choose what to watch next, sort many new videos into lists, and browse by channel without losing track of each video's destination?

The main Library includes Inbox, Backlog, and custom watch lists. It is a full browser-tab surface belonging to the planned extension; the small toolbar popup is a separate capture surface. Existing saved videos may number in the thousands, so compare layouts at useful desktop density rather than presenting a nearly empty dashboard.

## Prototype brief

Use the UI skill's default of three structurally different variants on one local route, selected by `?variant=` and its floating bottom switcher. Suggested starting directions, not user-approved designs:

- A: persistent list sidebar with a detailed selected-list view.
- B: lists shown side by side, emphasizing moving videos between them.
- C: a compact table with strong list/channel navigation, emphasizing scanning and bulk sorting.

Use the same representative data and interaction scenarios in all variants. Let the user combine elements rather than forcing a winner unchanged. The earlier interview offered sidebar and side-by-side alternatives; neither has been selected.

Use in-memory sample data, with roughly 60-100 videos, Inbox, Backlog, several named watch lists, and repeated channels across lists. Include YouTube, Twitch VODs, generic video links, missing metadata, unavailable videos, descriptions, prior watch history, and a list exceeding 10 items. These are proposed prototype fixtures, not new product requirements.

Keep the prototype local and clearly marked throwaway. Use an existing app surface if one exists when this session starts; otherwise create the smallest standalone preview under `.scratch/video-backlog/prototypes/library-layout/`. Detect available tooling and provide one command to run it. Product framework, extension packaging, and storage architecture remain open.

## Interactions needed to judge the layouts

Make these interactions work with the mock data:

1. Browse a list, browse all active videos, and filter by channel both within a list and across the Library.
2. Change video sort order, including duration and publication date, then return to the retained manual arrangement. Drag/reorder and move selected videos between lists.
3. Change list importance and switch to an alternative overview sort without changing importance. Include counts and known-duration totals with missing-duration counts.
4. Multi-select Inbox videos, move them to a watch list, and Undo.
5. Expand a video's details/description and search the available text.
6. Simulate opening a video or an entire list: update mock watched/history state, display the simulated grouped-tab result, and show the notice above 10 items. Keep this simulation inside the prototype rather than opening real external video tabs.

Implement enough supporting UI to compare the workflow; it need not implement every setting or import feature from the full spec. Any visible control should work against mock state or be visibly marked as outside the prototype. A compact, collapsible state inspector or interaction log can satisfy the skill's state-visibility requirement without cluttering the product layout under evaluation. Preserve mock edits across variant switches and offer Reset demo.

## Semantics easy to get wrong

The linked spec is authoritative; this checklist highlights cases that affect the layout comparison:

- Library is the collection, not another destination. Inbox and Backlog are permanent and distinct.
- Each active video belongs to one list; channel views do not create extra membership.
- Importance ranks lists only. There are no per-video priority scores.
- Release-date order defaults oldest first. Manual order follows release dates until rearranged, then preserves the arrangement and appends arrivals. Other sort views do not overwrite it.
- Opening marks watched and removes the item from active views, even when marked unavailable. Watched/dismissed history is hidden unless requested. Playback progress is outside scope.
- Ordinary moves and repeat saves cannot return a video to Inbox. Undo and the explicit destination choice during custom-list deletion are the two exceptions.
- Deleting a custom list offers dismiss-all or move-all to a chosen list, including Inbox; do not silently pick Backlog.

Use mock operations for these semantics. Real imports, browser permissions/tab APIs, API credentials, network metadata, persistence, backups, and a deployable extension are outside this prototype. If a visible layout decision requires an unsettled behavior, identify it as a prototype assumption and ask only the focused question needed; bring any resulting recommendation back to the original interview.

## Deliverables and feedback

Completion of the build means the user has a working local preview, one run command, direct variant URLs, and a brief explanation of the differences. Follow the prototype skill's lightweight approach: no production scaffolding or automated test suite; manually check the variant switcher and the listed interactions.

Gather feedback on these tasks:

- Pick a video to watch from a chosen list.
- Sort a batch from Inbox into two destinations.
- Find one channel's videos within a list and across the Library.
- Change chronology, manually rearrange videos, and recover that order after switching views.
- Compare the list overview by importance, count, and duration.

Write the resulting feedback to `.scratch/video-backlog/layout-feedback.md`, recording:

- Which variant, or combination of elements, the user chose and why.
- Density, navigation, drag/drop, selection, and channel-view preferences.
- What failed or felt cumbersome.
- User-confirmed changes versus recommendations and unresolved questions.
- Prototype path, run command, variant URLs, and any branch/commit capture reference required by the prototype skill.

If the user has not chosen yet, record that the decision is pending; do not invent a verdict. Keep the variants available as the primary source. Report any environment limitation that prevents branch archival, and preserve the artifacts. Promotion to production is outside this handoff; the original session will incorporate validated design decisions before planning implementation.

## Comments

### 2026-10-13 - User concluded the prototype

The user said “ok i think the prototype is finished.” Closed the exploration and finalized [layout-feedback.md](../layout-feedback.md), including the final refined-A reference, user decisions, implementation assumptions, run instructions, and archival limitation. The triage label routes the completed result back to the original interview; no further prototype feedback is required. Color/theme and production implementation remain deferred.

### 2026-10-13 - Invisible page scrollbar

The user requested an invisible scrollbar. Hid the root scrollbar while keeping native scrolling enabled and eliminating its width allocation in both short and tall views. This replaces the earlier visible reserved gutter; nested scrollbars remain unchanged. Recorded the preference in layout-feedback.md.

### 2026-10-13 - Prevent scrollbar-induced layout shift

Reproduced the user's leftward shift on Library search: grouped channel results add a vertical scrollbar, shrinking the layout by 15 pixels. Reserved scrollbar space on the root page. Browser measurements at 1440 × 1200 confirm stable search-control and header positions across all eight fixture channels. Feedback recorded in layout-feedback.md.

### 2026-10-13 - Stable channel order during scope changes

The user reported that Across Library reorders the channel buttons and reiterated a preference against jumping controls. Anchored channel ranking to explicit list navigation and reserved count-label width; scope toggles now update results/counts without re-ranking the existing buttons. Recorded the feedback in layout-feedback.md.

### 2026-10-13 - Reversible channel scope

The user reported that Across Library for a channel could not be reversed. The active state was rendered as a static badge. Replaced it with a persistent on/off toggle that returns to the originating list and retains channel/search filters. Recorded the correction in layout-feedback.md.

### 2026-10-13 - Stable search toggle; theme deferred

The user disliked the search-scope button shifting and requested a toggle that stays in place. Replaced the variable-width control with a fixed-width on/off toggle and reserved a separate scope-information line. The user explicitly deferred color/theme decisions; recorded that decision in layout-feedback.md.

### 2026-10-13 - Thumbnail default and scoped search

The user preferred the latest revision, requested Thumbnails by default, and asked for search scoped to the selected list with an entire-Library toggle. Updated the preview accordingly and moved search beneath the list heading. Query text is retained when changing scope; channel filters remain visibly identified. Recorded the changes and the user's theme-scope question in layout-feedback.md. No color/theme choice or production implementation is approved.

### 2026-10-13 - Manual button placement and vertical channel preview

The user requested Manual closer to the table and asked to see Library-wide channel results vertically. Moved Manual beside Select all above the content, and changed the initial/reset channel grouping to Columns. Rows remains available. Recorded both requests in layout-feedback.md; the orientation is still a comparison choice, not a finalized design decision.

### 2026-10-13 - Second feedback round and refinement

The user requested drag insertion previews, title/thumbnail opening, nearby Across Library access without the redundant In Inbox control, header-based sorting in compact and thumbnail views, grouped Library-wide channel results resembling B, and separators with Backlog below watch lists. They disliked the video-order dropdown and leaned toward never displaying video reorder arrows.

Updated the throwaway preview accordingly and captured the full feedback in [layout-feedback.md](../layout-feedback.md). Library-wide channel results offer Rows and Columns for comparison; neither orientation is approved. The prior A refinement is preserved in `prototypes/library-layout/refinement-1/`. Browser walkthrough verified sort direction, missing-value placement, title/thumbnail simulation, insertion before/after including horizontal end placement, group layouts, and sidebar ordering. No production promotion or architecture changes.

### 2026-10-13 - User preference captured; refined A available

The user prefers A as the base, C-style channel controls with a most-videos-first expandable shortlist, and a compact/thumbnail toggle. They requested GUI reordering of lists, automatic Manual sort on video rearrangement, whole-list opening closer to the videos (explicitly not in the sidebar), a clearer Select all control, and a replacement for the always-visible Select matches bar. They also liked B's Library-wide channel browsing.

Recorded the feedback and separated confirmed preferences from implementation proposals in [layout-feedback.md](../layout-feedback.md). The same A URL now shows the refinement. Five visible channels, compact by default, and selection-only batch actions are trial choices awaiting review. The original comparison sources are preserved in `prototypes/library-layout/original-comparison/`. Browser walkthrough verified the new controls and preserved state. Status remains needs-info for the remaining interaction decisions, not for the overall preferred layout direction. Production remains deferred.

### 2026-10-13 - Preview built; user comparison pending

Three working alternatives are available at [prototypes/library-layout/](../prototypes/library-layout/README.md). Run from the project root with `powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/library-layout/serve.ps1`, then open `http://127.0.0.1:8765/?variant=A` (or B/C). Switch variants with the floating arrows to retain mock edits.

Browser walkthrough covered the required interactions, including simulated opening of 12 videos with unavailable records included and Undo restoring them. See the README for assumptions and verification limits. [layout-feedback.md](../layout-feedback.md) records the comparison, assistant recommendations, and the pending user decision. No layout is approved and no production code is being promoted.

Archival limitation: there is no Git repository or usable Git command in this workspace. The complete throwaway source remains in the prototype directory for later branch capture. Status is needs-info because the design verdict requires user feedback; the preview build is available now.

### 2026-10-13 - Prototype session started

Claimed for the requested throwaway layout comparison. Building A (sidebar), B (side-by-side lists), and C (compact table) with shared in-memory fixtures. This workspace has no app surface or `.git` directory; preserve the prototype in the requested folder and document branch archival as unavailable. The final layout decision awaits user feedback.

### 2026-10-13 - User-requested handoff

The user asked to move layout prototyping into a new session using `$prototype`, then return to the original interview with an answer. This issue is the entry point for that session. No layout has been selected and no prototype has been built by the originating session.
