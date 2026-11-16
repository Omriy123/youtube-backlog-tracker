# Video sorting and arranging validation

Checked 2026-10-28 for issue #53 against the public Library command and installed desktop Chrome boundaries. Chrome executable: `C:/Program Files/Google/Chrome/Application/chrome.exe`. Tests use isolated persistent profiles and explicit fictional metadata fixtures; no provider information is fabricated in production.

## Evidence

- All 40 command-boundary tests passed, including six arrangement cases covering unknown/tied values, remembered directions, atomic persistence failure, stale/recovery conflicts, per-destination imported/Manual anchors, arrival fitting and independent preference patches.
- All 51 installed Chrome browser tests passed in 2.3 minutes, including ten arrangement workflows/workloads and the previous capture/title/review/opening/organization suite. A subsequent focused native automated mouse test also passed: dragging from the opening title rearranges one video without opening a tab. Existing deterministic drag-event assertions verify exact insertion markers.
- The package build completed successfully. After composing with channel browsing, all eleven arrangement browser cases, all eight browsing/scale cases, all 40 boundary tests and the package build passed. Native title dragging is included in these eleven.
- Filtered `1,5` → `5,1` does not change saved `1,2,3,4,5`, placement dates or history. Clearing the query restores saved order; density/resizing and unrelated destination changes retain temporary relative order. Unfiltered Place adopts the displayed order and saves Manual/history together; browser restart preserves it. A stale second window cannot overwrite a newer arrangement. A rejected adapter write keeps the dialog, previous state/history and retry available.

## Representative measurements

One installed-Chrome run at **1440 × 1000 CSS pixels, 100% zoom**, with 70% of active videos in Inbox, honest missing duration/publication/channel values and the remainder spread over custom lists:

| Fixture | Active / total | Channels / custom lists | Reload to rows | Title sort | Place preview | Place commit to rows |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline | 1,000 / 1,000 | 100 / 8 | 154 ms | 427 ms | 59 ms | 447 ms |
| Growth | 1,900 / 3,000 | 550 / 24 | 322 ms | 1,464 ms | 233 ms | 960 ms |

Sort and Place timings begin with in-page button activation and end when the resulting controls/rows are observable. Automation locator resolution is excluded: accessible-name traversal at these DOM sizes otherwise measures substantial runner overhead. These are single-run measurements, not percentile estimates or a latency guarantee. Growth actions remain visibly slower than the small fixture; no numerical acceptance threshold was specified. The full Library currently renders matching rows rather than virtualizing them.

## Limits

Browser automation verifies native automated mouse dragging with both endpoints visible, synthetic exact-marker behavior and keyboard/button Place. It does not establish physical mouse/trackpad comfort, edge-scroll dragging ergonomics or subjective responsiveness on the owner's hardware. An offscreen `dragTo` attempt targeted its source after automated scrolling and is excluded from gesture evidence. Human physical-device walkthrough remains an explicit evidence limit.

Compact/Thumbnails and a 430 × 780 resize are exercised here; broader narrow/short/wide/tall grouped-browser validation belongs to the integrated browsing workflow. No 10,000-record requirement, provider enrichment or capacity guarantee is inferred.
