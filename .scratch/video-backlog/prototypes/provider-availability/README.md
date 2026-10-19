# Provider availability discussion prototype

Throwaway UI evidence for **Choose provider setup, enrichment, availability, and lifetime behavior**. Open `index.html` directly, or run `powershell -NoProfile -ExecutionPolicy Bypass -File .scratch/video-backlog/prototypes/provider-availability/serve.ps1`, then visit http://127.0.0.1:8770/.

Three structurally different presentations inside the existing refined-A Library context:

- `?variant=A`: compact status pills that open a details dialog; successful retrieval stays quiet.
- `?variant=B`: selecting a row shows its evidence/actions in a persistent side panel (below the list on narrow windows).
- `?variant=C`: explanations and actions directly beneath each row.

Switch using the floating bottom arrows or left/right keys. Status/metadata details expose source/time/context, Retry, Open and Dismiss. A prototype-only selector changes the simulated next retry outcome. Reset restores all fictional records. Nothing connects to YouTube, changes the real Library, opens a real video, or persists across reload. The sidebar/search/channel controls are layout context only.

The user selected **A**, compact status pills opening a details dialog: “yea i agree with you about a”. B and C remain exploratory alternatives. Later corrections choose all retained metadata versions and thumbnail images, historical-title search by default, Personal-title/original-title precedence with the differing latest title below, weekly enrichment within quota, and automatic metadata backup inclusion ON after API setup. These supersede the earlier blanket exclusion/backup-off, latest-only search and original/latest-only history proposals.

`prototype.js` adds the revised original/current title presentation, Original / Latest / History inspection and search. Independent **Personal / Original / Intermediate / Latest checkboxes** start checked. Try **Bridge loads explained**, an intermediate title: it matches by default; unchecking Intermediate excludes it while Original and Latest stay enabled. Click the historical match to open its archive, or a metadata pill for check evidence. Thumbnail blocks are fictional visual placeholders, not fetched/stored image bytes. Backup/clearing/scheduling/persistence are not implemented by this mock.

The user's later removal correction is explicit: Clear current enrichment retains every historical version/image, pauses automatic retrieval for affected videos and remains undoable. The proposed irreversible purge was rejected.

The focused draft and originating ticket hold the chosen product behavior and documented source-evidence limits separately. Colors/theme remain provisional. No production code, provider validation, source-permission or full-contract approval is implied.
