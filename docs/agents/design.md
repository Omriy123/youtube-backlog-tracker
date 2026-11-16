# Design discussions and UI work

## Resume a design discussion

Read the relevant approved decisions and unresolved issue first; [the workflow](../workflow.md) describes the design-to-delivery sequence. Begin with a short recap of the user workflow, settled choices, and the decision still needed. Explain unfamiliar terms through a concrete action and result before asking detailed questions. Carry settled answers forward and keep questions at the level of the current discussion: overarching design, feature behavior, or implementation.

## UI preferences

Before changing an interaction, read the relevant feature's accepted feedback and [layout reference](../design/library-layout.md). Use accepted prototype interactions as references; production behavior follows the approved decisions rather than incidental mock logic.

The owner is colorblind. Make status understandable through text, symbols, or borders independently of color, and use visible examples when choosing a palette. Keep controls and rows stable during selection or scope changes, provide comfortable row/label click targets, and keep routine UI instructions brief.

Treat presentation opinions as defaults that can be adapted by extension users. Favor settings for colors, themes, density, and other subjective presentation choices rather than fixing every user's experience to the owner's taste. Identify the relevant setting when proposing such a choice; an agreed deferral belongs in a tracked follow-up under the [issue-tracker guidance](issue-tracker.md#follow-ups). This preference guides feature planning; it does not add an entire settings system to every UI ticket.

## Rendered review and readiness

Identify the approved spec, relevant prototype handoff and later explicit corrections before implementation. Follow the pointers to the actual reference; a prose summary alone can omit the interaction being implemented. List the affected reference behaviors in the plan or issue: navigation hierarchy, density/grouping, control placement, selection and keyboard/drag affordances. Treat a genuine change to agreed behavior as a decision. Theme deferral does not defer the accepted layout.

Alongside behavior tests, inspect the actual extension using a scenario comparable to the reference. Capture desktop and narrow views of each changed density and the relevant selected/dialog/empty state. Compare hierarchy, information density, layout stability and action reachability; exact pixel matching is not required. Give the reviewer the reference pointers and rendered evidence or runnable preview. A screenshot without comparison does not establish fidelity.

Use a representative distribution for the design question. A provider-color comparison needs consecutive same-provider videos and the expected provider majority, not just one differently colored example per service. Include long titles and honest missing values. Label fictional metadata and thumbnail placeholders. Check normal capture separately from enriched synthetic fixtures; fixture-supported channel browsing does not establish provider acquisition.

Before marking ready, account for each affected reference behavior with public-workflow evidence and a rendered comparison, or an explicitly accepted limitation/deferment. Native pointer tests with visible endpoints do not establish offscreen dragging, scrolling while dragging or physical-device comfort. Describe available features and missing acquisition beside the [human-test handoff](../development.md#handoff-for-human-testing).

When human testing exposes current-scope defects, follow the [feedback workflow](issue-tracker.md#human-test-feedback) and keep the PR draft until its agreed repair criteria are met. Closing a narrow repair ticket does not certify all feedback or the entire PR complete.
