# Retained metadata browsing (#66)

Implements `docs/specs/manual-youtube-enrichment.md` using the already approved public Library command and installed-extension workflow boundaries. No new test seam is introduced.

1. Add a failing public-command regression for historical-only match attribution when a latest description also matches, then correct search classification and long excerpts without changing URL-only/default scopes.
2. Add a failing installed-Chrome workflow for newly acquired channel shortcuts, full Original/Latest/History details, per-field provenance and historical navigation. Implement focused `metadata-details-ui.js`; keep capture-only inspection compatible, and route provider historical matches to metadata details.
3. Exercise missing current fields, retained images and changed/unchanged checks, failures and pending-review action gates. Add representative 1,000-active and 3,000-total workloads with up to 550 channels, desktop/narrow screenshots, keyboard access and offline/restart inspection.
4. Run relevant regression suites, record actual evidence and live-provider limits, commit and merge the integration tip before handoff.

Affected references: selected A metadata status pill opens a dialog; Original/Latest/History archive; normal title stays stable beside latest source title; dated historical match links to its exact retained observation. Existing list/channel navigation, density controls, selection and review/status workflows retain their placement and behavior. Theme and provider-color settings stay deferred.

Ownership: `metadata-details-ui.js`, `title-service.js`, `title-ui.js`, `enrichment-ui.js` details delegation, `library.html` search copy; `library.js` anchor reconciliation and detail callbacks only. Batch retrieval lives independently in #67.
