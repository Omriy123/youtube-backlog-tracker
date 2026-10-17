# Feature-design areas and early end-to-end delivery

The [overarching design](../specs/video-backlog.md) was approved on 2026-10-14. These areas organize interviews and ownership of requirements; they do not prescribe seven code modules or seven implementation milestones. GitHub Issues remain authoritative for task status.

Each area begins from the settled requirements. Interview unresolved choices, write and approve the relevant spec or slice of a spec in `docs/specs/`, create/refine a focused GitHub ticket, then prepare its implementation plan. A usable delivery slice can cross several design areas; an area can yield several smaller specs and tickets. Approve the behaviors/contracts needed for a slice before implementing it, then refine designs through real use. The selected prototype informs layout; its mock code does not decide domain logic. Preserve single-record identity, exclusive active membership, the revised Inbox/rediscovery rule, and the history/recovery contract across all slices.

[Roadmap issue #9](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) is the continuing return point for the remaining approved scope. After the first series through #8, review the working build and user feedback, choose the next bounded slice, and link its focused spec and tickets there. The roadmap stays open across later slices until its remaining scope is delivered or explicitly deferred/removed by the user. Current task status and coverage links belong in that issue.

## Design areas and ownership

| Feature | Outcome and owned scope | Boundary |
| --- | --- | --- |
| Library foundation | A small, provisional shared contract for video/list records, what counts as the same video, valid lifecycle/placement changes, and placement dates. Enforce one record per underlying upload and at most one active destination. | Establish rules before choosing a complete storage/interface design. Refine persistence and interfaces as recovery, capture, and real imports expose needs. Browser integration, packaging, permissions, and technology choice are scoped to the usable slice that needs them, rather than bundled into a large prerequisite project. |
| Recovery and backups | Persistent change history, Undo, point-in-time Library restoration, automatic/manual snapshots, complete backup files, and reminders. | Defines the change information every feature must preserve. Does not own the decision to watch/dismiss or the interpretation of third-party import files. |
| Capture and rediscovery | Current-tab, link/thumbnail, and window capture; Inbox/default and ranked destination shortcuts; exact-duplicate and watched/dismissed save interactions; explicit tab closing. | Owns the save/rediscovery interaction while applying foundation's identity and membership rules. It does not redefine what counts as the same video. Imports owns batch presentation; watch-event creation belongs to opening/status actions. |
| Library organization and browsing | Create/manage watch lists, importance, moves/deletion, date/manual order, channel views, search, selection/batch organization, remembered preferences, and refined A's layout. | Owns placement and browsing interactions. Bulk Open/Watched/Dismiss invoke the opening/status feature; destructive changes use recovery contracts. |
| Opening and watched/dismissed history | Single/selected/whole-list tab opening and grouping, explicit watched/dismissed actions, watch events, unavailable-video opening, and prior viewing details. | Owns status/watch-event changes and tab creation outcomes. Rediscovery UI is capture's concern; availability evidence is metadata's concern; reversing changes is recovery's concern. |
| Backlog imports | Convert Chrome tab groups, OneTab, and Session Buddy source data into save candidates; previews, destination mapping, preserved grouping/source order, batch review, input accounting, and interrupted-import recovery. | Owns source conversion and presentation of batch decisions. Applies foundation's same-video rules and capture's save/rediscovery contract. Complete backups produced by this extension are restored by recovery, not treated as third-party imports. |
| Metadata and availability | YouTube's optional API setup/enrichment, Twitch/generic fallback boundaries, title/channel/description/duration/publication data, search inputs, retry/availability evidence, and fetched-data lifetime. | Owns data provenance and refresh/deletion constraints, including copies in history/snapshots/backups. Missing metadata never prevents capture or erases the user record. |

## Shared identity and duplicate contract

- Foundation owns the definition of the same video and enforces one record/active destination, including when several save/import operations target it.
- Capture owns what the user sees and chooses when saving or rediscovering an existing record.
- Imports owns converting source formats and presenting the same decisions for a batch, without inventing another identity or membership rule.
- An exact duplicate is another reference to the same underlying upload. A possible reupload has a different upload identity and is only a suggestion of repeated content; it must not be automatically merged based on similar metadata. Foundation defines that distinction, metadata can supply similarity evidence, and capture/import interfaces present any review.

## Early metadata contract

Before settling foundation and recovery designs, produce and approve a concrete field-by-field provenance/lifetime contract. Use the existing [metadata research](../research/video-metadata-and-identity.md) and [follow-up constraints](../research/design-constraints-follow-up.md). Provider setup, credential screens, enrichment UI, and richer retrieval can be designed later.

The [approved first-slice contract](../specs/first-end-to-end-slice.md#personal-titles-and-metadata-contract) now supplies these rules for current-tab capture, personal titles, and opening recovery without provider enrichment. Expand the contract through later focused specs before introducing additional data sources or recovery surfaces.

Start from this field/source inventory; resolve the lifetime and historical-copy treatment in the early contract before storage/recovery decisions are settled:

| Field group | Source to distinguish |
| --- | --- |
| List names, chosen destination, importance/manual arrangement, explicit status choices | User decisions; generated history records the decisions and their times. |
| First saved/Inbox-exit/list-entry dates, action history, watch events | Application-generated records of user actions; separate from provider publication dates. |
| Saved link and exact-upload identity | Capture/import input and identity derived from that input; record separately when identity is supplied by a fetched provider response. |
| Editable title | A deliberately authored title/override, a captured page/tab title, an imported title, or a fetched title; do not collapse these origins into a single assumed user-authored value. |
| Channel, description, thumbnail, duration, publication date | Fetched, page-observed, imported, or deliberately supplied values where supported; record origin rather than promising unrestricted preservation. |
| Availability label | An observation with source/check time/confidence; a failed request is not proof of deletion. |

The early contract must:

- Classify the saved URL/provider identity, editable title, list names/membership/order, placement dates, status/watch events, title/channel/description/thumbnail/duration/publication data, and availability observations. Distinguish user-authored values, application-generated records, fetched/provider data, page-observed data, and imported values whose original source may be unknown. A field can have multiple origins; a copied fetched value does not become user-authored merely by storing it in the Library.
- Define which source is authoritative for a displayed value, how a deliberate user edit relates to a fetched value, and what provenance survives import, editing, and export.
- Define what refresh, source disappearance, expiry, and required removal do to current values and historical copies in change history, snapshots, and downloadable backups. Define restoration of an older copy without treating it as permission to revive expired fetched data.
- State what user organization/history remains recoverable when fetched metadata must change or disappear. Missing metadata must not erase the saved record or prevent saving/organizing a link.

Expected output: a reviewed field/source/lifetime table and corresponding recovery rules, sufficient for the first usable slice. This is a concrete early design task, not a requirement to finish every provider integration first. Unresolved provenance rules must remain explicit rather than being guessed in storage implementation.

## Interview order

1. Discuss the small shared foundation, early metadata provenance/lifetime contract, and recovery obligations together. Keep storage/interface choices provisional until workflows exercise them.
2. Interview Capture and rediscovery, then Backlog imports using representative real exports/group examples. The existing backlog and ongoing capture have equal product importance; imports must expose grouping, ordering, and duplicate needs early.
3. Continue with Library organization/browsing and Opening/watched/dismissed history. Pull the limited browse/open behavior needed for the first usable slice forward without requiring these areas to be fully specified.
4. Expand metadata/provider setup and enrichment after the early lifetime contract is established.

This is a design interview order, not a requirement to complete and implement full areas in sequence. Approve the small set of cross-area behaviors needed for a usable slice, build and test that slice, then continue interviews and refinement alongside later slices.

## First usable end-to-end slice

**An early delivery must let the user save a real video, find it, open it, and recover the change.** A finished technical layer or the throwaway mock alone does not meet this target. Do not wait until all seven areas are fully designed or implemented before testing the real workflow.

The slice must demonstrate:

- Save a real video into Inbox through an actual extension action, using the accepted URL/title fallback; optional metadata enrichment is not a prerequisite.
- Reopen or reload the Library, find the persisted record, and retain a single record for that upload. A minimal real list/search surface is sufficient for this slice.
- Open it in a real browser tab. Successful tab creation marks it watched and removes it from active Inbox, preserving recoverable prior state/history; failed tab creation must not silently retire it.
- Recover that change through the approved recovery interaction, restoring its prior active placement and record. The slice's spec must define exactly what is recovered before implementation.
- Run browser checks on the save/find/open/recover flow and let the user try it. Use that feedback to refine provisional contracts, storage/interfaces, and the next delivery slice.

Foundation, recovery, capture, browsing, and opening contribute only the approved pieces this slice needs. Snapshot libraries, full point-in-time restoration, every capture mode, all import formats, rich provider metadata, and all organization controls can grow through later slices while remaining in the approved product scope. The [first-slice spec and delivery slicing](../specs/first-end-to-end-slice.md#approved-delivery-slicing) are approved; implementation plans are prepared for the relevant tickets before production work.

## Carry-forward checks

- Every detailed-decision category in the overarching spec has an owner above; no settled requirement is discarded by the split.
- Cross-feature rules are written once in the Library/domain contracts and referenced by dependent feature specs. Capture and imports must not invent different duplicate or rediscovery rules.
- History and data safety apply to every mutation, including moves, reorders, title edits, status changes, imports, list deletion, and restoration.
- Chrome is first; shared product/UI and isolated browser integration keep later browser adaptation a design requirement. Select packaging, permissions, technology, and compatibility checks incrementally for usable slices, without requiring a complete platform project before testing real capture/open/recovery.
- Implementation tickets deliver testable workflows across design areas; they are not forced to correspond one-to-one with the seven headings. Agree on each slice's relevant contracts/spec before planning and implementing it.
- Color/theme, mobile capture, cloud sync, automatic channel discovery, and preview-free capture remain deferred as stated in the overarching design. Provider metadata limits and restoration retention require feature decisions, not blanket promises.

## Basis for subsequent feature specs

The existing product spec, glossary, ADRs, prototype feedback, and research provide enough context to begin a focused spec/interview for each area. They do not constitute complete implementation specifications for the later capabilities. Use settled behavior as the starting point; interview only unresolved choices and look up technical facts or acquire representative fixtures when needed.

| Design area | Established behavior to carry forward | Remaining focused work for its spec |
| --- | --- | --- |
| Library foundation | Same-upload identity, one record/active destination, Inbox/Backlog/watch-list meanings, lifecycle/watch events, placement dates, personal-versus-automatic titles, provisional persistence, and Chrome-first portability. | Validate supported URL/provider boundaries and minimal migration/concurrency contracts as capture/import examples demand them. Specify only the storage/interfaces needed by each usable slice. |
| Recovery and backups | Persistent Undo, restore to retained history points, automatic/manual snapshots, up to 30 changed-day daily snapshots plus pre-import/restore snapshots, complete backups, and automatic metadata staying current during restoration. First build's Undo opening is now bounded. | Decide history/manual-snapshot retention, selective versus whole-state recovery UI, later-edit/missing-list conflicts, backup reminders/downloads, validation and safe restoration. Provider-copy lifetime needs technical verification before enrichment. |
| Capture and rediscovery | Current-tab/link/window capture goals, Inbox default, importance-based top-three shortcuts plus Backlog, source tabs kept open, strict exact-duplicate behavior, and the revised watched/dismissed review/Inbox rule. | Refine link/window/shortcut UI, preview decisions, pending review interactions, batch rediscovery, and explicit close behavior. Reuse foundation identity rather than re-interview the one-record rule. |
| Backlog imports | Chrome group preservation/mapping, requested OneTab/Session Buddy sources, new imported lists preserving source order, exclusive placement, shared duplicate/rediscovery decisions, and synthetic grouped/title examples. | Acquire representative real export fixtures for format fidelity, especially OneTab; resolve format support, existing-list arrival order, batch reconciliation, interruptions/retry, and input/result accounting. This evidence is needed before promising a complete parser, not before drafting its spec. |
| Library organization and browsing | Refined A's accepted layout and feedback, list importance, sorts/manual arrangement, permanent destinations and deletion choices, channel scopes, stable toggles, search, selection/batch goals, density and remembered preferences. | Refine unconfirmed logical edge cases (filtered drag/selection/ranking), missing channel data, responsive behavior, and the concrete controls included in each delivery. Preserve the layout decision; theme remains deferred. |
| Opening and watched/dismissed history | Open marks watched after tab creation, no playback-progress tracking, retained history/repeated watch events, explicit watched/dismissed goals, whole-list grouped tabs, notice over 10, inclusion of unavailable records, and recovery preserving earlier events. | Refine bulk grouping/focus/partial-failure behavior, pending-review interaction, repeated-event presentation, and explicit status controls. Single-video opening/Undo is already specified in the first slice. |
| Metadata and availability | Optional YouTube API key, fallback without enrichment, requested fields/descriptions, retained unavailable records, badges/retry/open/dismiss, personal-title precedence, provenance separation, and fetched data not rewinding during restoration. | Verify provider integration/setup and source/lifetime rules; specify retrieval/refresh, availability confidence, Twitch/generic enrichment limits, missing values, and treatment of historical/exported copies before storing provider responses. Known uncertainties remain explicit. |

For each later area, synthesize these recorded requirements into a draft, run its focused grilling session where choices remain, then formalize/publish with to-spec after those choices are settled. Use to-tickets to propose and agree on vertical implementation tickets and blocking edges. A feature-design area may need multiple specs/slices; do not force one giant implementation spec or one horizontal ticket per row.

The approved [first-slice spec](../specs/first-end-to-end-slice.md#approved-delivery-slicing) is divided into five published workflow tickets. The user approved a save/find build first, then opening/recovery to complete the first usable end-to-end path. The other tickets finish the slice's title, rediscovery, and combined failure/recovery cases without requiring all later-area specs to be finished first. This supersedes the earlier proposal to put the entire initial path into one larger ticket.
