# Full-list deletion and matching cleanup validation

Issue #56 implements `docs/specs/library-organization.md` through the existing installed-extension/browser-persistence seam. Validation ran on Windows with installed desktop Google Chrome **155.0.8059.41**, using `C:/Program Files/Google/Chrome/Application/chrome.exe` and the existing `CHROME_PATH` launcher.

## Behavior and regression evidence

The complete regression checkpoint passed **40 boundary tests and 96 installed-Chrome browser tests**. A final targeted checkpoint covers **13 removal workflows**, including one additional historical-date case after that full checkpoint. The extension package build passed. Independent final integration reviews and any fixes are recorded separately by the parent implementation session.

Removal tests exercise:

- Full active membership despite hidden query/channel/selected-only results; explicit effect/destination without a destructive default; permanent-list denial; whole-delete Inbox exception and ordinary matching restriction.
- Actual matching-only scope including selected-only, retained list/unmatched videos, pending exclusions and processed-only selection cleanup. Same-target matching moves preserve dates/order/History.
- Effect-aware navigation for current/return origins and unrelated sidebar deletion, with filters retained and zero-result controls usable. Empty deletion needs confirmation and no destination choice.
- Pending whole moves cannot exclude unresolved videos; review alone does not execute the removal. Explicit dismissal resolves the pending dismissal decision.
- Relevant source arrivals and target changes refresh the affected preview before any mutation and require another confirmation. An emptied source discards obsolete move choices; new arrivals make explicit normal choices necessary again.
- Deterministic failed persistence retains the dialog/selection and leaves coherent durable state unchanged; explicit retry works. After browser restart, Undo restores the original list identity/name/importance/Manual order, placement dates and relevant review state.
- Recovery protects recreated-name collisions and newer importance/status decisions; sequential reversal works. Newer Personal titles and automatic observations remain independent. Unknown historical First Inbox-exit dates remain unknown during later custom-list moves.

The sequential recovery test exposed a shared status baseline alias: appending a manual watch also changed the saved before-array. The placement snapshot is now detached, and the test verifies status Undo followed by deletion Undo succeeds without retaining the new watch event.

## Combined representative workloads

`tests/browser/removal-scale.spec.js` runs actual save/find/select/temporary Place/batch move/full deletion/Undo/open/Undo workflows. Synthetic metadata is explicitly labeled test-only. The skewed Inbox holds approximately 70% of active records; one large custom list holds approximately 20%. Synthetic records have three retained observations, missing channel/duration/publication fields, and retained watched/dismissed records at growth scale. The actual captured record remains available at the end of the walkthrough.

A full-suite run recorded:

| Fixture | Active / total | Known channels / custom lists | Full affected rows | Initial load | Preview | Delete | Recover |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | 1,000 / 1,000 | 100 / 8 | 190 | 276 ms | 108 ms | 260 ms | 308 ms |
| Growth | 1,900 / 3,000 | 550 / 24 | 370 | 577 ms | 244 ms | 856 ms | 1,070 ms |

Ten selected query matches are moved first; the full preview then includes all remaining 190/370 source members despite the query returning zero there. Temporary filtered Place is verified not to save Manual before the batch move. Opening creates one actual browser tab, then Undo restores active membership. These are individual observed automation samples, not latency promises or capacity limits. Timed buttons use in-page UI activation, with durable/DOM outcomes awaited.

## Responsive, keyboard and retained artifacts

Actual CSS viewport measurements cover **2560x1440**, **1440x900**, **1280x500**, **390x844**, and **768x1200**. No horizontal root overflow occurred. The native modal scroll exposes the complete title table and confirmation actions; the focused confirmation was scrolled into view and checked within viewport bounds. The narrow screenshot shows readable Video/From/effect columns and wrapped reachable actions.

Actual `chrome.tabs.setZoom` at **125%** and **150%** measured **614x960** and **512x800** CSS pixels respectively from the 768x1200 host viewport, with corresponding device pixel ratios 1.25/1.5 and no horizontal root overflow. Root scrolling remains native with the accepted hidden scrollbar.

Raw evidence is preserved at the project root, outside implementer worktrees and Playwright's cleared output directory:

- [Baseline metrics](../../.scratch/validation/organization-removal/baseline.json) and [growth metrics](../../.scratch/validation/organization-removal/growth.json).
- Same directory: `baseline-1440x900.png`, `baseline-final.png`, `growth-2560x1440.png`, `growth-1440x900.png`, `growth-1280x500.png`, `growth-390x844.png`, `growth-768x1200.png`, `growth-zoom-1.25.png`, `growth-zoom-1.5.png`, and `growth-final.png`.

Set `ORGANIZATION_EVIDENCE_ROOT` to that root directory when rerunning from a worktree. Rerunning replaces these samples with fresh measurements; ordinary runs from the repository root use the same location by default.

## Evidence limits

This is headless installed desktop Chrome automation using actual extension storage, browser tab APIs, modal scrolling and browser zoom. It does not establish physical mouse/trackpad ergonomics, subjective comfort, other browsers, provider acquisition, or a universal hardware/performance guarantee. Broad theme/UI work and bulk tab groups remain outside this ticket.
