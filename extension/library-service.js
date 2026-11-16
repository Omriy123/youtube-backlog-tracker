import { executeOrganization, organizationSummary } from './organization-service.js';
import { executeArrangementPreferences, organizationPreferences, arrangedRecords, listStatistics } from './arrangement-service.js';
import { identify } from './identity.js';
import { createOpeningCommands } from './opening-service.js';
import { editTitle, matchRecordTitles } from './title-service.js';
import { requeueForReview, review, persistReviewChange } from './review-service.js';
import { createEnrichmentCommands } from './enrichment-service.js';
export function createLibrary(browser) {
  const openings = createOpeningCommands(browser);
  let queue = Promise.resolve();
  function transact(action) {
    const result=queue.then(async()=>action(await browser.read() ?? {version:1,records:[],history:[]}));
    queue=result.catch(()=>{});return result;
  }
  const enrichment=createEnrichmentCommands(browser,transact);
  async function execute(command, captured) {
    const state = await browser.read() ?? { version: 1, records: [], history: [] };
    const preference = await executeArrangementPreferences(state, browser, command);
    if (preference) return preference;
    const organization = await executeOrganization(state, browser, command);
    if (organization) return organization;
    if (command.type === 'editTitle') return editTitle(state, browser, command);
    if (command.type === 'review') return review(state, browser, command);
    if (command.type === 'list') {
      const records = state.records.filter(record => record.user.status === 'active').flatMap(record => {
        const match = matchRecordTitles(record, command.query, command.scopes);
        return match.matched ? [{ ...record, historicalMatch: match.historicalMatch }] : [];
      });
      const summary=organizationSummary(state);
      return { ok: true, ...openings.summaries(state), ...summary, organizationPreferences:organizationPreferences(state), listStatistics:listStatistics(state.records,summary.lists), records:arrangedRecords(state,records) };
    }
    if (command.type === 'save') {
      const observationResult = await captured;
      if (observationResult.error) throw observationResult.error;
      const capture = observationResult.value;
      const identity = identify(capture.url);
      const existing = state.records.find(record => record.identity === identity);
      const observation = { title: capture.title?.trim() || null, source: capture.source, observedAt: capture.observedAt };
      if (existing) {
        existing.metadata.observations.push(observation);
        const requeued = requeueForReview(state, existing, browser);
        if (requeued) {
          const record = await persistReviewChange(state, browser, requeued, existing.id);
          return { ok: true, outcome: 'reviewPending', record };
        }
        await browser.write(state);
        return { ok: true, outcome: 'alreadySaved', record: existing };
      }
      const time = browser.now();
      const record = {
        id: browser.id(), identity, url: capture.url,
        user: { status: 'active', destination: 'Inbox', firstSavedAt: time, firstInboxExitAt: null, initialPlacementComplete: false, latestListEntryAt: time, revision: 1, personalTitle: null, watchEvents: [], pendingReview: null },
        metadata: { observations: [observation] },
      };
      state.records.push(record);
      state.history.push({ id: browser.id(), type: 'save', recordId: record.id, at: time });
      await browser.write(state);
      return { ok: true, outcome: 'saved', record };
    }
    const opening = await openings.execute(command, state);
    if (opening) return opening;
    throw new Error('Unknown Library command.');
  }
  return {
    command(command) {
      const enriched=enrichment.command(command);
      if(enriched)return enriched;
      // Freeze capture facts immediately; only durable state mutations wait for earlier commands.
      const captured = command.type === 'save' ? browser.capture().then(value => ({ value }), error => ({ error })) : null;
      const pending = queue.then(() => execute(command, captured));
      queue = pending.catch(() => {});
      return pending;
    },
  };
}
