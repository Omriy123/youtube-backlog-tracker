# Representative backlog source evidence

Evidence collected for [Obtain representative backlog exports and Chrome-group examples](https://github.com/Omriy123/youtube-backlog-tracker/issues/27). These are real user-supplied source examples, with the limitations below. They establish an evidence inventory for later format validation, not parser compatibility or a complete backlog migration.

## Source inventory

| Source | Received material | Observed structure | Version and acquisition information |
| --- | --- | --- | --- |
| Session Buddy | One user-supplied collection JSON export, described by the user as a random collection | `collections[] -> folders[] -> links[]`; 1 collection, 13 folders/windows and 678 link occurrences | Installed version and exact export-dialog options unknown. Filename has a date/time label; actual source observation time is not independently verified. |
| OneTab | One user-supplied shared web page, captured privately; link text derived locally from its embedded data | 1 displayed group with 407 ordered title/URL objects; embedded `groupings` array empty | Installed version unknown. Retrieved the page and inspected its first-party copy-handler code. This is shared-page evidence, not an installed-extension native export or an observed clipboard capture. |
| Native Chrome tab groups | One human-written observation of an existing named group | A subset of one group with two supplied tab title/URL pairs, explicitly listed in left-to-right order; both supplied URLs use YouTube watch form and have distinct raw video-ID strings | Chrome version, observation date, open versus saved/closed state and window placement unknown. User described positions 1-3 but supplied two entries; the third is absent and is not reconstructed. |

Raw files and the original Chrome observation are retained only under ignored `.scratch/wayfinder/import-evidence/raw/` in the collecting workspace. They are not committed or attached to this issue. A future session without that workspace must request access from the owner; this summary alone does not provide replayable raw fixtures.

## Grouping and order evidence

Session Buddy has explicit collection/folder boundaries and ordered arrays. Its folder link counts in source-file order are `16, 22, 3, 412, 57, 5, 41, 45, 8, 9, 6, 31, 23`. Five folders omit a title. Preserve the omission separately from an intentionally empty or generated name. Export-to-original-UI order has not been corroborated by the user.

Of the Session Buddy links, 581 have numeric `groupId` fields and 97 omit that field. No separate native-group name/color metadata was observed in the export's object keys. The presence of numeric group IDs does not establish a mapping to named native Chrome groups, and folder boundaries must not be treated as proof of that mapping. Native IDs do not become durable Library identities.

The Session Buddy sample includes 12 additional exact raw-URL occurrences beyond each distinct URL's first occurrence. These are literal-string repeats, not an upload-identity reconciliation result. Retain source occurrences and order for later accounting. The sample also contains non-video and browser-internal links; successful JSON parsing does not establish their import acceptance.

The OneTab page contains one displayed group's ordered links. Its first-party copy handler emits `URL | title` lines, with LF between links and two LF between displayed groups; the handler does not include group names in that text. Only one displayed group was supplied, so the multi-group branch is a code observation, not real multi-group fixture evidence. The locally derived text uses that transformation and is labelled as derived. It was not created by running the installed extension's native exporter.

The Chrome observation establishes that the user has a named source group and an intended within-group order. A second group, complete group contents, cross-group/window order and machine-readable group acquisition were not supplied. No export/capture API has been exercised by this observation.

## Titles and provenance

- All 678 Session Buddy links have nonblank titles and nonempty URLs. No `titleOriginal` field was present. The [documented JSON export](https://sessionbuddy.com/formats/#export) can include an original title when edited; absence here is not proof that no edits occurred.
- OneTab's observed objects contain `title` and `url`, without an original-title or acquisition-origin field. Chrome's manual observation supplies displayed titles and links only.
- Deliberate title editing and original title acquisition source are unknown for all supplied material. Do not infer that imported titles are personally authored, API-fetched or browser-observed from their text or field name. A copied/imported value does not acquire a new factual origin merely through import.
- Link count is not verified individual-video count. No playback, provider enrichment, supported-URL parser, upload canonicalization or duplicate merging was tested.

## Remaining unavailable evidence

- Native OneTab export from the installed version, including real multiple groups, group names and any folder/title-edit data that survive that path.
- Confirmation that Session Buddy export order matches its source UI; further collection-export formats/versions, complete-backup compatibility and source native-group name mapping.
- Complete Chrome group contents, a third tab for the stated three-position subset, a second group, open/saved state, window context, version and machine-readable acquisition.
- Independently known title-edit/original-acquisition history and installed source versions.

These gaps remain explicit inputs to [Validate candidate import formats against representative source evidence](https://github.com/Omriy123/youtube-backlog-tracker/issues/28). That ticket must gather fresh first-party format/acquisition evidence and request targeted missing samples if required before promising supported formats. This collection task does not settle those guarantees.

## Handoff boundaries and sources

Preserve groups/source occurrences/order, one record per upload and at most one active destination. A newly created imported list initializes saved Manual order from source order. Preserve the approved recovery, capture rediscovery, opening and organization contracts; this evidence changes none of them. Import mapping, existing-destination arrivals, batch accounting/reconciliation and interrupted retry remain with [Decide import reconciliation, mapping, accounting, and retry behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/29).

Source references inspected during collection: [Session Buddy supported formats](https://sessionbuddy.com/formats/), [collection Import/Export versus Backup/Restore](https://sessionbuddy.com/import-export/), [OneTab help](https://www.one-tab.com/help), [OneTab first-party shared-page copy-handler source](https://www.one-tab.com/web/js/page3.70.js), and [Chrome desktop tab-group help](https://support.google.com/chrome/answer/2391819?hl=en&co=GENIE.Platform%3DDesktop). These document sources complement the private real examples; they do not substitute for testing the user's installed versions. The private OneTab share URL is intentionally omitted.

Publication uses a structural summary rather than a replayable fixture. Real titles, URLs/video identifiers, group names, private artifact identifiers and unrelated source values are withheld; schema keys, counts, missing-value distinctions, observed order and limitations remain. Earlier synthetic examples in `docs/research/design-constraints-follow-up.md` remain synthetic and do not validate the real backlog. No production implementation was performed.
