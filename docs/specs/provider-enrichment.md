# YouTube enrichment, metadata history, and availability

Status: **approved on 2026-10-19** through the [complete-contract approval](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6264328786). Originating decision: [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31). This is a focused planning contract; it does not select the next delivery slice or authorize production implementation.

Delivery-timing amendment, 2026-11-16: at [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32), the owner selected manual-first real YouTube metadata and approved the [focused slice specification and three-workflow delivery handoff](manual-youtube-enrichment.md#approved-delivery-workflows). Automatic acquisition/weekly refresh, clearing, backup integration and provider-color settings are postponed for this first metadata delivery; their broader approved contracts remain intact. In particular, the automatic-on-after-setup behavior below is later delivery scope, not a requirement to start automatic work in the manual-first slice.

## Problem Statement

The Library must remain useful with saved URLs and Personal titles, while optionally retrieving YouTube details for recognition, channel browsing, date/duration sorting and description search. A creator can rename a video or change its description/thumbnail. Refresh must preserve the information the user saw earlier, including intermediate versions, rather than silently replacing the only recognizable title.

The user wants automatic weekly enrichment within the available API allowance, explicit manual retrieval, historical titles searchable by default, retained thumbnail image copies, and configurable metadata in complete backups. Missing information or a provider failure must not erase or block the user record.

## Solution

Add optional personal, user-configured-key YouTube enrichment for known saved video URLs. Keep every retrieved version of the selected metadata and every check observation with factual source/time. Keep current observations distinct from original information, genuinely authored Personal titles and app-generated user history. Use the selected compact status-pill/details-dialog presentation, with Original / Latest / History inspection and normal search across retained title/description versions.

Twitch and generic links retain URL/available-title fallback, Personal titles, organization and opening. This bounded integration adds no Twitch authorization/payloads, DOM extraction, generic-site enrichment or automatic similarity detector. Their broader approved scope is not removed.

## User Stories

1. As the user, I can save and organize a link without an API key or complete metadata.
2. As the user, I can configure my own YouTube API key through clear setup instructions and a connection check.
3. As the user, I can see setup/network/quota failures without having a video falsely labeled deleted/private.
4. As the user, I can enable automatic enrichment and turn it off while retaining saved information.
5. As the user, I can pull metadata for one video, one list or the entire Library.
6. As the user, I can enrich existing YouTube links after setup with progress and cancellation.
7. As the user, I can save/import a link without waiting for background enrichment to finish.
8. As the user, I can have approximately weekly refreshes paced to the actual API allowance rather than constant checks.
9. As the user, I can retain the title/details originally obtained for a video when the creator later changes them.
10. As the user, I can retain intermediate metadata versions and their observation times.
11. As the user, I can recognize a saved video by its original title while seeing a different latest YouTube title.
12. As the user, I can give a genuinely authored Personal title that takes display precedence and survives refresh.
13. As the user, I can find a video by a title from anywhere in its retained history without enabling an extra option.
14. As the user, I can independently include Personal, Original, Intermediate and Latest information in search using checkboxes.
15. As the user, I can read original, latest and historical descriptions and see their source/time.
16. As the user, I can retain actual thumbnail images when their source URLs later change or stop working.
17. As the user, I can see honest unknown channel/duration/date values rather than fabricated data.
18. As the user, I can inspect check evidence through compact clickable status pills.
19. As the user, I can distinguish a never-checked video, returned metadata, a no-result lookup and a failed request.
20. As the user, I can retry, open or dismiss a record regardless of the metadata check result.
21. As the user, I can retain metadata backups by default after configuring YouTube, while choosing fields/history coverage.
22. As the user, I can recover my user-controlled Library even if a backup omits automatic metadata.
23. As the user, I can restore included metadata history without silently replacing newer current information.
24. As the user, I can remove the API key without losing retrieved information.
25. As the user, I can clear current enrichment, pause automatic retrieval and Undo that change without losing saved videos, authored values or any metadata history.
26. As the user, I can see storage usage and capacity failures without silent pruning.
27. As the owner developing this extension, I have an open review after four weeks of actual enrichment use to reconsider memory/storage, history/images, backup growth and request usage.

## Implementation Decisions

### Carry-forward boundaries

- Preserve one record per underlying upload, one active destination, exact-duplicate placement/date rules, pending rediscovery review, tab-creation watched semantics and recovery safeguards.
- Saving is durable independently of retrieval. A metadata result does not move, dismiss, mark watched, change user placement dates or manufacture a watch event.
- Genuinely authored Personal titles remain distinct from source text, take display precedence and are recovered under the user-state contract. Copying/importing/relabeling automatic data does not establish independent authorship.
- Q54 continues to govern current automatic fields during recovery: do not rewind them to older snapshots. The original/intermediate source archive introduced here is separately retained; retaining that archive is not a current-field rewind.
- Publication time is separate from First saved date and is not labeled as a guaranteed original upload timestamp. Unknown dates sort last; unknown durations are not zero and are disclosed beside totals.
- No metadata or availability result blocks opening, including the approved inclusion of unavailable videos in bulk opening. Playback remains unverified by tab creation or metadata retrieval.

### Explicit retention decision and evidence boundary

The owner explicitly chose retention of all original/intermediate/latest selected-field information and thumbnail images without automatic deletion at a 30-day age. They chose refresh for practical usefulness, later preferring weekly refresh within quota. They also chose user-controlled metadata backup inclusion, on by default after API setup. These later instructions supersede earlier proposed blanket exclusions, original/latest-only storage and age-based deletion in this ticket.

This is the chosen product behavior. It does not change the documented YouTube refresh/deletion conditions, establish provider permission, or establish that an agreement is legally unenforceable. The research remains a source record, including uncertainty over historical-display permission versus stored historical-copy lifetime. Do not describe the selected behavior as a verified provider-policy exemption or promise unrestricted third-party retention rights.

### Setup, automatic controls, and credentials

- Settings has optional YouTube enrichment, instructions for creating/enabling the owner's project/key, a credential field and Test connection. No hidden bundled key, Twitch secret, confidential relay, paid scraper or Google-login authorization is added to this public-data lookup scope.
- Test connection distinguishes usable setup from rejected key/API setup, quota, network and no-result outcomes. A valid request returning no accessible video is not proof the key or video is invalid. The exact test URL/request and browser permission mechanics belong to delivery planning.
- Enable Automatic enrichment by default after explicit successful first setup. Later explicit off/on choices persist through restart/reconfiguration/reconnection; do not repeatedly overwrite them.
- Offer Enrich existing YouTube videos with count, progress and cancellation. Do not silently force a bulk scan as a prerequisite for saving.
- New saves/imports enqueue background acquisition when automatic enrichment is enabled. Exact duplicate input does not create another record, reset original metadata or force a fresh call when the existing information is already current enough.
- Removing/replacing the key stops/cancels old-credential work; do not log or export credentials. Key setup is separate from Google Drive backup authorization. Account/key access and data-storage implementation are delivery-plan choices. Global Automatic enrichment and per-video pauses are separate: enabling the global switch does not clear an existing per-video pause.

### Retrieval, scheduling, and manual scopes

- Default desired cadence is approximately once per week for saved YouTube records, including retained watched/dismissed records, while the browser, key and network are available. There is no playback polling or per-opening full lookup. New/never-enriched records may be retrieved earlier.
- Pace and batch requests against the actual daily project allowance, reserving usable capacity for manual/new-save requests. Do not promise a fixed Library-size capacity or silently activate a paid service. On quota exhaustion, retain data, report paused work and resume when capacity returns. The current known-ID `videos.list` method costs one quota unit per call; the default metadata bucket is documented as 10,000/day. Numeric batch limits require delivery verification.
- Catch up after restart/network interruption without treating missed weeks as separate mandatory repeat fetches. One new observation per due record is sufficient. Failed attempts do not pretend to be successful retrievals or reset the recorded age of prior values. Use bounded backoff, avoid a retry storm and distinguish paused/cancelled/failed/completed work.
- Manual Pull metadata is available per video, list and entire Library with Automatic enrichment off or on. A list means its current members; entire Library includes retained records. Snapshot target identities at invocation, preserve their identity/placement, deduplicate repeated input and include supported YouTube records; report unsupported/fallback-only records as skipped, not failed.
- Progress/result presentation reports requested, retrieved, no-result, failed, skipped and not-attempted/cancelled records with per-video explanation and retry of unsuccessful/unattempted work. Stop cancellation from starting further requests; report any already-in-flight result accurately. Completed safe results are retained.
- **Approved bounded default:** commit each accepted observation/archive/current-pointer update coherently. Partial enrichment persistence failure preserves the user's saved record and previously committed metadata, reports failure and does not claim a complete new version. A batch can retain completed per-video results; it is not an all-or-nothing user mutation.
- Late/older in-flight responses must not overwrite a newer accepted latest value, undo a newer clear/pause choice, use a removed credential, replace a Personal title or introduce a second record. Exact request ordering/concurrency/atomicity mechanisms remain implementation choices.

### Original, latest, and retained history

- Keep every accepted observation of the selected fields with source, record identity, observed/retrieved time and request/access context. Keep changed and unchanged checks distinguishable; identical content/images may share representation without losing any observation or version.
- Original means the first usable automatic value actually recorded for that field in the Library record. It may be browser-observed at capture, imported with unknown upstream age, or first retrieved later. Preserve that factual path/time; do not label a later acquisition as known at the original save time.
- Latest means the most recently accepted source result for the field, with its actual time. A successful response containing the resource but lacking a field records that field as missing; it does not carry an old field forward as current. Original/history values remain inspectable.
- A failed request or no-resource response records its own evidence without erasing the last successfully retrieved metadata. Present retained values as last known when a newer check could not confirm them, with successful-retrieval time separate from latest-attempt time. Do not call metadata found or tab creation verified playback.
- Original / Latest / History in the details dialog exposes all selected values, actual thumbnail images where retained, their source/time and missing values. Older observations remain historical; no automatic rollback action is supplied for replacing current provider values with an old snapshot.
- Main title: Personal title, else original saved title, else latest retrieved title, else saved URL. When original and latest differ, show `YouTube now: <latest>` beneath the main original title. If a Personal title leads, expose both automatic titles in details and identify differing latest/original values honestly.
- **Approved bounded default:** default expanded description is original when present, with an adjacent Latest option; History exposes intermediate descriptions and times. Missing original description falls back visibly to latest. Channel/date/duration and their sorting/grouping use latest successfully observed resource values or honest missing values, not a silently chosen historical snapshot. Title sorting uses the displayed title. Refresh may update a live date/duration/channel sort but does not replace a saved/imported Manual arrangement or change placement dates.

### Default search behavior

- Ordinary Library search matches saved URL, genuinely authored Personal title and titles/descriptions from every retained automatic version. Finding an intermediate title must work by default.
- Provide independent **Personal / Original / Intermediate / Latest checkboxes**, all on by default, rather than a mutually exclusive dropdown. The user can uncheck Intermediate and keep both Original and Latest. Preserve the ordinary selected list/Library/channel scope and organization controls. A restriction must be visible; no implicit narrowing to latest-only after refresh.
- If only a historical value matches, keep the video discoverable under its normal display title and show a concise `Matched title/description from <time>` excerpt leading to that version. Do not disguise the historical match as the current title/description. Missing/unknown observation time is labeled honestly.
- The checkbox layout, pagination/indexing and search execution are builder choices. Preserve the approved rule that reopening starts with empty query/selection; default version scopes are all on unless explicitly changed in that session. URL matching remains available independently of these title/description scopes; with all four off, show that only URL matching remains. A value present in more than one selected category can match any selected category without duplicating the saved-video result. No new per-opening network retrieval is required to search retained information.

### Field-by-field provenance and lifetime

| Field/group | Origin and original/latest authority | Local retention and missing/removal | Copies and restoration |
| --- | --- | --- | --- |
| Saved URL / upload identity | User-invoked capture/import; URL-derived identity distinct from API-supplied ID | Preserve user record even if metadata fails/disappears | Always in complete user-state backup/recovery; no metadata-based merge |
| List names/order/membership, status, user dates/watch/action history | User choices and app-generated records of activity | Existing approved indefinite recovery until deliberate deletion; no metadata mutation | Always recoverable; metadata history does not fabricate user actions/watch events |
| Personal title | Genuinely authored text and factual edit lineage; display precedence | Refresh cannot overwrite it; deliberate clearing restores automatic-title precedence | Included in user-state recovery and complete backup independently of automatic-metadata switches |
| Browser-observed title | User-invoked tab property/time, separate from DOM extraction | Keep every accepted observed title in source history; no blanket API-origin/independent-authorship reclassification | Optional automatic title coverage; preserve provenance/known and unknown times through copies |
| Imported automatic title/other supported source values | Source format/known lineage and actual observation/import time; upstream origin/age may be unknown | Retain accepted values without inventing acquisition dates or authorship; import parser scope remains with existing import decisions | Same selected-field/version controls; unknown provenance stays unknown; import/restore is not a successful provider refresh |
| YouTube title | Known-ID public Data API response; first known and later versions distinct | Keep originals/intermediates/latest; missing resource/failed request is observation evidence, not silent record deletion | Automatic title/version coverage controls copies; restore never silently replaces newer current data |
| YouTube channel name/identity | Response field and source time, separate from URL-derived video identity | Retain versions; current missing channel stays unknown | Selected channel/version coverage, same provenance and recovery non-rewind |
| YouTube description | Response field/time | Retain versions, searchable by default; explicit resource-field absence recorded as missing | Selected description/version coverage including search representations; no credentials/unused payloads |
| YouTube duration / publication time | Response fields; publication is not First saved | Retain versions; unknown duration is not zero, unknown dates sort last | Selected field/version coverage; active sorts use latest values/missing, not old snapshot values |
| Thumbnail URL/reference | Response origin/time and the associated metadata version | Retain every changed reference and observations | Thumbnail field coverage includes references and retained image representation; original source remains attributable |
| Thumbnail image bytes | Image retrieval from the observed reference, separate image acquisition time/outcome | Keep actual original/changed image content. Record failed image retrieval without inventing a saved image. Identical bytes can share storage | Thumbnail backup coverage includes retained bytes. Offline restore displays included images without requiring the original URL still to work |
| Check/availability evidence | Source/time/access context/outcome: not checked, resource returned, no resource returned, request failed | Retain observations with confidence limited to the actual outcome; no private/deleted cause inferred from omission/network/tab failure | Historical observations remain historical. Restore does not label them newly checked; include/exclude with automatic history coverage |
| Derived copies: indexes, diagnostics, cached renditions | Retain factual linkage to corresponding source versions | Indexes/renditions may be rebuilt, not independent authorship or new source refresh. Avoid unused raw provider payloads/secret logs | Excluded backup fields must not survive in derived backup representations. Backup may rebuild indexes without losing included history/search coverage |

The chosen integration retains all automatic source history indefinitely under the approved retained-history contract, subject to capacity failures and the later human storage review. Clear current enrichment does not delete it. This is not a provider-permission guarantee. The exact schema/compression/content-sharing mechanism stays with delivery.

### Check evidence and selected presentation

| Observation | User-facing meaning and action |
| --- | --- |
| No check made | Not checked; setup or manual retrieval available. Automatic fields can be missing. |
| Resource/metadata returned | Metadata retrieved at the recorded time; playback not checked. Quiet Metadata details control in ordinary rows. |
| Lookup completed, no accessible resource returned | No metadata returned; cause unknown. Retain user record and last-known archive. Retry/Open/Dismiss remain available. |
| Connection/request failed | Check failed with actual failure context; no availability verdict. Retry when possible. |
| Key/setup rejected | Check failed with Check setup; do not label each affected video deleted/private. |
| Quota temporarily unavailable | Retrieval paused with relevant quota/status explanation; resume within available capacity. |

- Use **A's compact clickable status pills and details dialog**. Details contain source, time, context, Original / Latest / History and Retry/Open/Dismiss. Labels/symbols/borders must distinguish states independently of provisional colors. Broad theme remains deferred.
- No fabricated numeric availability probability, embedding test, private/deleted classifier or playback check is added. Historical failure is not a permanent current availability claim. Last known/check times remain visible instead of implying 100% freshness.
- Opening invokes the established single/bulk flow and its watched/history/review rules. A metadata action itself does not create viewing tabs or mark watched.

### Recovery, snapshots, backups, and restoration

- Keep the automatic archive attributable and logically separate from user changes. Local history/snapshots refer to source observations/archive without requiring a full duplicate provider response in every user action. Retain every selected observation/version despite efficient representation.
- User-state Undo/selected recovery/full restoration preserves access to the archive and keeps current automatic values at the latest known source observation or missing. Restoring older user organization must not replace newer current provider information or delete later automatic history.
- Include automatic metadata in manual and optional Google Drive backups **by default after first explicit YouTube setup**. Before that, default off. Show the setting and preserve later explicit user choices; reconnecting or key replacement must not silently turn a deliberately disabled option back on.
- Let the user select automatic fields and whether to include all retained versions. When enabled for the first time, default to all supported fields and all versions, including thumbnail bytes and check history. Turning history inclusion off retains original and latest values with source/time. User-controlled Library/recovery data is always included; credentials never are.
- Backups created with automatic metadata off do not retain hidden automatic fields inside event display labels, snapshot payloads, indexes, thumbnails or diagnostics. Keep only the provenance needed to identify omitted coverage without embedding excluded payloads. Back up clear/pause/user-preference choices as user-controlled state even when their automatic payload is omitted. Already completed backup versions are not silently rewritten/deleted when a setting changes; explain coverage per version.
- **Approved bounded default:** a persisted automatic change that is included by the enabled backup settings is eligible for the existing within-five-minutes automatic Drive backup contract while available, even if no user organization changed. No unchanged-state periodic file is required. Metadata-only checks do not create new daily user-state snapshots solely to duplicate their payload.
- Restore validates schema/identity/provenance, previews coverage and applies the existing safety-snapshot/confirmation/Undo-restoration contract. Restore user state even if metadata is absent. Included historical metadata is not a new observation: preserve source/acquisition/check times and missing/unknown lineage.
- In an existing installation, retain newer current/archive information and combine valid included history without duplicates. In a fresh installation, included metadata can supply original/latest/history and offline images using its recorded times; it is not marked newly refreshed. With automatic enrichment on and a usable key, queue a due weekly catch-up for records not individually paused; with it off, paused or no key, preserve manual fallback and offer retrieval. Restoring archived values alone does not resume active provider use over a newer clear/pause decision. Restoring that user choice itself uses the normal explicit preview/conflict safeguards.
- **Approved bounded default:** ambiguous conflicting source/version identity or unknown ordering never silently displaces newer known current values. Surface a meaningful conflict in the restoration preview. Do not guess new authorship/freshness from upload time or import order.
- Downloaded files are outside remote control. Disconnecting, changing future backup settings or clearing current enrichment does not claim to alter those files. Cloud-version deletion remains a separate explicit recovery/backup operation.

### Reversible clearing, pauses, and reconnection

- Key removal/disconnection stops future work with that key and preserves all already retrieved local information. Reconfiguration retains metadata settings and user choices.
- **Clear current enrichment** is a separate confirmed, recoverable user action for selected video(s), list or Library. Preview affected active provider fields. Clear their active use and pause automatic retrieval for affected videos. Do not delete original/intermediate source versions, check history, thumbnail images or the recovery information needed for Undo.
- Preserve saved URLs/identity, Personal titles, unaffected browser/import information, organization, user dates and watch history. Active rows fall back to unaffected browser/import title, Personal title or URL; the details dialog explains that current enrichment is cleared and automatic retrieval paused, with Undo, Pull metadata and Resume automatic enrichment available.
- Retained provider history stays inspectable and searchable through the selected scopes, with clearly historical match attribution, and remains eligible for enabled history backups. Clearing is not a space-reclamation promise. This bounded action adds no irreversible metadata purge or new permanent-history erasure feature.
- Record the active-use/pause change and its audit durably with enough prior state to Undo after restart. Undo and selected-action recovery restore the action's own active-use/pause decisions subject to the existing later-edit conflicts. Current metadata resolves to the latest known observation or missing, not an old field payload. Automatic refresh alone does not invalidate otherwise-safe Undo; a newer explicit manual retrieval/resume/clear can create a real conflict that must not be overwritten silently.
- Paused videos stay out of automatic queues even if the global Automatic enrichment switch is on. Explicit Resume automatic enrichment removes the per-video pause; manual Pull metadata performs one retrieval and can supply current values without silently resuming automatic retrieval. A late request started before Clear cannot reactivate cleared fields or remove the pause.
- Full restoration/Undo restoration applies the existing user-state preview/safety/conflict rules to active-use/pause choices. Historical metadata remains retained and current values do not rewind. There are no purge tombstones, no no-Undo removal and no special irreversible-purge restoration gate in this contract; those proposals were explicitly rejected by the owner.

### Storage, capacity, and four-week review

- Show local usage and actionable capacity failures for retained metadata/history/images; support inspection without sending browsing diagnostics elsewhere. Show backup coverage/size/failure through the existing backup-health contract.
- No silent pruning, fixed history-count cap or automatic 30-day deletion. Sharing identical content, compression and index rebuilding may reduce growth without discarding observations or user recovery coverage.
- When enrichment storage cannot complete, preserve the saved record and prior coherent archive/current values; report failed/incomplete enrichment, permit later retry and keep saving/organization usable when their own persistence can succeed. Do not claim thumbnail or backup coverage that was not persisted.
- [Review metadata and thumbnail storage after four weeks of real use](https://github.com/Omriy123/youtube-backlog-tracker/issues/35) stays open under the delivery roadmap. At the enrichment-enabled development handoff, attach genuine delivery blockers and record actual first-use date and date plus 28 calendar days. Do not start its clock from planning/prototype approval or a build without enrichment.
- Review local metadata/check/index/image growth, memory/search/browse responsiveness, backup growth/performance, request usage and usefulness of retained versions. Coordinate with [the recovery retention review](https://github.com/Omriy123/youtube-backlog-tracker/issues/34) if their evidence periods overlap. The owner decides any changed retention policy; this checkpoint introduces no production reminder or silent deletion.

## Testing Decisions

The primary boundary remains the installed Chrome extension's observable workflows, persisted Library and real provider/browser/backup interactions. Prototype walkthroughs explain intended UI; they are not provider, storage, restart, quota, deletion or restoration validation.

- Verify optional setup/no-key fallback, actual known-ID lookup, user key rejection/removal/replacement, quota and network errors, weekly scheduling/catch-up and automatic-off manual scopes. Record actual documented/tested provider response meanings; do not infer private/deleted causes from fixtures.
- Save/import real supported links while provider work is delayed/failing; reopen/restart and verify one durable record, unchanged placement/dates, exact-duplicate behavior, authored title and watch history. Capture/import parser functionality is validated by its owning workflow rather than faked here.
- Use controlled metadata fixtures at the existing provider boundary for title XXXX -> intermediate ZZZZ -> YYYY, descriptions changing/missing, unknown dates/durations, thumbnail changes/fetch failures, identical responses and out-of-order responses. Supplement with actual authorized public API integration; do not claim controlled fixtures prove all real provider states.
- Search the intermediate title/description by default, restrict Original/Latest/Personal scope and inspect the marked matching version. Exercise existing list/channel/Library search scopes, retained records and responsiveness with representative volumes.
- Inspect Original / Latest / History, actual persisted image bytes, source/time and honest missing/last-known/check failures; restart/offline must retain intended content. Requests/metadata do not prove playback or create watch events.
- Verify each automatic-field/history backup selection, first-setup-on default, explicit-off persistence and credential exclusion. Real manual-file and selected Drive-version round trips must restore user state with/without automatic metadata, retain newer existing values, expose original and every included intermediate version, show images offline and preserve actual observation times.
- Verify user-state Undo/full restoration/Undo restoration without automatic rollback or loss of later archive; Clear current enrichment preserves every historical version/image and historical search, pauses automatic requests and supports safe Undo across restart. Exercise manual one-off retrieval, explicit resume, later-edit conflicts and late in-flight responses. Old backups must not silently override a newer clear/pause choice merely by containing historical payloads.
- Induce enrichment persistence/image/capacity/backup failures at the existing boundary. Assert visible durable outcomes, complete observations, prior-state preservation and retry rather than internal implementation structure.
- At development trial handoff record actual review prerequisites/dates; after real use provide actual memory/storage/backup/request observations for the open review. No assumed 10,000-record scale guarantee or prototype timing substitutes for that review.

Storage framework, browser permissions, packaging, tested URL forms/batch limits, scheduler/backoff/queue mechanics, indexing, content sharing, compatibility migrations and automated test runner remain delivery-plan choices. Do not require full platform layers before usable workflow validation.

## Out of Scope

- Production implementation, shipping or provider-response storage during this planning session.
- Twitch OAuth/API enrichment, bundled Twitch secret, generic-site enrichment, DOM scraping, external scraper services and automatic discovery.
- API-derived reupload/similarity detector or automated merging of different uploads. Existing comparison UI remains a consumer of separately supported evidence.
- Playback/embedding availability verification, playback-progress tracking or aggressive availability polling.
- Live multi-installation synchronization, mobile capture, extra backup destinations and broad theme/color work.
- Legal enforceability determination or a claim that the selected retention behavior is an approved provider-policy exemption.

## Further Notes and Handoff

- Decision provenance: [initial scope/copy/evidence discussion](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6262074191), [selected A presentation](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6262129770), [automatic/manual and missing-field decisions](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6262357041), [original-information requirement](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6263220591), [explicit retention choice](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6263630580), [all versions/title precedence/weekly cadence](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6263737933), [thumbnail/search/backup corrections and review](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6263917349), and [independent checkboxes and recoverable clearing](https://github.com/Omriy123/youtube-backlog-tracker/issues/31#issuecomment-6264182256). Later answers supersede earlier default historical-search exclusion, backup-off, dropdown and destructive-purge proposals.
- Accepted starting contracts: [metadata/fallback boundaries](https://github.com/Omriy123/youtube-backlog-tracker/issues/19#issuecomment-6234607201), [first slice](https://github.com/Omriy123/youtube-backlog-tracker/issues/21#issuecomment-6234607828), [recovery](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238880289), plus current approved capture/opening/organization contracts and map Notes. Explicit later human answers above extend the original-information/copy behavior. On 2026-10-19 the owner explicitly requested replacement first-slice tickets applying contradictory later wayfinder decisions: the [current slice](first-end-to-end-slice.md) includes captured-title observation retention, Original-first fallback and available title-version search/inspection now. Provider acquisition, descriptions/images, metadata clearing/backup UI and the enrichment trial remain later work; those broader capabilities are not silently added.
- Source evidence: [fresh acquisition/copy research](https://github.com/Omriy123/youtube-backlog-tracker/blob/d02039c1852cc8b2853dd10508a2955b9d4987c6/docs/research/provider-acquisition-and-copy-lifetime.md), [focused backup-reuse research](../research/metadata-backup-reuse.md) and [cost/acquisition-alternatives research](../research/metadata-cost-alternatives.md), official [Video resource](https://developers.google.com/youtube/data/reference/rest/v3/videos), [videos.list](https://developers.google.com/youtube/data/reference/rest/v3/videos/list), [quota](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits), [Developer Policies](https://developers.google.com/youtube/terms/developer-policies), and [YouTube terms](https://www.youtube.com/static?template=terms). Documentation was checked 2026-10-18/19; no credentials, live API lookup, source-copy permission, provider audit, production quota/storage or extension integration was validated.
- The [throwaway availability prototype source guide](../prototypes/provider-availability.md) links immutable source and fictional walkthrough observations. A's visual direction is selected. The revised mock demonstrates original/current titles, dated source history and independent Personal/Original/Intermediate/Latest search checkboxes, all on by default; it does not implement real thumbnail-byte persistence, clearing/Undo, provider scheduling or backups. Browser walkthroughs establish fictional UI observations only, not the full current contract.
- Delivery remains with [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) and [the remaining-scope roadmap](https://github.com/Omriy123/youtube-backlog-tracker/issues/9). A possible later split is setup/initial enrich+find, weekly/manual refresh+full metadata/image history, and configurable backup/removal/recovery integration. This is a proposal, not agreed workflow tickets or horizontal modules. Agree scope/tickets at the existing real-build checkpoint; link the review prerequisite there.
- Fresh builder check found only the two clearing decisions material; the owner's Q15–Q16 answers settled them with recoverable clearing, per-video automatic pause, retained history and normal restoration. A final consistency review found nothing important left. The owner then approved the complete contract, including the exposed bounded defaults, with “yes good”; see the approval linked above.
- The published contract, field/source/lifetime table, research and prototype guide supply the handoff to the existing map/roadmap/import/recovery/search consumers. The originating session resolves only this planning ticket and stops; production implementation and later delivery-ticket agreement remain separate.
