# Metadata backup reuse: requests, quota, and offline copies

Checked **2026-10-19** (Asia/Jerusalem). Narrow follow-up for [Choose provider setup, enrichment, availability, and lifetime behavior](https://github.com/Omriy123/youtube-backlog-tracker/issues/31), following the human's proposal for optional, per-field backup inclusion, default off. This note selects no product behavior.

Foundation: [Provider acquisition and metadata-copy lifetime boundaries, immutable research](https://github.com/Omriy123/youtube-backlog-tracker/blob/d02039c1852cc8b2853dd10508a2955b9d4987c6/docs/research/provider-acquisition-and-copy-lifetime.md). Its acquisition findings, Q54 non-rewind recovery, source distinctions, and evidence limits remain applicable. This follow-up checks only YouTube request economics and metadata-copy wording.

## Can reuse save API calls?

Yes, mechanically: using an eligible, still-valid stored value instead of fetching it can avoid a request. A backup helps only when restoration would otherwise lack that value. Restoring user organization in the same installation can already retain the latest valid local automatic values; exporting them adds no request saving in that case. A fresh installation may lack that cache. These are deductions about the proposed application, not additional provider permission.

`videos.list` costs **one quota unit per call**, accepts multiple comma-separated video IDs, and can request multiple parts together. It does not require one call per field or video. `maxResults` is not supported with `id`; its documented maximum must not be mistaken for an ID-batch limit. The opened reference does not explicitly document a numeric maximum for the ID list. [Videos: list, quota and parameters](https://developers.google.com/youtube/data/reference/rest/v3/videos/list)

Consequently, omitting a field from backup need not cause an extra call if another missing field already requires lookup for that video. Reusing some videos saves quota only when it removes an otherwise-needed lookup call after batching. Selecting fewer response fields reduces payload, not the documented one-unit method price. These are deductions from that method contract.

ETag conditional requests can return HTTP 304 and reduce bandwidth and latency. They still make a request; the quota documentation charges every API request at least one unit. Neither a cached file nor an ETag establishes a quota-free refresh. [Overview, ETags](https://developers.google.com/youtube/data/getting-started#using-etags), [Quota Calculator](https://developers.google.com/youtube/data/determine_quota_cost)

## What does the copy wording establish?

The policies expressly permit limited temporary Non-Authorized API-data storage when needed, with refresh or deletion within 30 calendar days. Ordinary Authorized metadata has a similar boundary; exceptions for certain statistics do not establish one for titles. Reasonable currency and latest available display still apply. The explicit backup prohibition in III.E.1 concerns audiovisual content. No separate permission or exemption for user-held metadata backup files was found. [Developer Policies, III.E.1 and III.E.4](https://developers.google.com/youtube/terms/developer-policies)

Terms 24.3 additionally requires deletion of API Data in the developer/client's possession or control after suspension, discontinuance notice, or termination. It does not define this application's offline-backup boundary. [API Services Terms, 24.3](https://developers.google.com/youtube/terms/api-services-terms-of-service)

**Classification:** ordinary bounded caching is expressly contemplated; a user-held finite-age metadata backup remains unresolved by the checked wording. No blanket metadata-backup prohibition was identified. A user toggle supplies no provider exemption.

An expiry timestamp and restore-time rejection prevent stale **reuse**. They do not erase expired bytes from a disconnected file. Refreshing today's cache also does not update that old file. This is a technical distinction, not a claim that all such files are forbidden or exempt. A proposed inclusion contract therefore needs both valid reuse rules and an assessed treatment of retained external copies.

## Two bounded product choices

1. **Exclude provider payloads from portable backups for this slice.** Keep reusable automatic data in the managed local cache. Same-installation recovery retains latest valid values; fresh restoration reacquires missing enrichment according to the approved automatic/manual setting. User state remains recoverable.
2. **Approve optional inclusion as conditional scope.** Keep the setting default off, but defer actual provider-payload export until provider-specific copy permission/control is clarified and implementable. Specify source, original acquisition/refresh time, expiry, removal events, and restore eligibility before enabling it. Merely promising to reject an old file at restoration does not satisfy the missing copy-lifetime analysis.

These are alternatives for the human decision, not an approval or an implementation plan. Neither changes authored-title precedence or Q54.

## Evidence limits

Primary documentation was checked on the date above. No live API calls, quota measurements, ID-batch-limit test, backups, deletion mechanism, restoration flow, or provider clarification were exercised. This note neither determines legal compliance nor extends its YouTube findings to Twitch, browser-observed data, or unknown imported provenance.
