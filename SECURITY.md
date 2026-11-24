# Security

What this extension holds, where it reaches, and what a security check must look at. The rules shared by every app are in `../home/docs/factory/specs/security.md`; this page adds what is true of this app. Facts below were read from the code on `main` at `6e7c995`. When the code changes any of them, update this page in the same PR.

## What data the app holds

Everything stays in the browser's local extension storage (`chrome.storage.local`) on the user's machine. Nothing is synced or backed up by the extension. Read and written only in `extension/browser.js`.

| Storage key | What it holds |
|---|---|
| `library` | The whole Library: records (link, title, list, status, personal title, watch events), history, lists and organization settings, enrichment operations, and retained YouTube information (every version of title, description, channel, dates, duration) plus thumbnail image copies stored as image data. |
| `libraryDateFormat` | The date display preference. |
| `youtubeCredential` | The user's YouTube key (see the next heading). |

Retained information and images are not pruned automatically (`extension/enrichment-ui.js` shows their size to the user).

## Where keys are stored

The app ships no key. Each user brings their own YouTube key (`docs/specs/manual-youtube-enrichment.md`).

- **Entered** in the Library's YouTube setup, in a password-type field that is cleared as soon as Save is pressed (`extension/enrichment-ui.js`).
- **Passed** in an internal extension message to the background worker, which writes it (`extension/enrichment-service.js`, message `setYoutubeKey`).
- **Stored** in browser local storage under the key `youtubeCredential`, as the key plus a random revision id that changes on every save or removal (`extension/browser.js`).
- **Used** only in memory while a request is made: it goes in a request header, never in the address (`extension/youtube-provider.js`).
- **Never sent back** to the page: the settings view only learns whether a key is set (`configured`), not the key itself.
- **Removed or replaced** with Remove key or a new Save. A new revision id stops further requests made with the old key and rejects late answers to them (`extension/enrichment-service.js`, `extension/enrichment-operation-service.js`).

A key must never appear anywhere else: not in source, tests, logs, error messages, screenshots, evidence, tickets or commits. Tests use obviously fake placeholders.

## Outside addresses it may contact

Both requests are made only in `extension/youtube-provider.js`, only when the user asks (Test connection or Pull metadata), with browser cookies left out (`credentials: 'omit'`) and redirects refused (`redirect: 'error'`), and give up after 20 seconds.

| Address | What is sent | What comes back |
|---|---|---|
| `https://www.googleapis.com/youtube/v3/videos` | One video id, the list of fields wanted, and the user's key in the `X-Goog-Api-Key` header. | Title, description, channel, publication date, duration, thumbnail links. |
| `https://i.ytimg.com/` | A request for one thumbnail image. Any other host is refused, both when reading thumbnail links and when downloading. | The image, kept only if it is JPEG, PNG, WebP or GIF. |

No other address is contacted by the extension's code. Two things open pages without the extension fetching anything: the setup screen links to Google's setup instructions (`https://developers.google.com/youtube/data/getting-started`, opened by the user's click), and opening a video opens its saved link in a browser tab.

## Permissions and why each exists

From `extension/manifest.json`:

| Permission | Why |
|---|---|
| `tabs` | Read the current tab's link and title when saving it; open the Library page and saved videos in tabs; list and focus open tabs when opening a video (`extension/browser.js`). |
| `storage` | Keep the Library, the date preference and the YouTube key in local storage. |
| `unlimitedStorage` | Retained YouTube information and thumbnail copies can grow past the browser's default local storage limit. |
| Host `https://www.googleapis.com/*` | Fetch video information from the YouTube Data API. |
| Host `https://i.ytimg.com/*` | Download thumbnail images. |

Any new permission or host needs the owner's yes.

## The provider key shapes to scan for

One: the Google API key used for the YouTube Data API. In words: the fixed four-character prefix `AIza`, then 35 characters that are letters, digits, `-` or `_` (39 characters in all). As a pattern:

```text
AIza[0-9A-Za-z_-]{35}
```

The exact rule the scanner uses is settled in tracker #71 (this pattern is the commonly used one, not yet checked against the scanner's built-in rule).

Not in place yet:

- The commit hook that scans for this shape before each commit: tracker #71.
- The CI scans of each PR and of the built extension folder: tracker #71 (they need the CI from tracker #64).
- GitHub push protection and secret scanning: both off for this repo today; switching them on is the owner's step in tracker #71.
- Screenshots that always mask the key field: tracker #73. The field shows dots, but nothing masks it in captures yet.

## Anything the security pass must always check here

- The key stays inside its boundary: stored only under `youtubeCredential`, sent only in the header to `www.googleapis.com`, never in an address, message back to a page, log, error text, export, test or screenshot.
- Every `fetch` goes to one of the two addresses above, keeps `credentials: 'omit'` and `redirect: 'error'`, and the `i.ytimg.com` host check stays on both thumbnail paths.
- No request happens without a user action (no automatic requests after setup, save, restart or quota recovery).
- Text from YouTube and from saved pages (titles, descriptions, channel names) is inserted as text (`textContent`), never as markup (`innerHTML`).
- Thumbnails are kept only as checked image types.
- No code is loaded from outside the package: pages load only their own bundled scripts.
- `extension/manifest.json`: no new permission or host without the owner's yes.
- Removing or replacing the key still stops old requests and rejects their late answers.
