import {completeInitialPlacement} from './placement-state.js';
// Rediscovery changes user placement separately from automatic observations.
export function requeueForReview(state, record, browser) {
  if (!['watched', 'dismissed'].includes(record.user.status)) return false;
  const before = structuredClone(record.user);
  const event = before.watchEvents.at(-1);
  const opening = state.openings?.find(item => item.id === event?.openingId && item.recordId === record.id);
  const activity = state.history.filter(item => item.recordId === record.id || item.changes?.some(change=>change.kind==='records' && change.id===record.id));
  const time = browser.now();
  const previousDestination=before.destination ?? (before.status === 'watched' ? opening?.before.destination ?? event?.destination : before.lastDismissal?.destination) ?? null;
  const destinationName=['Inbox','Backlog'].includes(previousDestination)?previousDestination:state.lists?.find(list=>list.id===previousDestination)?.name ?? event?.destinationName ?? before.lastDismissal?.destinationName ?? null;
  const previous = {
    status: before.status,
    destination: previousDestination,
    destinationName,
    lastActivityAt: activity.at(-1)?.at ?? event?.at ?? null,
    lastOpenedAt: [...before.watchEvents].reverse().find(item=>item.source!=='manual')?.at ?? null,
    lastWatchedAt: event?.at ?? null,
    dismissedAt: before.lastDismissal?.at ?? null,
    user: before,
    // History itself remains durable. Retain its dated activity summaries here
    // without recursively copying earlier reviews' full history snapshots.
    activity: activity.map(({ id, type, at }) => ({ id, type, at })),
  };
  completeInitialPlacement(state,record,time);
  record.user = { ...record.user, status: 'active', destination: 'Inbox', latestListEntryAt: time, revision: record.user.revision + 1, pendingReview: { queuedAt: time, previous } };
  const changeId = browser.id();
  state.history.push({ id: changeId, type: 'rediscovery', recordId: record.id, at: time, before });
  return changeId;
}

export async function persistReviewChange(state, browser, changeId, recordId) {
  try { await browser.write(state); }
  catch (error) {
    // A rejected acknowledgement does not undo an accepted durable decision.
    const durable = await browser.read();
    if (!durable?.history.some(item => item.id === changeId && item.recordId === recordId)) throw error;
    return durable.records.find(item => item.id === recordId);
  }
  return state.records.find(item => item.id === recordId);
}

export async function review(state, browser, command) {
  const record = state.records.find(item => item.id === command.recordId);
  if (!record || record.user.revision !== command.expectedRevision || record.user.status !== 'active' || !record.user.pendingReview) {
    return { ok: false, outcome: 'conflict', error: 'This review changed. Close this dialog and refresh the Library before deciding.' };
  }
  if (!['keep', 'dismiss'].includes(command.decision)) return { ok: false, error: 'Choose a review decision.' };
  const before = structuredClone(record.user);
  const time = browser.now();
  completeInitialPlacement(state,record,time);
  if (command.decision === 'dismiss') {
    record.user.lastDismissal = { at: time, destination: record.user.destination };
    record.user.status = 'dismissed';
    record.user.destination = null;
  }
  record.user.pendingReview = null;
  record.user.revision++;
  const changeId = browser.id();
  state.history.push({ id: changeId, type: command.decision === 'keep' ? 'keepRediscovery' : 'dismissRediscovery', recordId: record.id, at: time, before });
  const persisted = await persistReviewChange(state, browser, changeId, record.id);
  return { ok: true, outcome: command.decision === 'keep' ? 'kept' : 'dismissed', record: persisted };
}
