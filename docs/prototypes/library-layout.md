# Library layout prototype archive

The user completed this throwaway prototype and selected refined A on 2026-10-13. Read the [feedback and accepted direction](../design/library-layout.md) before using it as a reference. The source is illustrative and does not select a production framework or implement a browser extension.

## Source

The archive branch is [archive/library-layout](https://github.com/Omriy123/youtube-backlog-tracker/tree/archive/library-layout/.scratch/video-backlog/prototypes/library-layout), captured at commit `a547c769bdfc037a36334c40de18a5a7b0894e07`. Its source directory is `.scratch/video-backlog/prototypes/library-layout/`, including the original comparison and first refinement. The main branch keeps the accepted design docs; `.scratch/` is normally ignored.

The current local workspace may still contain the source. For a new checkout, obtain the archive branch in a separate checkout so production work and prototype code stay distinct.

## Run

From the archive checkout root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/library-layout/serve.ps1
```

Open `http://127.0.0.1:8765/?variant=A` for refined A. Variants B and C use `?variant=B` and `?variant=C`. The floating switcher preserves mock edits; reloading resets them. The source README includes the comparison walkthrough and implementation assumptions.

All data and actions are simulated in memory. No API key or production data is needed.
