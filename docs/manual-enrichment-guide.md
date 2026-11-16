# Retrieve YouTube information

Saving, organizing and opening videos works without an API key. This build retrieves information only when you explicitly test the connection or pull metadata.

## Connect YouTube

1. Open the [Google Cloud console](https://console.cloud.google.com/), create or select a personal project, and enable **YouTube Data API v3** in its API Library.
2. In **APIs & Services → Credentials**, create an API key. Restrict its API access to **YouTube Data API v3**. Check the project's quota page for its actual allowance.
3. Open the extension's Library and its YouTube setup control. Enter the key in the credential field and save it. Keep it out of screenshots and feedback.
4. Choose **Test connection**. This performs one bounded known-video lookup and leaves saved records unchanged. A valid response with no resource differs from rejected setup, quota exhaustion and a network failure.

You can replace or remove the key in the same setup control. Existing information and images remain available. Setup alone never scans the Library.

## Retrieve and inspect

Use a saved video's **Pull metadata** control to retrieve its YouTube information and thumbnail. The result distinguishes text retrieval from image acquisition. Unsupported links are skipped; missing information remains unknown. A failed lookup preserves the last successful information and does not establish that a video was deleted, made private or playable.

The normal title remains your Personal title, then the first usable recorded automatic title, then the latest title or saved URL. A different latest YouTube title appears separately. Metadata details show source/time and retained Original, Latest and History information. Previously captured browser titles keep their actual provenance.

After retrieval, real channel names, publication dates and durations feed the existing browsing, sorting and totals. Unknown values remain unknown. Titles and descriptions from retained versions are searchable through the independent Personal, Original, Intermediate and Latest scopes; all scopes off means URL-only search. A dated historical match opens its retained source version.

## Lists, the Library and retry

List retrieval uses that list's members at the moment you invoke it. Entire-Library retrieval includes retained watched and dismissed videos. Later moves do not change the requested targets.

Keep the results available to inspect requested, retrieved, no-result, failed, skipped and unfinished records. Image failures have their own explanation. You can cancel further work while retaining completed results. Retry addresses unsuccessful or unfinished work; an image-only retry does not repeat a successful text lookup.

After an interruption or browser restart, inspect the retained results and retry deliberately. Restart and quota recovery do not resume requests automatically. Ordinary Library actions remain available during retrieval.

## Local data and feedback

Retrieved information, every accepted check/version and acquired image bytes stay in this Chrome profile for offline inspection. Setup shows retained metadata/image usage. Storage failures preserve prior coherent information and offer an explicit retry; there is no automatic pruning.

This build has no metadata backup/export, automatic refresh or clearing control. Keep the existing extension installed and retain its storage when updating. Removing the extension or clearing its storage loses local trial data.

For the first real enrichment trial, record the build and actual first-use date in [the metadata review](https://github.com/Omriy123/youtube-backlog-tracker/issues/35); its review is due 28 calendar days later. Installation or fixture tests alone do not start that clock. Report the visible result, what you expected and whether text or image acquisition failed. Never include the key.

Setup references: [YouTube getting started](https://developers.google.com/youtube/data/getting-started), [quota](https://developers.google.com/youtube/data/guides/quota_and_compliance_audits). Validation evidence and remaining checks belong in the delivery PR and validation report.
