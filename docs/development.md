# Development and validation

Build a portable unpacked folder with Node 24 or newer:

```powershell
npm run build
```


`npm run build` prints a new `.scratch/build/video-backlog-tracker-…/` folder containing `extension/`, `INSTALLATION.md`, and `README.txt`. Copy the whole folder before sharing it. The receiver installs the `extension/` folder and needs no Node installation.

For user-facing steps, see the installation guide. For feature behavior, see the [organization guide](library-organization-guide.md) and [capture/opening reference](first-slice-reference.md). The [integrated validation report](validation/library-organization.md) records checks and evidence limits.

## Handoff for human testing

Prepare a fresh handoff each time a human receives a new test build:

1. Run the checks appropriate to the changed behavior using the commands below. Record actual results and any manual checks still needed.
2. Run `npm run build` and use the exact output folder it prints. Confirm the packaged `extension/manifest.json` version and included `INSTALLATION.md`; identify the source revision as well, since development builds can share a manifest version.
3. Give the tester the whole portable folder or an archive of it, with a clickable location. Use the [installation guide](installation.md) for first installation or updating the existing loaded folder. State which route applies, whether files need copying, and the exact source/destination paths when known. Reload the extension and close/reopen its Library views after an update. Retain the installed extension and its storage to preserve trial data.
4. Send a short handoff using the template below. Include a few actions with expected results for this build's changes, plus the location of any relevant setting. Separate known limitations from behavior the tester should report as a failure.

```text
Build: <manifest version>, source <revision>
Get it: <clickable artifact location; extract first if archived>
Install/update: <concrete steps for this tester, including copy paths and Chrome Reload>
Try:
- <action> → <expected result>
- <action> → <expected result; setting location if relevant>
Known limits / data notices: <material limitations and any effect on existing trial data>
Verified: <checks actually run; what still needs human testing>
Feedback: <what happened versus what you expected; screenshot if useful>
```

Keep the tester's steps self-contained and brief; link the guides for detail. Describe a build as ready for testing separately from human acceptance or approval to merge.

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

To run the browser test suite against installed desktop Chrome, set `CHROME_PATH` to its executable before `npm run test:browser`. The shared test launcher uses the same isolated-profile CDP registration as `validate:chrome`; without this variable it uses bundled Chromium. For example, `$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'`. Physical mouse/trackpad comfort and manual installation still require a human walkthrough.
