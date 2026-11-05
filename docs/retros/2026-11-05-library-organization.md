# Library organization session retrospective

Scope: the current implementation, human testing, provider-indicator prototyping and tracker-reconciliation conversation. This report records process findings; current task state belongs in GitHub.

## Highest impact: behavior checks were mistaken for UI acceptance

The implementation passed 40 boundary tests and 111 installed-Chrome workflows, plus build and restart checks. The owner nevertheless found list hierarchy, densities, selection controls and Library presentation inconsistent with the accepted refined-A prototype. The source had been available in the [layout handoff](../design/library-layout.md). Spec/standards reviews caught important ordering/date defects but did not establish rendered prototype fidelity.

Change: make rendered comparison a separate readiness requirement. Give reviewers the accepted reference and actual changed views. Compare hierarchy, density, information placement and interaction affordances, rather than checking only that a control exists. Keep real capture and synthetic enriched fixtures distinct. Representative data should appear early: a majority-YouTube 20-row prototype exposed color-density effects that three mixed-provider examples hid.

Repository guidance now lives in [design discussions and UI work](../agents/design.md#rendered-review-and-readiness), reached from AGENTS.md and the review standards pointer. These rules improve evaluation; they do not prove the outstanding UI defects fixed.

## High impact: feedback recording and execution routing happened too late

The 35 observations and provider decisions initially remained in local notes. The owner had to ask whether they were in the map, whether selection work contained everything, and whether current-PR bugs would be fixed first. A full intake alone did not supply an executable repair ticket. The assistant recommended the next planning question when the owner needed the next development task.

Change: preserve every observation, classify reported versus confirmed defects and new decisions, and route each one with a current-PR/next-scope disposition. Produce a bounded current-PR repair checklist before proposing another feature interview. Distinguish local draft, published record, agreed design, implemented behavior and merge readiness in every handoff.

The [feedback intake](https://github.com/Omriy123/youtube-backlog-tracker/issues/58) and [confirmed repair task](https://github.com/Omriy123/youtube-backlog-tracker/issues/63) now exist. The latter is the owner's chosen wayfinder prerequisite, with explicit execution permission and native blockers. The generic lesson is to verify the actual picker and handoff after routing, rather than assume that a body link makes a task selectable. This owner's explicit gate should not become a universal rule blocking unrelated work.

The repeatable process is in [human-test feedback](../agents/issue-tracker.md#human-test-feedback). A recent separate guidance commit also added follow-up tracking, source-retirement and human-test packaging rules; those were retained rather than duplicated.

## High impact: existing checks have no automatic enforcement

At inspection, package.json defines boundary, browser, combined test and build commands. The lockfile pins Playwright. There is no tracked CI workflow, configured hooks path or active local Git hook; the hook directory contains samples only. There is also no configured lint/typecheck command. The finding is absent enforcement of existing checks, not a need to invent another parallel test runner or an arbitrary style policy.

Recommended follow-up: [Run existing extension checks automatically in pull-request CI](https://github.com/Omriy123/youtube-backlog-tracker/issues/64). Run npm ci, install bundled Playwright Chromium/dependencies, run npm test and npm run build, and retain browser failure artifacts. A successful hosted run must precede a claim that CI is operational. Automated behavior checks still cannot certify prototype fidelity or comfort. The proposal has a native dependency on the owner's current repair task.

## Medium impact: picker handoffs can contradict prerequisite execution

The installed list-wayfinder handoff ends with planning-only language. The owner later required a repair task in the map; its Notes explicitly authorize that bounded prerequisite execution. A generic copied handoff would prohibit the very work selected. The local prepared prompt was corrected, but that is not a reusable global-skill fix.

Recommended existing-skill change: generate handoffs from the ticket type and live Notes. Planning questions stay planning-only; an explicitly authorized prerequisite task gets only its bounded execution permission. A small contract check should cover both cases and blocked/assigned tickets. This repo's tracker guidance now records that requirement; the global skill itself was not changed by this retrospective.

## Lower impact: tool calls and stale navigation added avoidable friction

The session repeatedly used Windows wildcard paths with rg, incompatible gh flags, fragile nested jq quoting, and broad file dumps that truncated. Structured gh API payloads and parsed JSON worked better. Prefer bounded metadata, native graph queries, batched independent reads and exact follow-up sections. Log command results once rather than rerun a complete browser suite for unchanged code.

The workflow's old Current stage section still described superseded first-slice tickets. It was replaced with live tracker pointers. AGENTS.md remains a short router; detailed steps live behind its existing design and tracker pointers.

## Skill choices

Use the existing prototype skill for unresolved visual/interaction choices, receiving-code-review or bug diagnosis for evaluation/reproduction, tdd for confirmed repair implementations, and code-review plus rendered evidence for readiness. Verification-before-completion applies to the exact conclusion supported by the evidence.

A new global feedback-triage skill is optional if this workflow recurs across repositories. Its output would be a complete observation inventory, bounded PR repairs, linked open decisions, verified tracker routing and a next-work handoff. It should reuse tracker/UI guidance rather than duplicate it. A second universal planning/router skill would add more selection burden before improving this repo's concrete failure points.

No global skill, product behavior, test result, CI enforcement or PR readiness changed merely because this retrospective was written.
