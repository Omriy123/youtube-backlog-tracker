import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

// Deterministic failures at the existing browser/persistence boundary: Chrome cannot
// reliably induce these storage/crash phases in the real installed workflow.
function boundary() {
  let durable = null; let writes = 0; let nextId = 0;
  let active = { url: 'https://example.org/first', title: 'First lecture', source: 'browser-tab', observedAt: '2026-10-20T10:00:00.000Z' };
  let time = '2026-10-20T10:00:00.000Z';
  const failures = new Map(); const tabs = [];
  return {
    tabs,
    setActive(value) { active = { ...active, ...value }; },
    setTime(value) { time = value; },
    failNextWrite(offset = 1, commit = false) { failures.set(writes + offset, commit); },
    failCreate: false,
    async capture() { return structuredClone(active); },
    async read() { return structuredClone(durable); },
    async write(value) {
      const failed = failures.has(++writes);
      if (!failed || failures.get(writes)) durable = structuredClone(value);
      if (failed) throw new Error('Storage failure');
    },
    async createTab(url) {
      if (this.failCreate) throw new Error('Tab creation failed');
      const tab = { id: ++nextId, url, title: 'Existing tab', active: true, windowId: 1 };
      tabs.push(tab); return structuredClone(tab);
    },
    async listTabs() { return structuredClone(tabs); },
    async focusTab(tabId) { return tabs.find(tab => tab.id === tabId); },
    now() { return time; },
    id() { return `fixture-${++nextId}`; },
  };
}

async function saved(browser = boundary()) {
  const library = createLibrary(browser);
  const result = await library.command({ type: 'save' });
  const open = { type: 'open', recordId: result.record.id, expectedRevision: result.record.user.revision, attemptId: 'opening-one' };
  return { browser, library, record: result.record, open };
}

test('failed preparation cannot create a tab or remove the saved video', async () => {
  // Would fail if persistence is attempted only after tabs.create.
  const { browser, library, record, open } = await saved();
  browser.failNextWrite();
  const result = await library.command(open);
  assert.equal(result.ok, false);
  assert.equal(browser.tabs.length, 0);
  assert.deepEqual((await library.command({ type: 'list' })).records[0].user, record.user);
});

test('failed tab creation preserves Inbox and a later explicit opening can succeed', async () => {
  // Would fail if a rejected create records a watch or strands the record as opened.
  const { browser, library, record, open } = await saved(); browser.failCreate = true;
  const failed = await library.command(open);
  assert.equal(failed.ok, false);
  assert.match(failed.error, /could not create/i);
  assert.deepEqual((await library.command({ type: 'list' })).records[0].user, record.user);
  browser.failCreate = false;
  const retry = await library.command({ ...open, attemptId: 'opening-two' });
  assert.equal(retry.outcome, 'opened');
  assert.equal(retry.record.user.watchEvents.length, 1);
  assert.equal(browser.tabs.length, 1);
});

test('known opened but unsaved tracking repairs after restart without replay or a second event', async () => {
  // Would fail if completion failure loses creation evidence or repair opens another tab.
  const { browser, library, record, open } = await saved();
  browser.failNextWrite(3); // preparation, durable receipt, coherent completion
  const failed = await library.command(open);
  assert.equal(failed.outcome, 'trackingFailed');
  assert.equal(failed.error, 'Tab open — Library update not saved');
  const pending = await library.command({ type: 'list' });
  assert.deepEqual(pending.records[0].user, record.user);
  assert.equal(pending.recoveries[0].outcome, 'known');
  const restarted = createLibrary(browser); browser.setTime('2026-10-20T11:00:00.000Z');
  const repaired = await restarted.command({ type: 'repairOpening', attemptId: open.attemptId });
  assert.equal(repaired.outcome, 'opened');
  assert.equal(repaired.record.user.watchEvents.length, 1);
  assert.equal(repaired.record.user.watchEvents[0].at, '2026-10-20T10:00:00.000Z');
  assert.equal((await restarted.command({ type: 'repairOpening', attemptId: open.attemptId })).outcome, 'alreadyOpened');
  assert.equal((await restarted.command(open)).outcome, 'alreadyOpened');
  assert.equal(browser.tabs.length, 1);
  assert.equal((await restarted.command({ type: 'list' })).records.length, 0);
});

