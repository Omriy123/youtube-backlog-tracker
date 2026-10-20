import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

// The approved browser/storage adapter boundary supplies failures and otherwise-impractical state.
function boundary() {
  let durable = null; let active = { url: 'https://example.org/title', title: 'Original Alpha', source: 'browser-tab', observedAt: '2026-10-20T10:00:00.000Z' }; let nextId = 0;
  return {
    setCapture(value) { active = { ...active, ...value }; },
    async capture() { return structuredClone(active); },
    async read() { return structuredClone(durable); },
    async write(value) { durable = structuredClone(value); },
    now() { return '2026-10-20T11:00:00.000Z'; },
    id() { return `title-fixture-${++nextId}`; },
  };
}
async function edit(library, record, personalTitle) {
  return library.command({ type: 'editTitle', recordId: record.id, expectedRevision: record.user.revision, personalTitle });
}

test('failed title persistence retains the authored value and history across service restart', async () => {
  const browser = boundary(); let library = createLibrary(browser);
  let { record } = await library.command({ type: 'save' });
  ({ record } = await edit(library, record, 'My first lesson'));
  const before = await browser.read(); const write = browser.write;
  browser.write = async () => { throw new Error('Storage unavailable'); };
  await assert.rejects(edit(library, record, 'Uncommitted lesson'), /Storage unavailable/);
  library = createLibrary(browser);
  assert.equal((await library.command({ type: 'list' })).records[0].user.personalTitle, 'My first lesson');
  assert.deepEqual(await browser.read(), before);
  browser.write = write;
  await edit(library, record, null);
  const durable = await browser.read();
  assert.equal(durable.records[0].user.personalTitle, null);
  const edits = durable.history.filter(item => item.type === 'editTitle');
  assert.equal(edits[1].before.personalTitle, 'My first lesson');
  assert.equal(edits[0].before.personalTitle, null);
  assert.equal(edits[0].after.personalTitle, 'My first lesson');
});

test('stale editors cannot overwrite later authorship, while observations do not invalidate an edit', async () => {
  const browser = boundary(); const library = createLibrary(browser);
  const { record: initial } = await library.command({ type: 'save' });
  browser.setCapture({ title: 'Latest Gamma' }); await library.command({ type: 'save' });
  const first = await edit(library, initial, 'My decision'); assert.equal(first.outcome, 'titleSaved');
  const stale = await edit(library, initial, 'Old editor'); assert.equal(stale.outcome, 'conflict');
  const result = await library.command({ type: 'list' });
  assert.equal(result.records[0].user.personalTitle, 'My decision');
  assert.equal(result.records[0].user.revision, initial.user.revision + 1);
  assert.deepEqual(result.records[0].metadata.observations.map(item => item.title), ['Original Alpha', 'Latest Gamma']);
  const beforeNoop = await browser.read(); await edit(library, result.records[0], ' My decision ');
  assert.deepEqual(await browser.read(), beforeNoop);
});

test('pending review and inactive or non-Inbox records cannot silently commit a prepared title', async () => {
  const browser = boundary(); const library = createLibrary(browser);
  const { record } = await library.command({ type: 'save' });
  const pending = await browser.read(); pending.records[0].user.pendingReview = { previousStatus: 'watched' }; await browser.write(pending);
  const gate = await edit(library, record, 'Prepared before review');
  assert.equal(gate.outcome, 'reviewRequired'); assert.equal(gate.recordId, record.id);
  assert.equal(gate.record.user.personalTitle, null); assert.deepEqual(await browser.read(), pending);
  const nonInbox = structuredClone(pending); nonInbox.records[0].user.pendingReview = null; nonInbox.records[0].user.destination = 'Backlog'; await browser.write(nonInbox);
  assert.equal((await edit(library, record, 'Forbidden')).outcome, 'notEditable');
  const inactive = structuredClone(nonInbox); inactive.records[0].user.destination = null; inactive.records[0].user.status = 'watched'; await browser.write(inactive);
  assert.equal((await edit(library, record, 'Forbidden')).outcome, 'notEditable');
  assert.deepEqual(await browser.read(), inactive);
});

test('retained repeated and missing observations keep their actual categories without read mutations', async () => {
  const browser = boundary(); const library = createLibrary(browser);
  for (const title of [null, 'Original Alpha', 'Repeated Beta', 'Repeated Beta', null]) {
    browser.setCapture({ title }); await library.command({ type: 'save' });
  }
  const before = await browser.read();
  const scopes = { personal: false, original: false, intermediate: true, latest: false };
  const historical = await library.command({ type: 'list', query: 'Beta', scopes });
  assert.equal(historical.records.length, 1); assert.equal(historical.records[0].historicalMatch.index, 2);
  assert.deepEqual(historical.records[0].metadata.observations.map(item => item.title), [null, 'Original Alpha', 'Repeated Beta', 'Repeated Beta', null]);
  assert.equal((await library.command({ type: 'list', query: 'Beta', scopes: { ...scopes, intermediate: false, latest: true } })).records.length, 0);
  assert.equal((await library.command({ type: 'list', query: 'Alpha', scopes: { ...scopes, intermediate: false, original: true } })).records.length, 1);
  assert.equal((await library.command({ type: 'list', query: 'example.org', scopes: {} })).records.length, 1);
  assert.deepEqual(await browser.read(), before);
});
