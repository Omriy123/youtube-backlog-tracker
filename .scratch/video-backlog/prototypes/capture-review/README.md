# Throwaway window-save review comparison

Prototype verdict on 2026-10-17: **B's clickable badge/dialog is selected; palette A stays provisional; the latest popup is good enough to leave visual exploration.** This verdict approves the shown direction, not production code or the complete written contract. The final accepted interaction is `popup.html`; `index.html` preserves the earlier A/B/C comparison and superseded flow for provenance.

Question: Should watched/dismissed Inbox rediscovery use expandable rows, clickable badges with a dialog, or a separate review panel in the window-save preview?

Run from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/capture-review/serve.ps1
```

Open http://127.0.0.1:8767/?variant=A. The bottom switcher selects A (expandable rows), B (badge/dialog), or C (review panel); left/right keys also switch. Choices survive variant switching but reset on refresh or Reset example.

## Feedback and popup revision

The user selected **B** but rejected the full-page framing and mandatory capture-time decisions. Toolbar use must stay in the extension popup, and Save must be simple; organization/review should happen later. This supersedes any inference that the original full-page Save-ready screen was approved as the toolbar workflow.

Open http://127.0.0.1:8767/popup.html for the corrected current-tab and current-window popup framing. **Latest user change:** generic watched/dismissed rediscovery belongs in Inbox immediately with a pending-review badge. Keep confirms staying in Inbox; Dismiss removes the record from active lists while retaining history. This explicitly replaces the earlier outside-active-list pending-request proposal and changes the generic Q44 placement timing for this later slice. Explicit destination shortcuts retain their chosen placement and Dismiss/Leave here/Leave here & open review. The prototype is a browser page depicting an extension popup, not an installed extension.

The Example selector demonstrates new upload, active exact duplicate, watched exact duplicate, and a different-upload possible-duplicate suggestion. Window saving includes two references to one upload and both watched/dismissed records. Source rows and checkbox text are clickable; destination controls do not toggle selection. Other-destination buttons show only list names even when automatic closing is enabled. The explicit **Undo save & choose again** replaces ambiguous Back after a save. It reverses the mock save's placement/request changes and preserves source-tab closure; it is illustrative pending final spec approval. An already-active duplicate with no change has no save reversal.

**Show Library demo** or explicit **View in Library** demonstrates later B-style clickable badges: queued generic Keep/Dismiss, active shortcut Dismiss/Leave here/Leave here & open, and a separate nonblocking different-upload comparison. No page opens automatically on saving. Changing the Example selector is a demo control, not a proposed product feature.

Latest feedback: status must look like a distinct badge and be clickable in the popup/window preview itself, rather than being plain text that only links to later Library review. The revised pill badges open B dialogs. Optional capture-time choices are staged until Save; ignoring them still saves/queues review for later. Exact-active and repeated-reference badges explain identity without changing placement. The source-list scroll position now survives selecting rows, destination changes, and optional review choices; the reported 130px → 0 reset was reproduced and corrected to 130px → 130px in Chrome. Temporary `inspect.ps1`/`repro-*.js`/`check-*.js` files are local inspection helpers, not product tests or required archived source.

Results feedback: carry the same clickable pills into the processed-source list and make every unsaved/not-added reason explicit, including duplicates. The revised results account for every source tab (selected or unchecked), distinguish saved/requeued, already-active duplicate, repeated same-upload link, pending generic review, deliberately dismissed, failed, and unchecked. Duplicates explain why no new record was added while pointing at the safe existing record. A demo-only checkbox simulates one window save failure; its result offers Retry without repeating successful records. Result-pill review updates the row after resolution and preserves scroll. This remains a mock, with no actual browser or persistence failure injection.

Reopening feedback: Done closes the mock popup. Opening it again starts a current-tab/window capture preview, not the old results page. The window model tracks individually closed source tabs; closed sources disappear, failed/unsaved sources remain available, and already-saved sources still open are visible but unchecked. A Last save results link deliberately returns to the receipt. The one-off failed-write example can succeed on a subsequent attempt. This does not query or mutate actual browser tabs.

Pill accessibility feedback: the user is colorblind and needs visible examples rather than describing troublesome colors. The mock offers A (blue/amber), B (monochrome), and C (purple/blue), with Try buttons applying the palette to actual popup pills. Every status has a text label, symbol, and distinct border treatment; status headlines no longer rely on red/green. **The user selected A for now.** This is a focused status-pill adjustment, not approval of the broader product theme.

Try selecting destinations, All selected → Inbox, individual or batch Keep/Dismiss, saving ready rows while leaving unanswered reviews, and simulated source closing. All data and effects are fictional and in memory. This is presentation evidence, not browser integration, persistence, metadata acquisition, or production correctness. Existing Library layout is context; theme is not under review.

Human decisions already accepted: direct single-item save, shared and per-item destinations with an easy all-to-Inbox path, a separate post-save source close action, an opt-in remembered toolbar Save & close toggle, B's clickable review badge/dialog, pending generic rediscovery in Inbox, Dismiss / Leave here / Leave here & open for shortcuts, nonblocking late possible-duplicate suggestions, and provisional palette A. Both the original mandatory window-preview decision queue and outside-active-list pending requests are superseded. The user accepted the revised prototype as good enough to move on; the complete bounded written contract still needs approval. Some result details remain illustrative. Temporary inspector files/profiles/logs are not part of the archived source.

After user feedback, archive the complete comparison on a throwaway branch and link it from the chosen planning ticket. Keep only approved decisions/spec pointers on main. Do not promote this HTML into production.
