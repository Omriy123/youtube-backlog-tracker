# Manual enrichment implementation facts

Checked 2026-11-16 for the approved manual enrichment slice. These documentation checks establish request/setup facts, not authenticated production behavior or a new product decision.

- A known-ID lookup uses `GET https://www.googleapis.com/youtube/v3/videos` with `id` and requested `part` values. `snippet` supplies title, description, channel and thumbnail references; `contentDetails` supplies duration. The documented quota cost is one unit per call. Request only selected fields needed by the contract. [videos.list](https://developers.google.com/youtube/data/reference/rest/v3/videos/list)
- Setup requires a Google Cloud project and credentials with YouTube Data API enabled. The application uses the owner's API key for public known-ID requests; OAuth is required for user-authorized operations rather than this workflow. [Getting started](https://developers.google.com/youtube/data/getting-started)
- The current quota page describes 10,000 daily units combined for endpoints other than the separately allocated search/upload operations. The owner's actual project allowance and usage must be checked in its Cloud console; a default is not a guarantee of remaining capacity. No automatic quota retry is part of this slice. [Quota and compliance](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits)
- Extension service-worker requests to external origins require matching host permissions. Restrict access to the actual API and image origins; do not add arbitrary URL fetching or page content scripts. [Chrome cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)

No usable owner credential was supplied in the implementation request. Controlled provider/image responses can establish deterministic persistence, UI and error handling, but cannot establish an authenticated YouTube request. Perform that final check through the extension's credential field and explicit Test connection/Pull metadata controls; keep keys out of logs and review evidence.

The accepted retention contract and its source-policy evidence limits remain in `docs/specs/provider-enrichment.md` and the earlier provider research. This note does not amend that contract or start the four-week real-use clock.
