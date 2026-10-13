# Library layout feedback

Date: 2026-10-13

Outcome: complete — user concluded the prototype on 2026-10-13; accepted layout decisions are incorporated into the product spec.

## Decision

**Finished: refined A is the layout reference.** On 2026-10-13 the user said, “ok i think the prototype is finished.” This concludes layout exploration with A's sidebar, C-inspired channel controls and density options, and B-inspired grouped Library-wide channel results. It does not authorize production implementation or promote the throwaway code.

The original design interview has incorporated this result. This document preserves the feedback and distinguishes user choices from prototype implementation assumptions.

## Final handoff

- **Navigation:** persistent sidebar, separated Inbox / watch-list / Backlog sections; Backlog last; GUI watch-list importance ordering.
- **Video presentation:** Thumbnails by default, with Compact available. Click titles or thumbnails to open. Whole-list opening stays next to the video content, not in the sidebar.
- **Sorting:** clickable headers in both densities; no video-order dropdown or video reorder arrows. Manual sits near the table. Dragging shows an insertion marker and automatically switches to Manual.
- **Channels:** a most-videos-first shortlist with expansion; nearby, reversible Across Library toggle. Library-wide results group by destination, using vertical columns in the final preview; horizontal rows remain an alternative.
- **Search:** beneath the list heading, initially scoped to the selected list, with a fixed-position entire-Library toggle. Scope changes retain query/channel filters and can return to the originating list.
- **Selection:** clear Select all with a result count; the final preview shows batch actions only after selection and supports dragging selected videos between lists.
- **Stability:** scope toggles do not re-rank channel buttons or shift the layout. The root scrollbar is invisible while native scrolling remains enabled.
- **Deferred:** color/theme and production implementation. Architecture, storage, permissions, metadata, recovery, scale, and other open spec questions return to the original interview.

The final preview is the visual reference, including its current five-channel cutoff and contextual selection treatment. Those defaults were not individually specified by the user; do not turn them into additional hard product requirements solely because the prototype is complete. No further prototype feedback is required for this handoff.

Question: which Library structure makes choosing the next video, sorting Inbox batches, and browsing channels easiest without obscuring destinations?

## Alternatives and comparison

| Variant | Structure | Likely strength | Tradeoff to evaluate |
| --- | --- | --- | --- |
| A | Persistent list sidebar, detailed video rows, thumbnail placeholders, channel selector | Stable navigation and choosing from one list | Lower density; destinations use sidebar drops or a batch selector |
| B | Horizontally arranged list columns with cards and drop targets | Sorting while source and destination remain visible | Horizontal scrolling with six lists; tall cards and long titles use space |
| C | Compact table, list tabs, channel shortcuts, explicit metadata columns | Scanning and bulk selection with destinations visible | More controls; weaker visual recognition without row thumbnails |

Use the same five tasks in each: choose from Tonight; split an Inbox batch between Tonight and Backlog; find Studio North within Inbox and across the Library; rearrange manually and recover that order after changing sorts; compare list importance, count, and known duration.

## User feedback

- **Layout:** prefers A as the base; no additional reason for the overall choice was stated.
- **List sorting:** wants to rearrange lists through the GUI, as videos can be rearranged within a list. The prototype interprets this as dragging watch-list handles to change saved importance; Inbox and Backlog remain permanent.
- **Video sorting:** moving videos within a list should automatically change the sort mode to Manual. The user should not have to choose Manual before rearranging.
- **Channels:** prefers C's channel controls. Suggests showing the channels with the most videos first, with an expand button if there are more than a certain number. The exact cutoff was not specified.
- **Density:** likes C's compact list and wants a compact/thumbnail view toggle.
- **Whole-list opening:** the A/C header placement felt too far from the videos. Wants it closer to the table, like B. Considered a sidebar placement, then explicitly rejected it.
- **Selection:** dislikes the always-visible “Select matches” bar. Wonders whether it is needed when dragging is available. Wants a clearer Select all control. This is not a confirmed request to remove multi-selection or all batch actions.
- **Library-wide channels:** likes seeing a channel across the entire Library in B and wants to retain that capability.

