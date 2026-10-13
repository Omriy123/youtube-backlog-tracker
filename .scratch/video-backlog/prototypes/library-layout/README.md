# Throwaway Library layout study

Question: which layout best supports choosing the next video, sorting many new videos, and browsing a channel while keeping destinations clear?

This is local, disposable HTML/CSS/JavaScript. It selects no product framework, extension architecture, or storage design. No production implementation or promotion is included.

**Exploration complete, 2026-10-13.** The user concluded the prototype; the final refined A is the layout reference for the original design interview. The consolidated handoff is [layout-feedback.md](../../layout-feedback.md). Source and earlier comparisons remain available. No further prototype review is required; theme and production work are deferred.

## Refined A after user feedback

A is now the preferred base. Its revision includes draggable watch-list importance, automatic switching to Manual when videos are rearranged, C-style channel shortcuts ranked by video count, an expandable channel list, and a compact/thumbnail toggle. “Open entire list” is beside the videos. Select all has a visible count and partial-selection state; batch actions appear only while videos are selected.

The second refinement adds an insertion line while rearranging, clickable video titles/thumbnails, and clickable sort headers in both densities. Click a header again to reverse; unknown metadata stays last. Manual is a button rather than a dropdown choice; Library date sorts live behind the expandable “Library dates” control. Video reorder arrows are omitted in every mode.

Across Library now sits beside the selected channel; the redundant “In [list]” control is removed. Library-wide channel results use destination groups, with Rows and Columns options. The user subsequently requested a vertical preview, so Columns is now the starting view, including after Reset demo; an orientation is not finalized. Click a group name or sidebar list to narrow the channel back to that destination. Inbox, watch lists, and Backlog are separated, with Backlog at the bottom; temporary overview sorting applies within the watch-list section.

Following the third feedback round, Manual sits beside Select all immediately above the video content, rather than in the upper toolbar.

The five-channel cutoff and contextual batch bar are final preview defaults, not individually specified production requirements. The user selected Thumbnails as the default; Compact remains available. Dragging in another sort adopts that full displayed ordering before applying the move; search/channel filtering does not drop hidden records from the saved arrangement. List dragging affects custom watch lists, switches to Importance, and retains permanent Inbox/Backlog destinations.

Search now lives beneath the current list heading and starts within that list. “Search entire Library” toggles to active Library results and back to the previous list without losing the query. A retained channel filter is named beside the search field. Selecting a sidebar list narrows search to that list. In B, a search scoped to a focused list leaves other columns visible as destinations but shows matches only in that list.

The search-scope control is a fixed-position on/off toggle with constant text. Scope information appears on its own reserved line, so switching scope does not move the button.

The user explicitly deferred color/theme decisions to the future. Current styling remains a placeholder; theme exploration is outside the current iteration.

The channel's Across Library control is also reversible: it stays a button when active. Toggle it off to return to the originating list, preserving the selected channel and query. This is navigation, so no data-edit Undo entry is added.

Channel-button order stays anchored to the explicitly selected list while toggling Library scope. Counts update in reserved-width labels without re-ranking the buttons. Navigating explicitly to another list establishes its channel ranking.

The root page scrollbar is hidden at the user's request, while native scrolling remains enabled. Short and tall result views use the same content width, preventing sideways shifts. Nested column scrollbars remain unchanged.

The initial three designs are preserved as HTML/CSS/JS in `original-comparison/`; the first A refinement is preserved in `refinement-1/`. Open either `index.html` directly to revisit that version. The main directory contains the final refinement. These files are preserved on branch `archive/library-layout`; main keeps the accepted design documents.

