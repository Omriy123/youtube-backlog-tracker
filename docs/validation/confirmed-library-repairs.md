# Confirmed Library interaction repairs

Bounded implementation for [Fix confirmed issues in the current build](https://github.com/Omriy123/youtube-backlog-tracker/issues/63), based on organization PR head `feb6a9cc7512353cc315eea6ea8d03e58f35f131`. This supplies a corrected prerequisite build; it does not certify all feedback or the overall draft PR ready.

## Checks

Final `npm test` passed **40 boundary tests and 117 browser workflows**, including the existing stale-state reconfirmation, pending review, cancellation, failed-write/retry and recovery scenarios. Browser workflows used installed Chrome as described below. `git diff --check` passed. Initial local attempts needed the existing portable Node runtime and permission to launch isolated Chrome; the completed runs used that established environment.

Installed Chrome **155.0.8059.41**, isolated profiles and real extension/storage, using `CHROME_PATH` with the existing Playwright launcher. `tests/browser/confirmed-repairs.spec.js` covers:

- Native Enter creation and rename, invalid reserved name explained without closing, Escape cancellation and persistence after restarting Chrome.
- Delayed failed persistence through the existing test-only browser adapter: pending submission rejects repeated form submissions and Escape; failure leaves no list or action; keyboard focus returns to the name field and native Enter retries, producing exactly one list/action.
- Native Ctrl + title drag of two selected videos onto a watch list: shared target starts at the dropped list. Per-row overrides produce an explicit Mixed destinations state; excluding/re-including a row updates that state without losing its choice. Confirmation persists the two distinct intended destinations.
- Both importance directions and both name directions are visible; the active importance direction has an accessible description. Inbox/Backlog remain fixed endpoints, and saved importance values remain unchanged.
- Cross-list selection at **390 × 1000** and **1440 × 1000**: In Here/Elsewhere have identical Video/From column positions. Individual × controls occupy the title cell and retain full accessible deselection names. All/Matches and global Clear remain independent. Selection and a second click at the same result checkbox retain its rectangle. Compact mode retains column positions and reachable actions.

The regressions failed on the original implementation before their fixes. The review additionally caught lost keyboard focus after a delayed failed save; its regression failed, then passed after restoring focus. Capture fixtures wait for durable save completion, and layout measurements wait for completed asynchronous rendering.

Independent read-only review cleared the bounded fixes after that focus correction. The six focused Chrome workflows passed. `npm run build` produced manifest version **0.1.0** with `INSTALLATION.md`. `npm run validate:chrome` against that packaged extension passed the existing save/find/review/open/Undo path with three retained title observations, two openings and two full browser-process restarts. Its result and five screenshots are under `.scratch/validation/actual-chrome/run-7aHQFm/` in the fix worktree; they are local supporting evidence, not a second task tracker.

## Rendered comparison

References: [accepted Library layout](../design/library-layout.md), [organization selection decisions](../design/library-organization-decisions.md#selection-and-its-presentation), and the [actual archived organization prototype](https://github.com/Omriy123/youtube-backlog-tracker/blob/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing/index.html). The later ticket correction governs In Here capitalization and compact individual deselection.

Inspected the rendered extension at both widths and densities. Compared with the accepted title/normal-size From grouping and beside-title individual control: the title and origin columns now line up across groups; long titles wrap within their column, with × reachable beside the title. Scoped and global actions wrap at narrow width. The panel remains below results, preserving the result checkbox during selection. Fixtures use fictional titles and honest missing metadata; no provider acquisition is implied.

| Density | Desktop | Narrow |
| --- | --- | --- |
| Thumbnails | [Selection panel](confirmed-library-repairs/selection-desktop.png) | [Selection panel](confirmed-library-repairs/selection-narrow.png) |
| Compact | [Selection panel](confirmed-library-repairs/selection-compact-desktop.png) | [Selection panel](confirmed-library-repairs/selection-compact-narrow.png) |

## Limits

Later direct-drop/contextual flows, modifier reversal, selection retention refinements, merge/Redo decisions and provider preferences remain outside this repair. Overall list/density/Entire Library prototype fidelity, drag scrolling and physical-device comfort still need explicit broader PR/human review. Automated headless installed Chrome checks establish the exercised extension behavior, not human acceptance or manual extension registration persistence. Existing local trial data is preserved by updating the same loaded extension folder; do not uninstall it.
