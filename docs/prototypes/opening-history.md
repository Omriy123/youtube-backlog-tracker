# Opening and watched-history interaction prototype

Outcome: the corrected interaction direction was accepted during [Specify bulk opening failures and watched-history controls](https://github.com/Omriy123/youtube-backlog-tracker/issues/26). After completing the Q1–Q8 discussion and seeing the assembled draft, the user invoked to-spec on 2026-10-18 to formalize the [focused specification](../specs/opening-and-watch-history.md). This archive is evidence for the discussion, not production code or a shipping claim.

## Source and running

- Archive branch: [prototype/opening-history-feedback](https://github.com/Omriy123/youtube-backlog-tracker/tree/prototype/opening-history-feedback).
- Pinned source: [accepted HTML, README, walkthroughs, observations and screenshots](https://github.com/Omriy123/youtube-backlog-tracker/tree/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history).
- [Single-file HTML](https://github.com/Omriy123/youtube-backlog-tracker/blob/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history/index.html). Download/open locally in a browser; no server, dependencies, real account or Library data. All changes are fictional and memory-only. Reset/reload restores fixtures.

Only throwaway artifacts were added on the archive branch; it is not merged into main and no PR is opened for it. The main branch keeps this guide and the behavior contract. Browser preview profile files are excluded from the archive.

## What the discussion established

- Prompt for a group name, default Selected videos; keep the Library focused for grouped opening.
- Resolve pending reviews before initial tab creation, or explicitly leave individual videos in review and outside that group. Keep/Leave here alone opens nothing; final Open creates included videos in the displayed order.
- Retry failed tab creation into the original named group at requested relative positions, rather than create a separate retry group.
- Distinguish failed tab creation from a tab whose watched/history update was not saved. Retrying the latter write creates no new tab or duplicate event.
- Completed Open, Mark watched and Dismiss remove records from active views. Retained history is available explicitly, including repeat-watch controls and a popup containing all available record information and history.

The user initially requested examples and explanation, rejected the separate retry group, required group naming and review-first ordering, and clarified active-row removal. After those changes, the user accepted the revised flow with “yes seems good.” The final Q6–Q8 answers accepted retained repeat-watch actions, prompted missing-group recreation without reopening deliberately closed successful tabs, and explicit recovery of uncertain interrupted outcomes.

Decision records: [examples and popup requirement](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240486982), [corrections](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240773794), [accepted revised flow](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240828194), and [accepted Q6–Q8](https://github.com/Omriy123/youtube-backlog-tracker/issues/26#issuecomment-6240974905). Corrections supersede the initial ready-videos-proceed and separate-retry-group proposals.

## Observations and limits

The local fictional HTML was walked through in hidden Chrome at 1440 × 1080 and inspected at 640 × 900. The pinned observations show zero viewing tabs before review/name confirmation; custom naming; a reviewed Camera/Bridge/Rust group; explicit leave-in-review exclusion; cancellation retaining confirmed review choices; retry inserting Bridge between Camera and Rust in the same group; watched-write repair with no additional tab; completed active-row removal; and a scrollable information popup with readable narrow layout.

Evidence in the archive includes [walkthrough observations](https://github.com/Omriy123/youtube-backlog-tracker/blob/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history/walkthrough-observations.json), [failure results](https://github.com/Omriy123/youtube-backlog-tracker/blob/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history/failure-results-desktop.png), [review and naming](https://github.com/Omriy123/youtube-backlog-tracker/blob/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history/review-naming-narrow.png), and [information popup](https://github.com/Omriy123/youtube-backlog-tracker/blob/0f78ccf3acbba1619332fb43db37110748d98caa/.scratch/video-backlog/prototypes/opening-history/popup-narrow.png).

These are simulator observations. No actual viewing tabs/groups, production writes/Undo, restart/crash reconciliation, tab-identity validation, provider metadata, API behavior or scale performance was proved. The accepted missing-group and uncertain-outcome policies are specified in the focused contract; the simulator does not exercise them. Its three-video fixture does not prove the above-ten notice boundary. Hardcoded outcomes, simplistic state snapshots and helper code do not become implementation requirements. Real installed-extension validation remains required by the first-slice and focused contracts.
