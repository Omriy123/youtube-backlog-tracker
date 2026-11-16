# Manual YouTube enrichment: first metadata delivery slice

Status: **to-spec formalization published; complete-spec approval and workflow-ticket agreement pending**. On 2026-11-16 the owner selected real YouTube metadata, then approved the proposed manual-first boundary with “ok sure”. The owner subsequently invoked to-spec to synthesize and publish the discussion. This document records that boundary and marked builder defaults; publication does not approve unreviewed elaborations, workflow tickets or production implementation.

Decision owner: [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32). Delivery coverage stays in [Track remaining product scope after the first usable slice](https://github.com/Omriy123/youtube-backlog-tracker/issues/9). The organization PR merged on 2026-11-16; its historical repair-branch instructions do not apply to this work.

## Problem Statement

The working Library saves and organizes videos, but ordinary capture does not acquire real YouTube channels, publication dates, durations or thumbnails. This limits recognition, channel browsing and meaningful date sorting. The owner selected real metadata as the next useful capability after testing organization.

## Solution

Configure a personal API key, deliberately retrieve information for a video, a list or the entire Library, then use real thumbnails, channels, dates, durations and searchable descriptions in existing browsing. Preserve every acquired version and its source/time from the first retrieval. Saving, organizing and opening continue to work without enrichment. The owner approved manual-first delivery while automatic refresh, clearing, backup integration and provider-color settings remain later scope.

## User Stories

1. As a Library user, I want to save and organize links without an API key, so that optional enrichment never blocks my collection.
2. As a Library user, I want instructions for configuring my own YouTube API key, so that I can enable real metadata without a bundled service credential.
3. As a Library user, I want to test my setup explicitly, so that I can distinguish a usable connection from rejected setup, quota and network failures.
4. As a Library user, I want setup to leave existing records untouched until I request retrieval, so that I control when metadata work begins.
5. As a Library user, I want to replace or remove my key without losing retained information, so that disconnecting does not damage my Library.
6. As a Library user, I want my credential excluded from diagnostics and shared artifacts, so that reviewing or reporting a problem does not expose it.
7. As a Library user, I want to pull metadata for one saved video, so that I can enrich a specific record.
8. As a Library user, I want to pull metadata for a list's current members, so that I can prepare that list for browsing.
9. As a Library user, I want to pull metadata across the entire Library including retained watched and dismissed records, so that older records remain recognizable.
10. As a Library user, I want unsupported links reported as skipped, so that fallback-only records are not presented as broken YouTube requests.
11. As a Library user, I want retrieval targets fixed when I invoke the action, so that later moves do not silently change its affected set.
12. As a Library user, I want progress and per-video outcomes, so that I can tell what completed and what still needs attention.
13. As a Library user, I want to cancel further retrieval while retaining completed results, so that stopping a batch does not discard useful information.
14. As a Library user, I want to retry unsuccessful or unattempted work explicitly, so that recovery does not unnecessarily repeat successes.
15. As a Library user, I want interrupted work explained after restart, so that I can choose whether to retry without silent requests.
16. As a Library user, I want quota and network failures to preserve existing metadata, so that a failed check does not erase the last known information.
17. As a Library user, I want real retained thumbnail images, so that saved videos remain visually recognizable offline or after source changes.
18. As a Library user, I want image acquisition failures distinguished from text retrieval, so that partial success does not imply complete image coverage.
19. As a Library user, I want real channel names and identities in channel browsing, so that I can find saved videos from the same creator.
20. As a Library user, I want real publication dates and durations in existing sorts and totals, so that those controls can use actual provider information.
21. As a Library user, I want missing values shown honestly, so that unknown duration or date is not mistaken for zero or a fabricated fact.
22. As a Library user, I want my Personal title to remain first in display precedence, so that retrieval cannot overwrite my authored name.
23. As a Library user, I want the first usable recorded automatic title preserved as Original, so that later retrieval does not rewrite what I originally saved.
24. As a Library user, I want a differing latest YouTube title identified separately, so that I can recognize both the saved and newly observed title.
25. As a Library user, I want Original, Latest and History inspection for metadata and images, so that I can inspect changes with their actual source and time.
26. As a Library user, I want every accepted changed and unchanged check retained, so that repeated retrieval remains factual evidence rather than silently rewritten history.
27. As a Library user, I want titles and descriptions from all retained versions searched by default, so that an earlier name or phrase still finds my video.
28. As a Library user, I want independent Personal, Original, Intermediate and Latest search checkboxes, so that I can choose which versions contribute matches.
29. As a Library user, I want a dated historical-match excerpt leading to its source version, so that I understand why a normally titled row matched.
30. As a Library user, I want all title-version scopes off to mean clearly explained URL-only search, so that search restrictions remain understandable.
31. As a Library user, I want check outcomes distinguished from playback or deletion claims, so that a missing resource or failed request is not a false availability verdict.
32. As a Library user, I want metadata work to preserve placement, saved Manual order, selection, user dates and watch events, so that enrichment does not reorganize my Library.
33. As a Library user, I want existing review gates to remain effective for opening, edits and status actions, so that metadata inspection never acts as implicit review confirmation.
34. As a Library user, I want metadata and images retained across reopening, restart and offline use, so that enrichment becomes durable Library information.
35. As a Library user, I want failed writes and late responses to preserve prior coherent information, so that retries and races do not corrupt metadata or duplicate records.
36. As a Library user, I want Undo of a user action to preserve later automatic observations, so that recovering organization does not rewind metadata.
37. As a Library user, I want storage usage and actionable capacity errors without silent pruning, so that I understand retained-image/history growth.
38. As a Library user, I want usable keyboard, narrow-screen and both-density metadata controls, so that enrichment fits the accepted Library layout.
39. As the owner trialing the build, I want a review after four weeks of actual enrichment use, so that retention, request usage and storage choices can be assessed with real evidence.

## Implementation Decisions

### Source precedence and delivery boundary

The [approved enrichment contract](provider-enrichment.md) governs semantics, retention, source attribution, title precedence, retrieval outcomes and recovery. This slice changes delivery timing only. In particular, automatic enrichment after setup, new-save retrieval and weekly refresh are explicitly postponed by the owner's manual-first decision. No automatic provider or image requests are started by setup, saving, opening, searching, reopening or restart. A deliberate metadata retrieval includes its thumbnail acquisition.

Carry forward [organization and browsing](library-organization.md), [the accepted layout](../design/library-layout.md), [the provider prototype source and evidence limits](../prototypes/provider-availability.md), the [glossary](../../GLOSSARY.md), and existing opening/review/recovery contracts. Later accepted gesture amendments remain intact. This document bounds delivery; it does not retire the broader approved enrichment contract.

### Connect and disconnect

- Provide optional YouTube setup with instructions for creating/enabling a personal project/key, a credential field, Test connection and removal/replacement. No bundled credential, Google-login requirement, relay or paid scraper.
- Test connection is an explicit bounded request, not a Library scan. Distinguish rejected setup, quota, network and valid no-resource outcomes. Show that enrichment is manual in this build; do not expose a nonfunctional automatic switch.
- Key removal/replacement prevents further use of the old credential, stops further old-key requests and rejects its late responses. Keep previously stored metadata and Library state. Never put credentials in logs, exports, issue evidence or screenshots.
- Setup does not silently fetch existing records. No key is required to save, browse, edit or open supported links.

### Retrieve and report

- Provide Pull metadata for one saved video, the selected list's current members, and the entire Library including retained watched/dismissed records. A quiet manual retrieval control for retained records is included; this does not require a new unified user-action History screen.
- Snapshot and deduplicate target identities at invocation. Process supported YouTube identities, report Twitch/generic records as skipped, and preserve identity, placement, saved Manual arrangement and factual user dates.
- Fetch title, channel identity/name, description, duration, publication time, thumbnail references and actual thumbnail image bytes. A missing response field remains missing; an image fetch failure does not fabricate a stored image.
- Present counts for requested, retrieved, no-result, failed, skipped and not-attempted/cancelled, with per-video explanation and retry of unsuccessful/unattempted work. Report image failures separately from successful text retrieval; “retrieved” must not imply every image was saved.
- Progress, cancellation and completed outcomes are inspectable while the Library remains usable. Cancellation stops further requests and truthfully accounts for in-flight results. Completed coherent observations remain saved. Retry does not replay successful records unnecessarily.
- Respect actual provider allowance, bounded retries and manual request pacing. Quota exhaustion explains paused/unattempted work; it does not launch an automatic later retry in this slice. The user can explicitly retry when capacity is available.
- Builder default: retain a durable operation summary and per-record completion sufficient to show interrupted work after restart and explicitly retry unfinished targets. Restart does not silently issue requests. Concurrent/repeated activation must not create competing duplicate operations or invent completion; exact coordination is a builder choice.

### Browse, inspect and find

- Show real retained thumbnails in Thumbnails density. Populate channel browsing/counts, latest-known publication/duration sorts and duration totals through existing Library controls. Unknown values remain honest and sort last in either direction; a newer successful resource with an absent field makes that current field missing.
- Preserve Personal → Original → Latest → URL title precedence. Original is the first usable automatic value actually recorded for that field, including earlier browser capture; first API retrieval must not rewrite that provenance. Show differing latest YouTube title as secondary information under the original when applicable.
- Use the approved compact metadata evidence/details treatment: not checked, metadata returned, no resource returned, or check failed, with actual source/time and last-success versus latest-attempt distinctions. A missing resource never asserts deleted/private, and enrichment never claims playback verification.
- Original / Latest / History inspection exposes retained field versions, descriptions, actual images or honest missing-image outcomes, and observation times. Keep every accepted changed and unchanged check distinguishable; storage sharing is allowed without discarding observations.
- Search URL, Personal title and all retained automatic titles/descriptions by default. Keep independent Personal / Original / Intermediate / Latest checkboxes, initially on. All off means visibly URL-only search. Historical-only matches show a dated excerpt linked to that version without replacing the normal row title or duplicating results.
- Preserve existing list/Library/channel scope, selection and navigation behavior. Metadata arrival may update a factual channel/date/duration sort; it must not rewrite saved Manual order, move a video or clear selections.
- Preserve accepted row density, control placement and stable scope controls. Metadata presentation is not permission to redesign the entire Library. Provider-color settings, suffix-stripping changes and dark mode are excluded; the accepted provider-indicator contract remains follow-up scope.

### Persistence and recovery obligations from the first retrieval

- Store every accepted selected-field observation and actual acquired thumbnail version with factual source and acquisition/check times. Do not store unused raw payloads or silently prune by age/count. Record image acquisition separately from the metadata response.
- Commit each accepted metadata/archive/current-pointer update coherently. Partial batches may retain completed per-video results. Failed writes preserve prior coherent metadata and the saved record; disclose incomplete images or text and permit explicit retry.
- Retain metadata/images across Library reopening, browser restart and offline use. Newer accepted observations cannot be overwritten by late responses. Duplicate source values may share content while preserving individual observations.
- Metadata retrieval does not create a watch event, resolve pending rediscovery, change an authored title, or mutate user action history as if it were an organization action. Inspection/retrieval can proceed without resolving rediscovery; Open/Dismiss/edit continue through their existing review gates.
- Existing Undo and user-state recovery preserve newer current automatic values and access to later metadata history. They must not restore stale provider fields or erase observations collected after a user action. Migration must preserve existing capture-title history and recovery records.
- Show local retained-metadata/image storage usage and actionable capacity failures. Saving/organization remain usable where their own writes can succeed. No silent eviction or success message before durable completion.
- No automatic scheduling or per-video clear/pause user action is introduced here. Therefore no placeholder clear/pause controls or general forward Redo are added. Disconnect preserves retained values; reversible Clear current enrichment remains approved follow-up work.

## Testing Decisions

Use the installed Chrome extension's public workflows, durable Library state and real authorized YouTube requests. Controlled provider-boundary fixtures supplement real integration for deterministic changes/failures; they do not establish live provider outcomes. Reverify current official API setup, request fields, permissions, quotas and image acquisition facts during implementation planning; this draft makes no fresh API claim or live-lookup claim.

- **Primary boundary and prior agreement:** extend the existing installed-extension save/find/open/recover walkthrough and organization browser workflows. This is the real-browser boundary already approved in the first-slice and enrichment contracts; the to-spec invocation synthesizes that agreement without introducing a new testing interface or another interview.
- **Tested responsibilities:** exercise setup and browser/provider integration, durable retrieval/archive/image persistence, Library browse/search/details and existing review/recovery together through visible actions and observable records/tabs. Good tests assert user outcomes, not helper calls, schema layout, component nesting or a storage engine.
- **Deterministic supplementary checks:** reuse the existing public Library command with injected browser/persistence behavior for failures and races impractical to induce in Chrome, as the capture/title/opening/organization boundary tests already do. Extend that integration boundary for provider/image responses where necessary instead of adding independent helper-only seams across modules. Pair controlled checks with actual authorized provider requests and installed-browser behavior.

1. Connect with a usable key; retrieve real saved YouTube records; browse real channels, dates, durations and images; inspect source/time and descriptions; reopen/restart/offline and find the same durable information. Also verify no-key saving and metadata-independent organizing/opening.
2. Exercise one-video, list and entire-Library targets, including retained records and unsupported links; snapshot scope, cancellation, interrupted restart, explicit retry, repeated activation and concurrent user moves. Inspect accurate per-record outcomes and unchanged identity/placement/dates/watch events.
3. Use changing and unchanged title/description/image fixtures to verify every observation, Original/Latest/history, historical search scopes, missing fields, failed images, stale responses and duplicate content. Personal titles and existing capture observations must survive.
4. Verify rejected/removed/replaced key, quota/network/no-resource cases, text/image/capacity/persistence failures, and retry. Inspect credentials only in their intended storage/use boundary; verify absence from captured diagnostics and artifacts. No automatic requests after setup, save, restart or quota recovery.
5. Enrich before and after recoverable opening/organization changes, then invoke existing recovery. Preserve later automatic observations/current values while reversing only the intended user decision. Include pending-review records without bypassing action gates.
6. Compare rendered desktop and narrow views in both densities with accepted references: long titles, same-provider runs, images and missing images, selected rows, loading/result/error/details states, historical-only matches and expanded channels. Check keyboard access, readable labels independent of color, control reachability and stable layout. Use representative approximately 1,000-active/100-channel and 3,000-total/up-to-550-channel cases from the organization contract; synthetic fixtures do not prove acquisition.
7. At the actual enrichment-enabled human-test handoff, follow `docs/development.md#handoff-for-human-testing`. Attach the real delivery prerequisite to [Review metadata and thumbnail storage after four weeks of real use](https://github.com/Omriy123/youtube-backlog-tracker/issues/35), record actual first-use and +28-day dates, and state that backup growth/round-trip evidence waits for backup delivery. Do not start its clock from this spec or start the separate broader-recovery review automatically.

## Out of Scope

| Capability | Disposition |
| --- | --- |
| Automatic retrieval of new saves/imports; weekly refresh and automatic catch-up | Later delivery; manual-only timing is the explicit amendment for this slice. |
| Clear current enrichment, per-video pauses/resume and recoverable clearing | Later delivery under the existing approved contract. No destructive substitute. |
| Metadata backup inclusion settings, manual-file/Drive integration and restoration | Later delivery. The approved first-setup-on default must still be honored when backup coverage is delivered, with later explicit choices preserved. This build must not claim to back up enriched data. |
| Provider colors and density-specific configurable edges/fills | Later delivery under the already accepted provider-indicator decision. |
| Broader UI/dark mode, selection/direct drops, list merging, forward Redo | Keep existing decision owners; this slice does not resolve or block those independent questions. |
| Other import/capture modes, bulk opening and unified user-action History | Remain with their existing contracts/roadmap. Only metadata's own details/results and retained-record retrieval access are included. |

Twitch/generic enrichment, scraping, similarity detection, playback checks, synchronization and additional browser releases are outside this slice. Existing fallback and shared Chrome-first browser boundaries remain. Production implementation is outside this planning session.

## Further Notes

Framework/storage choices, migration representation, queue coordination, image sharing/compression, least browser permissions, request batching, indexing, test automation and exact settings/control placement are builder choices constrained by these observable behaviors. Inspect existing modules before choosing seams; no large foundation rewrite is prescribed.

After complete-spec approval, propose bounded vertical workflow tickets and genuine native dependencies under the remaining-scope roadmap. Every ticket must expose a usable user workflow and include its applicable validation; do not split into schema/API/UI layers that cannot be tried independently. Obtain agreement on that breakdown before publishing it as ready work. The chosen planning checkpoint closes only after the approved spec and agreed workflow tickets are published and its map/roadmap pointers are verified.
