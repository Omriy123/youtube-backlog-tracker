# Provider acquisition and metadata-copy lifetime boundaries

Checked **2026-10-18** (owner timezone: Asia/Jerusalem), using fresh first-party documentation. Research for [Verify provider acquisition and metadata-copy lifetime boundaries](https://github.com/Omriy123/youtube-backlog-tracker/issues/30). Product choices remain with [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31).

This note verifies documented boundaries before enrichment beyond browser URL/title capture. It selects no production authentication flow, retention implementation, availability classifier, or detector. No provider credentials, live provider API requests, OAuth sessions, browser capture tests, playback tests, or real import/backup fixtures were used. Documentation capability and contractual wording do not establish tested behavior or a legal adjudication of this extension.

## Existing decisions this evidence must preserve

The [first-slice provenance/Q53-Q54 contract](../specs/first-end-to-end-slice.md#personal-titles-and-metadata-contract) already separates Personal titles from automatic values, keeps URL/title fallback working, restores user organization/history/authored edits, and resolves automatic metadata to latest valid values or missing. Retaining an unavailable saved record does not require retaining every automatic payload.

The [recovery contract](../specs/library-recovery.md#recoverable-state-and-provenance) guarantees recoverable user state and explicitly excludes a promise of indefinite automatic metadata copies. Its indefinite history/snapshot/backup-version retention and development review do not authorize indefinite provider payloads. [Capture](../specs/expanded-capture.md#possible-duplicates-and-metadata-boundary) approves possible-duplicate comparison presentation when evidence exists, without approving a detector or acquisition method. [Opening](../specs/opening-and-watch-history.md) and [ADR 0001](../adr/0001-mark-watched-on-open.md) count successful tab creation as Watched, without establishing playback. [Organization](../specs/library-organization.md) keeps missing channel/date/duration values unknown.

These are local product decisions, not claims of provider permission. This research supplements [earlier metadata research](video-metadata-and-identity.md), [Early metadata contract validation](design-constraints-follow-up.md#early-metadata-contract-validation), and the [feature-map handoff](../design/feature-map.md#basis-for-subsequent-feature-specs). No conflict with the relevant ADRs was found.

## YouTube: bounded acquisition and evidence

Public-data lookup need not make the end user sign in. A non-OAuth request needs an API key identifying its project; requests requiring access to private user data need appropriate OAuth authorization. Setup requires a Google account, project, enabled YouTube Data API, and credentials. This establishes two access categories, not permission to retrieve another person's private video. [Credentials, credential types](https://developers.google.com/youtube/registering_an_application), [Overview, Before you start and Supported operations](https://developers.google.com/youtube/v3/getting-started)

For known IDs, `GET /youtube/v3/videos?id=...&part=snippet,contentDetails` is a bounded candidate; request `status` only if needed. The documented cost is one quota unit per call. `part` selects resource sections; `fields` can further restrict nested response properties. This is a known-ID lookup, not a requirement to search for each saved URL. [videos.list, Request/Parameters/Quota impact](https://developers.google.com/youtube/v3/docs/videos/list), [Overview, Partial resources](https://developers.google.com/youtube/v3/getting-started)

| Requested information | Documented resource property |
| --- | --- |
| Provider title; description | `snippet.title`; `snippet.description` |
| Channel identity/name | `snippet.channelId`; `snippet.channelTitle` |
| Publication time | `snippet.publishedAt`; may differ from original upload time |
| Thumbnail references | `snippet.thumbnails` URLs/dimensions |
| Duration | `contentDetails.duration`, ISO 8601 |
| Available status information | `status.privacyStatus`, `status.uploadStatus`, `status.embeddable`; not a comprehensive playback verdict |

Field meanings and conditional visibility come from [Video resource, Properties](https://developers.google.com/youtube/v3/docs/videos). A publication date is not the Library's First saved date. Candidate fields should remain absent where inaccessible rather than being inferred from a title or URL.

`videos.list` documents `videoNotFound` and owner-only restrictions on `fileDetails`, `processingDetails`, and `suggestions`; it does not promise a private/deleted/nonexistent cause classifier for omitted or inaccessible resources. Generic API errors separately identify authorization and quota failure. Inference: record response/request evidence and its time; neither a failed request nor a missing resource establishes definitive deletion. [videos.list, Errors/Response](https://developers.google.com/youtube/v3/docs/videos/list), [API errors, Core API errors](https://developers.google.com/youtube/v3/docs/errors)

The separate IFrame API's error `100` combines removed/private causes; `101`/`150` concern embedding refusal. This is player evidence, not the behavior of a Data API lookup or the tracker's ordinary tab-opening action. Metadata accessibility, embedding, tab creation, and successful playback are separate observations. [IFrame API, onError](https://developers.google.com/youtube/iframe_api_reference#onError)

### YouTube policy clause map

The following compact map preserves the exceptions and shorter deletion paths; a universal “30-day cache” description is incomplete. All rows reference [Developer Policies, III.D-E](https://developers.google.com/youtube/terms/developer-policies).

| Clause | Boundary |
| --- | --- |
| III.D.1.b-d | Assigned developer/project credentials; one project/client; no third-party disclosure/open-source embedding; confidential-agent exception. |
| III.E.4.a | Tokens: necessary, active consent, purpose/law conditions. |
| III.E.4.b | Authorized Analytics/Reporting/statistics may exceed 30 days under necessary consent/law conditions; recheck authorization every 30 days; video-statistics example also checks deletion. Non-Authorized statistics cannot. |
| III.E.4.c-d | Other Authorized/limited Non-Authorized data: necessary, at most 30 calendar days, then refresh/delete. |
| III.E.4.e-f | Reasonable current consistency; latest display; accurately time-contextualized historical display allowed. |
| III.E.4.g | User-data deletion request/account deletion: ASAP, within seven calendar days. |
| III.E.4.h | No replacing API values with independently calculated substitutes or creating derived data/metrics; disclose independent product values. |
| III.D.2.3 | In-client revocation: revoke token immediately; consent-derived Authorized Data ASAP/within seven calendar days. Google-settings revocation: related consent-derived API Data ASAP/within 30 calendar days; periodically reconfirm tokens. |
| III.E.6 | No scraping/obtaining scraped YouTube data; limited public-search-engine exception. |
| III.E.1.a | Explicit backup restriction concerns audiovisual content. |

Historical display permission supplies no express metadata-copy retention exemption. Personal local setup versus distribution needs scoped credential interpretation; the existing optional user-configured-key decision is not silently rejected here.

An additional analytics amendment requires acceptance and an analytics use case. Accepted statistical/derived metrics may be stored up to 36 calendar months; titles, creator names, descriptions, and comment text still follow the 30-day refresh/deletion policy. It is not a general metadata extension. Whether proposed API-derived similarity scoring fits any permission requires separate assessment; accepting a comparison dialog does not answer that question. [Additional policies, introduction and Data Storage](https://developers.google.com/youtube/terms/derived-metrics-policy)

YouTube defines API Data by supply through its API services (Terms introduction; section 1 defines API Client). Terms 24.3 requires stopping use and deleting API services/data in the developer/client's possession or control following suspension, discontinuance notice, or termination. No import, relabeling, snapshot, export, or restore conversion exemption was found in those clauses. [API Terms, introduction/1 and 24.3](https://developers.google.com/youtube/terms/api-services-terms-of-service)

## Browser-observed, authored, imported, and generic values

Chrome `tabs.Tab` exposes an optional title and last committed main-frame URL with `tabs` or relevant host access; the URL may be empty before commit. User-invoked `activeTab` supplies temporary access for that tab. This is browser-observed input, not a complete provider metadata response. `activeTab` is not evidence of access to every tab in a window. [Tabs, Permissions and Tab properties](https://developer.chrome.com/docs/extensions/reference/api/tabs), [activeTab, scope and allowed operations](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)

A context-menu event's `linkUrl` identifies the clicked link separately from `pageUrl` and image/media `srcUrl`; its schema does not promise the linked video's title. DOM reading is a separate content-script capability. Neither source documents a stable YouTube card schema or guarantees channel/date/description on every page. [Context menus, OnClickData](https://developer.chrome.com/docs/extensions/reference/api/contextMenus), [Content scripts, capabilities](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

YouTube's general Terms, Permissions and Restrictions item 3, restrict automated service access with specified exceptions. The checked text does not expressly classify a user-invoked extension saving pre-existing tab properties. Browser capability therefore settles neither terms permission nor a blanket exemption for browser-sourced values. Applying API retention to every tab title is also not established by this evidence. DOM/background extraction needs its own assessed acquisition contract. [YouTube Terms, Permissions and Restrictions](https://www.youtube.com/static?template=terms)

The following are proposed contract distinctions for [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31), grounded in the existing Q53-Q54 decisions, not new claims of legal ownership:

| Origin | Required distinction and unresolved boundary |
| --- | --- |
| Deliberately authored | Preserve actual authored text/overrides separately from automatic values. Keeping a copied fetched title unchanged is not evidence of independent authorship; an edit marker alone proves no acquisition path. Meaningful rewriting's treatment remains unresolved. |
| Application-generated | Library action times, placement dates and watch events record user activity. Keep these distinct from provider publication dates and provider observations, as Q54 already requires. |
| Browser-observed | Preserve observation path/time and distinguish tabs from DOM. No blanket indefinite-retention or provider-permission assertion. |
| Known provider API | Keep provider, field acquisition/check time, access category, and copy validity/removal obligations attributable to that source. A URL-derived ID and an API-returned ID need distinct provenance even if equal. |
| Imported/unknown | Retain known source/format and any supported original provenance; explicitly record unknowns. Import time is not a verified original acquisition/refresh time. Never turn unknown/API copies into authored or browser-origin data solely through import. |
| Generic link | URL/available title fallback remains useful. No universal provider schema, refresh period, authentication promise, or extraction permission is established here; assess each added source independently. |

For generic availability, HTTP `404` means no current representation found **or unwillingness to disclose one** and does not establish permanence; `410` expresses likely permanent unavailability at that origin. Even these describe HTTP resource evidence, not necessarily an embedded video's provider state. [RFC 9110, 15.5.5 and 15.5.11](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.5)

## Twitch VOD: independent authentication and storage constraints

`GET /helix/videos` takes known video IDs (maximum 100), requires an app or user OAuth access token and matching `Client-Id`, and returns video ID, broadcaster identity, title, description, creation/publication times, URL, thumbnail reference, type, and duration. It distinguishes VOD archives, highlights, and uploads. Missing IDs are ignored if any valid ID remains; all missing IDs produce documented `404`. `401` separately covers invalid credentials/client mismatch. These are lookup observations, not a reliable cause classifier or indefinite VOD-availability promise. [Get Videos, Authorization/Parameters/Response/Codes](https://dev.twitch.tv/docs/api/reference/#get-videos)

The app-token client-credentials flow requires a client secret and is documented for server-to-server requests. Twitch documents a client-side user-token flow and a public-client device flow, but this research chooses neither; device-flow suitability for an ordinary browser extension remains unverified. Maintained OAuth sessions require validation; Twitch's validation documentation specifies startup and hourly checks. [Getting OAuth tokens, flow table/client credentials/device code](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/), [Validating tokens](https://dev.twitch.tv/docs/authentication/validate-tokens/)

A client ID may be public; a client secret must never be exposed to users, even obscured. Inference: bundling an application secret in a distributed extension is not a supported silent app-token solution. A confidential service, a supported user authorization design, or reduced enrichment remain alternatives for [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31). [Register your app, Client ID/secret instructions](https://dev.twitch.tv/docs/authentication/register-app/)

The **current English Developer Services Agreement**, displaying **12/04/2024**, was retrieved through first-party indexed search; direct page opening returned a page shell. The current URL and exact clauses follow, rather than an older archived agreement. [Current agreement](https://legal.twitch.com/en/legal/developer-agreement/)

| Clause | Boundary |
| --- | --- |
| II.A.3-4; VI.A | Program Materials includes metadata; Twitch Data includes API-derived data/insights. |
| VI.C-D | Third-party sharing requires prior written permission; personal/sensitive information only as long as needed, with security controls. |
| VI.F; IX | Delete Twitch Data on termination, authorization revocation/reduction, or Twitch/end-user request; permitted downstream copies also deleted. |
| Schedule 1.C | Respect user controls; end-user API-data deletion has law/regulation/separate-agreement qualification. Copies require prior written Twitch authorization (terms or otherwise), control of associated rights, or a cache of at most 24 hours without further third-party sharing. Re-syndication/re-distribution prohibited. Use commercially reasonable efforts to update caches, remove reported deleted/expired materials/content, and honor changes. |
| VII.B-C | Frequent accurate updates; clear source path/attribution. |

These are Twitch-specific conditions, not YouTube's 30-day rule. They supply no blanket snapshot/export exemption. Whether an identified authorization/rights exception permits this proposed personal metadata use, and how private user backup destinations fit sharing/copy language, remains unresolved; do not claim indefinite storage by omission. [Developer Agreement, cited clauses](https://legal.twitch.com/en/legal/developer-agreement/)

## Decision-ready copy and restoration questions

The following are design options and unanswered mechanics, not selected product behavior. Their purpose is to make the approved user-state recovery promise compatible with an assessed source contract:

The integration's copy inventory should cover current values, search indexes and other derived representations, cached thumbnail bytes separately from thumbnail URLs, diagnostic payloads, history, snapshots, and external versions. A field disappearing from the current UI alone does not establish that its stored copies were removed. This is an assessment checklist, not a selected storage design or a new retention exception.

| Surface | Candidate option or decision needed |
| --- | --- |
| Current automatic fields | Choose supported fields/origins, refresh cadence and failure behavior, validity/removal checks, and honest missing-data presentation. A retry failure must not silently renew acquisition age. |
| History and local Library snapshots | Consider references to the latest permitted automatic values, or separately removable payloads, rather than embedding an immutable provider response in every user action. Preserve user change history even when an automatic value is absent. |
| Application-controlled cloud backup versions | Decide whether provider payloads are excluded or can actually be removed/updated across every retained version. Stopping future uploads alone is not a copy-lifetime design. Indefinitely retained user-state versions remain an existing requirement. |
| Downloaded files outside application control | User-held offline files cannot be assumed remotely mutable. Decide source-specific inclusion/exclusion and explain coverage honestly. This research found no general exemption making exported provider payloads indefinitely retainable, and does not promise automatic deletion of inaccessible copies. |
| Uploaded backup/import and full restoration | Restore user organization/history/authored values through existing preview/safety rules; validate source/time/lifetime before using automatic fields. Candidate behavior: omit invalid/unknown payloads or obtain new permitted data. Import/restore is not a freshness reset. |
| Personal title over automatic title | Keep authored precedence and factual lineage. Decide display/source details without offering “make permanent” relabeling as a policy workaround. |
| Availability evidence | Specify source, checked time, request/access context, observed outcome, confidence and expiry. Distinguish metadata missing, request failed, embed refused, and playback unverified. |
| Similarity evidence | Choose permitted evidence production separately from the approved comparison UI; avoid treating API-derived scoring as already authorized. |

The outstanding interpretations are: personal local versus distributed credential setup; browser-tab capture versus prohibited automated extraction; authorship after meaningful rewriting; unknown imported lineage; whether a successful refresh supports any particular retained historical value; removal from already exported/offline copies; application control over private cloud versions; Twitch authorization/rights and private-backup sharing scope; and any derived-metadata detector permission. Obtain clarification or keep the affected enrichment/copy capability bounded before promising it. [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31) already owns these product decisions; no duplicate interview or tracker item is needed.

## Evidence limits and handoff

All external links above were accessed on 2026-10-18. Primary API/browser references establish documented capabilities; policy/terms clauses establish wording only. Twitch agreement evidence has the explicit indexed-retrieval limitation above. No exact response matrix was tested for private/deleted/restricted videos, no OAuth/key-distribution architecture was validated, and no provider-specific copy purge, export/restore, or real-browser permission behavior was exercised. The earlier notes' untested boundaries remain untested.

The resulting decision can preserve useful fallback and retained unavailable user records while specifying only the enrichment, evidence, and copy coverage it can support. Further implementation planning must turn the selected contract into bounded installed-browser/API/backup validation, without treating this research or a mock as that evidence.
