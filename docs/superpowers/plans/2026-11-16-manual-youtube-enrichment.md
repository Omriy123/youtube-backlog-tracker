# Manual YouTube enrichment implementation plan

> **For agentic workers:** Execute the approved ticket graph with implement-spec, isolated implementer worktrees, TDD at the already approved boundaries, merger agents, and a whole-branch code-review.

**Goal:** Deliver the approved manual enrichment spec on `implement/manual-youtube-enrichment`.

**Architecture:** Extend the existing public Library command boundary and browser adapter. Keep provider requests outside serialized Library writes; re-read state when committing observations so concurrent organization and recovery survive. Persist credentials separately from Library information and store image bytes locally.

**Tech stack:** JavaScript ES modules, Manifest V3, Chrome local storage, Node 24, Playwright.

**Spec:** `docs/specs/manual-youtube-enrichment.md`, with `docs/specs/provider-enrichment.md` for semantics. GitHub #65–#67 hold delivery status and acceptance criteria.

## Global constraints

- Personal → Original → Latest → URL display precedence; preserve capture provenance.
- No automatic provider/image requests on setup, save, browse, open, restart or quota recovery.
- Keep every accepted changed/unchanged check and image version; no silent pruning.
- Preserve user placement, Manual order, dates, titles, review and watch events.
- Credentials stay outside Library diagnostics and shared evidence.
- Existing installed-browser and injected public-command boundaries are the approved test seams.
- The real-use review clock starts on actual owner use, not completion or fixtures.

## Review focus

- Disconnect/replacement during pending requests rejects old-key results.
- Failed or lost write acknowledgement preserves coherent prior information and accurate results.
- Undo after retrieval reverses user state without rewinding automatic metadata.
- Missing fields in a successful response become missing current fields.
- Restart/cancellation/image-only retry never duplicates successful text observations or resumes silently.

## Task 1: Connect and enrich one saved video (#65)

**Files:** existing Library/browser/title/metadata modules, a focused enrichment service and UI, manifest permissions, boundary/browser tests and ticket-specific plan.

**Interfaces:** Public Library commands for settings, credential replacement/removal, explicit bounded connection test, one-video retrieval and metadata details. Browser adapter supplies credential and provider/image acquisition boundaries; final signatures belong in the ticket plan.

- [ ] Confirm integration baseline; write failing public-workflow tests for setup, acquisition, provenance/images, recovery and the first three review risks.
- [ ] Implement the workflow in red/green slices, including coherent persistence, stale-response rejection, initial presentation and explicit retry.
- [ ] Verify boundary/browser behavior; record actual provider authorization limits. Commit and merge the integration tip before handoff.
- [ ] Merge with a merger agent; open a draft integration PR linking all three tickets.

## Task 2: Browse and search retained metadata (#66, depends on #65)

**Files:** metadata/title and browse consumers, focused details UI, public boundary and installed-browser tests.

**Interfaces:** Consume retained observations/current metadata from #65; preserve the existing list/channel/search and selection interfaces.

- [ ] Write failing tests for absent current fields, independent version scopes, historical descriptions and dated version navigation.
- [ ] Implement current-value consumers and complete Original/Latest/History inspection in red/green slices.
- [ ] Validate both densities, narrow/desktop layouts, offline persistence and representative 1,000-active/3,000-total distributions. Commit and reconcile integration tip.

## Task 3: List/Library retrieval and durable results (#67, depends on #65)

**Files:** focused operation service/UI, existing command integration and public boundary/browser tests.

**Interfaces:** Reuse #65 acquisition/commit operations; public commands snapshot list or entire-Library targets and expose progress, cancellation and retry.

- [ ] Write failing tests for frozen/deduplicated targets, cancellation, restart, quota, concurrent moves, repeated activation and image-only retry.
- [ ] Implement durable outcomes and explicit retry in red/green slices. Keep ordinary Library commands responsive during provider work.
- [ ] Validate retained and unsupported records, desktop/narrow results and representative scale. Commit and reconcile integration tip.

## Task 4: Integration, review and human-test handoff

**Files:** validation report, concise enrichment guide, portable build references.

- [ ] Merge each workflow with merger agents. Run fresh complete boundary/browser checks and installed Chrome checks.
- [ ] Run parallel Standards and Spec review against `origin/main`; fix substantive findings with one implementer agent and reverify affected behavior.
- [ ] Package the exact tested extension. Record source revision, manifest version, rendered evidence and honest live-provider/manual-device limits.
- [ ] Update PR/ticket handoffs and #35 without inventing a first-use date. Mark ready only when repository readiness criteria are met.
- [ ] Remove completed implementer worktrees after verifying commits are retained on integration.
