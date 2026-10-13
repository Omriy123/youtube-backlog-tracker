# OneTab and Session Buddy recovery behavior

Checked 2026-10-13 using official product pages and release notes. This note distinguishes restoring open tabs, reversing library edits, recovering a damaged local database, and surviving loss of a browser profile.

## Verified comparison

| Concern | OneTab | Session Buddy |
| --- | --- | --- |
| Main saved data | Browser-internal database, associated with a browser profile. | Local IndexedDB storage associated with a Chrome profile; collections, history, and settings are stored on the device. |
| History of open tabs | Current public help describes explicitly storing tabs and restoring groups; it does not establish automatic browser-session snapshots. | History captures open windows/tabs over time, with configurable snapshot checks and retention. It is distinct from saved collections. |
| Internal recovery | A v1 database may remain available as a migration fallback if v2 data is lost; this is an old-data fallback, not documented continuous version history. | Automatic local backups of collections and events since v4.1. Restore can use these or a backup file. |
| External recovery | Manual export/import; optional encrypted cloud backup/sync. | Manual Backup/Restore files include collections and history. Import/Export is for collections and excludes history. System backup can cover the underlying local folders. |
| Accidental library deletion | Current official pages checked do not establish trash, retention, or edit undo guarantees. | Homepage advertises recovering deleted items from automatic backup. August 2026 roadmap still lists collection/link deletion undo as planned. |
| Accidental move/reorder | Drag/drop and group merging are documented; persistent undo of those actions is unverified. | Link/folder movement is documented, but persistent undo or full collection version history is unverified. |
| Whole profile or device loss | Requires an external surviving copy: export, system/profile backup, or enabled cloud backup/sync and its encryption password. | Local history and internal backups are still browser-controlled; use a separate Backup file or system backup. Official materials describe cloud storage as still under development. |

The table is supported by the detailed citations below; unknown behavior is not evidence that the feature is absent.

## OneTab

OneTab stores data in the browser's internal database and treats Chrome profiles independently. Uninstalling removes the local data. The troubleshooting page recommends exports or its cloud backup/sync and says cloud users must retain their encryption password for recovery after reinstallation. It also documents fallback to retained v1 data if the newer v2 database is lost, and says v2 reached users around March 2026. The current feature set is available on Chrome, Edge, and Firefox, with Safari limitations. [Official troubleshooting](https://www.one-tab.com/troubleshooting)

Current help explicitly documents optional end-to-end encrypted cloud backup/sync using AES-256 and propagation of changes between devices. It also documents moving tabs/groups and merging groups. It does not specify cloud backup version retention, deleted-item restoration, or reversal of accidental moves. Consequently, sync alone should not be interpreted as a verified historical undo mechanism. [Official help](https://www.one-tab.com/help)

The homepage documents export/import and saved tabs surviving routine browser/computer restarts. [Official homepage](https://www.one-tab.com/)

**Opening a saved link:** the current official public help and store material checked did not establish the exact default removal behavior, setting names, modifier-key behavior, or locked-group behavior. Search results describing these details included third-party forks and user reviews; those were excluded. Treat the user's description of their own workflow as input, but do not label a default as independently verified without checking the installed version or further first-party documentation.

## Session Buddy

Each install belongs to a Chrome profile. Its data is in that profile's IndexedDB directory: a main LevelDB folder and, commonly, a companion blob folder. Both must be included when backing up those files. [Official data location](https://sessionbuddy.com/data-location-v4/)

History represents the state of **open tabs**, rather than an audit log of all edits to saved collections. The v4 release documents configurable snapshot frequency and retention, plus browser-close snapshots for session recovery. [v4 release](https://sessionbuddy.com/releases/4.0.0/)

Automatic backups of collections and events were introduced in v4.1, with recovery through the Restore dialog. [v4.1 release](https://sessionbuddy.com/releases/4.1.0/)

**Timing correction:** v4.1.2, released April 27, 2026, changed automatic backups to run when data changes instead of only nightly, with an experiment to revert that behavior. Do not present nightly backups as the current default. The release does not define exact delay, backup generation count, or retention guarantees. [v4.1.2 release](https://sessionbuddy.com/releases/4.1.2/)

The general reliability article still says internal backups can lag up to 24 hours; that timing conflicts with the newer specific release note. Its broader limitation remains relevant: internal backup data is browser-controlled and remains exposed to profile/site-data deletion, corruption, and browser problems. It describes automated downloads as under investigation and cloud storage as under development. [Official reliability discussion](https://sessionbuddy.com/data-reliability/)

The homepage explicitly advertises deleted-item restoration from automatic backup. However, the August 2026 roadmap still lists deletion undo for collections and links as planned. These are different recovery mechanisms. Neither source establishes a durable log of every move or a guaranteed window for recovering every deletion. [Homepage](https://sessionbuddy.com/), [Roadmap](https://sessionbuddy.com/roadmap/)

Manual Backup creates an external file containing collections and history; Restore can load it after reinstallation or on a different computer. Each backup operation creates a new file. [Backup and Restore](https://sessionbuddy.com/backup-restore/)

Import/Export handles collections, while Backup/Restore includes history. Restore avoids creating duplicate collections that were already restored and preserves collection dates and pins; Import creates new collections and resets those details. Therefore, restoring a backup should not be assumed to rewind all edits to existing collections. [Restore semantics](https://sessionbuddy.com/restore/)

For protection outside extension-managed storage, the product recommends adding its local data folders to scheduled system backups. A file-level restore replaces the current local dataset, so its documented procedure preserves newer data separately before restoring the old folders. [Local backup and restore](https://sessionbuddy.com/backup-restore-advanced/)

## Design implications (inferences, not competitor guarantees)

For the video backlog, “recovery like OneTab and Session Buddy” needs separate decisions:

1. **Undo/recently removed:** restore a mistakenly removed video or its previous queue and position after a move.
2. **Local library snapshots:** return to an earlier library state after a bad batch edit or partial corruption.
3. **External backup:** survive extension removal, profile loss, or device failure using a separately retained file or cloud copy.

Open-tab history does not automatically provide queue-edit history. A second database in the same browser profile is not a backup against losing that profile. Sync needs explicit history/retention semantics before promising recovery from accidentally synced changes. Neither product's public documentation establishes the exact move-undo contract this backlog may need.
