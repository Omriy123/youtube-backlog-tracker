# Candidate backlog import formats: bounded evidence

Checked 2026-10-18 for [Validate candidate import formats against representative source evidence](https://github.com/Omriy123/youtube-backlog-tracker/issues/28), under [Wayfinder: plan the approved video Library through bounded delivery slices](https://github.com/Omriy123/youtube-backlog-tracker/issues/10). This continues the [representative-source inventory](backlog-import-evidence.md) and [earlier grouped-import research](design-constraints-follow-up.md#grouped-tab-manager-imports). It establishes format evidence and limitations for planning, not production parser compatibility or a product-selected support list.

## Findings for the next decision

- **Session Buddy collection JSON has the strongest real structural evidence:** one actual collection, 13 explicit folders, 678 ordered link occurrences. Its collection/folder boundaries survive; named native Chrome groups cannot be reconstructed reliably from the supplied fields. File order is observed, original UI order is unconfirmed.
- **OneTab shared-page copy text has bounded evidence:** one real displayed group containing 407 ordered links, with its exact copy transformation independently reproduced. This does not validate installed-extension native exports. The copy text omits group names, and 23 actual titles contain its delimiter.
- **Live Chrome groups have a documented acquisition path:** read group metadata and member tabs, using tab indices for order. The supplied manual observation validates only two ordered entries within one named group. No browser API was exercised. Reopening a saved group makes live acquisition a plausible route; closed/saved catalog enumeration is not established.
- **Session Buddy CSV and indented text are documentation candidates only.** No real exported fixtures were supplied. HTML has no current published export grammar in the sources checked. Complete Session Buddy backups, OneTab native exports, and direct saved-group acquisition remain unvalidated.

These distinctions let [Decide import reconciliation, mapping, accounting, and retry behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/29) select a bounded initial contract without representing missing evidence as compatibility. Choosing formats or a new human workflow remains that planning decision.

## Evidence classes and version scope

**Observed** means the private real source was inspected structurally. **Derived** means a local transformation of that source, not a new export from its application. **Documented** means current first-party documentation or published code, without an integration run. **Synthetic** means an invented example; the earlier research examples remain synthetic. **Untested** means neither a real corresponding fixture nor a relevant execution supports the claim.

No installed Session Buddy, OneTab, or Chrome version is known for these samples. No supported installed-version range can therefore be claimed. The OneTab website filename `page3.70.js` identifies the inspected web asset, not an installed extension version. OneTab documents a v2 rewrite and a different storage database around March 2026; that history reinforces keeping native export versions separate from web-page asset versions. [OneTab troubleshooting](https://www.one-tab.com/troubleshooting)

Session Buddy's v4.0.5 release introduced the expanded JSON/CSV/text export/import choices; its current release index lists v4.1.2 and a forthcoming v4.2. These are documentation anchors, not a version identification for the private JSON or a claim that all intervening exporters were tested. [v4.0.5 release](https://sessionbuddy.com/releases/4.0.5/), [release index](https://sessionbuddy.com/releases/)

## Session Buddy: collection exports

Documented export candidates, distinct from Session Buddy's broader import acceptance: [Supported formats](https://sessionbuddy.com/formats/)

| Candidate | Documented content and limitations | Real fixture status |
| --- | --- | --- |
| Collection JSON | `collections[] -> folders[] -> links[]`; explicit boundaries; optional names; link `title`, `url`, `titleOriginal` when edited, numeric `groupId` | One observed file |
| Collection CSV | `Collection,Folder,Title,URL,favIconUrl`; missing group names become generated labels | None |
| Indented URL text | Collection/folder hierarchy; folder indentation 2 spaces, URLs 4; no link titles | None |
| Indented title/URL text | Same hierarchy, title/URL pairs separated by blank lines; missing titles become `Untitled` | None |
| Flat URLs or title/URL pairs | No collection/folder hierarchy; pairs contain title then URL, unlike OneTab's same-line delimiter | None |

Session Buddy also accepts legacy JSON shapes and v4/v3 backup `collections`/`sessions` forms; none was validated here. CSV omits original-title/native-group metadata. [Supported formats](https://sessionbuddy.com/formats/)

### What the real JSON establishes

Structural checks reproduced the inventory without publishing source values:

| Check | Observed result |
| --- | --- |
| Collection/folder/link occurrences | 1 / 13 / 678 |
| Link counts by folder in source-array order | `16, 22, 3, 412, 57, 5, 41, 45, 8, 9, 6, 31, 23` |
| Folder title omitted | 5 |
| Link titles nonblank / URLs nonempty | 678 / 678 |
| `titleOriginal` present | 0 |
| Numeric `groupId` present / omitted | 581 / 97 |
| Present `groupId` values | 581 nonnegative; none equal Chrome's no-group sentinel |
| Exact raw-URL repeat occurrences beyond first | 12 |
| Separate native-group name/color metadata | None in observed object keys |

The checks retain occurrences and nested array positions; they do not normalize URLs or resolve upload identities. Folder boundaries are real source boundaries. They are not proof of native Chrome group boundaries. A numeric native ID has no independently established name mapping in this export, and cannot stand in for a durable Library identity. The sample contains non-video and browser-internal links; 678 links does not mean 678 eligible individual videos.

The five omitted folder titles must remain distinguishable from an explicitly empty title or an application-generated display label. Arrays provide an unambiguous file sequence, but export-to-source-UI order was not corroborated. Neither the collection count nor this file's contents establish coverage of the user's complete backlog.

All titles are imported source values. No source edit history was supplied. In particular, absence of `titleOriginal` must not be treated as proof that no deliberate editing occurred or that titles originated with a particular browser/provider acquisition method. A documented field cannot restore provenance absent from the supplied artifact.

### CSV, text, HTML and backup loss cases

The following are derived constraints for future fixture validation, not tests of installed exporters:

- Name-only grouping can be ambiguous when distinct collections/folders have identical names. CSV row order can be retained as file order, but name collisions do not supply stable boundary identities. No real CSV confirms quoting, Unicode, embedded newlines, repeated names, empty groups or UI ordering for the installed version.
- Indented text and blank-line pairing need actual examples before promising handling of leading whitespace, multiline names/titles, blank titles or empty groups. Do not silently flatten a hierarchy while reporting that group preservation succeeded. A flat export cannot reconstruct boundaries it does not encode.
- HTML has no supplied fixture or current published export grammar; v4.0.5 describes HTML/Markdown as future additions. **No HTML candidate is validated here.** [Supported formats](https://sessionbuddy.com/formats/), [v4.0.5 release](https://sessionbuddy.com/releases/4.0.5/)
- Collection Export is for sharing selected/all collections and excludes history; Backup/Restore includes collections and history and has its own repeat-restoration behavior. Native Session Buddy import's duplication behavior does not prescribe this Library's reconciliation rules. [Import/Export](https://sessionbuddy.com/import-export/)
- No complete-backup fixture or restore was tested. Reading a compatible collection subtree would establish extraction only; it would not preserve source history, pins, restoration bookkeeping or restore semantics. Session Buddy documents its own backup operation separately. This Library's complete backups remain governed by its recovery contract. [Backup/Restore](https://sessionbuddy.com/backup-restore/), [approved Library recovery](../specs/library-recovery.md)

## OneTab: distinguish the acquisition paths

OneTab's current help documents sharing a group as a web page and copying links to the clipboard, along with folders and drag reordering. Its homepage advertises import/export, but these product capabilities do not specify a native export grammar or prove which fields survive it. [OneTab help](https://www.one-tab.com/help), [OneTab homepage](https://www.one-tab.com/)

| Path | Evidence | Honest boundary |
| --- | --- | --- |
| Installed-extension native export | Feature documented; no actual native export or installed version | Grammar, groups, names, folders, edits, tasks, notes, timestamps and version compatibility unvalidated |
| Supplied shared web page | One actual displayed group, 407 embedded ordered `title`/`url` objects; embedded `groupings` empty | Validates that page's content/sequence, not original full folder/group structure or native-export equivalence |
| Shared-page copy transformation | First-party handler inspected and locally reproduced; saved derived text matches | Validates the transformation; no browser clipboard action or native extension export was executed |

The rechecked first-party [shared-page handler](https://www.one-tab.com/web/js/page3.70.js) maps each displayed group's tab objects to `url + " | " + title`, joins tabs with LF, and joins displayed groups with two LF. It serializes neither group names nor original-title provenance. The supplied one-group page exercises only the single-group result; multi-group separation is code evidence. Source code alone does not guarantee stable grammar across releases or define escaping for every possible title/URL.

Structural checks found **23 titles containing literal ` | `**, zero URLs containing that delimiter, and no embedded CR/LF in supplied titles or URLs. Splitting globally on every delimiter would corrupt real titles. For this observed subset, a first URL/title boundary retains the rest of the title; this is an observation, not a complete escaping/parser contract. The derived text contains 407 link lines in source order and exactly matches the handler-equivalent transformation as decoded text. It is still derived evidence rather than a captured clipboard fixture.

The embedded `groupings` array being empty cannot validate folder extraction. Shared-page group labels, if displayed, do not survive this copy output. Naming such a group during Library mapping would therefore be an explicit user decision or generated label, not a recovered source name. Page creation/acquisition times, title editing and upstream title acquisition remain unknown.

The public JavaScript was freshly retrieved over HTTPS: HTTP 200, 6,561 bytes, identical to the inventory's captured asset. The web reader could not retrieve this JS directly; direct HTTPS retrieval resolved that limitation. No private share URL was requested again or published.

## Chrome: live groups, saved groups and alternatives

### Documented live acquisition

Chrome exposes `tabGroups` in Chrome 89+ / Manifest V3, with the `tabGroups` permission; Promise-returning group methods are documented from Chrome 90. Group records include optional title, color, collapsed state and window ID. Group IDs are session-unique; they are not portable Library identities. Membership is queried through `tabs`, not through a tab array on the group record. [Tab groups API](https://developer.chrome.com/docs/extensions/reference/api/tabGroups)

Tabs expose `groupId` (Chrome 88+), `windowId`, zero-based within-window `index`, optional title, and the last committed URL. Reading sensitive title/URL fields requires `tabs` or matching host access; `activeTab` grants temporary access to the invoked current tab, not an entire group/window. [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)

**Derived acquisition plan:** obtain groups and member tabs, retain source window/group context, sort members by tab `index`, and retain missing titles/URLs honestly. This establishes a technically documented candidate for preserving a named live group and within-group order. It is not a tested browser integration or an atomic snapshot guarantee. Tabs may move, navigate or close between reads; future browser validation must exercise those changes and permission-limited reads. Window IDs or API return-array order do not establish a user-defined cross-window importance order.

The real Chrome observation contains one named group's subset with two supplied title/URL pairs explicitly in left-to-right order. A stated third position has no supplied entry. It supplies no second group, window context, complete group membership, installed version, open/saved state or machine-readable acquisition. The missing third tab and cross-group order must not be reconstructed.

### Closed/saved groups

Chrome's user help distinguishes closing a group from deleting it and describes reopening a saved group from the bookmarks bar or Tab groups menu. A collapsed live group remains different from a closed group. [Chrome desktop tab help](https://support.google.com/chrome/answer/2391819?hl=en&co=GENIE.Platform%3DDesktop)

The checked extension group schema requires a containing window and publishes no dedicated saved-group catalog method. Therefore **direct closed/saved-group enumeration remains unestablished**, rather than being promised by `tabGroups.query()`. Reopening through Chrome's UI and then using live acquisition is a documentation-backed candidate route, untested here; reopening can load/navigate source pages and is not the same as a silent file import. [Tab groups API](https://developer.chrome.com/docs/extensions/reference/api/tabGroups)

`sessions.getRecentlyClosed()` returns tabs/windows, capped at 25 session entries; its device results describe synced sessions. These do not constitute a documented complete saved-tab-group catalog or a validated group-name/order restoration format. [Sessions API](https://developer.chrome.com/docs/extensions/reference/api/sessions)

### Bookmarks and manual evidence

Chrome documents bookmark HTML export. Its bookmarks API represents folder children, title, URL and within-parent index, using the `bookmarks` permission. Those are bookmark structures: a group appearing in the bookmarks-bar UI is not evidence that it appears as a folder in `bookmarks.getTree()` or bookmark HTML. No such export or API result was supplied. [Chrome bookmark export](https://support.google.com/chrome/answer/96816?hl=en), [Bookmarks API](https://developer.chrome.com/docs/extensions/reference/api/bookmarks)

A deliberate folder-per-group bookmark conversion or manually supplied grouped list could preserve the boundaries and order the user actually supplies, but would be a separate conversion/acquisition contract. It must not be described as direct lossless native-group import. Manual Chrome titles are observed/imported values; their source names do not establish deliberate authorship or provider origin.

## Handoff and remaining validation

Carry forward the [approved product](../specs/video-backlog.md), [feature-map basis](../design/feature-map.md#basis-for-subsequent-feature-specs), [glossary](../../GLOSSARY.md), and [Chrome-first ADR](../adr/0004-chrome-first-with-shared-browser-design.md). No ADR conflict was identified. The evidence changes none of the accepted contracts:

- Preserve source occurrences and grouping before reconciliation; initialize a newly created imported list's saved Manual video order from its source order. Apply one record per upload and at most one active destination. Exact raw-string repetition is not upload canonicalization. Existing-list arrivals, conflicting group destinations and retry accounting remain the import decision's work.
- Apply the [expanded capture/rediscovery contract](../specs/expanded-capture.md), including retained duplicate review and honest outcomes, and preserve [organization/manual-order rules](../specs/library-organization.md). Import format conversion must not invent a different save lifecycle.
- Preserve [opening/history](../specs/opening-and-watch-history.md) and [recovery](../specs/library-recovery.md) semantics. Importing source links is not watching/opening them or restoring this Library's backup. No source tab was opened, closed or changed for this research.
- Preserve imported titles separately from confirmed Personal titles and automatic metadata. Unknown upstream origin remains unknown; import/export/restore does not reset factual origin or fetched-data lifetime. Consume [Recover the existing browser, provider, and import research findings](https://github.com/Omriy123/youtube-backlog-tracker/issues/20#issuecomment-6234607478) and [the resolved provider acquisition/copy research](https://github.com/Omriy123/youtube-backlog-tracker/issues/30#issuecomment-6253857855), including its [pinned source/lifetime evidence](https://github.com/Omriy123/youtube-backlog-tracker/blob/d02039c1852cc8b2853dd10508a2955b9d4987c6/docs/research/provider-acquisition-and-copy-lifetime.md), rather than reopening those questions here.

Before an implementation claims broader compatibility, its chosen bounded formats need representative installed-version fixtures and browser checks: native OneTab export/multiple groups; Session Buddy CSV/text or legacy variants if selected; actual live Chrome acquisition and source changes; repeated/missing group names; empty groups/titles; quoted/newline/Unicode values; mixed eligible/ineligible links; duplicate accounting and interrupted retry. These are explicit gates for the selected support contract, not a requirement to validate every conceivable format before planning can continue.

Private raw artifacts remain only in ignored `.scratch/wayfinder/import-evidence/raw/`; the ignored `.scratch/wayfinder/validate-import-evidence.ps1` records aggregate structural checks (run with `powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/wayfinder/validate-import-evidence.ps1`). This published note intentionally contains no replayable private fixture, personal titles, URLs/video IDs, group names or private share identifier. Future work without that workspace must obtain owner access or new privacy-safe fixtures before reproducing the observations. No production parser, provider lookup, upload reconciliation, app export/import execution, browser API integration or complete compatibility test was performed.
