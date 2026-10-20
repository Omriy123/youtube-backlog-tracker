# Install and try the first test build

This unpacked Manifest V3 extension delivers Save to Inbox and Library/search (#41), plus Personal titles and retained captured-title inspection/search (#44). Opening, watched history, Undo and rediscovery review are delivered by their own slice tickets. The source folder is the runnable build; no compilation or API key is needed.

1. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
2. Choose **Load unpacked**, then select this repository's `extension/` directory (not the repository root).
3. Pin **Video Backlog Tracker** from Chrome's Extensions menu.
4. Open a video or other HTTP(S) link. Click the toolbar extension, then **Save to Inbox**. Wait for **Saved to Inbox** or **Already saved**. The source tab stays open.
5. Choose **Open Library** explicitly. Search beneath the Inbox heading using any captured title or the saved URL. Closing/reopening the Library or restarting Chrome preserves saved records.
6. Reload the extension on the extensions page after updating its files. Extension removal or clearing extension storage deletes this local test collection; this build has no backup/export UI.

The extension requests `tabs` to read the current tab's URL and browser title and `storage` for its local Library. It has no host permissions, content scripts, provider requests, DOM scraping or API credentials. Captured titles are browser observations, with their observation time; they are not verified current provider metadata. Chrome may supply a URL-shaped browser title for an untitled page. Thumbnail, channel, duration and publication date remain explicitly unknown.

Save confirmation follows the coherent storage write. A failed write displays a failure and keeps the previously committed Library. Retry explicitly; do not interpret action failures as evidence that a video was deleted/private. All records and metadata observations remain local to the Chrome profile; this test build does not sync them.

## Bounded identity and opening context

Identity recognition describes URL syntax, not playback availability. It never merges similar titles or different upload IDs.

| Input | Record identity |
| --- | --- |
| `http(s)://youtube.com/watch?v=M7lc1UVf-VE` or `www.youtube.com` | YouTube upload `M7lc1UVf-VE`; exactly one valid 11-character `v` parameter required. Timestamp, playlist/index and other query context do not create a second record. |
| `http(s)://youtu.be/M7lc1UVf-VE?t=120` | Same upload. Exactly one 11-character path segment. |
| `http(s)://twitch.tv/videos/335921245` or `www.twitch.tv`, optional trailing slash/time query | Twitch VOD decimal identity `335921245` (no leading zero). |
| Other HTTP(S) URLs | Conservative full-URL identity after standard URL parsing. Query, fragment and path remain identity-significant. Exact repeats merge; different links stay separate. |
| Conflicting/repeated watch `v`, malformed ID, channel/search/playlist-only, Twitch channel/clip, lookalike host, nonstandard port, or not-yet-supported provider route/host | Generic full-URL fallback, never a manufactured known-upload match. |
| Browser/internal/extension/file/javascript URLs or credentials embedded in a URL | Rejected; no record is saved. |

The first saved URL remains unchanged on active repeat saves, preserving its initial timestamp/playlist/fragment context for the later Open workflow. Different references to a recognized upload do not overwrite that saved context, reorder it, reset user dates or create watch events. All accepted browser-title observations, including missing titles and unchanged repetitions, are retained separately from user History. Title display uses Personal, then first usable automatic Original, then usable Latest, then saved URL. Broader YouTube embed/shorts/live/mobile/music URL normalization belongs to #43.

## Personal titles and captured-title search

For an active Inbox video, choose **Edit Personal title** and deliberately enter your own title, then **Save title**. The editor starts empty unless you already authored a Personal title. **Clear Personal title** restores the automatic-title/URL fallback; it preserves captured observations. Confirmation follows persistence, failures remain in the editor, and accepted authored changes retain their prior title in History. Automatic repeat captures never replace a Personal title or count as a user edit. Stale editors must be closed and reopened before retrying. Pending rediscovery review gates editing; resolving it does not submit a prepared title automatically.

The independent **Personal / Original / Intermediate / Latest** checkboxes start on. Saved URL matching is always available; all four off visibly means URL-only search. A single observation can be both Original and Latest. Original is the first usable captured title, Latest is the final observation even when its title is missing, and Intermediate covers observations between those indices. Multiple matching categories return one video. Closing/reopening starts with an empty query and all four scopes on.

A historical-only result keeps its normal display title and shows a dated matching excerpt. Click the excerpt to inspect the exact retained observation. **Titles** provides bounded **Original / Latest / History** views, including missing/repeated observations and actual source/time or honest unknowns. These times describe capture, never verified provider freshness. Escape or **Close titles** closes the dialog. Search, navigation and title inspection leave user History, ordering and watch events unchanged.

## Run the automated checks

Use Node 24 or newer from the repository root:

```powershell
npm ci
npx playwright install chromium
npm test
```

`npm test` runs the public Library command/browser-boundary checks and the installed-extension Playwright workflows. `npm run test:browser` and `npm run test:boundary` run those separately. Browser profiles, failure-fixture extension copies, screenshots and reports go under ignored `.scratch/`. For a shared browser cache, set `PLAYWRIGHT_BROWSERS_PATH` before both install and tests. The development machine's existing Chrome build rejects automation extension-loading flags, so tests use bundled Chromium with `channel: 'chromium'`.

Playwright routes synthetic HTTPS fixture pages into real tabs; no test claims provider playback or live-provider availability. Main workflows run the actual production extension, tabs API and Chrome local storage. Deterministic failed writes, missing titles and unknown observation provenance use a test-only extension copy replacing only the existing browser/persistence adapter, retaining all real UI/service code and actual local storage for accepted writes. No production testing hooks are present. The actual toolbar popup is opened with `chrome.action.openPopup()` and inspected through CDP because Playwright does not expose it as a Page. Other repeated fixture captures load the same popup UI in an extension tab. Public-command boundary tests control capture timing, failed persistence and conflicting/pending user state that cannot reliably be induced through normal capture alone.
