# Enrichment close-control repair

Owner feedback on 2026-11-17 after the `0.1.0` / `56207f3` handoff (installed revision not independently inspected):

| Observation | Disposition |
| --- | --- |
| Pull-all opens a large details section with no apparent way to close it | Current-PR #67 close-control reachability repair |
| Top button locations should change in the UI pass | Explicitly deferred to existing [#51](https://github.com/Omriy123/youtube-backlog-tracker/issues/51); replacement arrangement remains undecided |
| Metadata popup appears closable only with Escape | Current-PR #66 pointer-close reachability repair |
| Rest seems to work well | Owner workflow evidence, retained alongside the new failures |

## Reproduction and repair

Both existing close controls were present but could be outside the visible scroll area. A long retained description placed **Close metadata** after the entire dialog body. Scrolling the 20-record retrieval-results section moved **Hide retrieval results** out of view.

Two installed-Chrome regressions failed before the repair, each reporting viewport intersection ratio zero for its close button. They assert visibility and actual pointer hit testing before clicking; automatic locator scrolling cannot conceal the failure.

The repair moves each existing close control beside its heading and keeps that heading visible during scrolling. It preserves Escape, retained outcomes, acquisition/cancellation semantics, metadata version tabs and Library controls. Hiding running results allows retrieval to finish; results can then reopen with every outcome retained.

## Reference comparison and checks

The [accepted provider-details reference](../prototypes/provider-availability.md) places its pointer-close action in the dialog heading. The [Library layout reference](../design/library-layout.md) continues to govern navigation, density, search and selection. The focused review compared pinned prototype source and real desktop/narrow renders across both densities. No Library toolbar relocation is included.

Review found no correctness issue; a small sticky-header padding gap was corrected so description text cannot appear above the heading. Final regression and full-suite results accompany the delivered revision in PR #68 and `BUILD.txt`.

Final verification completed successfully: **66 boundary checks and all 130 installed-Chrome browser workflows passed**. The final uninterrupted `npm test` run exited 0; the browser portion took 5.9 minutes. Focused code and rendered review found no remaining issues.

An initial full run stopped on `metadata-browse.spec.js`'s first workflow before any dialog opened: its Pull button was absent after the fixture changed tabs without waiting for Save to Inbox to complete. The fixture now waits for the public **Saved to Inbox** acknowledgement before opening Library. Three focused repeats passed afterward. This adds no production behavior and does not treat the interrupted run as passing.

The new browser cases cover:

- Original, Latest and History with long text in both densities at 1440- and 390-pixel widths, before and after scrolling; close by pointer and Escape.
- Scrolled results containing 20 records; pointer-hide and reopen with all counts retained.
- Hiding an in-flight retrieval without cancelling it; background completion while hidden; explicit reopening with all completed results.

Captured dialogs and panels use synthetic records and controlled provider responses, including honest missing-image states. No personal key, owner Library data or authenticated network request is involved. Pictures show the scrolled state; physical pointer comfort still needs owner retesting.

| Surface | Thumbnails desktop / narrow | Compact desktop / narrow |
| --- | --- | --- |
| Metadata History | [1440](enrichment-close-controls/metadata-Thumbnails-1440.png) / [390](enrichment-close-controls/metadata-Thumbnails-390.png) | [1440](enrichment-close-controls/metadata-Compact-1440.png) / [390](enrichment-close-controls/metadata-Compact-390.png) |
| Scrolled batch results | [1440](enrichment-close-controls/results-Thumbnails-1440.png) / [390](enrichment-close-controls/results-Thumbnails-390.png) | [1440](enrichment-close-controls/results-Compact-1440.png) / [390](enrichment-close-controls/results-Compact-390.png) |

## Owner retest

Update the existing loaded extension folder, Reload in Chrome and reopen Library. Scroll Metadata details and close it with **Close metadata** beside its heading. Scroll retrieval results and use **Hide retrieval results** beside that heading; use **Retrieval results** to reopen. Both controls should remain visible while scrolling their respective surfaces. Hiding results is separate from **Cancel further retrieval**.

The top enrichment buttons remain in their current location pending the owner's later #51 UI design session. PR #68 remains draft until the close-control repair is retested; prior successful thumbnail and metadata feedback remains recorded.
