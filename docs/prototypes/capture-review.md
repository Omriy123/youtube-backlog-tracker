# Capture and rediscovery prototype archive

The user accepted the revised popup prototype as good enough to leave visual exploration on 2026-10-17. **B's clickable pill/dialog** is the chosen interaction. **Pill palette A (blue/amber) remains provisional**; status labels, symbols, and border patterns must work independently of color. The broader product theme remains deferred.

Planning decision: [Specify expanded capture and pending rediscovery-review interactions](https://github.com/Omriy123/youtube-backlog-tracker/issues/24). Written contract: [expanded capture and pending rediscovery review](../specs/expanded-capture.md), formalized through the user-invoked to-spec handoff after completed grilling and prototype feedback. The mock itself is not production code or browser validation.

## Primary source

Source is on [archive/capture-review](https://github.com/Omriy123/youtube-backlog-tracker/tree/archive/capture-review/.scratch/video-backlog/prototypes/capture-review), pinned at commit [`87a71c60fa667a3e9b453e43bdafa302b40c57a4`](https://github.com/Omriy123/youtube-backlog-tracker/tree/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review).

- [Latest popup and Library-review mock](https://github.com/Omriy123/youtube-backlog-tracker/blob/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review/popup.html): the accepted direction.
- [Original A/B/C comparison](https://github.com/Omriy123/youtube-backlog-tracker/blob/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review/index.html): historical alternatives, including the superseded mandatory full-page save/review framing.
- [Feedback/run instructions](https://github.com/Omriy123/youtube-backlog-tracker/blob/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review/README.md) and [sample results/palette screenshot](https://github.com/Omriy123/youtube-backlog-tracker/blob/87a71c60fa667a3e9b453e43bdafa302b40c57a4/.scratch/video-backlog/prototypes/capture-review/inbox-palettes-check.png).

The branch is throwaway source evidence and is not merged into main. Main retains decisions/specification and this source pointer. Temporary browser profiles, logs, inspection helpers, and runtime state are not archived.

## Run

Obtain the archive in a separate checkout; do not switch a shared working branch merely to inspect it. From that checkout's root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/capture-review/serve.ps1
```

Open `http://127.0.0.1:8767/popup.html`. The original comparison is still at `http://127.0.0.1:8767/?variant=B`. Port is configurable with `-Port`.

Use the Example selector for fresh, active-exact, watched-exact, and different-upload possible duplicates. Save tabs from this window shows shared/per-upload destinations, repeated references, pending Inbox rediscoveries, unchecked fallback, and an optional simulated write failure. Results retain clickable pills; opening/closing them preserves scroll. The mock's Done/toolbar sequence refreshes its remaining source model, and the comparison panel applies palettes A/B/C.

## Evidence limits

All data and actions are simulated in memory, resetting on reload or Reset. This is a webpage depicting an extension popup and Library, not an installed extension. It does not save/open/close real browser tabs, write a real Library, fetch metadata, parse import exports, or establish production recovery/concurrency correctness. Its snapshot-based immediate correction and example source/duration/date values are illustrative.

The latest human correction puts pending generic rediscoveries **in Inbox**, superseding both the original pre-save review requirement and an intermediate outside-active-list request proposal. Keep confirms Inbox membership; Dismiss removes it from active lists with retained history. Explicit destination pending review remains in that destination. The focused spec records the actual behavior and revision; older variants are evidence of exploration, not competing requirements.
