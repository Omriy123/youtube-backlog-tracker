import { identify } from './identity.js';
import { createOpeningCommands } from './opening-service.js';
import { editTitle, matchRecordTitles } from './title-service.js';
export function createLibrary(browser) {
  const openings = createOpeningCommands(browser);
  let queue = Promise.resolve();
  async function execute(command, captured) {
    const state = await browser.read() ?? { version: 1, records: [], history: [] };
    if (command.type === 'editTitle') return editTitle(state, browser, command);
    if (command.type === 'list') {
      const records = state.records.filter(record => record.user.status === 'active').flatMap(record => {
        const match = matchRecordTitles(record, command.query, command.scopes);
        return match.matched ? [{ ...record, historicalMatch: match.historicalMatch }] : [];
      });
      return { ok: true, ...openings.summaries(state), records };
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
        await browser.write(state);
        return { ok: true, outcome: 'alreadySaved', record: existing };
      }
      const time = browser.now();
      const record = {
        id: browser.id(), identity, url: capture.url,
        user: { status: 'active', destination: 'Inbox', firstSavedAt: time, firstInboxExitAt: null, latestListEntryAt: time, revision: 1, personalTitle: null, watchEvents: [], pendingReview: null },
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
      // Freeze capture facts immediately; only durable state mutations wait for earlier commands.
      const captured = command.type === 'save' ? browser.capture().then(value => ({ value }), error => ({ error })) : null;
      const pending = queue.then(() => execute(command, captured));
      queue = pending.catch(() => {});
      return pending;
    },
  };
}
