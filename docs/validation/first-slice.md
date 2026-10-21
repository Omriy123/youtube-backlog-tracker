# First-slice validation

Validated on 2026-10-21. This is the bounded Chrome test build for save/find/open/recover, pending rediscovery review and Personal/retained captured titles. It does not validate the broader planned Library product or start later recovery/enrichment real-use review clocks.

## Actual installed Chrome

`npm run validate:chrome` passed against both repository `extension/` and the standalone artifact created by `npm run build`. The final packaged run completed at **2026-10-21T16:24:47.927Z**, using **Chrome/155.0.8059.41** on Windows, in a fresh isolated profile. It used production extension files, actual toolbar popups, Chrome local storage and real tabs. Each popup was independently identified by `chrome.tabs.getCurrent()` returning no tab.

The common walkthrough in `tests/workflows/complete-workflow.js` verified:

- Capture Original alpha, Intermediate beta and Latest gamma as three retained browser observations on one record; author a separate Personal title.
- Open into a new, active native tab with the saved requested URL; preserve the source tab and record the first watch. Native tab IDs/counts distinguish the new tab from existing same-URL source tabs. A pending browser navigation is sufficient; provider playback is not assumed.
- Re-save the watched record immediately into pending Inbox, retain its identity/dates/earlier watch and expose prior watched status/destination/activity. Escape leaves review pending. Search the intermediate title and inspect that exact retained version with browser source/time without changing user state.
- Restart the entire browser process with the same isolated profile; preserve pending review and every title/watch. Keep through Enter, creating no tab or extra list-entry date. Open separately through Enter and record a second watch.
- Restart again, then Undo through Enter. Restore the reviewed Inbox state, keep the first watch and all observations, never revive resolved review, and leave all pre-Undo browser tab IDs/counts unchanged.
- Resize to **390 × 780**, open the editor through Enter with the input focused, and clear Personal title to restore Original fallback without horizontal page overflow.

Screenshots from the final packaged run:

| State | Evidence |
| --- | --- |
| Populated Library with Personal title and captured Latest | [Library](first-slice/01-populated-library.png) |
| Pending review with prior placement/dates/watch | [Prior activity](first-slice/02-pending-prior-activity.png) |
| Exact intermediate search match and retained source/time | [Title inspection](first-slice/03-retained-title-match.png) |
| Second opening with persistent Undo available | [Recovery](first-slice/04-opening-recovery.png) |
| Restored Inbox at 390 pixels after clearing Personal title | [Compact Library](first-slice/05-compact-restored-library.png) |

The screenshots were visually inspected for readable facts/actions and compact layout. Full-page modal screenshots can extend below the viewport backdrop; this is a capture artifact.

## Repeatable checks and coverage

Fresh complete `npm test` on the integrated branch passed **29 public boundary checks and 26 installed Chromium workflows**, with zero failures or skips. The browser portion completed in 1.6 minutes. `npm run build` passed; all 17 packaged production files and the packaged installation guide matched their source hashes. No product changes were needed for final integration.

Run `npm ci`, `npx playwright install chromium`, then `npm test` from the repository root with Node 24 or newer. Windows PowerShell can use `npm.cmd` / `npx.cmd` when script policy blocks the `.ps1` launchers. `npm run validate:chrome` separately uses installed Chrome; `CHROME_PATH` overrides its executable and `EXTENSION_PATH` selects a packaged extension folder. Every invocation writes its own run directory beneath `.scratch/validation/actual-chrome/`, containing five screenshots, an isolated profile and a successful `result.json` only after the complete walkthrough passes.

| Boundary | Behavior covered |
| --- | --- |
| Installed Chromium UI, actual tabs/local storage | Toolbar capture, exact duplicates and supported URL contexts, repeated/missing observations, Personal save/clear/fallback, independent search scopes and exact historical inspection, watched/dismissed requeue, prior review/cancel/Keep/Dismiss, action gates, reopened/restarted Library, opening/Undo, known repair, uncertain inspection and explicitly warned new opening, small viewports and keyboard actions. |
| Additional combined installed workflows | Three titles plus authored title through two watches/two restarts and reviewed Undo; a prepared editor in one Library while another opens and popup requeues, followed by review without implicit title commit and a later deliberate edit protected against old Undo. |
| Existing public command/browser-persistence adapter | Concurrent invocation capture, repeated saves/commands, stale review/editor/open revisions, later conflicting versus unrelated decisions, automatic observations surviving Undo, failed save/title/review/preparation/tab creation/receipt/completion/Undo writes, known repair across restart/repeated activation, lost creation evidence, committed writes with rejected acknowledgements and conservative URL identity fixtures. |

Deterministic write failures and crash boundaries use only the existing browser/persistence adapter, sometimes in a copied extension; production code has no test hooks. Boundary checks cover phases Chrome cannot reliably induce, while installed workflows verify the visible behavior with real browser storage and tabs. Earlier watches, complete capture observations and correction audit are retained without count/age eviction. No extra private-helper tests or product layers were added for final integration.

## Build and evidence limits

`npm run build` copies production `extension/` and installation instructions to a fresh `.scratch/build/video-backlog-tracker-…/` directory. That folder is runnable with Chrome **Load unpacked**, with no compilation, provider account, API key or runtime Node dependency. The final trial ZIP is a convenience archive of this unpacked folder and its evidence; extract before installation. Follow [installation and the complete trial walkthrough](../installation.md), including the bounded supported-URL table and safe update instructions.

The Chrome harness uses CDP `Extensions.loadUnpacked` on every process launch because that automation registration is session-scoped on the validated version. It proves persistent Library data through those launches, not the human `chrome://extensions` registration workflow. The personal browser profile was never used. Controlled HTTPS fixture pages and browser titles establish capture, identity, real tab creation and persistence; they do not establish live provider playback, availability or current provider metadata. Failure fixtures are deterministic integration-boundary evidence, not a claim that every failure was forced in machine Chrome. No other-browser release, cloud sync, provider enrichment, imports, general organization or backup/export/recovery UI is included.