test('a lost receipt write still permits live repair from known creation evidence', async () => {
  // Would fail if receipt write rejection discards the known tabs.create result.
  const { browser, library, open } = await saved(); browser.failNextWrite(2);
  const result = await library.command(open);
  assert.equal(result.outcome, 'trackingFailed');
  assert.equal((await library.command({ type: 'list' })).recoveries[0].outcome, 'known');
  const repaired = await library.command({ type: 'repairOpening', attemptId: open.attemptId });
  assert.equal(repaired.outcome, 'opened');
  assert.equal(repaired.record.user.watchEvents.length, 1);
  assert.equal(browser.tabs.length, 1);
});

test('lost creation evidence after restart requires inspection or an explicitly warned new opening', async () => {
  // Would fail if matching tabs or repeating an Open invents success or blindly replays.
  const { browser, library, record, open } = await saved(); browser.failNextWrite(2);
  await library.command(open);
  const restarted = createLibrary(browser);
  const before = await restarted.command({ type: 'list' });
  assert.equal(before.recoveries[0].outcome, 'uncertain');
  const repeated = await restarted.command(open);
  assert.equal(repeated.outcome, 'uncertain');
  assert.equal(browser.tabs.length, 1);
  assert.equal((await restarted.command({ type: 'repairOpening', attemptId: open.attemptId })).ok, false);
  const inspected = await restarted.command({ type: 'inspectOpening', attemptId: open.attemptId });
  assert.equal(inspected.tabs[0].url, record.url);
  assert.deepEqual((await restarted.command({ type: 'list' })).records[0].user, record.user);
  const newOpening = { type: 'newOpening', attemptId: open.attemptId, newAttemptId: 'explicit-new', expectedRevision: record.user.revision };
  assert.equal((await restarted.command(newOpening)).ok, false);
  assert.equal(browser.tabs.length, 1);
  const opened = await restarted.command({ ...newOpening, acknowledgePossibleDuplicate: true });
  assert.equal(opened.outcome, 'opened');
  assert.equal(opened.record.user.watchEvents.length, 1);
  assert.equal(browser.tabs.length, 2);
  assert.equal((await restarted.command({ type: 'list' })).recoveries.length, 0);
});

test('Open rejects stale user revisions and pending review never continues into opening', async () => {
  // Would fail if a stale UI or unresolved rediscovery bypasses the shared action gate.
  const { browser, library, record, open } = await saved();
  const stale = await library.command({ ...open, expectedRevision: 0 });
  assert.equal(stale.ok, false); assert.match(stale.error, /changed|refresh/i);
  const state = await browser.read();
  state.records[0].user.pendingReview = { priorStatus: 'watched' }; state.records[0].user.revision = 2;
  await browser.write(state);
  const review = await library.command({ ...open, expectedRevision: 2 });
  assert.equal(review.outcome, 'reviewRequired'); assert.equal(review.recordId, record.id);
  assert.equal(browser.tabs.length, 0);
  // #43 supplies the review producer; this fixture represents its separately committed Keep.
  const kept = await browser.read(); kept.records[0].user.pendingReview = null; kept.records[0].user.revision = 3;
  await browser.write(kept);
  assert.equal(browser.tabs.length, 0);
  const opened = await library.command({ ...open, expectedRevision: 3 }); assert.equal(opened.outcome, 'opened');
  const undone = await library.command({ type: 'undoOpening', attemptId: open.attemptId });
  assert.equal(undone.record.user.pendingReview, null);
});

test('later relevant user decisions block unsafe Undo and tracking repair', async () => {
  // Would fail if recovery writes an old user snapshot over a newer authored decision.
  for (const incomplete of [false, true]) {
    const { browser, library, open } = await saved();
    if (incomplete) browser.failNextWrite(3);
    await library.command(open);
    const state = await browser.read();
    state.records[0].user.personalTitle = 'Later decision'; state.records[0].user.revision += 1;
    await browser.write(state);
    const result = await library.command({ type: incomplete ? 'repairOpening' : 'undoOpening', attemptId: open.attemptId });
    assert.equal(result.ok, false); assert.match(result.error, /later|changed/i);
    const visible = await library.command({ type: 'list' });
    if (incomplete) { assert.equal(visible.recoveries[0].canRepair, false); assert.equal(visible.records[0].user.personalTitle, 'Later decision'); }
    else { assert.equal(visible.latestOpening, null); assert.equal((await browser.read()).records[0].user.personalTitle, 'Later decision'); }
    assert.equal(browser.tabs.length, 1);
  }
});

