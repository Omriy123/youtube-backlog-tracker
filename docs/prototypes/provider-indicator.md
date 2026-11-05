# Provider indicator prototype

The owner selected G during human testing on 2026-11-05: provider edge and metadata source for Thumbnails; edge plus tinted touching rows for Compact. YouTube uses vivid red, Twitch violet and generic websites grey. Full provider color pickers and independent per-density edge/fill alternatives are required in production settings. See the [decision](../design/provider-indicator.md) and [accepted issue resolution](https://github.com/Omriy123/youtube-backlog-tracker/issues/59#issuecomment-6658679549).

## Immutable source

- [Archive branch](https://github.com/Omriy123/youtube-backlog-tracker/tree/prototype/provider-indicator-feedback), separate from production; no prototype PR or merge.
- [Pinned four-file source](https://github.com/Omriy123/youtube-backlog-tracker/tree/4b8c758de3fbfb0788cb5b7ec4758d5e99061494/.scratch/video-backlog/prototypes/provider-mark).
- [Interactive HTML](https://github.com/Omriy123/youtube-backlog-tracker/blob/4b8c758de3fbfb0788cb5b7ec4758d5e99061494/.scratch/video-backlog/prototypes/provider-mark/index.html) and [README](https://github.com/Omriy123/youtube-backlog-tracker/blob/4b8c758de3fbfb0788cb5b7ec4758d5e99061494/.scratch/video-backlog/prototypes/provider-mark/README.md).
- [Preferred Thumbnails screenshot](https://github.com/Omriy123/youtube-backlog-tracker/blob/4b8c758de3fbfb0788cb5b7ec4758d5e99061494/.scratch/video-backlog/prototypes/provider-mark/preferred-thumbnails.png) and [preferred Compact screenshot](https://github.com/Omriy123/youtube-backlog-tracker/blob/4b8c758de3fbfb0788cb5b7ec4758d5e99061494/.scratch/video-backlog/prototypes/provider-mark/preferred-compact.png).

Only these four named assets were added by the archive commit. Browser profiles, real Library data, credentials, local issue drafts and execution helpers are excluded.

## Run and evidence limits

Download the HTML and open it directly in Chrome. Use the bottom arrows or Left/Right to select G, switch Thumbnails/Compact, and compare other styles. The disclosure contains native provider color pickers with reset; choices survive in the URL, not extension storage.

There are exactly 20 fictional videos: 15 YouTube, three Twitch and two websites. The preview was rendered in installed desktop Chrome, with a 6px edge, density-specific fill, correct source colors, color URL round-trip/reset and no root overflow at 640x900. Screenshots were visually inspected. Synthetic thumbnail blocks do not establish real image acquisition. The archive demonstrates presentation, not complete production settings, persistent preferences, provider requests, physical-device ergonomics or contrast compliance for arbitrary custom colors.

Remaining Library concerns are preserved in [Track human-tested Library organization feedback and prototype mismatches](https://github.com/Omriy123/youtube-backlog-tracker/issues/58); accepting this prototype does not resolve all of them.
