# List and Library enrichment implementation plan

Implement #67 against the approved manual-enrichment spec. Test seams are the already approved public Library command with injected provider/persistence, and installed-extension visible actions. No authenticated live API evidence is possible without the owner's key.

The operation service freezes deduplicated record identities, journals per-target outcomes in the Library document, and runs paced requests outside its mutation queue. Metadata and target completion commit together. The latest durable operation is inspectable after restart without resuming; explicit retry preserves successful text and retries failed images separately.

Commands: `startEnrichment {scope:'list'|'library',listId?}`, `enrichmentOperation`, `cancelEnrichment {operationId}`, `retryEnrichment {operationId}`, `retainedMetadataRecords`.

- Red/green frozen target retrieval including unsupported and retained records; repeated activation shares current work.
- Red/green cancellation, quota, interruption/retry, image-only retry and coherent failed persistence.
- Add reachable list/Library controls and a quiet retained-record inspector; results stay nonmodal and usable while requests run.
- Installed-Chrome fixture workflow, narrow/desktop in both densities and representative-scale checks. Commit, merge integration tip and hand off with explicit evidence limits.
