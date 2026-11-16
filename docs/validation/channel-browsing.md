# Channel browsing and responsive presentation validation

Validated 2026-10-28 against issue #54 and `docs/specs/library-organization.md`. The installed desktop browser was Chrome 155.0.8059.41 at `C:/Program Files/Google/Chrome/Application/chrome.exe`, using the existing extension/browser-persistence boundary. Fixtures explicitly use synthetic recorded metadata; production does not acquire or fabricate provider/channel information.

## Automated coverage

`tests/browser/organization-browse.spec.js` covers reversible synchronized scope controls, list/group navigation retaining filters, zero-result recovery, stable top-five ranking and expansion, same-name distinct channel identities, unknown-channel browsing, substituted channel counts, retained-description scopes and exact source inspection, matching long excerpts, title display precedence, remembered density/Rows-Columns, and failed preference persistence with retry. A measured count-change test caught and then verified the fix for neighboring shortcut movement when a count gained a digit. Same-name shortcuts expose their recorded IDs visibly and in accessible descriptions.

Existing title and list/move/recovery workflows were rerun. Read-only browsing does not change record membership, authored fields or History. The 34 existing public-boundary tests and package build passed during this ticket. Final integration reruns cover the combined sorting and selection controls from their own tickets.

## Representative workload observations

The reproducible installed-browser test is `tests/browser/organization-browse-scale.spec.js`. It uses three retained metadata observations per record, honest missing metadata, skewed membership (70% in Inbox), and retained watched/dismissed history at growth scale. These are workload fixtures, not capacity limits.

A recorded desktop-Chrome run measured:

| Fixture | Active / total | Channel slots | Custom lists | Initial load | Query | Scope toggle | Channel filter |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | 1,000 / 1,000 | 100 | 8 | 256 ms | 86 ms | 67 ms | 93 ms |
| Growth | 1,900 / 3,000 | 550 | 24 | 629 ms | 177 ms | 128 ms | 169 ms |

The growth distribution has 500 distinct known channel identities plus unknown records because every eleventh slot deliberately lacks identity. The 550-slot configuration remains within the approved up-to-550 workload. Filtered channel result counts were awaited before measuring completion (10 baseline, 4 growth for the first ranked channel). Timings are observed end-to-end automation measurements, not performance guarantees or an invented latency budget.

## Viewports, zoom and artifacts

Actual measured CSS viewports were 2560x1440, 1440x900, 1280x500, 390x844, and 768x1200. The root document had no horizontal overflow or visible scrollbar gutter. Native scrolling, focused scope controls and actions remained reachable. At actual Chrome zoom 125% and 150% (using `chrome.tabs.setZoom`), the 768x1200 host viewport measured 614x960 and 512x800 CSS pixels respectively, with no horizontal root overflow. Both density choices and grouped orientations were exercised without losing filters.

Raw artifacts are temporary local evidence, deliberately outside the tracked product files:

- `.scratch/validation/organization-browse/evidence.json` (preserved at the integration root before ticket-worktree cleanup)
- Same directory: `workload-1000.png`, `workload-3000.png`, `viewport-2560x1440.png`, `viewport-1440x900.png`, `viewport-1280x500.png`, `viewport-390x844.png`, `viewport-768x1200.png`, `zoom-1.25.png`, `zoom-1.5.png`.

Running the scale test again replaces these local artifacts and records fresh measurements. The final integrated branch may produce additional evidence after combining arranging and selection.

## Evidence limits

Checks ran in headless installed desktop Chrome using actual extension storage, commands, tab APIs and browser zoom. They establish automated browser behavior and measured layout geometry. They do not establish physical mouse/trackpad ergonomics, subjective visual comfort, other browser compatibility, provider acquisition, or a capacity/latency promise.
