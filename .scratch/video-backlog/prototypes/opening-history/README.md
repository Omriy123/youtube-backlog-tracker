# Opening/history discussion prototype

Open `index.html` directly in a browser. Self-contained fictional HTML; all state is in memory. No server, dependencies, real tabs, Library data, or provider calls. Reload or Reset restores fixtures. This is planning evidence, not production implementation.

## Current human decisions

- Prompt for the tab-group name, default Selected videos. Library focus is provisionally accepted ("fine i think").
- Do not create a new Retry failed opening group. Reinsert retried missing tabs into the original named group and requested order.
- Open first prompts to finish pending review; no ready videos launch ahead of that preflight. Resolved, included videos open together in their requested order. The user can explicitly leave records in review; those do not join the group. Keep/Leave here alone creates no tab. The final Open confirms the request.
- Completed Open, Mark watched, and Dismiss remove records from active Library/list views. Retained history remains available explicitly, as previously approved. Failed watched writes remain recoverable and visibly incomplete rather than falsely claiming completion.
- The popup exposes all available record information and full watch/dismissal/placement/correction details, respecting unknown metadata and its lifetime rules.

The user accepted the corrected flow and failure explanation with "yes seems good", then accepted Q6 retained Open again / Record another watch, Q7 explicit missing-group recreation without reopening deliberately closed tabs, and Q8 explicit recovery of uncertain interrupted outcomes. The latter two policies are specified in the focused contract, not simulated here. Complete-document approval remains outstanding. The fixture order illustrates a given opening request; it does not settle organization's live cross-source ordering question.

## Walkthroughs

- Q1: naming dialog, one group, Library focus, completed active rows removed. The confusing grouping-only failure step was removed from this normal walkthrough.
- Q2: Camera succeeds, Bridge cannot create a tab, Rust opens but saving watched status/history fails. Retry inserts Bridge between Camera and Rust in the original group. Retry saving watched updates creates no tab.
- Q3: preflight shows all three Tonight videos in requested order. Review Bridge and choose Leave here, then confirm the entire group. Or explicitly leave Bridge in review and open only Camera and Rust. Cancel creates no tabs while preserving confirmed review decisions. Contextual group review offers Dismiss/Leave here and the final group Open; standalone destination review retains Leave here & open.
- Q4: active rows disappear after completed status/opening actions. An explicit retained-history view exposes previous records. Retained repeat-watch controls were subsequently accepted in Q6.
- Q5: a scrollable popup with all known fictional fields and event details. No new metadata acquisition is promised.

No real persistence, restart/crash reconciliation, browser grouping, durable batch Undo/conflicts, backup, metadata validity, or architecture is validated. The settled notice above ten tabs is retained in the preflight, although the fixture uses three inputs. Retry-after-original-group-loss is deliberately not invented; the mock explains that a recovery choice remains unspecified if that simulation is invoked.

Archive this accepted interaction source and its observations on a separate throwaway branch, linking it from the chosen planning ticket and durable prototype guide. No mock code is promoted into production by this session. Archival does not approve the assembled specification or establish real browser integration.

## Revised local browser observations

Walked through the revised HTML in hidden Chrome at 1440x1080 and the review/name dialog at 640x900. Naming and unresolved review produce zero viewing tabs. A custom group name is retained. Resolving review alone creates no tab/event; final confirmation opens Camera/Bridge/Rust in order. Explicitly leaving Bridge in review opens Camera/Rust only. Cancelling after review creates no tabs and preserves the confirmed review choice. Retry inserts Bridge into the original Watch these group between Camera/Rust, without another group. Retrying the watched write leaves the total at three viewing tabs and removes the last incomplete active row. Mark watched and Dismiss remove their active rows. The narrow dialog fits within the viewport. Observations/screenshots remain local; this is simulator evidence, not real-browser extension validation or the human verdict. No test suite was added.
