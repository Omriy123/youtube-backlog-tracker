# Provider availability and metadata history prototype

Planning decision: [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31). Focused [YouTube enrichment, metadata history, and availability contract](../specs/provider-enrichment.md): approved on 2026-10-19 after the final checkbox/recoverable-clearing corrections and complete-contract review.

The owner selected **A: compact status pills opening a details dialog**. Later feedback requires original/current titles, retained intermediate metadata, default historical-title search, and independent **Personal / Original / Intermediate / Latest checkboxes**, all on by default. Clearing current enrichment is recoverable and retains metadata history; the mock does not implement that operation. Broad theme/colors remain deferred.

## Immutable source

- [Archive branch](https://github.com/Omriy123/youtube-backlog-tracker/tree/prototype/provider-availability-feedback), separate from main; no PR or merge.
- [Pinned source and run instructions](https://github.com/Omriy123/youtube-backlog-tracker/tree/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability).
- [HTML](https://github.com/Omriy123/youtube-backlog-tracker/blob/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability/index.html) and [revised title/history/search behavior](https://github.com/Omriy123/youtube-backlog-tracker/blob/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability/prototype.js).
- [Observed mock behavior](https://github.com/Omriy123/youtube-backlog-tracker/blob/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability/observations.json), [desktop](https://github.com/Omriy123/youtube-backlog-tracker/blob/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability/checkbox-desktop.png) and [narrow](https://github.com/Omriy123/youtube-backlog-tracker/blob/28edb26e34bff11ba5decd7ea7b320bd29364eef/.scratch/video-backlog/prototypes/provider-availability/checkbox-narrow.png) screenshots.

Only nine named prototype assets were published. The archive excludes current specifications, real provider data, credentials, private imports, browser profiles, runtime logs, issue drafts and publication helpers. Main keeps this pointer and the contract, not prototype code.

## Run and inspect

Obtain the source files from the archive in a separate folder. Open `index.html` with adjacent `prototype.js`, or run its `serve.ps1` and visit `http://127.0.0.1:8770/?variant=A`. A/B/C remain switchable with the floating bottom arrows or left/right keys; B and C are unselected exploratory alternatives. Do not switch a shared working branch merely to view the archive.

Search **Bridge loads explained**, an intermediate title. It finds the Bridge record by default. Uncheck Intermediate: the result disappears while Original and Latest stay checked. Recheck it and click the historical match to inspect all three dated versions. The normal row preserves the original title while identifying the different latest-known title. Metadata pills expose returned/no-result/request/setup evidence and simulated actions. Reset restores fictional records.

## Observations and limits

Local Chrome walkthroughs at 1440 × 1080 and 640 × 900 observed: all four scopes checked by default; one intermediate-title result; zero after disabling Intermediate with Original/Latest still enabled; one after re-enabling it; three historical versions in the dialog; independent Latest inspection; preserved original/current labels; and no page-level horizontal overflow. Earlier walkthroughs covered A/B/C navigation, no-result evidence, simulated retry failure retaining five records, setup errors, explicit no-real-tab opening and reset.

Everything is fictional, memory-only and reset on reload. Thumbnail blocks are visual placeholders. No actual provider requests, image-byte persistence, real Library writes, clearing/Undo, weekly/quota scheduler, credentials, permission behavior, backup files/Drive versions, restoration, scale or memory/storage performance were validated. The focused spec's installed-extension testing and [four-week real-use review](https://github.com/Omriy123/youtube-backlog-tracker/issues/35) remain required. The UI source is evidence for discussion, not production code.
