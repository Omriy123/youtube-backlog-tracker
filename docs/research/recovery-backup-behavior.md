# Automatic recovery backups: OneTab, Session Buddy, and Chrome

Evidence checked **2026-10-17** against official product documentation and Chrome documentation. Focus: backups created without a user requesting each backup. This supplements [the earlier recovery comparison](tab-manager-recovery.md); it records research, not an approved Library retention policy or implementation choice.

## OneTab

- **Free/local behavior:** saved tabs live in a browser database belonging to a profile. Uninstalling deletes that local data. OneTab recommends regular exports, existing system/profile backups, or its optional cloud service for data-loss protection. Its v2 migration fallback can offer recovery from retained v1 data after v2 storage loss; this is an old-data fallback, not documented continuous snapshots. The page dates the v2 rollout to around March 2026. [Troubleshooting](https://www.one-tab.com/troubleshooting)
- **External files:** import/export is documented, but the checked public pages do not establish an automatic file-export schedule. That is an evidence gap, not proof the installed app has no such capability. [Homepage](https://www.one-tab.com/)
- **Paid cloud behavior:** Backup & Sync explicitly runs automatically after setup. Each change is encrypted and stored on the server, and offline changes sync on reconnection. Saved tabs and settings are covered; open tabs and browsing history are excluded. Connecting each browser/profile requires a deliberate setup step. New-machine recovery uses the license and encryption keys; optional server custody permits email recovery. The service describes backup and sync as the same mechanism. [Backup & Sync](https://www.one-tab.com/sync)
- **Retention and restoration unknowns:** the checked official pages do not specify automatic local snapshot retention, historical cloud versions, deleted-item retention, a rewind operation, an automatic snapshot before restoration, or undoing a restoration. Automatic synchronization alone does not establish point-in-time recovery. [Help](https://www.one-tab.com/help), [Backup & Sync](https://www.one-tab.com/sync)
- **Documented restore safeguard:** OneTab's Firefox profile recovery instructions require copying the current profile before replacing it and warn that newer profile data will be removed. This is a user-performed safeguard in a browser-profile workflow, not evidence of an automatic in-app safeguard. [Firefox recovery](https://www.one-tab.com/firefoxRestore)

The newer paid cloud service is relevant comparison evidence; it does not select cloud sync for this project's current scope.

## Session Buddy

- **Two different automatic mechanisms:** History records open windows/tabs, with configurable change checks and retention; the v4 release also documents snapshots on normal or unexpected browser shutdown. This is separate from backups of saved collections. [v4 release, March 13, 2024](https://sessionbuddy.com/releases/4.0.0/)
- **History retention evidence:** v4.0.2 added a `Never` scheduled-check option and longer retention choices of 100 years, 1,000 events, and 2,000 events. These are documented options introduced then, not a verified complete current menu or default policy. They do not establish backup-generation retention. [v4.0.2 release, March 23, 2024](https://sessionbuddy.com/releases/4.0.2/)
- **Automatic local data backups:** v4.1 introduced automatic local backups of collections and events and a Restore-dialog option to recover from an automatic backup. [v4.1 release, October 26, 2025](https://sessionbuddy.com/releases/4.1.0/)
- **Current timing correction:** v4.1.2 changed automatic backup to run when data changes instead of only nightly, with an experiment to revert it. Exact delay, generation count, and backup retention are unspecified in this release note. [v4.1.2 release, April 27, 2026](https://sessionbuddy.com/releases/4.1.2/)
- **Conflicting general guidance:** the reliability page still warns about up to 24 hours of backup lag. The newer, version-specific change above prevents treating nightly backup as the current default. The general page establishes that automatic copies remain under browser control and exposed to data clearing, quotas, and browser bugs. It describes automatic download backups as under investigation rather than documenting an available scheduler. [Preventing Data Loss](https://sessionbuddy.com/data-reliability/)
- **External files:** Backup is a manual gear-menu operation producing a new file containing collections and history each time, with a destination picker or Downloads fallback. Restore checks the file and displays counts before the user proceeds; repeated restoration avoids duplicates of already-restored data. [Backup and Restore](https://sessionbuddy.com/backup-restore/)
- **Restore is not a verified rewind:** Restore preserves collection dates and pins and adds collections not already restored; Import creates new collections and omits history. These semantics do not establish replacement of all current edits with an older state. [Restore](https://sessionbuddy.com/restore/)
- **External automation and safeguards:** official guidance recommends scheduled system backup of the data folders. File-level restoration replaces all current Session Buddy data; it instructs users to back up newer data first, close the browser completely, restore whole folders, then re-import newer data. Renaming/moving current folders is offered as a safer alternative to deletion. This safeguard is manual. [Back Up and Restore Local Data](https://sessionbuddy.com/backup-restore-advanced/)
- **Undo and future versions:** the August 2026 roadmap still lists collection/link deletion undo as planned. Neither that item nor the checked restore documentation establishes automatic pre-restore backups or undoing a restore. The release index marks v4.2 as coming soon; its opt-in paid cloud collections must not be presented as a generally released local-backup feature. [Roadmap](https://sessionbuddy.com/roadmap/), [Release index](https://sessionbuddy.com/releases/), [v4.2 preview](https://sessionbuddy.com/releases/4.2.0/)

## Chrome: external automatic backups are feasible, with limits

Chrome's extension Downloads API programmatically starts and monitors downloads with the `downloads` permission. A suggested filename can include subfolders inside the configured Downloads directory; arbitrary absolute paths and parent traversal are rejected. A Save As picker is optional. Completion is observable separately from download initiation. This supports the feasibility of an automatically initiated backup file; it does not verify a particular implementation, maximum backup size, schedule, or universally prompt-free behavior. [Downloads API](https://developer.chrome.com/docs/extensions/reference/api/downloads)

Chrome lets users change their default download directory and choose whether to ask where each file should be saved. Its help also documents automatic-download settings for sites; that does not establish how every setting applies to extension-initiated downloads. The precise interaction between extension options, settings, and managed policies needs browser validation. [Chrome download help](https://support.google.com/chrome/answer/95759?hl=en)

File System Access is another permission-dependent capability: users initially select/grant access, and Chrome 122 introduced optional persistent permission. Stored handles alone do not prove permission remains granted. These web-platform docs do not establish unattended extension-background operation in this project's target environment. [File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), [Persistent permissions](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)

## Planning implications and untested boundaries

These are inferences for product planning, not competitor guarantees:

- Automatic Library snapshots and automatic external backup files address different failures. A second copy inside the same profile cannot establish protection against losing that profile.
- A downloaded file outside extension storage can survive extension/profile removal if that file is retained. A file on the same device alone cannot establish protection against device loss; a surviving copy elsewhere is needed.
- Automatic backup should describe when a verified copy was last completed, its recovery coverage, and any blocked automation. Starting a download alone does not prove recovery is available.
- Cadence, retention, default behavior, destination setup, recovery after a missed run, and an automatic safeguard before Library restoration remain product decisions. The competitor docs do not supply a complete policy to copy.

No extensions were installed or exercised. No backup/restore, large-file, browser-restart, disabled-extension, disk-full, settings/policy, profile-loss, or device-loss tests were performed. Retention and pre-restore/undo guarantees not explicitly documented above remain unverified. No implementation technology is selected; Chrome-specific boundaries must respect [ADR 0004](../adr/0004-chrome-first-with-shared-browser-design.md).

## Follow-up: Chrome account sync is not a complete Library backup

Checked **2026-10-17**. Chrome can remember extensions and selected settings in a Google Account; that does not mean every extension's entire database is automatically uploaded or versioned. Google's account-help page lists Extensions among saved categories and lets users choose what to save. [Chrome account data](https://support.google.com/chrome/answer/165139)

The extension developer explicitly chooses storage areas:

| Area | Documented behavior |
| --- | --- |
| `storage.local` | Machine-local persistent data; 10 MB default quota, expandable with `unlimitedStorage`; cleared on extension removal. |
| `storage.sync` | Requires enabled Chrome Sync and signed-in browsers; otherwise local. Offline updates sync on reconnection. Limits: 102,400 bytes total, 8,192/item, 512 items, 120 writes/minute, 1,800/hour. |
| `storage.session` | Memory-only; cleared on browser restart and extension disable/reload/update. |

Developers choose local/sync writes; exceeding quotas fails. Persistent local storage should survive normal restart. API data survives cache/history clearing. [Extension Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)

A Chrome profile is a local subdirectory inside the user data directory; `chrome://version` exposes its path. It is distinct from the account service. [Chromium profile-directory documentation](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md) Removing a Chrome profile erases its local bookmarks, history, passwords, and other settings. Combined with machine-local extension storage, this makes profile-directory loss a recovery concern unless a surviving external copy exists. [Manage Chrome profiles](https://support.google.com/chrome/answer/2364824?hl=en)

**IndexedDB and browsing-data qualification:** extension-origin IndexedDB is another persistent storage option; the checked docs do not describe it as automatically synced. Chrome's dedicated storage-and-cookies page says extension-origin web storage, including IndexedDB and Local Storage, survives clearing browsing data, while noting quotas and rare eviction unless protected. Host-page storage accessed by a content script belongs to that host page. There is an official-documentation inconsistency: the Storage API overview separately warns that Web Storage can be lost on history clearing. Do not generalize either statement into a claim that ordinary history clearing wipes all extension databases. [Storage and cookies](https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies), [Storage API overview](https://developer.chrome.com/docs/extensions/reference/api/storage)

**Sync is mutable, not documented historical recovery.** Sync supports replacing/removing/clearing data; inference: erroneous app changes can spread. Historical rollback and server-side retention after uninstall are unverified. Chrome help documents account-data deletion and says changing a custom passphrase deletes its encrypted server data. [Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage), [Account-data deletion](https://support.google.com/chrome/answer/185277?hl=en), [Passphrase reset](https://support.google.com/chrome/answer/165139)

Concrete recovery cases follow from these boundaries:

- **Extension removal:** documented deletion of `storage.local` makes an external surviving backup useful.
- **Profile deletion, device loss, or disk failure:** machine-local copies share that failure domain; a copy retained elsewhere is needed.
- **Database corruption or unsuccessful writes:** competitor reliability docs describe real local-storage failures; storage quotas can also reject writes. No frequency or guaranteed browser immunity is established here.
- **Mistaken edits or deletion:** even healthy storage and successful sync can retain/distribute the unwanted latest state. Recovering an earlier Library state requires retained versions rather than only a current-state copy.

These cases explain why backups matter without suggesting that restarting Chrome normally destroys saved data. Database-failure details are supported by the competitor sources above; profile/device and mistaken-edit implications are engineering inferences from the documented storage boundaries.

### Choosing local and cloud destinations

The user's follow-up accepts automatic versioned cloud backups and requests destination choice including Google Drive and local storage. That direction is distinct from Chrome's existing sync behavior; this research does not claim it is implemented.

A user-selected local directory requires initial picker/permission interaction; later writes require retained authorization, with optional persistent permission in modern Chrome. The local filesystem capability does not itself grant access to arbitrary cloud services. [File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), [Persistent permission](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)

Google Drive is a separate authorized integration. Its `drive.file` scope supports creating files and accessing files the user shares with the app; long-term API access requires renewable authorization. Its hidden app-data folder is a different option requiring its own scope, and users can delete it. These sources establish possible destinations, not a selected design or automatic historical retention policy. Other cloud providers would need their own documented integration. [Drive authorization](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [Drive app data](https://developers.google.com/workspace/drive/api/guides/appdata)

No sync, uninstall/reinstall, passphrase-reset, permission-persistence, or provider-integration tests were run. Exact deletion propagation and recovery behavior for a chosen extension/version must be validated before promising protection.