test('closing a completed opening notice persists without changing opening facts and a later opening has its own notice', async () => {
  const { browser, library, open } = await saved();
  await library.command(open);
  const before = await browser.read();
  const closed = await library.command({ type: 'dismissOpeningNotice', attemptId: open.attemptId });
  assert.equal(closed.ok, true);
  assert.equal((await library.command({ type: 'list' })).latestOpening, null);
  const durable = await browser.read();
  assert.deepEqual(durable.records, before.records);
  assert.deepEqual(durable.history, before.history);
  assert.equal(browser.tabs.length, 1);
  assert.equal((await createLibrary(browser).command({ type: 'list' })).latestOpening, null);
  browser.setActive({ url: 'https://example.org/second', title: 'Second lecture' });
  const second = await library.command({ type: 'save' });
  await library.command({ type: 'open', recordId: second.record.id, expectedRevision: 1, attemptId: 'opening-two' });
  const latest = await createLibrary(browser).command({ type: 'list' });
  assert.equal(latest.latestOpening.attemptId, 'opening-two');
  assert.equal(latest.latestOpening.canUndo, true);
});

test('closing cannot hide unresolved opening recovery', async () => {
  const { browser, library, open } = await saved();
  browser.failNextWrite(3);
  await library.command(open);
  assert.equal((await library.command({ type: 'dismissOpeningNotice', attemptId: open.attemptId })).ok, false);
  const current = await library.command({ type: 'list' });
  assert.equal(current.recoveries.length, 1);
  assert.equal(current.latestOpening, null);
  assert.equal(browser.tabs.length, 1);
});

test('Undo applies only to the most recent opening rather than exposing an older Undo stack', async () => {
  // Would fail if undoing the latest opening makes an earlier opening newly eligible.
  const { browser, library, open } = await saved();
  await library.command(open);
  browser.setActive({ url: 'https://example.org/second', title: 'Second lecture' });
  const second = await library.command({ type: 'save' });
  await library.command({ type: 'open', recordId: second.record.id, expectedRevision: 1, attemptId: 'opening-two' });
  assert.equal((await library.command({ type: 'undoOpening', attemptId: open.attemptId })).ok, false);
  await library.command({ type: 'undoOpening', attemptId: 'opening-two' });
  assert.equal((await library.command({ type: 'list' })).latestOpening, null);
  assert.equal((await library.command({ type: 'undoOpening', attemptId: open.attemptId })).ok, false);
  assert.equal(browser.tabs.length, 2);
});

test('a completion committed before write rejection is reconciled as durable success', async () => {
  // Would fail if an acknowledged error hides an already committed opening or replays it.
  const { browser, library, open } = await saved(); browser.failNextWrite(3, true);
  const result = await library.command(open);
  assert.equal(result.outcome, 'alreadyOpened');
  assert.equal(result.record.user.watchEvents.length, 1);
  assert.equal((await library.command({ type: 'repairOpening', attemptId: open.attemptId })).outcome, 'alreadyOpened');
  assert.equal(browser.tabs.length, 1);
});

test('a rejected tab with an unsaved failure receipt stays known failed until evidence is lost', async () => {
  // Would fail if live knowledge of no created tab is incorrectly labelled uncertain.
  const { browser, library, record, open } = await saved(); browser.failCreate = true; browser.failNextWrite(2);
  await library.command(open);
  const pending = await library.command({ type: 'list' });
  assert.equal(pending.recoveries[0].outcome, 'failed');
  assert.deepEqual(pending.records[0].user, record.user);
  const recorded = await library.command({ type: 'repairOpening', attemptId: open.attemptId });
  assert.equal(recorded.outcome, 'failureRecorded');
  browser.failCreate = false;
  assert.equal((await library.command({ ...open, attemptId: 'retry-opening' })).outcome, 'opened');
  assert.equal(browser.tabs.length, 1);
});

