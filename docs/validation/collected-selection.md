# Collected selection and split actions validation

Issue #55 implements the [organization contract](../specs/library-organization.md)
and its selected-set consumer of the [opening/status contract](../specs/opening-and-watch-history.md).

Validated 2026-10-29 on Windows, installed Google Chrome **155.0.8059.41** at
`C:/Program Files/Google/Chrome/Application/chrome.exe`, through the existing
unpacked-extension launcher with `CHROME_PATH`.

- Full installed-Chrome regression checkpoint: **81 passed**.
- Final focused selection, arrangement and combined save/open/review/restart
  checkpoint: **28 passed**. This includes the additional batch-recovery restart
  case and readable custom-destination/manual-watch provenance assertions.
- Boundary regressions: **40 passed**. Extension build completed.
- After inspecting the narrow screenshot, a minimum readable From-column width
  was added; all **five** responsive preview/keyboard checks passed again.

The workflows cover cross-search/list identity selection, partial/complete
Select all, All/Matches and zero-result scopes, selected-only channel count
substitution without shortcut reanchoring, live From/title rows, checkbox focus
and same-position deselection, and clearing session selection on reopening.

Explicit shared/per-row move previews retain a frozen ordered set. Cases cover
pending exclusion, separate confirmation after Keep, relevant stale target
refresh, persistence failure/retry, processed-only deselection, split arrivals,
no-op dates, one batch Undo and recovery after restart. Current metadata dates
and explicitly missing current dates use the same accessor as browsing sorts.

Group Place and Ctrl-drag use complete current matches, including offscreen
selected rows. Ordinary drag remains single-row; dropping onto a block member
does nothing. Outside-results Place offers explicit Matches/Move choices;
cross-destination drops open a preview. Filtered/selected-only arrangements
remain temporary, preserve surviving order through checkbox edits, and reset
after relevant review decisions.

Selected Mark watched/Dismiss use explicit no-tab previews and one atomic
recoverable status transaction. Dismiss can resolve its pending dismissal;
Mark watched requires review/exclusion. Manual events retain actual source,
time and destination, including readable names. Repeat saves retain prior
manual watches without inventing tab openings. Failed creation and
opened-but-unsaved records retain selection until durable repair. Bulk tab
groups are outside this ticket.

Recovery rejects newer relevant name, importance and Manual decisions even
when values cycle back to an older value. Sequential reversal remains
possible; unrelated later names, Personal titles and automatic observations
remain independent.

## Recorded workloads and responsive evidence

The full-suite samples used a 1440 × 900 CSS-pixel viewport, device pixel ratio
1, zoom 100%. Fixture observations are labeled synthetic and include missing
metadata. Times below are individual observed samples, with locator resolution
excluded by in-page UI activation; they are not universal latency guarantees.

| Fixture | Active / total | Channels / custom lists | Load | Select all | Selected-only | Query |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline | 1,000 / 1,000 | 100 / 8 | 246 ms | 62 ms for 700 matches | 315 ms | 120 ms |
| Growth | 1,900 / 3,000 | 550 / 24 | 568 ms | 122 ms for 1,330 matches | 552 ms | 249 ms |

The skewed Inbox contains 70% of active records; growth includes 1,100 retained
watched records. Removing the ten current selected-only matches preserves all
other selections and leaves the zero-result controls usable.

Keyboard-operated selection and move previews were checked at 2560 × 1440,
1440 × 900, 1280 × 500, 390 × 844 and 768 × 1200 CSS pixels, zoom 100%. The
390-pixel screenshot was visually inspected for readable Video/From/To and
reachable confirmation controls.

Raw workload attachments and initial screenshots are retained outside the
disposable worktree in `.scratch/validation/organization-selection/2026-10-29-full-suite/`.
Final responsive screenshots are in the adjacent `2026-10-29-final-responsive/`.
These are local evidence, not a second task tracker. Physical mouse/trackpad
ergonomics, owner hardware and additional zoom levels were not established by
this automation.

## Cleanup integration hooks

`library.js` retains `latest` (the full active snapshot), `browse`, and the
selection controller. `selection.currentResults` is the complete ordered actual
matching set; `selection.selectedIds` is identity-only session state;
`selection.selectedOnly` and `selection.context` describe the active predicates.
`selection.processed(ids)` removes only explicit successful outcomes. Matching
cleanup must use actual results for its destination, independently of the
panel's All/Matches scope. Preserve browse query/channel/selected-only when
repairing navigation after deletion.
