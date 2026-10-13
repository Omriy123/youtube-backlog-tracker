# YouTube Backlog Tracker

A personal desktop browser extension for collecting video links, sorting them into watch lists, and deciding what to watch next. YouTube is the primary provider; Twitch VODs and generic video links are also in scope.

The product is in design. The Library layout prototype is complete; production implementation has not started.

## Design

- [Product specification](docs/specs/video-backlog.md)
- [Domain glossary](GLOSSARY.md)
- [Accepted layout and prototype feedback](docs/design/library-layout.md)
- [Prototype source and preview instructions](docs/prototypes/library-layout.md)
- [Architecture decisions](docs/adr/)
- [Research](docs/research/)

## Development workflow

Work locally, track tasks in GitHub Issues, and review implementation through pull requests. Durable specifications and decisions live alongside the code; `.scratch/` is for temporary local work and is ignored by Git.

Read [the workflow](docs/workflow.md) and [agent instructions](AGENTS.md) before starting a task. There is no production build or test command yet; tooling will be chosen during implementation planning.
