# Organization and browsing prototype handoff

Snapshot recorded 2026-10-18 for continued grilling of [Specify remaining organization and browsing interaction edge cases](https://github.com/Omriy123/youtube-backlog-tracker/issues/25). The user requested a written record before returning to the other session. The ticket remains open: this is not a final prototype/specification approval or a delivery commitment.

Read [the consolidated decisions and remaining questions](../design/library-organization-decisions.md) first. It carries the final corrections from this exchange; the source README preserves chronological exploration rather than competing requirements.

## Source and run

The throwaway source is on [archive/organization-browsing](https://github.com/Omriy123/youtube-backlog-tracker/tree/archive/organization-browsing/.scratch/video-backlog/prototypes/organization-browsing), pinned at commit [`fe64e9975e7b77a65814fbf267406fea488d3c44`](https://github.com/Omriy123/youtube-backlog-tracker/tree/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing).

- [Single-file interactive demo](https://github.com/Omriy123/youtube-backlog-tracker/blob/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing/index.html).
- [Current snapshot introduction and chronological feedback](https://github.com/Omriy123/youtube-backlog-tracker/blob/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing/README.md).
- [Desktop snapshot](https://github.com/Omriy123/youtube-backlog-tracker/blob/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing/handoff-desktop.png) and [narrow snapshot](https://github.com/Omriy123/youtube-backlog-tracker/blob/fe64e9975e7b77a65814fbf267406fea488d3c44/.scratch/video-backlog/prototypes/organization-browsing/handoff-narrow.png).

In a separate checkout of the archive, double-click `.scratch/video-backlog/prototypes/organization-browsing/index.html`. No server, package installation, account or provider credentials are required. A GitHub source-page URL is not a hosted runnable demo. The existing workspace may already have the ignored local file. Reload/Reset restores fictional fixtures.

Do not merge the archive branch into main or switch a shared working checkout to inspect it. Main keeps the written decisions and this pointer. Browser profiles, logs, obsolete screenshots and local observation helpers are not archived.

## Evidence limits

The demo explores selections across queries/lists, temporary filtered versus saved unfiltered arrangements, single/group dragging, selected-only results, move/affected-title tables, whole-list versus filtered removal, unknown channels, grouped scopes, and simulated stale/save failures. Q11's full collected-selection arrival-order example remains a proposal.

Local browser observations used 1440 × 1100 and 640 × 900 CSS-pixel viewports. Earlier drag observations dispatched DOM events; the final current-results-only Ctrl+drag case also used native mouse input through Chrome's debugging connection, producing real browser dragstart/drop events at both sizes. Selection no-jump observations retained the same checkbox node and pointer target with 0px movement and successful same-point deselection.

These are observations of fictional in-memory state, not an installed extension. The source does not establish production storage/history, persistent recovery, concurrency correctness, tab-opening effects, provider metadata, imports or representative-scale performance. It does not implement the settled pending-rediscovery review gate. Physical-device ergonomics and full-contract approval remain for human review. The user workload and proposed delivery validation fixtures are recorded in the decision handoff, not proven by the tiny simulator.
