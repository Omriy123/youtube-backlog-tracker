# YouTube Backlog Tracker

A personal desktop browser extension for collecting video links, sorting them into watch lists, and deciding what to watch next. YouTube is the primary provider; Twitch VODs and generic video links are also in scope.

The Chrome first-slice test build supports toolbar save, Personal titles, retained-title search, real opening, watched/dismissed rediscovery review and persistent Undo opening. [Install the unpacked trial folder and try save/find/open/Undo](docs/installation.md). For more detail, see the [behavior reference](docs/first-slice-reference.md), [development commands](docs/development.md), and [validation evidence](docs/validation/first-slice.md). The five implementation tickets are tracked under [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3); broader Library organization remains planned.

[GitHub repository](https://github.com/Omriy123/youtube-backlog-tracker) · [Issues](https://github.com/Omriy123/youtube-backlog-tracker/issues) · [Remaining product roadmap, issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9)

## Quick trial

With the supplied trial folder unpacked, open `chrome://extensions` in desktop Chrome, enable **Developer mode**, choose **Load unpacked**, and select the folder's `extension/` directory. Pin the extension, save a video page with **Save to Inbox**, find it through **Open Library**, open it, then choose **Undo opening** in the Library. [The packaged installation guide](docs/installation.md) has the short steps and essential data notices. Installing the supplied build needs no Node, npm, or API key.

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

Read [the workflow](docs/workflow.md) and [agent instructions](AGENTS.md) before starting a task. The runnable build is `extension/`. See [development and validation](docs/development.md) for packaging and checks; the [behavior reference](docs/first-slice-reference.md) covers supported URLs and recovery details.
