# Install and try the first test build

This unpacked Manifest V3 extension delivers Save to Inbox and Library/search (#41), real single-video opening with persistent Undo and recovery (#42), pending rediscovery review and URL variants (#43), and Personal titles with retained captured-title inspection/search (#44). The source folder is the runnable build; no compilation or API key is needed.

For a portable trial folder, run `npm run build` with Node 24 or newer. The command prints a fresh `.scratch/build/video-backlog-tracker-…/` folder containing `extension/`, `INSTALLATION.md` and a short README. Copy that whole folder wherever you want to keep the build, then select its `extension/` directory in step 2. If received as a ZIP, extract it first and keep the unpacked folder in place while Chrome uses it. No `node_modules` or Node installation is needed to use the extension itself.

1. Open `chrome://extensions` in desktop Chrome and enable **Developer mode**.
2. Choose **Load unpacked**, then select this repository's `extension/` directory (not the repository root).
3. Pin **Video Backlog Tracker** from Chrome's Extensions menu.
4. Open a video or other HTTP(S) link. Click the toolbar extension, then **Save to Inbox**. Wait for **Saved to Inbox** or **Already saved**. The source tab stays open.
5. Choose **Open Library** explicitly. Search beneath the Inbox heading using any captured title or the saved URL. Closing/reopening the Library or restarting Chrome preserves saved records.
6. Click a saved title or **Open video**. A new focused tab opens at the first saved URL, including its saved timestamp/playlist/fragment context. The source and Library tabs stay open. Successful tab creation marks the video watched and removes it from Inbox; playback is not verified.
7. Return to the Library and choose **Undo opening** to restore the most recent opening's prior active placement and relevant dates. The created tab stays open. Undo remains available after closing/reopening the Library and restarting Chrome, provided later relevant user decisions have not made reversal unsafe.
8. To update an existing trial, replace files in its existing unpacked folder and choose **Reload** on the extensions page. Keep that installation/folder rather than removing it or switching to a different folder. Extension removal or clearing extension storage deletes this local test collection; this build has no backup/export or migration UI.

The extension requests `tabs` to read the current tab's URL and browser title and `storage` for its local Library. It has no host permissions, content scripts, provider requests, DOM scraping or API credentials. Captured titles are browser observations, with their observation time; they are not verified current provider metadata. Chrome may supply a URL-shaped browser title for an untitled page. Thumbnail, channel, duration and publication date remain explicitly unknown.

Save confirmation follows the coherent storage write. A failed write displays a failure and keeps the previously committed Library. Retry explicitly; do not interpret action failures as evidence that a video was deleted/private. All records and metadata observations remain local to the Chrome profile; this test build does not sync them.

## Bounded identity and opening context

Identity recognition describes URL syntax, not playback availability. It never merges similar titles or different upload IDs.

| Input | Record identity |
| --- | --- |
| `http(s)://youtube.com/watch?v=M7lc1UVf-VE` on exact hosts `youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com` | YouTube upload `M7lc1UVf-VE`; exactly one valid 11-character `v` parameter required. Timestamp, playlist/index and other context do not create a second record. |
| `/embed/M7lc1UVf-VE`, `/shorts/M7lc1UVf-VE`, `/live/M7lc1UVf-VE` on those same YouTube hosts | Same upload; optional terminal slash, no competing `v` query parameter. Shorts/live recognition describes the route, not a video's format or current availability. |
| `http(s)://youtu.be/M7lc1UVf-VE?t=120` | Same upload. Exactly one 11-character path segment, optional terminal slash, no competing `v` query parameter. Other short-link hosts stay generic. |
| `http(s)://twitch.tv/videos/335921245` or `www.twitch.tv`, optional terminal slash/time query | Twitch VOD positive decimal identity `335921245` (no leading zero); no competing `video`, `channel` or `clip` query target. |
| `http(s)://player.twitch.tv/?video=v335921245&parent=example.org` | Same VOD, with one `video` parameter (bare decimal `335921245` also accepted), no `channel` or `clip` target; root path only. First saved embed/parent/time context is retained. |
| Other HTTP(S) URLs | Conservative full-URL identity after standard URL parsing. Query, fragment and path remain identity-significant. Exact repeats merge; different links stay separate. |
| Repeated/conflicting identity parameters, path-ID with competing query-ID, malformed ID, channel/search/playlist-only, Twitch channel/clip, lookalike host, nonstandard port, or unlisted provider route/host | Generic full-URL fallback, never a manufactured known-upload match. Same-value repeated identity parameters also stay generic. `youtube-nocookie.com` and mobile Twitch hosts are unlisted. Standard URL parsing canonicalizes default ports; nonstandard ports stay generic. |
| Browser/internal/extension/file/javascript URLs or credentials embedded in a URL | Rejected; no record is saved. |

The first saved URL remains unchanged on all repeat saves, preserving its initial timestamp/playlist/fragment context for Open. Different references to a recognized upload do not overwrite that context or create watch events. Active duplicates preserve placement, order, user dates and pending review. All accepted browser-title observations, including missing titles and unchanged repetitions, are retained separately from user History. Title display uses Personal, then first usable automatic Original, then usable Latest, then saved URL.

## Rediscovery review

Save a watched or dismissed link again to return the **same record** to Inbox immediately. **Saved to Inbox — review pending** confirms durable placement. The popup and Inbox row offer **Review prior activity** with previous status, destination, activity dates and retained watch events. Unknown details remain unknown. Watched means opened from the tracker; it does not prove playback. Open Library views refresh on local changes while preserving their search and title scopes.

**Cancel**, Escape or closing the popup leaves review pending. **Keep in Inbox** clears review without another list entry, watch event or browser tab. Choose Open or Edit again afterward. **Dismiss** removes active membership and retains prior history and watches. A failed decision stays visible in its dialog and preserves the last committed review; retry explicitly or cancel. A stale dialog must be closed and reopened before deciding. Re-saving an already pending Inbox row reports **Already saved — review pending**, preserving its original pending details and dates.

First saved and the original First Inbox-exit stay fixed. Actual requeue advances Latest list-entry; Keep does not. Pending rows remain searchable and title inspection stays available, while Open and Personal title editing require review first. Earlier opening Undo cannot overwrite requeue/Keep/Dismiss; Undo after a new post-Keep opening restores the resolved Inbox state and earlier watches. Pending details and decisions survive Library reopening and browser restart. Broader destinations, capture sources, organization and explicit status controls remain outside this build.

## Complete trial walkthrough

1. Save one HTTP(S) video page, then use **Edit Personal title** to give it a recognizable name. Save the same link again after its browser title changes; your Personal title and first captured Original remain separate from the new observation.
2. Search an earlier captured title. The matching row keeps your normal display title; use the dated match excerpt or **Titles → History** to inspect the retained observation and browser source/time. Clear Personal title when desired to return to Original/Latest/URL fallback.
3. Open the video from the Library. Verify a new focused tab and the watched removal from Inbox. Return to the source page and save again: the same record returns immediately with **Review prior activity**. Inspect previous placement, dates and retained watches; Cancel or Escape leaves it pending. Search and Titles still work while pending.
4. Close/reopen the Library or restart Chrome. Pending review remains. Choose **Keep in Inbox**; no tab opens. Choose **Open video** separately to open it a second time.
5. Restart Chrome and open the Library. **Undo opening** restores the reviewed Inbox state, retains the first watch and every captured title, and leaves existing browser tabs alone. It does not revive the resolved review.
6. Open again, save again and choose **Dismiss** in the review. The record leaves active Inbox. Save it once more to inspect the retained dismissal and earlier watches; choose Keep or Dismiss explicitly. Requeue, review and later Personal edits protect against an older Undo overwriting those decisions.

The automated combined walkthrough uses controlled title changes and exercises Enter/Escape and a 390-pixel Library viewport. For your own trial, no page title change or provider API is required; repeated equal observations are retained too. See the validation report in the repository (`docs/validation/first-slice.md`) for actual results and screenshots. This first-slice build does not start the later recovery/enrichment real-use review clocks.

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

On Windows, use `npm.cmd` / `npx.cmd` in place of `npm` / `npx` if PowerShell's script policy blocks their `.ps1` launchers.

```powershell
npm ci
npx playwright install chromium
npm test
```

`npm test` runs the public Library command/browser-boundary checks and the installed-extension Playwright workflows. `npm run test:browser` and `npm run test:boundary` run those separately. Browser profiles, failure-fixture extension copies, screenshots and reports go under ignored `.scratch/`. For a shared browser cache, set `PLAYWRIGHT_BROWSERS_PATH` before both install and tests. The automated suite uses bundled Chromium with `channel: 'chromium'`; load desktop Chrome manually with the steps above.

To repeat the complete production-extension path in installed Chrome, run:

```powershell
# Optional when Chrome is installed somewhere else:
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run validate:chrome
```

The command creates a fresh isolated profile under `.scratch/validation/actual-chrome/`, saves five screenshots and `result.json`, and runs two full browser-process restarts. It never uses your personal Chrome profile. Its default executable is the Windows path above; set `CHROME_PATH` for another installation. Set `EXTENSION_PATH` to a packaged `extension/` folder to validate that artifact instead of repository source. Run from the repository root after `npm ci`.

On the validated Chrome 155 build, automation uses CDP `Extensions.loadUnpacked` with `--enable-unsafe-extension-debugging` and removes Playwright's extension-disabling default. That automation registration must be repeated on each launch; the isolated profile's stored Library survives. This verifies data persistence, not manual Developer-mode registration persistence. Chrome's removed `--load-extension` flags are not required by this script; the primary human installation remains **Load unpacked** on `chrome://extensions`. Screenshots show the real extension UI in headless desktop Chrome; synthetic HTTPS fixture pages establish capture/tab behavior, not provider playback or availability.

Playwright routes synthetic HTTPS fixture pages into real tabs; no test claims provider playback or live-provider availability. Main workflows run the actual production extension, tabs API and Chrome local storage. Deterministic failed writes, missing titles and unknown observation provenance use a test-only extension copy replacing only the existing browser/persistence adapter, retaining all real UI/service code and actual local storage for accepted writes. No production testing hooks are present. The actual toolbar popup is opened with `chrome.action.openPopup()` and inspected through CDP because Playwright does not expose it as a Page. Other repeated fixture captures load the same popup UI in an extension tab. Public-command boundary tests control capture timing, failed persistence and conflicting/pending user state that cannot reliably be induced through normal capture alone.
