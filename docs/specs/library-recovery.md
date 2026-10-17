# Library recovery, snapshots, and backups

Design status: **complete contract approved on 2026-10-17**, including the marked builder defaults and real-browser testing boundary. [Recorded complete approval](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238845753). No production implementation or delivery breakdown is approved by this document.

Planning question and live decision record: [Specify broader recovery retention, conflicts, snapshots, and backup restoration](https://github.com/Omriy123/youtube-backlog-tracker/issues/23). Parent: [approved product design](video-backlog.md). Preserve the [first-slice contract](first-end-to-end-slice.md), [feature ownership](../design/feature-map.md), and [glossary](../../GLOSSARY.md).

## Problem Statement

Make accidental Library changes recoverable, keep recovery points across restarts, and provide a surviving copy when extension-local data is lost. Recovery covers Library data; it does not reopen or close browser tabs, verify playback, or reinterpret third-party tab-manager exports.

The user needs to recover both recent mistakes and an earlier whole Library without silently overwriting later decisions. The first-slice Undo-opening contract establishes a narrow starting point; broader history, snapshots and complete restoration need a shared contract that later workflow tickets can build from.

## Solution

Specify persistent step-by-step Undo, safe selected-action recovery, whole-Library restoration, automatic/manual local snapshots, manual backup download/upload, and optional automatic versioned Google Drive backups. Later destinations and live synchronization between installations remain deferred. This contract can produce several vertical delivery tickets when relevant recovery scope is selected and its breakdown agreed; the first-slice build remains the earlier usable milestone.

The new decisions explicitly revise two older boundaries: the 30 changed-day daily-snapshot retention cap is removed, and versioned Google Drive backup is added to the planning scope. The existing first-slice Undo-opening rules and Q54 provenance contract remain binding.

## User Stories

1. As the user, I want Undo to survive restarting Chrome, so that recovery is not limited to the current session.
2. As the user, I want History to show prior destinations and action times, so that I can understand an accidental change.
3. As the user, I want to reverse one selected action, so that unrelated later work remains intact.
4. As the user, I want a batch recovered as one action, so that a partially reversed batch does not leave an unexpected mixture.
5. As the user, I want conflicting later decisions explained and protected, so that selective recovery never silently overwrites them.
6. As the user, I want to reverse the second move and then the first, so that I can safely work backward through dependent changes.
7. As the user, I want recovery to offer recreation of a missing watch list or an explicit alternate destination, so that placement is never guessed.
8. As the user, I want recovery to preserve record identity, placement dates and compatible order, so that my Library remains coherent.
9. As the user, I want an opening correction to preserve earlier watch events and existing browser tabs, so that it affects only the Library action being corrected.
10. As the user, I want authored titles restored separately from automatic metadata, so that stale provider values never replace my decisions.
11. As the user, I want the Library restorable even when automatic metadata is missing, so that links and organization remain usable.
12. As the user, I want automatic daily recovery snapshots on changed days, so that recovery points exist without manual work.
13. As the user, I want a safety snapshot before imports and full restoration, so that those operations have a route back.
14. As the user, I want to save and optionally name a manual snapshot, so that I can identify a deliberate checkpoint.
15. As the user, I want history and all snapshot kinds retained until deliberate deletion, so that an arbitrary age or count limit does not remove recovery.
16. As the user, I want storage usage and failures visible, so that capacity problems do not cause silent pruning or false success.
17. As the user, I want to restore a retained whole-Library point, so that I can reverse later user changes together.
18. As the user, I want restoration validated and previewed before confirmation, so that I understand the result and invalid files cannot damage the Library.
19. As the user, I want an outdated preview refreshed when the Library changes, so that I confirm the state actually being restored.
20. As the user, I want full restoration to complete coherently or preserve current state, so that interruption cannot create partial data.
21. As the user, I want easy Undo restoration immediately and after restart, so that choosing the wrong backup is itself recoverable.
22. As the user, I want pre-restore state and recovery history preserved, so that restoring older data does not erase my only route back.
23. As the user, I want Download backup to create a portable file only on request, so that the extension does not automatically save files into my computer's Downloads folder.
24. As the user, I want Upload backup to restore a complete Library into a current or fresh installation, so that an external copy can recover local data loss.
25. As the user, I want complete backups to include retained user and recovery information but exclude credentials, so that restoration does not depend on copying account secrets.
26. As the user, I want Google Drive backup to be an optional explicit connection, so that the Library also works locally without an account connection.
27. As the user, I want automatic versioned backups within five minutes when available, so that I do not have to request every backup.
28. As the user, I want interrupted backups to catch up and report their coverage, so that I know which changes have a completed external copy.
29. As the user, I want older completed backup versions kept until explicit deletion, so that failed uploads or later mistakes do not remove the last good copy.
30. As the user, I want to select a cloud backup for deliberate restoration, so that connection alone does not replace local work or overwrite surviving backups.
31. As the user, I want upload failures to preserve otherwise-safe local saving, so that a cloud outage does not make the Library unusable.
32. As the user, I want disconnection and backup deletion to be distinct, so that stopping future uploads does not erase existing recovery copies.
33. As the user, I want actionable backup health instead of repeated healthy-state reminders, so that I can address real gaps without unnecessary prompts.
34. As the owner building the extension, I want a temporary development reminder 28 days after real recovery use begins, so that I revisit retention using the built app's evidence.
35. As the owner building the extension, I want that reminder linked to a tracked review and excluded from production, so that the development checkpoint does not become a user-facing product feature.
36. As the owner building the extension, I want retention changes to require an explicit later decision, so that the review itself cannot trigger deletion.

## Implementation Decisions

### Recoverable state and provenance

- Preserve one record per underlying upload and at most one active destination. Inbox and Backlog remain permanent; watch-list identities and arrangements remain recoverable.
- Recovery includes saved links/identity and factual acquisition provenance; list names, importance and manual order; membership, lifecycle and pending user decisions where the producing feature supports them; personal titles; first-save/Inbox-exit/list-entry dates; watch events; and user action/correction history.
- Recover the changes made by the selected action. Reversing an opening reverses only that opening's watched marking/event and restores its prior placement, order, status and relevant dates. Earlier watch events remain. Browser tabs remain as they are.
- Whole-Library restoration returns user-controlled state to the chosen point. Preserve the later recovery trail and the restoration/correction audit so the user can reverse the restoration or recover a later retained point. Do not replace the only record of the pre-restore Library with the uploaded history.
- Automatic metadata is resolved to its latest valid value or missing. Older snapshots/files must not revive stale observations, expired provider values, or overwrite a personal title. Preserve source and observation times; importing/copying a field does not establish independent authorship.
- A complete backup guarantees the user-controlled Library and recovery data, not indefinite copies of automatic metadata. The current slice adds no provider enrichment. Future provider/import specs must establish source lifetime and historical-copy treatment before those payloads enter history, snapshots, or backups. Restore must work with URL/personal-title fallback when automatic fields cannot be used.
- Storage representation, record/version identifiers, compaction, and the choice of baseline-plus-changes versus full copies belong to implementation planning. They must preserve all retained recoverable points without silently reducing coverage.

### History, Undo, and selective recovery

- Every implemented user mutation must preserve enough information for recovery: saves, authored edits, placement/order/status changes, list changes, batches, imports, and restoration. This contract does not implement those producing features early. Search, navigation, selection and automatic metadata refresh do not become user-data changes merely to support recovery.
- Retain detailed change history indefinitely until an explicitly approved deletion. There is no action-count or age cutoff. Preserve prior placement information and durable watch/dismissal facts.
- Expose the latest user-change Undo and selected-action recovery through History. Keep the first-slice most-recent-opening Undo behavior available and safe; broader History recovery extends it.
- Show action time/type, affected videos/lists and enough prior/resulting state to understand the correction. A selected batch is one recovery action. Do not offer arbitrary field-by-field reconstruction.
- Preserve unrelated later edits. If a later user decision conflicts with reversal, explain it and apply none of that selected action/batch. Automatic metadata changes and unrelated browsing do not invalidate otherwise-safe recovery.
- Sequential reversal must work: for A -> B -> C, first reverse B -> C, then A -> B. The audit of the first reversal must not itself create a permanent conflict. Validate the effective user state and actual dependencies, rather than rejecting merely because an audit timestamp is newer.
- If a needed custom destination was deleted, offer explicit recreation of the original list or selection of an existing destination. Never choose a fallback silently. Recreation recovers only the selected action's affected videos; unrelated current records remain where they are. Explain any list-name/order conflict before applying.
- Recovery preserves the saved order where compatible with surviving records. If surrounding records/order changed, show the resulting position in the preview rather than silently overwriting unrelated arrangements. Exact stable ordering mechanics are left to the builder.
- A failed persistence operation leaves the affected Library state/history unchanged together and reports failure. Do not display recovery success before durable completion.

### Local snapshots and retention

| Snapshot kind | Creation | Retention |
| --- | --- | --- |
| Daily | Automatically on a local day with user-state changes | Indefinite until deliberate deletion; supersedes the previous 30-copy cap |
| Safety | Automatically before a large import or full restoration | Indefinite until deliberate deletion |
| Manual | Explicit Save snapshot, optional user-supplied name | Indefinite until deliberate deletion; never rotates out |

- Show kind, optional name, creation time and Library counts. Expose local recovery storage usage; exact measurement/estimation must be labelled honestly.
- Show a snapshot's recovery coverage before restoration and confirm its deletion. Deleting a recovery copy must not masquerade as deletion of the current videos.
- There is no silent age/count cleanup. Storage problems are visible; never discard recovery points merely to make a failed operation appear successful.
- Snapshot creation must be durable before the destructive full-restore operation proceeds. If that safeguard cannot be saved, abort restoration and leave the current Library intact.
- Changes and their necessary action history persist together. A failure of additional daily-copy creation must be reported and retried; do not claim that daily protection succeeded. It does not undo an already safely persisted user action.
- Approved builder defaults: use the user's local calendar day for daily snapshots; update that day's daily recovery point as changes persist; take safety snapshots before every import batch that mutates the Library, avoiding an arbitrary unapproved size threshold. These defaults do not change the requirement for action-level history.

### Full restoration and Undo restoration

The same safety flow applies to a retained history point, a local snapshot, an uploaded backup file, or a selected Google Drive backup version.

1. Read and validate the candidate without changing the current Library. Validate supported format/version and Library invariants, including identity, membership, lists/order and history references. Unsupported or corrupt files receive an actionable explanation.
2. Preview additions/removals and changes to lists, placement, status, authored values and history. Explain the automatic-metadata non-rewind rule and show the chosen source/time.
3. Require explicit confirmation. If current state changes after the preview, refresh the preview and obtain confirmation of the updated result. Do not silently apply an obsolete preview.
4. Durably preserve the full pre-restore Library, retained recovery trail, and a pre-restore safety snapshot. If this fails, abort before replacing current state.
5. Apply the confirmed restoration completely, including its audit record, or retain the original current state completely. A crash/restart must yield one coherent outcome, never a partial mixture or false success.
6. Offer clearly labelled **Undo restoration** in the result and retain it in History across restart. Ten seconds later, without intervening user edits, one Undo restoration action returns to the complete pre-restore Library. No manual backup creation is required.

Later edits do not disappear silently when undoing a restoration. If they conflict, apply the selected-action conflict rule; the preserved pre-restore state remains available through the explicit full-restoration preview. Undo restoration itself leaves an audit and preserves both retained states. Repeated recovery must not duplicate saved-video identities or fabricate watch events.

### Manual backup files

- **Download backup** creates one portable, versioned file only when requested. **Upload backup** accepts a selected file and enters the validation/preview/confirmation flow. No automatic Downloads-folder files.
- A complete backup covers current videos and retained watched/dismissed records, lists, order, user dates, authored data and provenance, change/watch/correction history, and local retained recovery points/snapshots. Independent cloud backup versions do not recursively embed other backup files.
- Approved builder default: include durable Library presentation preferences; exclude active searches/selections, credentials, OAuth tokens, and device-specific authorization. Recovery into a new installation must work before connecting Google Drive again.
- Confirm file completion rather than download initiation. An interrupted download must not update the last completed-backup indicator as though a valid file exists.
- File encoding/schema, compression, supported-version migrations and validation mechanics are implementation choices. No compatibility with OneTab/Session Buddy backup files is implied.

### Automatic Google Drive backups

- Google Drive is the first external automatic destination. Connecting and authorizing an account is explicit and optional; local Library use and manual backups work without it. Further local-folder/direct-cloud destinations are deferred until separately specified.
- After connection, automatically create a complete versioned backup within five minutes of persisted changes while Chrome, the network, authorization and destination are available. Coalesce changes within that window without losing the deadline during continuous editing. No unchanged-state periodic copies are required.
- After offline use, browser shutdown, expired access or other interruption, show the pending state and catch up when operation becomes possible. Do not promise background work while Chrome is closed or a destination is unavailable.
- Preserve older completed backup versions indefinitely until explicit deletion. A failed new backup must not overwrite the last good version. Restore from the selected version; connecting a new installation must not blindly overwrite the surviving backups with an empty Library.
- Show connection/account, last completed backup time and covered Library state, pending changes and actionable failure/reconnect status. A failure to upload does not prevent otherwise-safe local saving. Destination capacity failure is visible and does not trigger silent pruning.
- Reconnection/resumption must not discard pending local changes. Disconnect stops future uploads; do not silently delete existing cloud backups. Explicit remote deletion must be distinguishable from local disconnection or snapshot deletion.
- Backups are restored deliberately. This is not live state synchronization or a merge of two active installations. A restore is itself a new local change eligible for a later new backup; retain the earlier cloud versions.
- Approved builder defaults: provide Back up now, selectable backup versions, and confirmed version deletion; avoid modal reminders after successful automatic backup and show failures where recovery status is visible. When external backup is unconfigured, pending or failing, show a persistent nonmodal reminder/status with the appropriate Connect, Reconnect, Retry or Download backup action. No separate periodic manual-download reminder is introduced while automatic backup is healthy.
- Authentication flow, least-privilege scopes, safe upload/retry mechanics and account/file organization need an implementation plan and real-browser validation. Use provider authorization and secure transport; no separate application encryption-password workflow is selected by this contract.

### Retention review during the owner's development trial

Indefinite retention is an explicitly revisitable policy. It remains active unless the user approves a new policy; the review itself never authorizes deletion.

The tracked follow-up is [Review indefinite recovery retention after four weeks of real use](https://github.com/Omriy123/youtube-backlog-tracker/issues/34), a child of the remaining-scope roadmap. Its question is: **After real use, should detailed history, daily/safety/manual snapshots, and Google Drive backup versions still be retained indefinitely?** The delivery handoff must attach the eventual recovery build's native blocker and retain the follow-up until real use and a human review have occurred. Do not close it merely because this planning contract is approved.

Collect or inspect actual Library size and action volume, local history/snapshot storage growth, completed backup sizes and upload duration/failures, destination capacity, useful recovery depth, and the owner's experience. This is a development review for the person building the extension. It is not a production onboarding, analytics or reminder feature. Exact diagnostics must avoid collecting unrelated browsing data. Review each retention category separately; efficient representation may solve growth without reducing the user's recovery coverage.

Q70 accepts a temporary developer-only checkpoint: after 28 calendar days from the owner's first real use of the recovery-enabled development build, show a nonmodal reminder linking the review issue; if the build was closed on the due date, show it when next opened. Persist the development trial's start date across restarts and record its actual start and due dates in the follow-up issue when the trial begins. Review sooner if storage/upload cost or responsiveness becomes troublesome. The clock does not start from this planning session, a first-slice build lacking recovery, or a production installation. The future delivery issue supplies the concrete prerequisite; do not invent a shipping date now.

Keep the trial marker and reminder restricted to the owner's development workflow and exclude them from production UI and user onboarding. They do not require GitHub account access or automatic issue edits from the extension; record issue dates during the development handoff. The review issue remains the durable task after the temporary reminder is retired. This developer checkpoint is separate from the ordinary backup-health status and actionable failures described above.

Any changed retention policy needs a fresh human decision, clear coverage/deletion preview, and a deliberate transition. Existing copies must not silently disappear at the checkpoint.

## Testing Decisions

Use the installed Chrome extension with persisted Library data, actual manual files, and an explicitly authorized test Google Drive account. Deterministic failures may be induced at the existing browser/persistence/provider boundary. No helper-only or prototype walkthrough substitutes for the observable workflow.

The approved first-slice real-browser workflow is the prior testing boundary. Extend it to observable history/snapshot/file/Drive operations, asserting visible behavior and durable records rather than internal schemas, helper functions or component structure. At specification approval, the repository has no production extension or automated production test suite. Test runner, fixtures, provider scheduling and deterministic failure mechanics remain implementation-plan choices. Complete-contract approval includes confirmation of this testing boundary; no additional lower-level seam is selected here.

- Save/edit/move/open, restart, then recover the relevant user changes with original dates/order and unrelated authored edits preserved. Preserve first-slice opening failures and Undo behavior.
- Exercise A -> B -> C and reverse both moves in succession; exercise a real conflicting later edit and a batch conflict with no partial reversal.
- Recover to a deleted destination by explicit recreation and by an explicitly selected alternate; preserve unrelated memberships and list identities.
- Restore from retained history, daily/manual/safety snapshots, an uploaded backup and a Google Drive version. Verify single-record identity, lists/order, retained statuses, watch events, provenance, recoverable history and automatic metadata remaining latest valid or missing.
- Immediately Undo restoration and repeat after restart. Exercise later edits, repeated restore/undo, and retain access to both pre-restore and imported recovery trails.
- Reject corrupt/unsupported files without mutation. Exercise stale previews, failed safety-snapshot writes, partial storage/upload failures and interruption/restart. Verify one coherent Library and honest completion status.
- Verify automatic changed-day snapshots, manual naming/deletion, no age/count eviction and visible storage status. Do not claim infinite physical capacity.
- Verify complete manual file round trips into a fresh installation without credentials; no automatic local file downloads.
- Verify Google Drive opt-in, backup deadline/coalescing, offline/restart catch-up, revoked access, capacity failure, last-good-version preservation, restore into an empty installation and deliberate version deletion. Local saving remains usable during upload failure.
- In the owner's development trial, demonstrate storage/backup-growth observations, a restart-stable trial start date and the day-28/next-opening reminder linked to the review issue. Verify that production mode exposes no retention-review reminder or trial marker. Carry the follow-up into the delivery roadmap.

## Out of Scope

- Production implementation or treating this planning decision as a single build ticket.
- General third-party import parsing, provider enrichment and new provider-retention exemptions.
- Full organization/bulk-opening interfaces beyond the recovery obligations those features must preserve.
- Additional automatic local-folder/direct-cloud destinations and live state synchronization or merging between installations.
- Production retention-review reminders, onboarding, or analytics derived from the owner's temporary development checkpoint.
- A fixed action-count/age cap, silent pruning, automatic local-file downloads, or recovery that rewinds automatic metadata.

Implementation planning must choose bounded workflow tickets, fixtures, supported backup compatibility, browser scheduling/permission details and failure induction. Storage/framework selection remains with delivery.

## Further Notes

### Consuming planning and delivery handoffs

- This decision ticket resolves the recovery behavior/contract. Its resolution comment links the published durable spec and evidence; the wayfinder map holds the named decision pointer. Its planning label remains `wayfinder:grilling`; closing it does not mean recovery has been built.
- [Choose the next bounded delivery slice from the first working build](https://github.com/Omriy123/youtube-backlog-tracker/issues/32) reviews real first-slice feedback and the approved contracts indexed by the map/roadmap, including this recovery contract when choosing relevant scope. It is not automatically blocked on every optional area contract and does not imply recovery must be the next feature selected.
- [Track remaining product scope after the first usable slice](https://github.com/Omriy123/youtube-backlog-tracker/issues/9) retains the recovery coverage/spec links and later delivery issues until the capability is delivered or explicitly deferred. Approval of this specification does not check off delivered scope.
- When recovery scope is selected, use to-tickets to agree vertical workflow delivery issues referencing the relevant approved contract sections, then prepare implementation plans. Do not silently expand a bounded delivery issue to every capability in this area contract. Producers such as capture, list changes, opening and imports must carry the shared recovery obligations into their own specs and plans.
- [Review indefinite recovery retention after four weeks of real use](https://github.com/Omriy123/youtube-backlog-tracker/issues/34) consumes the actual recovery build and development-use measurements. Attach the eventual genuine delivery prerequisite, record first-use/due dates, and keep the review open after the original contract decision closes.
- The area handoff and map/roadmap scope notes must explicitly distinguish the newly approved versioned Google Drive backup boundary from still-deferred live synchronization and other destinations. Publish the source links before marking this decision resolved. The originating session stops after this planning ticket.

### Decision provenance and approval

- Accepted starting points: [Set local history, Undo, snapshots, and backup commitments](https://github.com/Omriy123/youtube-backlog-tracker/issues/17#issuecomment-6234606691), [Set metadata fallback, unavailable-record handling, and authored-title boundaries](https://github.com/Omriy123/youtube-backlog-tracker/issues/19#issuecomment-6234607201), and [Approve the first save/find/open/recover slice and its data-safety contract](https://github.com/Omriy123/youtube-backlog-tracker/issues/21#issuecomment-6234607828).
- Live checkpoints: [selected-action/manual-snapshot decisions and open retention questions](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238213335), [conflicts, missing destinations and validation](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238377999), [daily-cap removal and cloud scope](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238452023), and [Google Drive, timing, version retention and real-use review](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238514544).
- Fresh official-source evidence and untested boundaries: [automatic backup and Chrome profile research](../research/recovery-backup-behavior.md). Research establishes capability boundaries; it does not replace the user's decisions or real-browser validation.
- Q70 accepts the day-28/next-opening reminder with the explicit correction that it is only for the owner's development trial, not production.
- [Complete assembled contract approved](https://github.com/Omriy123/youtube-backlog-tracker/issues/23#issuecomment-6238845753), including the marked builder defaults and testing boundary. A fresh builder check found no material planning questions; the user's later tracking and development-only corrections are incorporated above. The originating session publishes the spec and resolution links, updates the map and affected handoffs, then stops this ticket without starting implementation or resolving another decision. Later delivery scope/tickets and implementation plans still require their own agreement.
