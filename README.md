# YouTube Backlog Tracker

A personal desktop browser extension for collecting video links, sorting them into watch lists, and deciding what to watch next. YouTube is the primary provider; Twitch VODs and generic video links are also in scope.

The overarching product design and first save/find/open/recover slice are approved. The first slice has five implementation tickets under [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3), starting with [save/find, issue #41](https://github.com/Omriy123/youtube-backlog-tracker/issues/41). The unpacked Chrome save/find test build is now available; [install it and run its checks](docs/installation.md).

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

Read [the workflow](docs/workflow.md) and [agent instructions](AGENTS.md) before starting a task. The runnable build is `extension/`. Run `npm ci`, `npx playwright install chromium`, then `npm test`; see [installation and validation](docs/installation.md) for workflow, permissions and evidence limits.
