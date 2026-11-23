# Connect YouTube and enrich one saved video

**Goal:** Implement #65 against `docs/specs/manual-youtube-enrichment.md` without automatic requests.

**Architecture:** Extend the public Library command boundary with an enrichment controller. Network work runs outside the serialized Library write queue; every completion rereads current Library state in that queue. Store the credential separately, and gate results by credential revision and request generation. Store selected observations and thumbnail data URLs coherently in the existing Library document so existing user-only recovery preserves them.

**Tech stack:** MV3 JavaScript, Chrome storage, fetch, Node boundary tests, installed-browser Playwright.

## Agreed test seams

The approved spec already selects installed-extension visible workflows and the public Library command boundary with injected browser/provider/persistence behavior. The former verifies UI integration and storage; controlled requests verify races and failures but cannot establish real authorized API acquisition.

## Work

- [ ] Red/green setup, no automatic requests and coherent single-video acquisition at the public command boundary.
- [ ] Red/green unchanged checks, image failure/retry, stale key/request responses, missing fields and failed persistence.
- [ ] Red/green recovery/concurrent organization preservation and retained/offline data.
- [ ] Add reachable setup/single-video controls, retained image presentation and source/time/details without bypassing review gates.
- [ ] Installed-browser workflow, both-density desktop/narrow rendered evidence, full boundary regression and build.

## Public commands for dependent workflows

- `enrichmentSettings` returns `{ok, configured, storageBytes}`; never the credential.
- `setYoutubeKey {key:string|null}` replaces/removes the separately stored credential and invalidates in-flight old-key results.
- `testYoutubeConnection` performs one explicit known-ID request, leaving Library records untouched.
- `pullMetadata {recordId,imageOnly?:boolean}` retrieves one saved record, including retained records. Returns `{ok,outcome,record?,imageOutcome?,error?}`. A repeated request while that record is in flight shares its pending result.
- `metadataDetails {recordId}` returns the retained record; no network requests.

Each successful YouTube observation is appended to `record.metadata.observations` with `source:'youtube-api'`, `observedAt`, selected `title`, `description`, `channel`, `publicationDate`, `durationSeconds`, `thumbnailReferences`, and `image` containing outcome, acquiredAt, URL and retained data URL when successful. `metadata.current` holds the latest successful selected values. Every accepted attempt goes to `metadata.checks`; failures/no-resource retain prior current values. Capture observations remain untouched. Missing fields in a successful resource are explicit nulls. Image-only retry updates current image and appends a distinct image acquisition without replaying successful text acquisition.

## Review focus

Credential removal during network/image acquisition; persistence failure after successful network; missing successful fields replacing old values; concurrent move/Undo preserving metadata; restart without automatic requests. Each is exercised at the agreed command boundary.

## Verified API facts

Checked 2026-11-16: `videos.list` accepts `part=snippet,contentDetails` and `id`, costs one unit per request; a personal Cloud project must enable YouTube Data API. Extension-origin cross-origin fetch requires matching host permissions. Actual project allowance is not assumed. Sources: https://developers.google.com/youtube/data/reference/rest/v3/videos/list ; https://developers.google.com/youtube/data/getting-started ; https://developer.chrome.com/docs/extensions/develop/concepts/network-requests . A usable key has not been supplied, so authenticated live acquisition remains a human-test requirement.
