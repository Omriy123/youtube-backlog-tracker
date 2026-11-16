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
3. Interview unresolved behavior in the areas needed for a usable delivery slice, then follow [spec publication and ticket approval](#spec-publication-and-ticket-approval). Bring real import examples into the discussion beside capture. Use research for technical facts; the layout prototype is not an authority for domain logic. Continue remaining interviews as later slices need them.
4. After explicit ticketing authorization, use `to-tickets` to propose vertical workflows and obtain approval of their breakdown before publishing implementation issues with genuine dependencies and the existing [triage roles](agents/triage-labels.md). A slice can cross several design areas.
5. Prepare the implementation plan for the approved slice, then implement it on a short-lived branch. Use a separate checkout when concurrent work needs isolation. Overall-design approval alone does not authorize unspecified feature behavior; completing every area before starting the first slice is not required.
6. Deliver a real end-to-end workflow early: save a real video, find the persisted record, open it in a browser tab, and recover the change. Run browser checks and let the user test it before completing all technical layers or features. Include checks appropriate to the change and open a PR linked to the issue; describe actual validation results.
7. Refine provisional rules, storage/interfaces, and subsequent slices from those checks and user feedback. Resolve review feedback, merge according to the user's instructions, and close the issue when its criteria are satisfied.

GitHub's open/closed state records whether an issue remains actionable. Triage labels describe readiness or ownership needs; they are not substitutes for completion. Start with Issues and PRs; a project board can be introduced when it helps.

## Spec publication and ticket approval

Apply this sequence whenever implementation work requires a new spec or a material change to an existing one, whether or not the user names a skill. It also applies when resuming the handoff in another session.

1. **Formalize automatically.** Read and use `to-spec` to synthesize the settled conversation and approved source decisions into the durable spec. Use the existing approved testing boundary where applicable; identify genuinely new testing decisions explicitly. Find skills under the user's Codex skills directory (`~/.codex/skills/<skill-name>/SKILL.md`); if a required skill is unavailable, report that rather than claiming to have used it. Follow the repo's spec location and tracker rules.
2. **Publish and update wayfinder automatically.** Publish the reviewable spec revision and link it from its source planning issue. Read and use `wayfinder` to update the relevant map and roadmap pointers in the same handoff. Pending work belongs in the issue and a concise Notes pointer; Decisions so far indexes only closed decisions. Preserve the map's completion criteria, planning/delivery separation, labels, native relationships and existing ownership. An absent map does not require inventing a new map for a small standalone task; state that no relevant map exists. Verify published changes through fresh reads before reporting success.
3. **Stop for the owner's decision.** Present the spec link and map status, then ask for complete-spec approval and explicit authorization to proceed with `to-tickets`. These are separate decisions, even when requested in one message. Approval of the spec alone permits recording that approval, not drafting or creating implementation tickets. The owner may revise scope, pause here or continue ticketing in another session. Earlier explicit authorization for the same approved revision remains valid; do not ask twice.
4. **Leave a durable handoff.** Record the exact spec revision/link, whether full-spec approval is pending or received, whether ticketing is authorized, and the next action in the source issue. Carry approved amendments and remaining scope forward. Keep a checkpoint open when its criteria also require agreed workflow tickets. On resume, read this handoff and subsequent owner amendments before proceeding; material spec changes return to the publication/approval step for the changed scope.
5. **Ticket only when authorized.** Read and use `to-tickets`, present the numbered vertical workflow breakdown and real blocking edges, and wait for approval of that breakdown before publishing tickets. Permission to start ticketing is not approval of an unseen breakdown. After approved publication, update the relevant pointers and verify native relationships. Resolve the source planning ticket and update Decisions so far only when its actual completion criteria are met.

The owner-directed approval boundary above governs generic skill instructions that would otherwise mark a planning spec ready or proceed directly to ticket creation. Wayfinder issues retain wayfinder-only labels; ready-for-agent applies to agreed delivery tickets. Tracking an agreed deferral in an existing roadmap or planning issue remains allowed before ticketing authorization; it must not create an unapproved delivery breakdown.

## Live delivery status

Use the live GitHub tracker as the authority for current work. Read the [remaining-scope roadmap](https://github.com/Omriy123/youtube-backlog-tracker/issues/9), [wayfinder map](https://github.com/Omriy123/youtube-backlog-tracker/issues/10), native relationships and current PR for the active milestone, ownership and next task. This workflow describes the process rather than caching an issue sequence that can be superseded. Closed superseded tickets do not establish implementation completion.

Use [human-test feedback reconciliation](agents/issue-tracker.md#human-test-feedback) after a trial and [rendered review and readiness](agents/design.md#rendered-review-and-readiness) for UI delivery. The [feature map](design/feature-map.md) and versioned specifications preserve design provenance; GitHub holds current actionable work.

## Historical background

This section preserves the original delivery context, not the current task sequence. Use [Live delivery status](#live-delivery-status) above to find current work.

The initial layout prototype is recorded in [issue #1](https://github.com/Omriy123/youtube-backlog-tracker/issues/1), and the overarching design was approved on 2026-10-14 in [issue #2](https://github.com/Omriy123/youtube-backlog-tracker/issues/2). The [feature-design map](design/feature-map.md) organized the early shared contracts, metadata rules and capture/import interviews around a usable save/find/open/recover slice. Prototype approval did not authorize shipping throwaway code or inferring domain logic from it.

The [first-slice spec](specs/first-end-to-end-slice.md) was approved through [issue #3](https://github.com/Omriy123/youtube-backlog-tracker/issues/3). Its draft used grill-with-docs and builder review; to-spec formalized the approved content, and to-tickets published the original child issues #4–#8. That sequence began with save/find and extended to open/recover, with UI and validation included in the relevant workflow tickets. These original tickets are historical references; their closure or supersession alone does not establish delivery.

The remaining-scope roadmap was introduced to review the real build and human feedback, choose subsequent bounded slices, resolve focused questions and agree their specs and implementation tickets. The [later-area handoffs](design/feature-map.md#basis-for-subsequent-feature-specs) preserve context without requiring every feature area to be finalized before the first working slice. The initial repository setup was a baseline commit; subsequent implementation followed the issue/branch/PR cycle described above.
