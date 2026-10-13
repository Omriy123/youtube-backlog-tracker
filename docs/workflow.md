# Development workflow

## Where information lives

| Information | Authoritative location |
| --- | --- |
| Code, tests, and durable design docs | This Git repository |
| Scope, acceptance criteria, dependencies, and task discussion | GitHub Issues |
| Implementation changes and validation | Pull requests |
| Domain terms | Root `GLOSSARY.md` |
| Lasting architecture decisions | `docs/adr/` |
| Temporary experiments, imports, and working notes | Ignored `.scratch/` |

Issues link to the relevant spec instead of maintaining a second copy. Local issue files from the initial design interview are historical artifacts, not an active second tracker. Preserve prototype source on its archive branch and record accepted decisions in the main branch's docs.

## From design to implementation

1. Resolve behavior that materially changes the feature and update the spec. Record remaining assumptions explicitly.
2. Create a focused issue with scope, acceptance criteria, relevant design links, and validation expectations. Use the existing [triage roles](agents/triage-labels.md).
3. Implement the issue on a short-lived branch. Use a separate checkout when concurrent work needs isolation.
4. Run checks appropriate to the change and open a PR linked to the issue. Describe the final behavior and actual validation results.
5. Review the change and try the affected behavior. Resolve feedback, merge according to the user's instructions, and close the issue when its criteria are satisfied.

GitHub's open/closed state records whether an issue remains actionable. Triage labels describe readiness or ownership needs; they are not substitutes for completion. Start with Issues and PRs; a project board can be introduced when it helps.

## Current stage

The Library prototype has been selected and its feedback incorporated. Continue resolving the product spec's open decisions before preparing the implementation plan. Prototype completion does not authorize shipping its throwaway code as the extension.

The completed prototype is recorded in [issue #1](https://github.com/Omriy123/youtube-backlog-tracker/issues/1). Continue the design interview through [issue #2](https://github.com/Omriy123/youtube-backlog-tracker/issues/2).

The initial repository setup is a baseline commit. Subsequent implementation follows the issue/branch/PR cycle above.