These preferences were supplied after the first preview comparison. The rounds below preserve how the final reference evolved; later decisions supersede earlier proposals.

### Second feedback round

- **Insertion preview:** while dragging videos within a list, visibly mark exactly where the video will land.
- **Opening:** clicking a video title or thumbnail should open the video. Both targets are supported in the new prototype, through the existing opening simulation.
- **Channel controls:** the “In Inbox” button is redundant; “Across Library” is too far from the channel choice. Remove the former and place the latter beside the selected channel.
- **Sorting:** compact column headers should be clickable sort controls, with an equivalent interaction in thumbnail view. The video-order dropdown feels clunky and is rejected.
- **Channel across Library:** prefers a presentation closer to B, showing destinations as groups. A horizontal arrangement is also acceptable to explore; an orientation has not been selected.
- **Reorder arrows:** dislikes small arrows appearing only in Manual mode. They should always or never be shown, with a stated lean toward never. The prototype now omits them in every video sort mode.
- **Sidebar:** wants separators between Inbox, watch lists, and Backlog. Backlog should be below the watch lists.

At the end of the second round, the selection bar, channel cutoff, default density, and Library-wide channel orientation remained open. Subsequent updates below supersede that status where noted.

### Third feedback round

- Move the Manual sort button lower, closer to the table. It now sits beside Select all, directly above the video content, rather than in the upper toolbar.
- The user asked to see the Library-wide channel view vertically. The preview now starts with **Columns** (videos stacked vertically within each destination), including after Reset demo. Rows remains available for comparison. This is a request to preview vertical layout, not a final orientation verdict.

### Fourth feedback round

- The user said the latest revision is better, then requested **Thumbnails as the default** instead of Compact. This now applies on initial load and Reset demo; Compact remains available.
- Move search out of its former location. Search should initially apply only to the selected list, with a button to toggle searching the entire Library.
- The prototype places search directly below the current list heading. “Search entire Library” switches to active Library results while preserving the query; toggling off returns to the last selected list. Selecting a sidebar list naturally narrows search again. Existing channel filters stay applied and are explicitly identified beside search. Placement and filter-combination details are implementation proposals.
- The user asked whether color/theme belongs in this prototype. The assistant recommends choosing only a broad visual direction now if useful, and deferring detailed colors, typography, and spacing until layout/workflows settle. **No theme preference was stated or selected.** Current colors remain placeholders.

### Fifth feedback round

- The search-scope button jumping when toggled is undesirable. Keep it as an on/off toggle at the same position. The prototype now uses a fixed-width grid cell, constant button text, and an on/off indicator. Scope information has a separate, permanently allocated line so changing it does not push the toggle sideways.
- **User decision: defer color and theme to the future.** Do not explore theme choices during this layout iteration; current styling remains a placeholder.

### Sixth feedback round

- The user reported that the channel's Across Library action could not be reversed. Its active state previously became a noninteractive badge. It is now a two-way on/off toggle beside the selected channel: turning it off returns to the originating list while preserving the channel and search query. The visible on/off indicator and `aria-pressed` expose its state. This reverses navigation directly; it does not add a data-edit Undo entry.
- Browser verification confirmed both directions from Inbox and Deep learning: Studio North with the query `fieldwork` expands to 10 active Library results, then returns to 3 Inbox results or 2 Deep learning results respectively. Channel and query remain unchanged, and the toggle's pressed state switches back to false.

### Seventh feedback round

- The user dislikes channel buttons jumping when Across Library is toggled. The cause was re-ranking channels by the new scope's counts on every render.
- Channel ranking is now anchored to the explicitly selected list (or explicitly selected All active view), rather than changing when either Library-scope toggle is used. Counts still update for the current result scope; count labels reserve space so digit changes do not shift nearby buttons. Explicit navigation to another list can establish a new most-videos-first order. Stable placement during scope toggles is the requested behavior; the ranking-anchor rule is its prototype implementation.
- Browser measurements also exposed vertical movement from the heading changing line wraps. Reserved stable heading space as well. Verified that Field Notes and Studio North retain identical button/toggle rectangles and channel order before, during, and after a scope round trip, while result counts change from 3 to 11/10 and back to 3.

