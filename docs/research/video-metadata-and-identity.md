# YouTube metadata, availability, and video identity

Checked 2026-10-13 using official Google/YouTube and Chrome documentation. No API credentials, user authorization, video downloads, or live metadata requests were used. Findings establish documented capabilities, not behavior tested against particular videos.

## Metadata available through the Data API

`videos.list` accepts one or more known video IDs. Requesting `part=snippet,contentDetails` provides the documented metadata below for resources the request can access. Adding `status` asks for available status fields. One list call costs one quota unit; a known-ID lookup does not require a search call. [videos.list](https://developers.google.com/youtube/v3/docs/videos/list)

| Wanted information | Documented field |
| --- | --- |
| Title | `snippet.title` |
| Channel | `snippet.channelId`, `snippet.channelTitle` |
| Publication date | `snippet.publishedAt` |
| Duration | `contentDetails.duration`, encoded as an ISO 8601 duration |
| Description | `snippet.description`; the description itself, up to 5,000 bytes, rather than merely a search-result excerpt |
| Thumbnail references | `snippet.thumbnails`, containing image URLs and dimensions |
| Available privacy/upload state | `status.privacyStatus`, `status.uploadStatus` |

`publishedAt` is publication time and can differ from original upload time, notably when a private upload later becomes public. Known unlisted IDs can expose metadata. A resource's `id` identifies that specific YouTube video. The documented resource schema does not expose a public media hash or a same-content/reupload identifier. [Video resource](https://developers.google.com/youtube/v3/docs/videos)

The developer needs a Google account, Cloud project, and enabled YouTube Data API. Requests without OAuth must carry an API key, which identifies the project for access and quota. Public metadata retrieval does not inherently require the end user to sign in; private user data requires appropriate OAuth authorization. [Setup](https://developers.google.com/youtube/v3/getting-started), [Credentials](https://developers.google.com/youtube/registering_an_application), [Authentication overview](https://developers.google.com/youtube/v3/docs)

The current quota page allocates 10,000 units daily for endpoints other than the separately budgeted search/upload endpoints. Invalid requests still cost quota, and the daily reset is midnight Pacific time. Actual project limits are visible in Cloud Console. This is a project quota, not a promise of an allowance per installed extension or user. [Quota calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

## Page capture differs from background metadata lookup

The browser context-menu event can supply the clicked link URL, page URL, and, for relevant elements, source URL. The tab API can supply a tab title and URL with the required access. These are browser/page facts, not a complete YouTube metadata record. Clicking a thumbnail link does not by itself guarantee the video's channel, duration, description, or publication date. [Chrome context menus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus), [Chrome tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs)

Content scripts can read the current page's DOM with appropriate access, so visible page/card information is technically inspectable. This does not establish a stable YouTube DOM schema or guarantee that every desired field exists on a loaded card/page. Background API lookup instead addresses a known video ID without needing its watch page open. [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [videos.list](https://developers.google.com/youtube/v3/docs/videos/list)

## Private, deleted, and otherwise inaccessible videos

An API key is not permission to access another person's private video. The Data API documents `videoNotFound`, but does not promise a public diagnostic record reliably distinguishing every private/deleted/nonexistent video. Owner-only parts include file and processing details. Do not infer definitive deletion from an unsuccessful fetch or missing result. [API authentication](https://developers.google.com/youtube/v3/docs), [List errors and access](https://developers.google.com/youtube/v3/docs/videos/list)

The separate IFrame Player API explicitly combines removed and private videos into error 100. It has other errors for embedding restrictions, so inability to embed is also not proof of deletion. [Player errors](https://developers.google.com/youtube/iframe_api_reference#onError)

Inference: distinguish metadata availability from playback availability, and distinguish an observed failure from a confirmed cause. A network, credential, or quota failure cannot establish that a video disappeared. No checked source offers retrieval of a lost title/description after the caller can no longer access the resource.

## Same upload versus genuine reuploads

Inference from YouTube's documented video identity: URL forms that resolve to the same video ID can be treated as references to the same upload. This does not prove that two distinct IDs contain different media, nor that similar titles/durations/thumbnails contain identical media. URL canonicalization and content equivalence are separate questions.

YouTube documents ETags as resource-version markers for caching and concurrency; they are not documented audio/video fingerprints. [ETag behavior](https://developers.google.com/youtube/v3/getting-started#etags)

Content ID does perform media matching, but it is a rights-management system for approved copyright owners with exclusive rights. Its API requires Content Manager access rather than being a general public deduplication endpoint. No official general-purpose API for checking whether two arbitrary uploads contain the same video was found in this bounded research. That is an absence of a documented available facility here, not a claim that all reupload recognition is technically impossible. [How Content ID works](https://support.google.com/youtube/answer/2797370), [Eligibility](https://support.google.com/youtube/answer/1311402), [Content ID API](https://developers.google.com/youtube/partner)

## API metadata retention constraint

YouTube's Developer Policies III.E.4 require limited non-authorized API data to be refreshed or deleted within 30 calendar days. They also require reasonable effort to keep stored API data consistent with current data. Historical presentation is allowed when correctly contextualized in time, but that clause is not an explicit exemption from refresh/delete requirements. Section III.E.6 prohibits API clients from scraping YouTube applications. [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)

Implementation implication: permanent preservation of API-derived title/description snapshots after a video becomes inaccessible is not an unrestricted capability established by these docs. Preserve the user's product intent as an open requirement while resolving data source and retention behavior; do not silently promise indefinite API caching or present page scraping as a policy workaround. User-authored queue data and notes should be distinguished from API-sourced metadata, without assuming that relabeling copied API data changes its origin. This is a constraint on the proposed integration, not a decision to remove the user's missing-video tracking requirement.

## Remaining uncertainties

- Precise response behavior for private/deleted/restricted examples was not tested; no guarantee of a reliable cause classifier.
- No tested URL normalization matrix, page extraction contract, or content-equivalence detector.
- No API-key distribution architecture, project quota audit, or product decisions.
- Other video providers are outside scope.
