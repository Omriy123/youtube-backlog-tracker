# Organization and browsing: decisions for continued grilling

Recorded 2026-10-18. This consolidates the human answers and prototype feedback from [Specify remaining organization and browsing interaction edge cases](https://github.com/Omriy123/youtube-backlog-tracker/issues/25). It is a partial decision handoff, **not an approved complete slice specification, delivery breakdown, or implementation**. Continue that same open ticket; do not re-interview the settled choices below. The user's final request was to write down the decisions and return to the other grilling session.

The [prototype source and evidence guide](../prototypes/organization-browsing.md) preserves the current demo. Earlier issue comments and README sections describe intermediate designs; the latest explicit corrections in this record take precedence. The final “great” acknowledged the latest demo correction and requested this handoff; it does not resolve the remaining questions listed below. The resumed grilling decisions under **Continuation on 2026-10-18** supersede the corresponding earlier proposals; the archived demo has not silently acquired those later corrections.

## Basis that remains in force

Start from the [Later-area handoffs](https://github.com/Omriy123/youtube-backlog-tracker/blob/42671787e0b042817f9178ec43dbdc1956e0d718/docs/design/feature-map.md#basis-for-subsequent-feature-specs), [approved product design](../specs/video-backlog.md), and [accepted refined-A layout](library-layout.md). Read these settled answers rather than reopening them:

- [Library identity, destinations and dates](https://github.com/Omriy123/youtube-backlog-tracker/issues/12#issuecomment-6234605386): one record per upload, one active destination, distinct first-save, initial-placement and latest list-entry dates.
- [List importance, sorting and remembered preferences](https://github.com/Omriy123/youtube-backlog-tracker/issues/13#issuecomment-6234605641): saved importance and Manual arrangements survive view sorts; source-order Manual survives ordinary arrivals. Preserve Q40 preferences and the remaining Q39 sorting rules, subject only to the two explicit revisions below.
- [Library layout and accepted prototype feedback](https://github.com/Omriy123/youtube-backlog-tracker/issues/18#issuecomment-6234606934): refined A, Thumbnails/Compact, destination-grouped channel results with Columns/Rows, stable reversible scope controls and accessible alternatives to dragging. Known and unknown channel results use the same readable layout. Broken narrow title rendering in the organization mock was a regression, not a new design choice.

Inbox and Backlog remain permanent. Ordinary moves back to Inbox remain unavailable. Deleting an entire custom list explicitly requires dismiss-all or move-all to a chosen destination, including Inbox; do not silently send everything to Backlog. Theme stays deferred.

The organization/browsing scope was provisionally acceptable as a planning boundary. It does not choose the next shipment: [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) still owns that decision.

## Selection and its presentation

The user wants to search for one video, select it, search for another, select it too, and retain both selections. Selection survives query, channel, list/Library scope, list navigation, sort, density, Rows/Columns and resize changes. Reopening starts with empty selection under Q40.

The following presentation decisions came directly from feedback:

- Show what is selected, including selections outside the current results, without requiring a trip back to each original search/list.
- Put the selection panel in the **main area**, not the sidebar. Use compact rows, not one ever-growing horizontal row of chips.
- Show each title and its source list clearly. The current table uses a normal-size **From** column; tiny source text under the title was rejected.
- Keep **In here / Elsewhere** grouping in the selection panel. The later request to remove Elsewhere boxes applied to the move preview, not this grouping.
- Allow individual deselection beside the title, rather than a Remove button at the far end of a long row.
- Selecting a row must not move it away from the pointer: the next click at the same position should deselect it. Controls and dragging must not accidentally toggle selection.
- Remove the toolbar **Selected** button whose only purpose was scrolling down to the panel. The panel retains its own count.

The demo places the table below the results. Main-area placement is explicit; the exact below-results position remains a prototype layout choice, not a separately approved final layout.

### Main filter versus selection-panel filter

The user clarified that “filtered selected” means **Show only selected in the main results**. Keep the earlier **All selected / Matches current filters** panel switch as well: the user said it could be useful.

These are separate controls:

| Control | Current direction |
| --- | --- |
| Show only selected | Filter the main video results to selected rows. The demo combines it with list/Library scope, query and channel filters. |
| All selected / Matches current filters | Choose the set shown in the selection panel. Its Move, Place and Deselect controls show affected counts and use that explicit panel set. |
| Ctrl+drag | Use selected videos in the **current main results**, regardless of the panel switch. Selections elsewhere stay selected and untouched. |

“Current results” is interpreted as the matching result set, not a cutoff caused by scrolling or rendering only part of a list. The human's wording was “only move the ones on screen”; this interpretation should remain explicit in the complete spec.

The main selected-only filter remains reachable at zero matches. The demo keeps other filters and selection when it is turned off, retains it while navigating, and resets it on reload. These composition/lifetime details are prototype defaults for complete-contract review, not separate human answers.

Q10's detailed selection mechanics were accepted **provisionally, subject to testing**: Select all adds current matches while retaining earlier selections; unchecking removes only current matches; Review selected temporarily shows the selection and returning restores browsing filters. Successful moves/removals deselect processed records; failure keeps selection for retry. The explicit later correction is that **rearranging retains selection**, for one row or a group. Review selected remains an optional separate view rather than the sole way to inspect/deselect selections.

## Dragging and arranging

Restore dragging from the row/title/body; it must not require hitting the small handle. Checkboxes and action controls keep their own behavior.

- Ordinary drag carries one video, including when it is selected.
- **Ctrl+drag a selected result** carries the selected videos in the current main results. Hidden selections in other lists or behind filters are excluded intentionally and remain selected and unchanged.
- Remove the confusing **Drag X together** control. The user read it as a toggle rather than a drag origin and explicitly requested Ctrl+drag.
- Both individual and grouped same-list arranging must work. Arranging must not deselect the moved rows. Non-drag alternatives remain required.

The mixed-list failure was concrete: Inbox videos 2/3 and hidden Rust in Learn were selected. Ctrl+drag of 2 after 5 incorrectly carried Rust, turning the operation into a forbidden ordinary move back to Inbox. Limiting the group to current results fixes the actual intended operation: Inbox becomes 1,4,5,2,3; Rust stays in Learn; all three stay selected. This changes gesture membership, not the Inbox rule.

The prototype inserts a group as a block in its existing displayed relative order. Cross-destination drops use a destination preview rather than promising an exact insertion position; same-destination arranging uses before/after positions. These detailed block/preview mechanics still need the complete-contract verdict. No saved global cross-list ordering was approved.

### Explicit revision: filtered arranging is temporary

The user said: “i want to still be able to reaarange while im filtered just that after undoing the filter it should not persist.”

Saved **1,2,3,4,5** → filter to **1,5** → arrange to **5,1** → clear the filter → saved **1,2,3,4,5**. Do not persist a global relocation or a visible-slot swap, and do not disable filtered arranging. Saved Manual/imported arrangements, hidden rows and placement dates remain unchanged. Actual destination moves remain real placement changes.

The giant temporary-order explanation/banner and repeated status message were explicitly rejected; preserve the behavior without that large UI section.

This supersedes Q39's historical **filtered** full-list reorder effect. The request for grouped arranging also supersedes its former **single-video-only** bound. Preserve all other sorting rules and Q40 persistence. Unfiltered same-list arranging still adopts the current full sort and saves Manual under the remaining contract.

Additional lifetime rules in the demo remain unapproved defaults: query/channel/selected-only changes, list/scope navigation, changing sort, entering/leaving Review selected or successful Library mutations discard temporary order; density, Rows/Columns, resize and checkbox changes retain it where still applicable. Reapplying a cleared filter starts from the underlying saved/view sort. Full-spec review must settle these boundaries rather than treating the mock as authority.

## Moves and their previews

Earlier accepted general ordering: use displayed order, not checkbox-click chronology. Grouped results traverse destination groups then their displayed rows. Unrearranged destinations continue following publication order; already-in-target videos stay put with unchanged dates/order. **Continuation correction:** grouping remains acceptable for the move preview, but the human rejects simply appending arrivals after an existing saved/imported Manual arrangement. Prefer fitting arrivals by publication date while preserving existing order, falling toward the end when that conflicts. The precise insertion algorithm remains open; see the continuation.

At the original prototype handoff, the complete collected-selection ordering question was still open (Q11). The resumed session accepts source-grouped preview order but explicitly separates it from date-fitting arrivals in the destination, as recorded in the continuation. The older Camera → Bridge → Rust append example is not the final destination-placement rule.

The user explicitly requested a **Video / From / To table**, with one row per affected video and readable origins, instead of a numbered list with tiny origin text. Remove the Elsewhere boxes from this move table.

The user suggested being able to send different videos to different places. The demo offers a To choice per row, Set the same destination for all, and Keep in the current list. The intent to explore split destinations is recorded; these exact controls and same-target/no-op presentation remain proposed pending final walkthrough/spec approval. Every record still has one active destination, and ordinary moves exclude Inbox.

Q13 stale-move handling was accepted: if affected status/placement or the target changes before commit, apply none of the outdated move, explain/refresh the affected operation and allow renewed confirmation. Unrelated changes should not interrupt it. Do not infer storage/transaction implementation from the simulator. The demo's precise refresh/reopen-dialog behavior is not an independently approved interaction detail.

## Deleting lists versus removing filtered matches

Preserve full custom-list deletion: show the full contents count including hidden videos, require explicit dismiss-all or move-all and a chosen destination, permit Inbox for this whole-list exception, and retain prior history. If affected contents or the destination change before confirmation, refresh the explanation and require confirmation again. Inbox/Backlog cannot be deleted.

The user explicitly clarified the additional filtered-only operation: **move or dismiss only matching videos, while keeping the list and its other/hidden videos**. It is not deletion of the custom list and creates no extra Inbox exception. The prototype offers Entire list / Only matching videos scopes and Remove matches while browsing a list; exact control naming/placement still needs review.

The user wants to see the **actual affected video titles**, not just a count, before deletion/removal. Preview the whole affected set for full deletion and only matches for partial removal, with origins and intended effect. Watched/dismissed retention and recovery still follow their owning contracts; “delete” is not permission for permanent record erasure.

The main selected-only filter participates in the demo's matching-only removal scope; whole-list deletion still includes all contents. This is an explicit prototype integration choice to review in the complete spec.

## Channels, scopes and responsive behavior

- Provide **Channel unknown** outside the ranked shortcuts. Do not infer a creator from the host or merge distinct channels just because display names match. Known and unknown channel results share the same grouping/layout and reversible scope controls.
- Accepted simplified shortlist rule: show the five channels with most active videos in the explicitly opened list (or explicitly opened All active view). Search/scope expansion must not shuffle shortcut positions; scope changes update counts. Explicitly opening another list recalculates its shortlist. Keep a selected channel available beyond the top five.
- Only matching destinations appear in Library-wide channel results, in sidebar order. Group headings open their list while retaining filters. Columns and Rows remain available and remembered; Columns stays the default.
- All controls must remain usable as browser width/aspect ratio changes. Preserve selection, filters and organization through resizing. Keep stable reversible scope controls and alternatives to dragging. Responsive reflow on deliberate resize is different from unwanted jumping while toggling a scope.

Not independently approved: exact ranking tie-breaks, whether counts ignore text search, exact refresh timing after data changes/reopening, and pinning a selected channel at zero results. The demo uses active counts before text search, name then identity tie-breaks, and stable rankings between explicit navigations; these are proposals, not settled algorithms. The user accepted the simpler explanation after finding the original detailed recommendation too complicated.

## Representative workload and validation

The user's estimate is 500–1,000 videos and up to about 100 channels; up to 20 additions/day and potentially five new channels/day, usually fewer. About ten videos/day may be watched and leave active lists; those need not be among that day's additions. Watched records/history remain retained.

Accepted validation fixtures, **not collection limits**:

- Baseline around 1,000 active records / 100 channels.
- Ninety-day upper example: 1,000 + 1,800 additions − 900 watched = 1,900 active, plus 900 newly watched retained = 2,800 total. Validate rounded **3,000 total records / up to 550 channels**, with appropriate distributions and missing data. Existing retained history is additional, not assumed permanently absent.

The user usually maximizes the browser on a 27-inch 1440p screen, but explicitly wants the application to remain functional when the browser's aspect ratio changes or hardware changes. Physical resolution is not a mandated CSS viewport or a universal performance guarantee. The relevant delivery plan must record representative viewports/zoom, actual hardware, distributions and measured interaction behavior, including narrow/short windows, real drag and non-drag controls, persistence/restart/failure handling. Do not import an unapproved 10,000-record target. This demo validates no representative-scale performance claim.

## Other settled contracts to consume

These were resolved by parallel sessions and must not be re-grilled here:

- [Expanded capture and pending rediscovery review](../specs/expanded-capture.md), [consumer handoff](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240089353): pending generic rediscoveries are actual Inbox rows; explicitly targeted ones remain in that list. Browsing/search/selection remain uninterrupted. Move/authored-edit/status actions must respect the settled pending-review gate; selecting does not mean Keep. The organization demo does not implement that gate.
- [Opening and watched-history contract](../specs/opening-and-watch-history.md), [consumer handoff](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6241187323): organization supplies an explicit target set and initial order; opening preserves its confirmed request order without silently dropping hidden selections or rewriting Manual. Whole-list opening includes active contents hidden by filters. Named review-first groups, retries, status removal/history and per-video details belong to that settled contract.
- [Library recovery](../specs/library-recovery.md): organization changes integrate with shared durable history/recovery and preserve newer decisions. The mock's lack of persistent Undo is not a product limitation or a new retention policy.

## Resume the remaining grilling

Keep the question open and continue only unresolved choices needed by this bounded planning contract:

1. **Q11 complete mixed-source arrival order:** obtain a verdict on the Camera → Bridge → Rust example or another explicit rule. The generally accepted displayed-order principle does not settle every collected/hidden-selection case.
2. **Review remaining prototype defaults:** temporary-order lifetime; exact selected-only scope/lifetime; ranking tie/count/refresh mechanics; block insertion; split-destination controls; stale-action refresh presentation. A default does not become approved merely because it appears in the demo. Distinguish implementation details from decisions that materially change behavior before asking.
3. **Finish necessary list edge cases:** naming uniqueness/ambiguity, deletion of a list used by a return-to-scope control, reconciliation of retained selections after actual deletion/moves, and empty-list confirmation. These were draft gaps, not answered questions; first check whether the settled capture/opening/recovery contracts already determine the answer.
4. **Approve the complete focused spec and agree the workflow tickets.** No delivery breakdown was approved or created in this session. The local draft proposed list management/recovery, selection/organization, and channel/responsive browsing workflows as discussion material only. Do not silently publish those as agreed tasks or choose the next shipment.

Do not close the ticket or put it in the map's Decisions so far until its full resolution is approved. No production implementation was started. This session ends with the handoff rather than another grilling round.

## Continuation on 2026-10-18

The original grilling session resumed after reading this handoff and the authoritative ticket. The ticket remains open and claimed; complete specification and workflow approval are still pending. The user requested a **very small** illustration of Q20, explicitly rejecting expansion into another full demo. The local `delete-navigation.html` beside the archived demo is a separate, later illustration, not part of its immutable archive snapshot.

- **Q11 destination arrival correction, now accepted:** source-grouped preview rows are acceptable, but preview order must not dictate destination placement. Unrearranged destinations use publication order. Preserve existing saved/imported Manual relative order and fit arrivals by publication date. The human accepted existing Manual Jan 1 → Jan 10 → Jan 5 → Jan 20 plus incoming Jan 7 becoming Jan 1 → Jan 10 → Jan 5 → Jan 7 → Jan 20. Insert after the last earlier/equal-date video and before the next later-date one after that point, or at the end when none follows. Unknown incoming dates go at the end; equal-date arrivals follow existing same-date records. This rejects both preview-order appending and simply date-sorting all arrivals before appending. Full-spec builder defaults specify deterministic multi-arrival, reverse-direction and missing-anchor mechanics for complete-contract review.
- **Q14 temporary-order lifetime accepted:** changing query/channel/selected-only/list/scope/sort/review starts from underlying order; relevant Library contents changes reset temporary arrangements. Density, Rows/Columns, resizing and checkbox changes preserve surviving rows' temporary relative order; unrelated changes elsewhere do not discard it. Clearing/reapplying filters does not restore an earlier temporary arrangement.
- **Q15 selected-only composition/lifetime accepted:** intersect selected rows with current list/Library scope, search and channel; retain other selections; keep the switch through navigation until turned off; reset on reopening. Turning it off preserves other filters. Matching-only removal uses those results, while whole-list deletion still includes all contents.
- **Q16 non-adjacent group arranging accepted:** starting 1,2,3,4,5, arrange selected 2 and 4 after 5 to get 1,3,5,2,4, keeping selection. Filtered arrangements are temporary; unfiltered arrangements save Manual. This confirms the demo's block insertion behavior.
- **Q17 split move controls accepted as in the demo:** Video / From / To rows, shared destination with individual overrides, and Keep in the current list. Ordinary moves exclude Inbox. Destination placement is governed by the corrected Q11 contract, not the older preview-relative append algorithm in the mock.
- **Q18 channel counts corrected and clarified:** channel buttons stay available/in place, but displayed counts reflect current filters, including typed search, substituting each button's own channel for the selected channel. The human explicitly chose Studio North's own bridge matches while bridge + Field Notes is selected, ignoring the other-channel filter for that button's count. This rejects both count-ignores-text-search and zeroing every other channel. Other explained defaults were accepted: alphabetical ties, counts update without shuffling buttons, recalculation on explicit list navigation/reopening, and retaining the selected channel at zero matches.
- **Q19 list names accepted:** custom lists have nonempty names unique ignoring case and surrounding whitespace; custom names cannot collide with Inbox or Backlog. Recovery recreation still uses its explicit conflict contract rather than silently overwriting an existing list.
- **Q20 navigation accepted after a small visual:** when deleting the browsed custom list and moving all its videos to one chosen destination, open that destination. When deleting with dismiss-all, open the across-list Library view. For final-contract review, the empty-list builder proposal is explicit confirmation without an unnecessary move/dismiss choice; that detail is not separately approved. Preserve filters unless the human subsequently revises that earlier scope contract, remove references to the deleted origin, and never confuse browsing navigation with video placement.
- **Visible label:** the human requested replacing All active with Entire Library or similar. Use **Entire Library** for the across-list browsing view. Its scope remains active videos; watched/dismissed records remain in History under the established contract. This does not redefine Library as a destination or erase retained history.

The live behavior frontier above is now answered. The complete focused draft is [Active Library organization and browsing](../specs/library-organization.md), formalized on 2026-10-18 through the user-invoked to-spec skill with its seven-section template and extensive numbered user stories. Builder review is complete; full human approval including marked defaults/validation and explicit workflow agreement remain pending. The existing installed-extension testing boundary carries forward prior approval without adding a lower-level seam. Resolve this same ticket only after the remaining approval. The earlier resume list is historical where the continuation above now settles a default. No production implementation or next-shipment selection has begun.

## Discussion provenance

The following comments preserve the progression; use the latest explicit correction when an earlier one conflicts:

- [Initial accepted/provisional answers and workload](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6239504699).
- [Prototype request, Q10–Q13 status and Q11 example](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6239665712).
- [Readable grouped cards, selection visibility and consistent unknown-channel presentation](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6239906609).
- [Filtered-only removal explicitly keeps the list and hidden videos](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6239944472).
- [Selection rows, affected-title previews and proposed split destinations](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240046500).
- [Temporary filtered order explicitly supersedes the filtered part of Q39](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240142096).
- [Full-row drag, pointer stability and rejected giant warning](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240439227); its sidebar placement was subsequently rejected.
- [Main-area selection, readable origins and single/group arranging](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240610325).
- [Ctrl+drag, retained selection and restored grouping](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6240831755); its panel-scope coupling was subsequently corrected.
- [Main selected-only filter and current-results-only Ctrl+drag correction](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6241140746).
- [Remove the Selected jump button](https://github.com/Omriy123/youtube-backlog-tracker/issues/25#issuecomment-6241208886).

The consolidated statements above preserve approval limits; the archive README retains the revision history and evidence limits.
