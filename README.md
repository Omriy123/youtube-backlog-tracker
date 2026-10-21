# YouTube Backlog Tracker

A personal desktop browser extension for collecting video links, sorting them into watch lists, and deciding what to watch next. YouTube is the primary provider; Twitch VODs and generic video links are also in scope.

The Chrome first-slice test build supports toolbar save, Personal titles, retained-title search, real opening, watched/dismissed rediscovery review and persistent Undo opening. [Install it and follow the complete walkthrough](docs/installation.md), or inspect the [validation evidence](docs/validation/first-slice.md). The five implementation tickets are tracked under [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3); broader Library organization remains planned.

[GitHub repository](https://github.com/Omriy123/youtube-backlog-tracker) · [Issues](https://github.com/Omriy123/youtube-backlog-tracker/issues) · [Remaining product roadmap, issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9)

## Design

- [Wayfinder map: recorded answers and remaining planning questions](https://github.com/Omriy123/youtube-backlog-tracker/issues/10)
- [Product specification](docs/specs/video-backlog.md)
- [Feature-design areas and first usable slice](docs/design/feature-map.md)
- [Approved first-slice spec and delivery tickets](docs/specs/first-end-to-end-slice.md)
- [Domain glossary](GLOSSARY.md)
- [Accepted layout and prototype feedback](docs/design/library-layout.md)
- [Prototype source and preview instructions](docs/prototypes/library-layout.md)
- [Architecture decisions](docs/adr/)
- [Research](docs/research/)

## Development workflow

Work locally, track tasks in GitHub Issues, and review implementation through pull requests. Durable specifications and decisions live alongside the code; `.scratch/` is for temporary local work and is ignored by Git.

Read [the workflow](docs/workflow.md) and [agent instructions](AGENTS.md) before starting a task. The runnable build is `extension/`. Run `npm ci`, `npx playwright install chromium`, then `npm test`. `npm run build` prepares a standalone unpacked trial folder; `npm run validate:chrome` runs the combined walkthrough in installed desktop Chrome using an isolated profile. See [installation and validation](docs/installation.md) for setup, supported URLs and evidence limits.