From the repository root, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/library-layout/serve.ps1
```

Open one of these URLs:

- [A: sidebar and detailed rows](http://127.0.0.1:8765/?variant=A)
- [B: lists side by side](http://127.0.0.1:8765/?variant=B)
- [C: compact table](http://127.0.0.1:8765/?variant=C)

Use the floating arrows or keyboard Left/Right to switch without losing mock edits. Arrow keys inside form fields retain their normal behavior. Opening another URL or refreshing starts a separate fresh demo. Reset demo restores the fixtures. The switcher appears only on loopback/file previews.

No dependencies or installation are required. If port 8765 is occupied, append `-Port 8766` and use that port in the URLs. The `index.html` file also works when opened directly in a browser.

## Comparison walkthrough

1. Choose Tonight, inspect a description, and pick a video to open. The confirmation simulates opening; it never creates a real video tab.
2. Select three Inbox videos and move them to Tonight; select three more and move them to Backlog. Try both the destination selector and dragging selected rows/cards onto a list. Undo restores the preceding action, including former order and first Inbox-exit dates.
3. Filter Studio North within Inbox, then use Channel across Library. Destination badges/columns show where each video belongs.
4. In any video sort, drag a video onto the upper or lower half of another row. The insertion line previews placement before or after it; the view switches to Manual automatically. In horizontal channel strips, use the left/right half instead. Click the Duration header, then Manual. The saved arrangement survives. No video up/down arrows appear.
5. In A, drag a watch-list handle onto another watch list to insert it before that list. This updates saved importance. Compare list overview by count and known duration, then return to Importance. Unknown durations are disclosed. The state inspector shows the top three quick-save destinations remaining tied to importance.
6. Open the entire Tonight list. Its 12 videos trigger the many-tabs notice; the simulated group includes unavailable records. Inspect History and Undo.

The Compare button contains a shorter guide. The collapsible state inspector below each layout exposes all mock records, placements, arrangements, history, current filters, selection, simulated tabs, and the interaction log. Variant switches also log full state to the browser console.

## Fixtures and assumptions

- 84 fictional records: 80 active and 4 retained history records; six lists, repeated channels, YouTube/Twitch/generic links, unavailable/private videos, absent dates/durations/descriptions, and prior watch events.
- Thumbnail tiles and source URLs are illustrative placeholders. No network assets or metadata requests occur.
- In B, all lists remain as columns. The focused list controls chronology and the whole-list open button; selecting a channel limits results to that focused list until Channel across Library is chosen. Other columns remain drop destinations. With no channel filter, batch Select matches selects all visible matches across the board.
- All-active manual view groups records by destination; no global manual arrangement is invented. Reordering works within a destination and moves work across destinations.
- A manual rearrangement adopts the current video sort and automatically switches to Manual. New arrivals append; a list not yet rearranged continues to sort by publication date. Unknown dates remain last in either direction.
- Undo uses up to 30 in-memory snapshots and can reverse a whole custom-list deletion. This is a prototype assumption, not a decision about production retention or restoration.
- A mock open always succeeds after the simulator confirmation. The confirmation for small batches is demonstration UI, not a proposed requirement. Actual tab creation failures, browser grouping APIs, and playback are not implemented.
- Metadata retry deliberately simulates no new information and retains the prior availability label. It makes no network request.
- Release-date oldest/newest direction is retained per list. Header and date buttons toggle ascending/descending order; a newly chosen non-publication sort starts ascending. Unknown values stay last. Overview counts/durations use the full list rather than the current channel/search subset. These are comparison defaults where the full design remains open.
- Direct-to-list timestamp rules, imports, repeat-save flows, storage, backups, API keys, and extension delivery remain outside this layout prototype.

## Validation and capture

Browser walkthrough performed in installed Chrome using DevTools-driven DOM interactions and screenshots at 1440 × 1000. Checked variant switching, batch moves/Undo, channel scopes, retained order, drag/drop event paths, all overview sorts, description search/details, grouped opening including unavailable videos, and explicit list-deletion destination choice. This is a smoke walkthrough, not an automated test suite or a scale/performance assessment. Native mouse dragging and subjective usability still need human feedback.

The local server was also checked by HTTP requests; it tolerates browser connections that close without sending a request. No tests or production scaffolding were added.

Git was unavailable during the original prototype session. Repository setup subsequently preserves this directory on the `archive/library-layout` branch. It remains a throwaway primary source; do not merge/promote it as production code. Read `docs/prototypes/library-layout.md` in the repository for the archive overview.

Feedback and decision status: [layout-feedback.md](../../layout-feedback.md). Entry issue: [01-library-layout-prototype.md](../../issues/01-library-layout-prototype.md).
