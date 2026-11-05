# Provider colors and density-specific presentation

Accepted during human testing on 2026-11-05. [Choose configurable provider indicators for thumbnail and compact views](https://github.com/Omriy123/youtube-backlog-tracker/issues/59#issuecomment-6658679549) records the human resolution. This document records the selected presentation and configuration requirements; it does not claim production implementation or approve a broader Library redesign. Delivery and the complete human-test feedback remain in [Track human-tested Library organization feedback and prototype mismatches](https://github.com/Omriy123/youtube-backlog-tracker/issues/58).

## Default: prototype G

| Density | Default treatment |
| --- | --- |
| Thumbnails | Provider-colored left edge and source label in metadata, with a neutral row background (prototype D's treatment). |
| Compact | Provider-colored left edge plus tinted row background and source label in metadata. Rows touch with a thin separator, without outer card borders, rounded corners or gaps. |

The accepted preview uses a 6px edge and 28% background tint. These are the preview's current values; the user chose G as the default and explicitly required alternatives rather than a fixed color treatment.

## Provider defaults

| Provider | Selected color | Current preview value |
| --- | --- | --- |
| YouTube | Vivid red | `#e62932` |
| Twitch | Violet | `#8236e8` |
| Generic website | Neutral grey | `#737373` |

The user selected vivid red and violet from the comparison, and requested grey for websites. The exact grey was a builder choice shown in the accepted G preview. Provider colors identify the source service, not a creator/channel or selection state.

## Required extension settings

- Provide a full color picker for each provider's color; do not restrict customization to supplied palettes.
- Make edge and row-fill treatments independently configurable for each density. Users can disable Compact fill, remove colored edges, combine both, or use a neutral presentation.
- Keep edge-only (prototype D) and tint-only (prototype F) alternatives available alongside G's default combination. Use descriptive production labels rather than requiring users to know prototype letters.
- A neutral presentation retains readable provider identity in metadata; color must not be the only way to identify the source.
- Save these preferences in extension settings and restore them after reopening. The prototype's URL-only choices are not production persistence.

This is a focused provider-presentation decision. Broader theme choices, selection styling, retained original-title handling and the other human-testing feedback retain their own scope. Presentation preferences must not mutate recorded metadata, Personal titles, placement, selection or recovery history.

## Prototype evidence

The [immutable source and screenshot guide](../prototypes/provider-indicator.md) preserves the throwaway comparison on a separate archive branch. It contains 20 explicitly fictional videos: 15 YouTube, three Twitch and two websites. It has native provider color pickers and a reset action; choices round-trip through the URL without accessing extension data. The source is deliberately kept out of the production branch.

The user approved G with “yes, that's good for now,” then clarified that disabling colors/edges and choosing D/F must be configurable. The density-specific default and provider choices above capture that clarification. The local prototype is interaction evidence, not production settings or provider acquisition.
