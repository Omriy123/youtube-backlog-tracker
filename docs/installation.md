# Install and try the first test build

Use the **unpacked trial folder** you received. It contains `extension/`, `INSTALLATION.md`, and `README.txt`. Extract it first if it arrived as a ZIP. Keep that folder in place while Chrome uses the extension.

1. In desktop Chrome, open `chrome://extensions` and turn on **Developer mode**.
2. Select **Load unpacked** and choose the `extension/` folder inside the unpacked trial folder.
3. Pin **Video Backlog Tracker** from Chrome's Extensions menu.

## Try save, find, open, and Undo

1. Open a video page or another HTTP(S) page. Click the extension's toolbar icon, then **Save to Inbox**. Wait for **Saved to Inbox** or **Already saved**.
2. Select **Open Library**. Find the saved video in Inbox, or search for its title or URL.
3. Select its title or **Open video**. Chrome opens a new tab and the video is marked watched and removed from Inbox. Return to the Library and select **Undo opening** to restore its earlier Inbox placement. Undo leaves the opened tab in place.

Data stays in this Chrome profile. For updates, replace the files in the **same unpacked installation folder** and select **Reload** on `chrome://extensions`. Removing the extension or clearing its storage loses this trial data; this build has no backup or export. Opening a tab does **not** verify playback.

## More detail

- [First-slice behavior reference](https://github.com/Omriy123/youtube-backlog-tracker/blob/feat/first-end-to-end-slice/docs/first-slice-reference.md): identity, review, titles, and opening recovery.
- [Development and validation commands](https://github.com/Omriy123/youtube-backlog-tracker/blob/feat/first-end-to-end-slice/docs/development.md): building the supplied folder and running checks. These are for the person preparing the build; they are not needed to install it.
- [First-slice validation evidence](https://github.com/Omriy123/youtube-backlog-tracker/blob/feat/first-end-to-end-slice/docs/validation/first-slice.md): installed Chrome results, screenshots, and evidence limits.