test('opening tokens are required and cannot identify a different saved record', async () => {
  // Would fail if malformed or reused operation identities could create/attribute the wrong opening.
  const { browser, library, open } = await saved();
  assert.equal((await library.command({ ...open, attemptId: null })).ok, false);
  assert.equal(browser.tabs.length, 0);
  await library.command(open);
  browser.setActive({ url: 'https://example.org/second', title: 'Second lecture' });
  const second = await library.command({ type: 'save' });
  const wrongRecord = await library.command({ ...open, recordId: second.record.id });
  assert.equal(wrongRecord.ok, false);
  assert.equal(browser.tabs.length, 1);
});

test('Undo preserves prior watches, relevant dates, manual order, newest observations and unrelated decisions', async () => {
  // Characterizes the recovery contract: restoring user state cannot rewind metadata or other records.
  const { browser, library, open } = await saved();
  browser.setActive({ url: 'https://example.org/second', title: 'Second lecture' });
  const second = await library.command({ type: 'save' });
  const state = await browser.read();
  state.records[0].user.firstInboxExitAt = '2026-10-19T09:00:00.000Z';
  state.records[0].user.latestListEntryAt = '2026-10-20T09:30:00.000Z';
  state.records[0].user.watchEvents = [{ id: 'earlier-watch', at: '2026-10-19T10:00:00.000Z' }];
  const before = structuredClone(state.records[0].user); await browser.write(state);
  await library.command(open);
  const later = await browser.read();
  later.records[0].metadata.observations.push({ title: 'Newest automatic observation', source: 'browser-tab', observedAt: '2026-10-20T11:00:00.000Z' });
  later.records[1].user.personalTitle = 'Unrelated authored decision'; later.records[1].user.revision += 1;
  await browser.write(later);
  await library.command({ type: 'list', query: 'nothing' });
  const result = await library.command({ type: 'undoOpening', attemptId: open.attemptId });
  assert.deepEqual(result.record.user, { ...before, revision: 3 });
  assert.equal(result.record.metadata.observations.at(-1).title, 'Newest automatic observation');
  const visible = await library.command({ type: 'list' });
  assert.deepEqual(visible.records.map(record => record.id), [open.recordId, second.record.id]);
  assert.equal(visible.records[1].user.personalTitle, 'Unrelated authored decision');
  assert.equal(browser.tabs.length, 1);
});

test('a failed Undo write leaves the opening intact and an explicit retry restores it once', async () => {
  // Would fail if Undo mutates shared live state before a coherent durable write.
  const { browser, library, open } = await saved(); await library.command(open);
  browser.failNextWrite();
  await assert.rejects(library.command({ type: 'undoOpening', attemptId: open.attemptId }), /Storage failure/);
  const visible = await createLibrary(browser).command({ type: 'list' });
  assert.equal(visible.records.length, 0); assert.equal(visible.latestOpening.record.user.watchEvents.length, 1);
  const undone = await library.command({ type: 'undoOpening', attemptId: open.attemptId });
  assert.equal(undone.record.user.watchEvents.length, 0); assert.equal(browser.tabs.length, 1);
});

test('retrying one token after rejected preparation cannot mislabel a later created tab as failed', async () => {
  // Regression: stale no-tab knowledge must never discard positive creation evidence.
  const { browser, library, open } = await saved();
  browser.failNextWrite();
  assert.equal((await library.command(open)).ok, false);
  assert.equal(browser.tabs.length, 0);
  browser.failNextWrite(2);
  assert.equal((await library.command(open)).outcome, 'trackingFailed');
  assert.equal(browser.tabs.length, 1);
  assert.equal((await library.command({ type: 'list' })).recoveries[0].outcome, 'known');
  const repaired = await library.command({ type: 'repairOpening', attemptId: open.attemptId });
  assert.equal(repaired.outcome, 'opened');
  assert.equal(repaired.record.user.watchEvents.length, 1);
  assert.equal((await library.command({ ...open, attemptId: 'opening-two' })).ok, false);
  assert.equal(browser.tabs.length, 1);
});