### Eighth feedback round

- The user reported that toggling Search entire Library with a channel selected shifts the layout left. Reproduced at a 1440 × 1200 viewport: local results fit without a page scrollbar, while grouped Library results add one, narrowing the layout by 15 pixels.
- Reserved the page scrollbar gutter, with an always-visible scrollbar fallback for browsers without gutter support. Browser measurements across all eight fixture channels now retain the same search-control and header positions when toggling from list results to Library results. Counts and results still change normally. This reinforces the user's requirement that controls stay anchored during navigation.

### Ninth feedback round

- The user requested an invisible scrollbar. Hide the root page's scrollbar while leaving native scrolling enabled. This supersedes the visible reserved-gutter treatment: short and tall views both use the full content width without a visible track. Scrollbars within destination columns and other nested areas remain unchanged.

## Implementation choices and assumptions

The following records distinguish final preview behavior from details not individually specified by the user. They are retained for the next design phase, not as blockers to the completed prototype:

- Show the **top five channels**, then “Show all N channels.” Rank using the explicitly selected list or Library view, retaining that order during scope toggles; counts update for the current scope. Ties use channel name. Keep a selected channel visible even if it falls outside the first five. Counts ignore text search to keep navigation stable.
- Following the fourth feedback round, start refined A in **Thumbnails** mode, with Compact still available. Switching preserves selection, filters, and ordering. Production preference persistence remains unsettled.
- Replace the always-visible batch bar with a labelled **“Select all N videos/results”** checkbox, including a partial-selection state. Show Move/Open/Watched/Dismiss actions only after selection; retain dragging single or selected videos between lists. This is the final preview's response to the user's rejection of the permanent bar; no separate explicit selection-bar verdict was given.
- Put **“Open entire list · N”** immediately above the videos, beside Undo. It always applies to the entire list, including videos hidden by filters. The user approved proximity, not this exact position.
- The first refinement's **“In [list] / Across Library”** pair was rejected in the second round. The new version places Across Library immediately beside the selected channel. Selecting a destination in the sidebar or grouped view changes to that list while retaining the channel filter.
- Reordering from another video sort adopts the full current sort (including filtered-out records), applies the move, then switches to Manual. Reordering watch lists from a temporary overview similarly switches back to saved importance. These are final prototype semantics to consider when designing production behavior.
- The insertion marker follows the upper/lower half of a row (or left/right half in horizontal channel strips), allowing insertion before or after, including at the end. Exact-position markers apply to single-video rearrangement within a destination; moving between destinations highlights the destination and retains the existing arrival-order semantics.
- Both densities now share clickable **Video, Channel, Destination, Duration, and Published** headers. Clicking again reverses direction. Unknown metadata remains last. Manual is a direct button; the three Library timestamps use a small expandable set of buttons rather than the removed video-order dropdown. Title/channel/destination sorts are prototype affordances for assessing header interaction, not an expansion of approved production scope.
- Library-wide channel results are grouped by destination. Following the third feedback round, **Columns** (vertical stacks) is the preview default; **Rows** (horizontal video strips) remains an alternative. Only groups with matching results appear; the sidebar still provides all destinations for moving videos. Compact/thumbnail mode applies to these groups too.
- Sidebar overview sorting now affects the watch-list section; Inbox remains above it and Backlog remains below it. This is the prototype interpretation of the user's requested grouping.

## Confirmed scope versus open decisions

The user requested three alternatives using the existing requirements, comparison assistance, a feedback record, and throwaway scope. The feedback above now establishes the preferred layout direction and requested interaction changes. Production implementation remains deferred.

Mock implementation assumptions include snapshot-based Undo (up to 30 actions), whole-deletion Undo, successful simulated tab creation, small-batch simulator confirmations, per-list manual order in the all-active view, and the board's focused-list/channel behavior. These support the comparison; they do not settle open spec questions. See the prototype README for the full list.

