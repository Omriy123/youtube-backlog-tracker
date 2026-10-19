# YouTube money, acquisition alternatives, and original-title history

Checked **2026-10-19** (Asia/Jerusalem), for [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31). Narrow factual support for the live discussion; no new product approval.

Foundation: [immutable provider acquisition/copy research](https://github.com/Omriy123/youtube-backlog-tracker/blob/d02039c1852cc8b2853dd10508a2955b9d4987c6/docs/research/provider-acquisition-and-copy-lifetime.md). This does not restart its acquisition inventory.

## Money versus quota

The current official documentation assigns projects 10,000 daily units combined for metadata and other endpoints, with separate default allocations for search and upload. Known-ID `videos.list` costs one unit per call. A unit measures permitted API usage; it is not a dollar charge. Additional quota is requested through an audit/extension process. [Overview, Quota usage](https://developers.google.com/youtube/data/getting-started#quota), [Quota and Compliance Audits](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits)

The credential instructions require an appropriate project credential; requests without OAuth use an API key. Those instructions do not list enabling billing or adding a payment card as a prerequisite. [Obtaining authorization credentials](https://developers.google.com/youtube/registering_an_application)

**Evidence boundary:** the checked current YouTube pages do not publish a per-call monetary tariff, automatic paid-overage mechanism, or explicit current statement that all standard Data API usage is free of charge. They describe quota and audit-based extensions. Thus this evidence establishes no API payment requirement for the proposed standard setup, but does not justify a permanent zero-price guarantee. Google's generic billing documentation distinguishes billable APIs and says to consult each API's own documentation; it does not itself make YouTube billable. Separate cloud hosting or unrelated APIs can have their own charges. [APIs and billing](https://support.google.com/googleapi/answer/6158867?hl=en)

## Acquisition alternatives: possible does not mean permitted

Chrome exposes an optional tab title and URL with the appropriate permissions. This supports the established browser URL/title fallback without a Data API lookup. Content scripts can separately read page DOM; that is a browser capability, not a stable YouTube metadata schema or permission from YouTube. [Tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs), [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

API policy III.E.6 prohibits scraping/obtaining scraped YouTube data, with its public-search-engine exception. General terms restrict automated access except search engines under robots.txt or written permission. Neither expressly classifies user-invoked tab-property capture. Avoiding an API key supplies no established exemption. [Developer Policies, III.E.6](https://developers.google.com/youtube/terms/developer-policies), [YouTube Terms, Permissions and Restrictions](https://www.youtube.com/static?template=terms)

The oEmbed registry lists a YouTube endpoint, but no current official YouTube documentation establishing an enrichment/retention exemption was found in this check. An attempted first-party endpoint opening failed in the browsing tool; no live response was validated. Therefore oEmbed is not established here as a full-field alternative or a way around source conditions. [oEmbed registry entry](https://oembed.org/providers/youtube)

## Keeping original XXXX alongside latest YYYY

III.E.4.c-d require relevant metadata refresh/deletion after 30 days; e requires reasonable currency; f permits time-contextualized historical display alongside latest available presentation. [Developer Policies, III.E.4](https://developers.google.com/youtube/terms/developer-policies)

**Unresolved:** the text does not explicitly settle whether refreshing today's resource authorizes indefinite preservation of its changed original title. Neither categorical permission nor a categorical prohibition of that design is established.

This boundary is a source condition; deletion is the alternative to mandatory refresh. The user's Library record need not disappear. Under the approved product contract, Personal titles remain separately authored; relabeling an automatic copy does not establish authorship.

## Limits

Documentation-only check: no project was created, billing screen inspected, payment supplied, quota extension sought, provider permission obtained, or production acquisition/retention mechanism tested. No scraping bypass is proposed. Existing authored-value and Q54 recovery contracts remain unchanged.
