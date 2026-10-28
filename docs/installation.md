# Install and try the test build

Use the **unpacked trial folder** you received. It contains `extension/`, `INSTALLATION.md`, and `README.txt`. Extract it first if it arrived as a ZIP. Keep that folder in place while Chrome uses the extension.

1. In desktop Chrome, open `chrome://extensions` and turn on **Developer mode**.
2. Select **Load unpacked** and choose the `extension/` folder inside the unpacked trial folder.
3. Pin **Video Backlog Tracker** from Chrome's Extensions menu.

## Try save, find, open, and Undo

1. Open a video page or another HTTP(S) page. Click the extension's toolbar icon, then **Save to Inbox**. Wait for **Saved to Inbox** or **Already saved**.
2. Select **Open Library**. Find the saved video in Inbox, or search for its title or URL.
3. Select its title or **Open video**. Chrome opens a new tab and the video is marked watched and removed from Inbox. Return to the Library and select **Undo opening** to restore its earlier Inbox placement. Undo leaves the opened tab in place.

Data stays in this Chrome profile. Removing the extension or clearing its storage loses this trial data; this build has no backup or export. Opening a tab does **not** verify playback.

## Update an existing installation

1. Unpack the new trial build if it arrived as a ZIP. Open its `extension/` folder and copy everything inside it.
2. Paste those files into the **same `extension/` folder you originally loaded in Chrome**, replacing files when prompted. Keep that folder in the same location.
3. Open `chrome://extensions`, find **Video Backlog Tracker**, and click its **Reload** button.

There is no need to select **Load unpacked** again. Keep the existing extension installed to retain its local trial data. If your extension already runs directly from a folder whose files have been updated, just click **Reload**.

## More detail

- [Organize your Library](library-organization-guide.md): watch lists, sorting, channels, selection, moving and recovery.
- [First-slice behavior reference](first-slice-reference.md): identity, review, titles, and opening recovery.
- [Development and validation commands](development.md): building the supplied folder and running checks. These are for the person preparing the build; they are not needed to install it.
- [First-slice validation evidence](validation/first-slice.md): installed Chrome results, screenshots, and evidence limits.
