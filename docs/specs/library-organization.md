# Active Library organization and browsing

Design status: **complete contract approved on 2026-10-18**, after the user-invoked to-spec formalization. [Recorded complete approval](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6241617576) includes the marked bounded builder defaults and validation boundary. The proposed implementation breakdown remains input to the existing next-slice checkpoint, where actual delivery scope and tickets will be agreed. No production implementation or next-shipment selection is implied.

Planning question: [Specify remaining organization and browsing interaction edge cases](https://github.com/Omriy123/youtube-backlog-tracker/issues/25). Parent: [approved product design](video-backlog.md). Decision provenance: [continued grilling and prototype handoff](../design/library-organization-decisions.md). Apply the [glossary](../../GLOSSARY.md), [feature ownership](../design/feature-map.md), [refined-A layout](../design/library-layout.md), and [prototype evidence guide](../prototypes/organization-browsing.md).

## Problem Statement

The user needs to organize an existing collection, collect selections across searches, arrange videos without damaging saved order, and browse channels across destinations. The mock exposed ambiguity about hidden selections, filtered arrangements, move arrivals and deletion scope. The user needs controls that keep their meaning while filters, selections and browser dimensions change, and durable recovery when an organization action is accidental.

## Solution

Specify the active Library's list management, importance, video sorts and arranging, search/channel scopes, selection and batch organization, responsive controls and remembered preferences. **Entire Library** replaces the visible label All active: it browses active videos across Inbox, watch lists and Backlog. Library still includes retained history; the view is not another destination and does not silently include watched/dismissed history.

This is a candidate organization/browsing planning contract. [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) retains actual next-slice selection. Capture, imports, provider acquisition, opening/status outcomes and recovery internals retain their owners. Theme stays deferred.

## User Stories

1. As a Library user, I want Inbox, watch lists and Backlog clearly separated, so that unreviewed videos remain distinct from deliberate viewing plans.
2. As a Library user, I want an Entire Library view across active destinations, so that I can browse my collection without changing membership.
3. As a Library user, I want watched and dismissed records retained in History, so that organizing active videos does not erase past activity.
4. As a Library user, I want each upload to have one record and one active destination, so that searches and channel views do not create duplicates.
5. As a Library user, I want to create and rename custom watch lists, so that destinations reflect my viewing intentions.
6. As a Library user, I want nonempty unambiguous list names, so that destination choices are clear.
7. As a Library user, I want Inbox and Backlog to remain permanent, so that basic placement destinations cannot be deleted.
8. As a Library user, I want to rank watch-list importance through the GUI, so that my preferred lists and capture shortcuts follow my intentions.
9. As a Library user, I want temporary list overview sorts, so that I can compare names, counts, known duration and recent additions without changing importance.
10. As a Library user, I want unknown-duration counts beside known totals, so that incomplete metadata does not suggest a falsely complete duration.
11. As a Library user, I want publication, Library-date, title, channel, destination and duration sorts where applicable, so that I can find useful viewing orders.
12. As a Library user, I want publication direction remembered for each list, so that oldest/newest preferences survive reopening.
13. As a Library user, I want missing sort values placed last in either direction, so that unknown metadata is handled consistently.
14. As a Library user, I want saved Manual and imported source order preserved while viewing other sorts, so that browsing does not erase my arrangement.
15. As a Library user, I want unfiltered arranging to adopt the displayed sort and save my insertion as Manual, so that rearranging does not require changing modes first.
16. As a Library user, I want to arrange filtered results temporarily, so that clearing the filter restores my underlying saved order.
17. As a Library user, I want temporary arrangements to end when the view meaning changes, so that an old filtered arrangement does not leak into another search or destination.
18. As a Library user, I want density, orientation, resizing and checkbox changes to retain applicable temporary order, so that presentation adjustments do not unexpectedly undo it.
19. As a Library user, I want to drag from a video's row or title, so that rearranging does not depend on hitting a tiny handle.
20. As a Library user, I want ordinary dragging to carry one video even when selected, so that I can adjust one row independently.
21. As a Library user, I want Ctrl+drag to carry selected current results only, so that selections elsewhere remain untouched.
22. As a Library user, I want current results to include matches beyond the viewport, so that scrolling or rendering does not accidentally define an action's scope.
23. As a Library user, I want selected group arranging to preserve displayed relative order, so that a non-adjacent selection becomes a predictable block.
24. As a Library user, I want arranging to retain selection, so that I can continue working with the same videos.
25. As a Library user, I want exact insertion markers and non-drag Place controls, so that I can choose positions with pointer or keyboard controls.
26. As a Library user, I want action controls and drag release to avoid accidental selection toggles, so that the affected set remains deliberate.
27. As a Library user, I want to select a video, change my search and select another, so that I can build a collection for one operation.
28. As a Library user, I want selection preserved through channel, scope and list navigation, so that I do not have to reconstruct it while browsing.
29. As a Library user, I want Select all to add current matches while retaining selections elsewhere, so that I can collect several search result sets.
30. As a Library user, I want unchecking Select all to remove only current matches, so that earlier selections are not silently discarded.
31. As a Library user, I want a correct partial-selection state and result count, so that I understand what Select all will affect.
32. As a Library user, I want compact selection rows in the main area with readable From destinations, so that I can inspect the collected set without revisiting each source.
33. As a Library user, I want In here and Elsewhere grouping in the selection panel, so that I understand which selections match the current results.
34. As a Library user, I want individual deselection beside each title, so that removing one selection is straightforward.
35. As a Library user, I want selecting a row to leave it under the pointer, so that a second click at that position can deselect it.
36. As a Library user, I want All selected and Matches current filters panel scopes with affected counts, so that panel actions target an explicit set.
37. As a Library user, I want zero-match selection states to retain access to my total selection, so that filtering does not strand selected videos.
38. As a Library user, I want Show only selected to combine with existing filters, so that I can browse the selected subset of a list or search.
39. As a Library user, I want turning off selected-only to preserve other filters, so that I can return to broader browsing easily.
40. As a Library user, I want optional full selection review and Clear selection, so that I can inspect the complete set or start again.
41. As a Library user, I want a Video / From / To move preview, so that I know every affected upload and destination before confirming.
42. As a Library user, I want one shared move destination with per-row overrides, so that I can split one selection between several lists.
43. As a Library user, I want Keep in the current list for a move row, so that I can leave an included video unchanged.
44. As a Library user, I want preview ordering independent of checkbox-click chronology, so that collecting across searches produces a readable request.
45. As a Library user, I want destination positions to follow publication or saved Manual behavior, so that preview grouping does not impose an unwanted video order.
46. As a Library user, I want arrivals fitted by publication date around an existing Manual arrangement, so that new videos find a useful position without rearranging existing records.
47. As a Library user, I want conflicting Manual date order handled toward the end using the agreed insertion rule, so that arrivals remain predictable without overwriting my arrangement.
48. As a Library user, I want missing-date arrivals at the end and equal-date arrivals after existing peers, so that incomplete or tied dates behave consistently.
49. As a Library user, I want source-order imported records protected during ordinary moves, so that adding videos does not rearrange the original imported collection.
50. As a Library user, I want same-target moves to preserve position and dates, so that a no-op does not fabricate placement history.
51. As a Library user, I want ordinary Move choices to exclude Inbox, so that reviewed videos do not return there accidentally.
52. As a Library user, I want pending rediscovery review respected before movement, so that selecting a record is never interpreted as Keep.
53. As a Library user, I want stale affected moves explained and reconfirmed before any placement change, so that another window's decisions are protected.
54. As a Library user, I want unrelated changes to leave my prepared action usable, so that safe work is not interrupted unnecessarily.
55. As a Library user, I want failed organization actions to preserve state and selection for retry, so that failure does not produce partial organization or false success.
56. As a Library user, I want successful moves/removals to deselect processed records while preserving unrelated selections, so that I can see what remains to handle.
57. As a Library user, I want full custom-list deletion to show every affected title including filtered-out videos, so that I understand its complete scope.
58. As a Library user, I want explicit dismiss-all or move-all choices when deleting a custom list, so that no destination or destructive action is guessed.
59. As a Library user, I want whole-list deletion to allow a chosen Inbox destination, so that I can deliberately reorganize the deleted list's videos.
60. As a Library user, I want to move or dismiss only matching videos while keeping their list and its other contents, so that filtered cleanup does not delete the whole list.
61. As a Library user, I want changed deletion previews refreshed before confirmation, so that I approve the actual affected set.
62. As a Library user, I want deleting my current browse/return list with move-all to open the chosen destination, so that I can continue with the moved videos.
63. As a Library user, I want deleting my current browse/return list with dismiss-all to open Entire Library, so that deleting my current list leaves a valid browsing view.
64. As a Library user, I want prior filters preserved after deletion with a way to clear them, so that navigation remains understandable even at zero matches.
65. As a Library user, I want durable recovery for moves, saved arrangements and deletion, so that accidental organization can be reversed without losing newer unrelated decisions.
66. As a Library user, I want Channel unknown available separately, so that records lacking creator metadata remain findable and usable.
67. As a Library user, I want channel identity distinguished from matching display names or hostnames, so that unrelated creators are not merged.
68. As a Library user, I want five ranked channel shortcuts with expansion and a retained selected channel, so that navigation is compact without hiding my current filter.
69. As a Library user, I want channel buttons to stay in place through search and scope changes, so that filtering does not move the control I am using.
70. As a Library user, I want each channel count to reflect other current filters while using that button's own channel, so that I can see the search matches available by switching channels.
71. As a Library user, I want selected zero-result channels to remain clearable, so that an empty result does not strand a channel filter.
72. As a Library user, I want reversible nearby list/Library scope controls, so that I can expand a search and return with query and channel intact.
73. As a Library user, I want Library-wide channel results grouped by matching destination in sidebar order, so that I can see where videos belong.
74. As a Library user, I want group headings to open their list while retaining filters, so that grouped results provide useful navigation.
75. As a Library user, I want Rows/Columns and Thumbnails/Compact choices remembered, so that browsing retains my preferred presentation.
76. As a Library user, I want every function reachable as browser dimensions change, so that a different window shape does not remove capabilities.
77. As a Library user, I want keyboard controls, readable titles/origins and visible focus, so that organizing does not depend on precise pointer dragging.
78. As a Library user, I want reopened search, selection and temporary arrangements to start empty, so that an old transient working set is not mistaken for current intent.
79. As a Library user, I want selected and whole-list opening to receive their explicit intended sets, so that opening does not silently omit records because of browsing filters.
80. As a Library user, I want the real extension validated with representative collection sizes, failures and resizing, so that an attractive small mock is not mistaken for a reliable working Library.

## Implementation Decisions

### Invariants and preserved contracts

- Preserve one record per upload and one active destination. Channel views, selection and search create no extra membership. Retain watched/dismissed records and prior history.
- Inbox and Backlog are permanent. Ordinary moves cannot return already sorted videos to Inbox. Entire custom-list deletion retains its explicit chosen-Inbox exception; filtered removal creates no exception. Rediscovery and Undo retain their separate established rules.
- Preserve first saved, first Inbox-exit and latest list-entry meanings. A real placement change updates applicable dates; a same-target/no-op changes none.
- Apply [expanded capture](expanded-capture.md), including real pending-review rows and action gates; [opening/history](opening-and-watch-history.md), including explicit ordered requests and tab/status outcomes; and [recovery](library-recovery.md), including durable action history and safe reversal. Organization must not silently choose Keep through selection or movement.
- Save a mutation and its necessary history coherently. Report success only after durable completion; a failed organization batch leaves its placement/order/history unchanged together. Do not promote mock snapshots or simulated success into persistence guarantees.

### Layout, sorts and preferences

Carry forward refined A: separated Inbox / custom watch lists / Backlog sidebar, default Thumbnails plus Compact, clickable sorting headers in both densities, Manual near Select all, content-adjacent whole-list Open, exact before/after insertion markers, stable nearby reversible scope controls and invisible root scrollbar with native scrolling. Keep Rows/Columns for grouped Library-wide channel results, initially Columns. No video-order dropdown, video reorder arrows or dedicated reset-saved-Manual command.

Preserve Q39 except its explicitly revised filtered-persistence and single-video-only rules below:

- Video sorts include publication, first saved, first Inbox-exit, latest entry, title, channel, destination and duration as applicable. Preserve the adopted expandable Library-date controls and grouped-result shortcuts.
- Clicking the current non-Manual sort reverses direction; choosing a different non-publication sort starts ascending. Publication initially uses oldest first and retains each list's direction; choosing publication direction Library-wide applies it to all lists as established. Missing values remain last in both directions.
- Manual returns to the saved per-destination arrangement, including a new imported list's source order. A list without a saved/imported arrangement follows publication direction in Manual. There is no global cross-list saved Manual order.
- Custom-list overview sorts include importance, name, count, known duration and most recent addition. Show unknown-duration counts beside known totals. Only custom lists participate: Inbox first, Backlog last. Overview sorts do not alter importance or capture shortcuts. Rearranging custom lists adopts displayed overview order, inserts, saves importance and switches to Importance.
- Remember Q40 density, current video sort, watch-list overview sort, Rows/Columns and per-list publication direction. Reopening clears search and selection; selected-only and temporary arrangements also reset. This contract does not add persistence requirements for every navigation detail.

### Search, scopes and accumulated selection

Search available personal/automatic titles, URL, channel and description; combine it with channel and current list/Entire Library scope. Missing metadata does not invent values or prevent browsing. Ordinary results exclude retained watched/dismissed history. Both Library-scope controls operate the same scope, preserve query/channel and can return to the originating list. Explicit sidebar navigation narrows to that list while preserving filters.

Selection survives query, channel, scope, list navigation, sort, density, Rows/Columns and resizing. It uses record identity rather than a frozen copy of title/destination. Rearranging retains selection. Completed moves/removals deselect processed records; failed or excluded records remain available for retry, and unrelated selections remain selected. Opening/status callers apply their approved per-record outcomes; never discard an opened-but-unsaved recoverable record as though its Library update succeeded.

#### Selection controls and presentation

- Select all adds all current filtered matches, including results outside the rendered viewport, while retaining earlier selections. Unchecking removes only those matches. Show partial selection accurately. Clear selection removes all selections; scoped panel Deselect affects only its explicit shown set.
- Show selected titles and readable **From** destinations in compact rows in the main area. Retain **In here / Elsewhere** grouping, individual deselection beside the title, and the panel's total count. These groups describe current-result membership, not a new arrival algorithm.
- Selecting a row must leave it under the pointer for same-position deselection. Avoid moving result rows merely because the selection panel grows; action controls and dragging do not toggle selection accidentally. Do not restore the rejected sidebar tray, horizontal chip accumulation, tiny origin text, distant Remove buttons or Selected scroll-jump button.
- The panel's **All selected / Matches current filters** switch controls its explicitly counted Move, Place and Deselect set; changing it discards no selection. A zero-match panel retains its total and a way back to All selected. Exact main-area placement is builder-owned; the demo's below-results placement is evidence, not a fixed pixel requirement.
- **Show only selected** independently filters the main results by selection, intersected with list/Library scope, search and channel. Keep it reachable at zero results, retain it through navigation until turned off, and reset on reopening. Turning it off preserves other filters/selections. Matching-only removal uses these actual results; full list deletion does not.
- Optional Review selected temporarily shows the complete selection with its origins and restores prior browsing filters on return. It is not the sole way to inspect/deselect selections.

### Dragging and arranging

Dragging works from the row/title/body rather than requiring a small handle. Checkboxes and action controls keep their own behavior. Suppress a release click that would accidentally toggle selection. Supply equivalent button/menu Place and Move actions, including grouped Place where applicable.

| Action | Affected set |
| --- | --- |
| Ordinary drag | That one video, even if selected |
| Ctrl+drag on a selected result | Selected videos in the current main result set |
| Panel Move or Place | The explicit All selected or Matches set shown by that panel |

Current results means all matching results, not an incidental scroll/virtualization cutoff. The panel switch never broadens Ctrl+drag to selections elsewhere. Those other selections remain selected and unchanged. Do not restore Drag X together as a confusing toggle-like control.

Same-destination arranging moves the chosen rows as a block in their existing displayed relative order. Example: 1,2,3,4,5, select 2 and 4 and place after 5 gives **1,3,5,2,4**, retaining selection. Dropping onto a member of the block has no positional effect (bounded builder default). Mixed-source records use destination moves, not a global saved arrangement. Cross-destination drops highlight a destination and open its explicit affected-set preview; they do not promise before/after insertion.

#### Saved versus temporary order

**Unfiltered same-destination arranging** adopts the full current sort, inserts the single video/group and saves Manual. **Filtered arranging** changes only the current view: saved 1,2,3,4,5, filter to 1,5, arrange 5,1, then clear the filter restores saved **1,2,3,4,5**. Preserve hidden records, imported/saved Manual, placement dates, remembered sort and durable action history. No global relocation or visible-slot swapping occurs. Actual cross-destination moves remain durable placement changes.

Filtering here includes query, channel, selected-only and Review selected. For grouped results temporary arrangements remain per destination. A panel Place set containing rows outside current results cannot silently prune them or change saved order; explain the mismatch and offer Matches or explicit Move instead.

Temporary order lifetime is settled:

- Query/channel/selected-only/list/scope/sort/review changes discard it. Reopening or clearing/reapplying filters starts from underlying saved/view order.
- Relevant contents changes reset it. Unrelated changes elsewhere do not.
- Density, Rows/Columns, resizing and checkbox changes preserve surviving rows' temporary relative order.

Keep the actual behavior quiet. Do not restore the rejected giant temporary-order banner or repetitive status warning. A concise optional reset-current-view-order affordance is a builder detail and does not reset saved Manual.

### Move preview and destination arrival order

Use an actual **Video / From / To** table, with readable origins and no Elsewhere boxes in the preview. Source-grouped rows are acceptable: use current sidebar destination order and each source's current displayed sort, including applicable temporary view order. Checkbox-click chronology never determines this preview. Provide Set the same destination for all, per-row overrides and Keep in the current list. Ordinary destination choices exclude Inbox. Freeze and show the explicit set for confirmation rather than silently adding later arrivals.

**Preview order does not dictate destination placement.** A publication-sorted destination shows all records in publication order. An existing saved/imported Manual arrangement preserves its existing records' relative order, while arriving videos try to fit by publication date rather than simply appending.

The human accepted this example: existing saved Manual dates **Jan 1, Jan 10, Jan 5, Jan 20**, arrival Jan 7, result **Jan 1, Jan 10, Jan 5, Jan 7, Jan 20**. Leave existing videos in place; insert after the last earlier/equal-date video, before the next later-date video following that point. If none follows, append. Unknown-date arrivals append; equal-date arrivals follow existing same-date videos.

Bounded builder defaults make that rule deterministic without rewriting Manual:

- Use the destination's remembered publication direction, oldest first unless reversed. Compare dates in that direction; missing incoming dates remain last in either direction.
- For each target, remove all outgoing rows before computing arrivals. Start from its surviving saved arrangement. Sort incoming records by publication in the target direction and insert them with the accepted rule. Break equal/unknown incoming ties by their preview-relative order. Existing records retain their relative order.
- Find the last existing earlier/equal record; insert immediately before the first later-dated record after it, or at the end if none follows. If no earlier/equal record exists, insert before the first known later-dated record. Existing unknown-date rows do not act as date anchors and are not moved; if no known anchors exist, append.
- Apply the same fitting rule to saved source-order arrangements: adding arrivals must not rearrange the original imported records. Initial creation of an imported list still uses source order, not this ordinary-move insertion rule. Import reconciliation/arrival decisions beyond ordinary moves retain their existing decision owner.
- Already-in-target/Keep rows retain position and dates. Use surviving target order as the baseline for split moves and swaps, so looping over destinations cannot produce a different result. No-op rows acquire no invented placement/history mutations.

Opening consumes the preview's explicit initial record order, not the destination insertion algorithm, and then preserves its own confirmed request order under the opening contract. Rearranging a filtered view does not save Manual merely because the set is opened.

#### Pending review, stale previews and failures

Pending rediscovery review gates movement and authored/status actions under capture. Browsing and selection do not trigger that review. Resolve relevant reviews before moving; Keep/Leave here alone does not perform the prepared move. Explicit Dismiss may itself resolve a dismissal decision. Refresh the affected preview after deliberate review decisions before final confirmation.

For organization batches, bounded builder guidance is to pause before mutation, permit an explicit exclusion of unresolved rows for an ordinary partial move, and keep excluded records selected. Entire-list deletion cannot exclude pending rows and still delete their destination: resolve them or cancel delete-and-move; explicit dismiss-all can resolve the dismissal decision. This applies the existing gate rather than inventing another pending state or allowing silent Keep.

If affected status/placement or a target changes before commit, apply none of the outdated move, explain the change, refresh and obtain renewed confirmation. Unrelated changes do not interrupt it. Preserve valid per-row destination choices where possible and identify invalid choices rather than guessing a fallback (builder presentation default). Failed persistence keeps selection and leaves organization/history unchanged together. Storage/transaction mechanics remain implementation-owned.

### List management, full deletion and filtered removal

Create, rename and delete custom watch lists; keep GUI importance ordering. Names are nonempty and unique ignoring case/surrounding whitespace, including conflicts with Inbox/Backlog. Identity does not change on rename. Recovery recreation uses its explicit conflict contract rather than overwriting an existing list. Exact menu placement and ordinary name-entry validation are builder details.

**Entire custom-list deletion** shows the actual full affected titles, origins and count, including hidden videos, and requires explicit dismiss-all or move-all plus a chosen destination. No destructive choice or destination is silently selected. Move-all may choose Inbox or Backlog. Permanent Inbox/Backlog cannot be deleted. Keep prior history; deletion is not permanent record erasure.

**Matching-only removal** shows and moves/dismisses only current matches, including selected-only filtering where enabled. Keep the custom list and its other videos. It follows ordinary Move destination restrictions, so no Inbox exception. Show the affected titles/From/effect and distinguish its scope from whole-list deletion; exact control labels may be refined in delivery without changing scope.

If contents or destination change after the preview, refresh affected titles/counts and require confirmation again. Apply the confirmed change and its history coherently, preserving recoverable list identity, importance, membership, order, dates and relevant pending decisions under recovery. Provide user-accessible recovery for delivered moves/deletion; do not assume snapshots/backups must ship to make those changes recoverable.

When deleting the list underlying the current browse/return scope:

- **Delete + move-all:** open the chosen destination, including Inbox when explicitly chosen.
- **Delete + dismiss-all:** open **Entire Library**.
- Preserve the existing query/channel/selected-only filters; a resulting zero-match view retains controls to clear them. Eliminate references to the deleted originating list. Navigation does not choose video placement.
- Deleting an unrelated sidebar list does not redirect the current valid browse view (builder default).
- Empty-list deletion uses explicit confirmation without asking where nonexistent videos should go, then follows Entire Library when its browse origin disappears (builder default for complete-contract approval).

### Channels, counts and grouped results

Use recorded channel identities, never host guessing or display-name-only merging. Provide **Channel unknown** outside ranked shortcuts; it describes absent channel data, not one shared creator. Known/unknown channels use the same readable grouped layout and reversible scope controls. Missing data never prevents organizing a link.

Show five most-populated channels for the explicitly opened list or Entire Library, with expansion and the selected channel retained beyond the cutoff. Rank using active membership at explicit navigation/reopening; alphabetical names break ties, with stable identity as the final deterministic tie-break (builder detail). Temporary overview sorting does not change saved list importance.

**Displayed counts apply current scope, search and selected-only filters, substituting each button's own channel for the selected-channel filter.** Example: search bridge and select Field Notes; the Studio North button still shows its own bridge matches, not zero merely because Field Notes is selected. Unknown-channel count follows the same rule. Counts update with filtering/data changes, including zero, without hiding/reordering existing buttons. Scope toggles/search do not re-anchor the shortlist. Explicit list navigation/reopening recalculates it; retain a selected zero-result channel so it can be cleared.

Library-wide channel results show only matching destinations in sidebar order: Inbox, current custom-list overview order, Backlog. Clicking a group heading opens its list while retaining filters. Keep Columns/Rows available and remembered, default Columns. No global saved cross-list order results from that grouping.

### Responsive and accessibility behavior

Keep every action reachable as browser width/aspect ratio changes. Controls may wrap, scroll or collapse; resizing preserves filters, selections, saved organization and chosen density/Rows/Columns. All dragging has a button/menu equivalent. Use keyboard-operable controls, visible focus and readable titles/From/To; controls must not accidentally select/deselect records.

At a fixed viewport, scope toggles keep nearby controls/channel buttons anchored without scrollbar-driven shifting or reranking. Deliberate responsive reflow while resizing is allowed. Preserve native root scrolling while hiding its scrollbar as previously accepted.

The owner's maximized 27-inch 1440p screen is validation context, not a mandatory CSS viewport or universal hardware guarantee. Actual CSS widths, short/wide/narrow/tall windows and zoom must be recorded and checked during delivery. Breakpoints and positioning mechanics remain builder choices.

## Testing Decisions

Use the existing installed-extension workflow as the highest common test boundary. This is the approved first-slice testing seam, carried forward by the settled capture, opening/history and recovery contracts. The user's representative-scale answers extend the workload, not the number of test seams. No new lower-level testing seam, storage architecture or renewed test-boundary interview is introduced.

Good tests assert observable Library behavior, durable records/history and browser outcomes through that workflow. Cover list management, selection, arranging/moves, channel browsing and their existing capture/opening/recovery interactions; do not bind acceptance to private helpers, component structure or storage schemas. At specification time, the repository has design/prototype evidence rather than an implemented production extension or production test suite. Choose the runner and deterministic fault injection in delivery plans at the existing browser/persistence boundary.

Use real installed Chrome workflows, persisted records/history, reopening/restart, real mouse/trackpad gestures and non-drag controls. Synthetic grouping fixtures are appropriate while provider metadata is unavailable, but must not appear as fabricated user metadata. Mock walkthroughs establish interaction evidence only.

Accepted workload fixtures, not capacity limits:

- Baseline approximately **1,000 active records / 100 channels**, with skew toward one large list and honest missing values.
- Growth approximately **3,000 total records / up to 550 channels**: at 90 days, 1,000 + 1,800 added - 900 watched gives 1,900 active plus 900 newly watched retained, 2,800 total rounded for validation. Existing retained history is additional workload, not assumed forever absent.
- Use varied custom-list counts as documented builder fixtures; the user supplied no fixed list-count requirement. No 10,000-record target is imported.

The relevant workflow plans must validate:

1. Cross-search/list selections, no pointer jump, All/Matches panel sets, selected-only zero states, count semantics, record-by-record outcomes and reopen clearing.
2. Ordinary versus Ctrl+drag current-result membership, noncontiguous group insertion, same-list saved versus temporary behavior, hidden-record preservation, lifetime resets and non-drag parity.
3. Date-fitting arrivals into publication/manual/imported orders, out-of-order anchor example, unknown/equal dates, reverse publication direction, split swaps and no-op dates/history.
4. Full versus filtered removal, actual title previews, permanent destinations, Inbox exception, post-delete navigation, empty lists, naming and pending-review gates.
5. Stable channel buttons/counts through query/channel/scope changes, unknown identity, zero matches, grouped headings, Rows/Columns, density and Q40 preferences.
6. Stale affected records/targets versus unrelated changes, deterministic persistence faults, correct batch recovery and protection of newer decisions. No optimistic success or partial organization/history on failure.
7. Combined real-browser save/find/organize/open/recover walkthroughs at recorded hardware/viewports/zoom and the approved workload distributions. Measure interaction latency and user-perceived responsiveness in the relevant implementation plan; no numerical latency budget is fabricated here.

## Out of Scope

- Production implementation, framework/storage/schema selection, installation/permission changes and code-level implementation plans in this planning session.
- Declaring the three proposed workflows approved delivery tasks, selecting the next shipment or bypassing the first-build feedback checkpoint.
- Redesigning the accepted refined-A layout, broad theme/color work, or treating exact mock dimensions and control placement as mandatory product decisions.
- Implementing capture modes, import parsers/reconciliation, provider enrichment/availability acquisition, tab-opening outcomes or recovery/snapshot/backup internals owned by their separate contracts. Integration with their settled behavior remains required for organization actions that use them.
- A saved global cross-list Manual order, persistent per-search/channel arrangements, video priority scores or silent moves back to Inbox.
- Permanent erasure of retained watched/dismissed records, silently changing existing Manual order, automatically keeping pending rediscoveries or claiming optimistic success before persistence.
- Treating prototype source, screenshots or scripted walkthroughs as production, persistence, physical-device or representative-scale performance proof. No unapproved 10,000-record commitment.
- Mobile capture, live synchronization, automatic channel discovery, preview-free capture and other deferred scope from the parent design.

## Further Notes

### Proposed workflow breakdown — not yet agreed

Each workflow owns its necessary UI, domain changes, user-accessible recovery and real-browser validation. These are vertical candidates to agree before creating delivery issues, not three pre-approved tasks or a chosen next shipment.

1. **Manage watch lists and recover placement changes:** create/rename, sidebar importance/overview, single-video Move with date-fitting arrivals, full-list deletion and filtered removal, pending-review/stale-confirmation handling, explicit recovery of its own changes. Extends the existing save/find/open/recover build; broader snapshot/cloud backup delivery is not a prerequisite merely to recover these actions.
2. **Collect selections and arrange or split-move videos:** main-area All/Matches selection rows, selected-only/review, cross-search collection, single/Ctrl group and non-drag arranging, saved versus temporary order, explicit split move table, truthful selection cleanup and integrated recovery. Consumes the list/move workflows, capture review gate and opening/status consumer contract.
3. **Browse channels and grouped destinations across window sizes:** known/unknown channels and stable filtered counts, reversible scopes, grouped Rows/Columns and navigation, remembered density/sorts and adaptive controls at representative scale. Its integrated completion exercises selections and moves; independent browse preparation must not acquire an artificial blocker on all selection work.

The eventual delivery tickets must use the roadmap's delivery parent/triage roles and native blockers for genuine prerequisites. The first-slice feedback checkpoint and next-slice decision remain authoritative. Agree which workflows are in the chosen delivery slice before labelling implementation tickets ready; write code-level plans at that handoff rather than selecting storage/framework here.

### Approval and evidence limits

The [decision handoff](../design/library-organization-decisions.md) records exact corrections and chronological discussion links. The [prototype guide](../prototypes/organization-browsing.md) links immutable source/screenshots and evidence limits. The final arrival-fitting, filtered-count and delete-navigation corrections supersede the corresponding mock algorithms; an old screenshot is not evidence those new rules shipped or were performance-tested.

After reviewing the formalized specification, the human answered **“spec looks good.”** This approves the full contract, including the explicitly marked bounded builder defaults, validation boundary and scope, and resolves the organization interaction decision. Actual delivery scope and workflow agreement belong to the existing first-working-build checkpoint; this behavior question does not require approving the exact three-ticket proposal before resolution. The map indexes the resolved behavior; the delivery roadmap owns eventual implementation tickets.

The human explicitly invoked to-spec to formalize and publish this synthesis after the behavior frontier was answered, then approved the resulting specification. Neither step approves the previously proposed workflow tickets or selects the next shipment. Publish this specification through the existing planning question while preserving its wayfinder label; repository instructions reserve ready-for-agent triage for agreed delivery issues, which have not been created here.
