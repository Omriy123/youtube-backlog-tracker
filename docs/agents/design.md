# Design discussions and UI work

## Resume a design discussion

Read the relevant approved decisions and unresolved issue first; [the workflow](../workflow.md) describes the design-to-delivery sequence. Begin with a short recap of the user workflow, settled choices, and the decision still needed. Explain unfamiliar terms through a concrete action and result before asking detailed questions. Carry settled answers forward and keep questions at the level of the current discussion: overarching design, feature behavior, or implementation.

## UI preferences

Before changing an interaction, read the relevant feature's accepted feedback and [layout reference](../design/library-layout.md). Use accepted prototype interactions as references; production behavior follows the approved decisions rather than incidental mock logic.

The owner is colorblind. Make status understandable through text, symbols, or borders independently of color, and use visible examples when choosing a palette. Keep controls and rows stable during selection or scope changes, provide comfortable row/label click targets, and keep routine UI instructions brief.

Treat presentation opinions as defaults that can be adapted by extension users. Favor settings for colors, themes, density, and other subjective presentation choices rather than fixing every user's experience to the owner's taste. Identify the relevant setting when proposing such a choice; an agreed deferral belongs in a tracked follow-up under the [issue-tracker guidance](issue-tracker.md#follow-ups). This preference guides feature planning; it does not add an entire settings system to every UI ticket.
