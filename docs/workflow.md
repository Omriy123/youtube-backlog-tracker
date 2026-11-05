# Development workflow

## Where information lives

| Information | Authoritative location |
| --- | --- |
| Code, tests, and durable design docs | This Git repository |
| Scope, acceptance criteria, dependencies, and task discussion | GitHub Issues |
| Planning decisions, recorded answers, and unresolved decision dependencies | [Wayfinder map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10) and its decision children |
| Implementation changes and validation | Pull requests |
| Domain terms | Root `GLOSSARY.md` |
| Lasting architecture decisions | `docs/adr/` |
| Temporary experiments, imports, and working notes | Ignored `.scratch/` |

Issues link to the relevant spec instead of maintaining a second copy. Local issue files from the initial design interview are historical artifacts, not an active second tracker. Preserve prototype source on its archive branch and record accepted decisions in the main branch's docs.

The [Wayfinder map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10) retrospectively indexes the existing approved answers and charts unresolved planning questions. Read a relevant historical resolution before interviewing; the map's open children and native blockers identify the remaining frontier. It complements the delivery roadmap: closing a planning decision does not mean the feature has shipped. See [Wayfinding operations](agents/issue-tracker.md#wayfinding-operations) when continuing the map.

## From design to implementation

1. Finalize and obtain approval of the overarching design in issue #2. Preserve settled decisions and explicitly defer feature details; do not require every interaction to be specified at this stage.
2. After overarching approval, split the design into feature-design areas and agree on interview order. These areas do not prescribe code modules or implementation milestones. Keep foundation small/provisional and settle the early field-provenance/lifetime and recovery contracts before committing to storage/interfaces.
3. Interview unresolved behavior in the areas needed for a usable delivery slice, write the relevant durable specs/contracts, and obtain approval of those behaviors. Bring real import examples into the discussion beside capture. Use research for technical facts; the layout prototype is not an authority for domain logic. Continue remaining interviews as later slices need them.
4. Create or refine a focused GitHub issue for a testable slice with scope, acceptance criteria, relevant spec links, dependencies, and validation expectations. A slice can cross several design areas. Use the existing [triage roles](agents/triage-labels.md).
5. Prepare the implementation plan for the approved slice, then implement it on a short-lived branch. Use a separate checkout when concurrent work needs isolation. Overall-design approval alone does not authorize unspecified feature behavior; completing every area before starting the first slice is not required.
6. Deliver a real end-to-end workflow early: save a real video, find the persisted record, open it in a browser tab, and recover the change. Run browser checks and let the user test it before completing all technical layers or features. Include checks appropriate to the change and open a PR linked to the issue; describe actual validation results.
7. Refine provisional rules, storage/interfaces, and subsequent slices from those checks and user feedback. Resolve review feedback, merge according to the user's instructions, and close the issue when its criteria are satisfied.

GitHub's open/closed state records whether an issue remains actionable. Triage labels describe readiness or ownership needs; they are not substitutes for completion. Start with Issues and PRs; a project board can be introduced when it helps.

## Live delivery status

Use the live GitHub tracker as the authority for current work. Read the [remaining-scope roadmap](https://github.com/Omriy123/youtube-backlog-tracker/issues/9), [wayfinder map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10), native relationships and current PR for the active milestone, ownership and next task. This workflow describes the process rather than caching an issue sequence that can be superseded. Closed superseded tickets do not establish implementation completion.

Use [human-test feedback reconciliation](agents/issue-tracker.md#human-test-feedback) after a trial and [rendered review and readiness](agents/design.md#rendered-review-and-readiness) for UI delivery. The [feature map](design/feature-map.md) and versioned specifications preserve design provenance; GitHub holds current actionable work.

## Historical background

This section preserves the original delivery context, not the current task sequence. Use [Live delivery status](#live-delivery-status) above to find current work.

The initial layout prototype is recorded in [issue #1](https://github.com/Omriy123/youtube-backlog-tracker/issues/1), and the overarching design was approved on 2026-10-14 in [issue #2](https://github.com/Omriy123/youtube-backlog-tracker/issues/2). The [feature-design map](design/feature-map.md) organized the early shared contracts, metadata rules and capture/import interviews around a usable save/find/open/recover slice. Prototype approval did not authorize shipping throwaway code or inferring domain logic from it.

The [first-slice spec](specs/first-end-to-end-slice.md) was approved through [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3). Its draft used grill-with-docs and builder review; to-spec formalized the approved content, and to-tickets published the original child issues #4–#8. That sequence began with save/find and extended to open/recover, with UI and validation included in the relevant workflow tickets. These original tickets are historical references; their closure or supersession alone does not establish delivery.

The remaining-scope roadmap was introduced to review the real build and human feedback, choose subsequent bounded slices, resolve focused questions and agree their specs and implementation tickets. The [later-area handoffs](design/feature-map.md#basis-for-subsequent-feature-specs) preserve context without requiring every feature area to be finalized before the first working slice. The initial repository setup was a baseline commit; subsequent implementation followed the issue/branch/PR cycle described above.
