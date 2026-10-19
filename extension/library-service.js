import { identify } from './identity.js';
export function createLibrary(browser) {
  let queue = Promise.resolve();
  async function execute(command, captured) {
    const state = await browser.read() ?? { version: 1, records: [], history: [] };
    if (command.type === 'list') {
      const query = (command.query ?? '').trim().toLocaleLowerCase();
      return { ok: true, records: state.records.filter(record => record.user.status === 'active' && (!query || [record.url, ...record.metadata.observations.map(item => item.title)].filter(Boolean).some(value => value.toLocaleLowerCase().includes(query)))) };
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