Production implementation, architecture, native drag ergonomics, thousands-of-record performance, persistence, recovery retention, direct-to-list timestamps, and browser permissions remain outside this handoff.

## Artifact and run instructions

Prototype: [archive and preview instructions](../prototypes/library-layout.md). Source is on branch `archive/library-layout` under `.scratch/video-backlog/prototypes/library-layout/`.

From the project root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/library-layout/serve.ps1
```

- [A — refined sidebar with compact/thumbnail toggle](http://127.0.0.1:8765/?variant=A)
- [B — lists side by side](http://127.0.0.1:8765/?variant=B)
- [C — compact table](http://127.0.0.1:8765/?variant=C)

Switch with the floating arrows to preserve mock edits. Reloading or opening a separate URL starts fresh. Reset demo restores all fixtures. The Compare button supplies a guide; the state inspector reveals placements, order, history, and the interaction log. No real video tabs are opened and no mock edits persist.

The initial comparison's HTML/CSS/JS is preserved in `original-comparison/` inside the archived prototype directory. Open its `index.html` directly to revisit the initial designs. The live route contains the refined A and shared interaction improvements; B/C retain their distinct structures.

The first A refinement is also preserved in `refinement-1/` inside that directory. The main prototype directory contains the final reference after all feedback rounds.

## Verification and archival

Chrome browser walkthrough verified the three rendered layouts, variant URL changes with preserved moves, Inbox move/Undo, channel filtering (Studio North: 3 in Inbox and 10 across active Library), retained manual order, drag/drop event handlers, overview sorts without changing importance, searchable expanded descriptions, and whole-list opening. Opening Tonight simulated 12 tabs including unavailable videos, marked all watched, and Undo restored 12 active videos. Deleting Tonight required an explicit action; choosing Inbox moved its videos there, and Undo restored both lists.

Verification used DevTools-driven browser interactions and visual screenshots; no automated test suite was added. Real mouse/trackpad dragging and subjective usability remain for the user's comparison.

Refinement walkthrough: verified dragging a watch list while overview-sorted switches to saved importance and Undo restores its prior rank; dragging a video from duration order switches to Manual and retains the new arrangement after changing sorts; expanding channels reveals all eight; Studio North switches from 3 Inbox records to 10 Library records and back; thumbnail toggling preserves selection; partial Select all state works; Select all selects the three filtered results; clearing selection removes the contextual batch bar. A screenshot verified the compact sidebar layout and whole-list action beside the video table.

Second-refinement walkthrough: verified insertion markers above/below rows agree with the resulting before/after arrangement, cleanup after drop, automatic Manual mode, and Undo. In horizontal channel strips the marker becomes vertical and dropping after the final match preserves all 24 underlying Inbox records. Verified clickable headers in both densities, duration ascending/descending with unknown values last, clickable title/thumbnail opening through the simulator and watched-state Undo, removal of video arrows and order dropdown, and the adjacent Across Library control. Studio North's ten active videos appear in five destination groups; both Rows and Columns work. Sidebar order is Inbox, watch lists, Backlog. These checks use browser DOM interactions; human mouse/trackpad ergonomics remain for review.

**Archive:** `archive/library-layout`. Git was unavailable during the prototype session; repository setup subsequently preserves the source separately from the main branch. See the [archive guide](../prototypes/library-layout.md). Production promotion remains deferred.

Fourth-refinement browser check: initial load and Reset demo use Thumbnails (24 Inbox thumbnails). Search is below the list heading rather than in the global header. Searching Studio North returns 3 Inbox results, toggling Library returns 10, toggling back restores the 3 Inbox results and unchanged query, and selecting Tonight narrows to its 1 match.

Completed work: [GitHub issue #1](https://github.com/Omriy123/youtube-backlog-tracker/issues/1). The original local prototype ticket is preserved on the archive branch at `.scratch/video-backlog/issues/01-library-layout-prototype.md`. Current requirements: [product spec](../specs/video-backlog.md).
