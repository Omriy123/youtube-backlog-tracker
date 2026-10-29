import {completeInitialPlacement} from './placement-state.js';
// Opening commands share the Library queue and coherent persistence boundary.
export function createOpeningCommands(browser) {
  // Keeps positively observed creation when its receipt write fails. A restart
  // intentionally loses this evidence and leaves an unqualified intent uncertain.
  const liveEvidence = new Map();
  const liveFailures = new Set();
  const trackingFailure = { ok: false, outcome: 'trackingFailed', error: 'Tab open — Library update not saved' };
  const conflictReason = 'This video changed after opening. Recovery cannot overwrite a later user decision.';
  function latestCreated(state) {
    return state.openings?.filter(item => ['created', 'completed', 'undone'].includes(item.phase) || liveEvidence.has(item.id)).at(-1);
  }
  function unresolved(opening) {
    if (opening.phase === 'created' || liveEvidence.has(opening.id)) return { ...trackingFailure, attemptId: opening.id };
    if (liveFailures.has(opening.id)) return { ok: false, outcome: 'creationFailed', error: 'No tab was created. Finish failed opening recovery before retrying Open.' };
    return { ok: false, outcome: 'uncertain', attemptId: opening.id, error: 'Opening outcome uncertain. A tab may already have opened. Inspect existing tabs or explicitly open a new tab, which may create a duplicate.' };
  }
  function summaries(state) {
    const candidate = latestCreated(state);
    const latest = candidate?.phase === 'completed' && !candidate.noticeDismissed ? candidate : null;
    const latestRecord = latest && state.records.find(record => record.id === latest.recordId);
    const safeUndo = latestRecord?.user.revision === latest?.completedRevision;
    return {
      recoveries: (state.openings ?? []).filter(item => ['prepared', 'created'].includes(item.phase)).map(item => {
        const known = item.phase === 'created' || liveEvidence.has(item.id);
        const failed = !known && liveFailures.has(item.id);
        const record = state.records.find(record => record.id === item.recordId);
        const safe = record?.user.revision === item.before.revision;
        return { attemptId: item.id, record, outcome: failed ? 'failed' : known ? 'known' : 'uncertain', canRepair: failed || known && safe, reason: safe || failed ? null : conflictReason, message: failed ? 'Opening failed — no tab created. The failed attempt outcome is not saved.' : known ? trackingFailure.error : 'Opening outcome uncertain. A tab may already have opened.' };
      }),
      latestOpening: latest && safeUndo ? { attemptId: latest.id, record: latestRecord, canUndo: true } : null,
    };
  }
  async function complete(state, opening) {
    const record = state.records.find(item => item.id === opening.recordId);
    if (opening.phase === 'completed') return { ok: true, outcome: 'alreadyOpened', record };
    if (!record || record.user.revision !== opening.before.revision) return { ok: false, outcome: 'conflict', error: conflictReason };
    const destination=opening.before.destination;
    const destinationName=['Inbox','Backlog'].includes(destination)?destination:state.lists?.find(list=>list.id===destination)?.name ?? null;
    const event = { id: opening.eventId, openingId: opening.id, at: opening.at,source:'opening',destination,destinationName };
    completeInitialPlacement(state,record,opening.at);
    record.user = { ...record.user, status: 'watched', destination: null, revision: record.user.revision + 1, watchEvents: [...record.user.watchEvents, event] };
    opening.phase = 'completed'; opening.completedRevision = record.user.revision;
    state.history.push({ id: browser.id(), type: 'opening', recordId: record.id, openingId: opening.id, at: opening.at });
    try { await browser.write(state); }
    catch {
      // An adapter can reject after the write committed. Reconcile by operation
      // identity before offering repair, never by a matching tab URL.
      try {
        const durable = await browser.read();
        const committed = durable?.openings?.find(item => item.id === opening.id);
        if (committed?.phase === 'completed') {
          liveEvidence.delete(opening.id);
          return { ok: true, outcome: 'alreadyOpened', record: durable.records.find(item => item.id === opening.recordId) };
        }
      } catch { /* Keep known creation evidence when durability cannot be verified. */ }
      return { ...trackingFailure, attemptId: opening.id };
    }
    liveEvidence.delete(opening.id);
    return { ok: true, outcome: 'opened', record };
  }
  async function execute(command, state) {
    if (command.type === 'inspectOpening' || command.type === 'focusOpeningTab') {
      const opening = state.openings?.find(item => item.id === command.attemptId);
      if (!opening || !['prepared', 'created'].includes(opening.phase)) return { ok: false, error: 'This opening no longer needs inspection.' };
      const tabs = await browser.listTabs();
      if (command.type === 'focusOpeningTab') {
        if (!tabs.some(tab => tab.id === command.tabId)) return { ok: false, error: 'That tab is no longer open.' };
        await browser.focusTab(command.tabId);
        return { ok: true, outcome: 'inspected' };
      }
      return { ok: true, outcome: 'inspected', tabs };
    }
    if (command.type === 'newOpening') {
      const opening = state.openings?.find(item => item.id === command.attemptId);
      if (!opening || opening.phase !== 'prepared' || liveEvidence.has(opening.id) || liveFailures.has(opening.id)) return { ok: false, error: 'Only an uncertain opening permits this action. Refresh the Library.' };
      if (command.acknowledgePossibleDuplicate !== true || typeof command.newAttemptId !== 'string' || !command.newAttemptId.trim() || state.openings.some(item => item.id === command.newAttemptId)) return { ok: false, error: 'Confirm that a new opening may create a duplicate tab and use a new opening token.' };
      opening.phase = 'superseded'; opening.supersededBy = command.newAttemptId;
      return execute({ type: 'open', recordId: opening.recordId, expectedRevision: command.expectedRevision, attemptId: command.newAttemptId }, state);
    }
    if (command.type === 'repairOpening') {
      const opening = state.openings?.find(item => item.id === command.attemptId);
      if (opening?.phase === 'prepared' && liveFailures.has(opening.id) && !liveEvidence.has(opening.id)) {
        opening.phase = 'failed';
        try { await browser.write(state); }
        catch { return { ok: false, error: 'Failed opening outcome not saved. No additional tab was requested.' }; }
        liveFailures.delete(opening.id);
        return { ok: true, outcome: 'failureRecorded' };
      }
      if (opening?.phase === 'prepared' && liveEvidence.has(opening.id)) Object.assign(opening, liveEvidence.get(opening.id));
      if (!opening || !['created', 'completed'].includes(opening.phase)) return { ok: false, error: 'Opening outcome is uncertain. Inspect existing tabs before an explicit new opening.' };
      return complete(state, opening);
    }
    if (command.type === 'open') {
      if (typeof command.attemptId !== 'string' || !command.attemptId.trim()) return { ok: false, error: 'An opening token is required. Refresh the Library.' };
      const existing = state.openings?.find(item => item.id === command.attemptId);
      if (existing && existing.recordId !== command.recordId) return { ok: false, error: 'This opening token belongs to another video. Refresh the Library.' };
      if (existing?.phase === 'completed') return complete(state, existing);
      if (existing) return ['prepared', 'created'].includes(existing.phase) ? unresolved(existing) : { ok: false, error: 'This opening attempt already ended. Use a new explicit Open action.' };
      const pending = state.openings?.find(item => item.recordId === command.recordId && ['prepared', 'created'].includes(item.phase));
      if (pending) return unresolved(pending);
      const record = state.records.find(item => item.id === command.recordId);
      if (!record || record.user.status !== 'active') return { ok: false, error: 'This video is no longer active. Refresh the Library.' };
      if (record.user.revision !== command.expectedRevision) return { ok: false, outcome: 'conflict', error: 'This video changed. Refresh the Library before opening.' };
      if (record.user.pendingReview) return { ok: true, outcome: 'reviewRequired', recordId: record.id, record };
      const before = structuredClone(record.user);
      const opening = { id: command.attemptId, recordId: record.id, before, eventId: browser.id(), preparedAt: browser.now(), phase: 'prepared' };
      (state.openings ??= []).push(opening);
      try { await browser.write(state); }
      catch { liveFailures.add(opening.id); return { ok: false, error: 'Opening preparation not saved. No tab was requested.' }; }
      // A token may be retried after a preparation that never committed. Its old
      // no-side-effect observation ends before this newly prepared browser action.
      liveFailures.delete(opening.id);
      let tab;
      try { tab = await browser.createTab(record.url); }
      catch {
        opening.phase = 'failed';
        try { await browser.write(state); } catch { liveFailures.add(opening.id); }
        return { ok: false, error: 'Could not create a browser tab. The video remains in its current destination.' };
      }
      opening.at = browser.now(); opening.tabId = tab.id; opening.phase = 'created';
      liveEvidence.set(opening.id, { at: opening.at, tabId: opening.tabId, phase: 'created' });
      try { await browser.write(state); }
      catch { return { ...trackingFailure, attemptId: opening.id }; }
      return complete(state, opening);
    }
    if (command.type === 'undoOpening') {
      const opening = latestCreated(state);
      if (!opening || opening.phase !== 'completed' || opening.id !== command.attemptId) return { ok: false, error: 'Only the latest opening can be undone.' };
      const record = state.records.find(item => item.id === opening.recordId);
      if (!record || record.user.revision !== opening.completedRevision) return { ok: false, outcome: 'conflict', error: conflictReason };
      record.user = { ...structuredClone(opening.before), revision: record.user.revision + 1 };
      opening.phase = 'undone';
      state.history.push({ id: browser.id(), type: 'undoOpening', recordId: record.id, openingId: opening.id, at: browser.now() });
      await browser.write(state);
      return { ok: true, outcome: 'undone', record };
    }
    if (command.type === 'dismissOpeningNotice') {
      const opening = latestCreated(state);
      if (!opening || opening.phase !== 'completed' || opening.id !== command.attemptId || opening.noticeDismissed) return { ok: false, error: 'This opening notice is no longer available.' };
      const record = state.records.find(item => item.id === opening.recordId);
      if (!record || record.user.revision !== opening.completedRevision) return { ok: false, outcome: 'conflict', error: conflictReason };
      opening.noticeDismissed = true;
      await browser.write(state);
      return { ok: true, outcome: 'noticeDismissed' };
    }
    return null;
  }
  return { execute, summaries };
}
