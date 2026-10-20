# Install and try the first test build

This unpacked Manifest V3 extension delivers Save to Inbox and Library/search (#41), real single-video opening with persistent Undo and recovery (#42), and Personal titles with retained captured-title inspection/search (#44). Rediscovery review is delivered by #43. The source folder is the runnable build; no compilation or API key is needed.

1. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
2. Choose **Load unpacked**, then select this repository's `extension/` directory (not the repository root).
3. Pin **Video Backlog Tracker** from Chrome's Extensions menu.
4. Open a video or other HTTP(S) link. Click the toolbar extension, then **Save to Inbox**. Wait for **Saved to Inbox** or **Already saved**. The source tab stays open.
5. Choose **Open Library** explicitly. Search beneath the Inbox heading using any captured title or the saved URL. Closing/reopening the Library or restarting Chrome preserves saved records.
6. Click a saved title or **Open video**. A new focused tab opens at the first saved URL, including its saved timestamp/playlist/fragment context. The source and Library tabs stay open. Successful tab creation marks the video watched and removes it from Inbox; playback is not verified.
7. Return to the Library and choose **Undo opening** to restore the most recent opening's prior active placement and relevant dates. The created tab stays open. Undo remains available after closing/reopening the Library and restarting Chrome, provided later relevant user decisions have not made reversal unsafe.
8. Reload the extension on the extensions page after updating its files. Extension removal or clearing extension storage deletes this local test collection; this build has no backup/export UI.

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

The first saved URL remains unchanged on active repeat saves, preserving its initial timestamp/playlist/fragment context for Open. Different references to a recognized upload do not overwrite that saved context, reorder it, reset user dates or create watch events. All accepted browser-title observations, including missing titles and unchanged repetitions, are retained separately from user History. Title display uses Personal, then first usable automatic Original, then usable Latest, then saved URL. Broader YouTube embed/shorts/live/mobile/music URL normalization belongs to #43.

## Opening recovery

Opening preparation must be saved before any browser tab is requested. A failed creation keeps the video active with no watch event. A failed Library write after a known creation shows **Tab open — Library update not saved**. Choose **Repair Library update** to finish tracking that same opening without creating a tab or a second watch event. Its watch time remains the original creation time. Repeated submissions reconcile the existing operation before changing anything.

If a receipt itself could not be saved, the running extension retains the known creation result for repair. Losing that live evidence through restart may leave an **Opening outcome uncertain** warning. The extension does not infer success from a matching URL or replay the attempt automatically. **Inspect existing tabs** lists current tabs and can focus one without marking the video watched. Only **Open a new tab anyway**, beside its possible-duplicate warning, requests a new opening. A known failed creation whose outcome could not be saved offers **Finish failed opening recovery** before another explicit Open.

The latest-opening Undo reverses only its own watched marking/event, preserves earlier watches, automatic observations and unrelated edits, restores prior active order/user dates, and retains a correction audit. It leaves browser tabs alone. Later relevant user changes disable unsafe Undo/repair with an explanation. Search, navigation, title inspection and automatic title observations do not invalidate safe Undo. Recovery stays visible even when search has no active results. Pending review gates both normal and explicitly warned new openings; resolving review alone never opens a tab.

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

`npm test` runs the public Library command/browser-boundary checks and the installed-extension Playwright workflows. `npm run test:browser` and `npm run test:boundary` run those separately. Browser profiles, failure-fixture extension copies, screenshots and reports go under ignored `.scratch/`. For a shared browser cache, set `PLAYWRIGHT_BROWSERS_PATH` before both install and tests. The automated suite uses bundled Chromium with `channel: 'chromium'`; load desktop Chrome manually with the steps above.

Playwright routes synthetic HTTPS fixture pages into real tabs; no test claims provider playback or live-provider availability. Main workflows run the actual production extension, tabs API and Chrome local storage. Deterministic failed writes, missing titles and unknown observation provenance use a test-only extension copy replacing only the existing browser/persistence adapter, retaining all real UI/service code and actual local storage for accepted writes. No production testing hooks are present. The actual toolbar popup is opened with `chrome.action.openPopup()` and inspected through CDP because Playwright does not expose it as a Page. Other repeated fixture captures load the same popup UI in an extension tab. Public-command boundary tests control capture timing, failed persistence and conflicting/pending user state that cannot reliably be induced through normal capture alone.
