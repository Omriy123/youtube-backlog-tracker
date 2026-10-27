import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

function boundary() {
  let durable = null; let next = 0; let fail = null;
  let active = { url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE&t=12#first', title: 'Original lecture', source: 'browser-tab', observedAt: '2026-10-20T10:00:00.000Z' };
  let time = active.observedAt;
  return {
    tabs: [],
    setActive(value) { active = { ...active, ...value }; },
    setTime(value) { time = value; },
    failNextWrite(commit = false) { fail = { commit }; },
    async capture() { return structuredClone(active); },
    async read() { return structuredClone(durable); },
    async write(value) {
      const failure = fail; fail = null;
      if (!failure || failure.commit) durable = structuredClone(value);
      if (failure) throw new Error('Fixture persistence failure');
    },
    async createTab(url) { const tab = { id: ++next, url }; this.tabs.push(tab); return tab; },
    now() { return time; }, id() { return `rediscovery-${++next}`; },
  };
}

async function watched() {
  const browser = boundary(); const library = createLibrary(browser);
  const original = (await library.command({ type: 'save' })).record;
  browser.setTime('2026-10-20T11:00:00.000Z');
  const opened = await library.command({ type: 'open', recordId: original.id, expectedRevision: original.user.revision, attemptId: 'first-opening' });
  browser.setTime('2026-10-20T12:00:00.000Z');
  return { browser, library, original, opened: opened.record };
}

test('rediscovery immediately requeues the watched record with durable prior activity', async () => {
  const { browser, library, original, opened } = await watched();
  const result = await library.command({ type: 'save' });
  assert.equal(result.outcome, 'reviewPending');
  assert.equal(result.record.id, original.id);
  const user = result.record.user;
  assert.equal(user.status, 'active'); assert.equal(user.destination, 'Inbox');
  assert.equal(user.firstSavedAt, original.user.firstSavedAt);
  assert.equal(user.firstInboxExitAt, '2026-10-20T11:00:00.000Z');
  assert.equal(user.latestListEntryAt, '2026-10-20T12:00:00.000Z');
  assert.deepEqual(user.watchEvents, opened.user.watchEvents);
  assert.equal(user.pendingReview.previous.status, 'watched');
  assert.equal(user.pendingReview.previous.destination, 'Inbox');
  assert.equal(user.pendingReview.previous.lastActivityAt, '2026-10-20T11:00:00.000Z');
  assert.deepEqual((await createLibrary(browser).command({ type: 'list' })).records[0].user, user);
  assert.equal(browser.tabs.length, 1);
});

test('Keep resolves review without reentry or opening and protects it from old Undo', async () => {
  const { browser, library } = await watched();
  const pending = (await library.command({ type: 'save' })).record;
  const request = { type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision: 'keep' };
  assert.equal((await library.command({ type: 'undoOpening', attemptId: 'first-opening' })).ok, false);
  const duplicate = await library.command({ type: 'save' });
  assert.equal(duplicate.outcome, 'alreadySaved');
  assert.deepEqual(duplicate.record.user, pending.user);
  const kept = await library.command(request);
  assert.equal(kept.outcome, 'kept');
  assert.deepEqual(kept.record.user, { ...pending.user, revision: pending.user.revision + 1, pendingReview: null });
  assert.equal(browser.tabs.length, 1);
  assert.equal((await library.command({ type: 'undoOpening', attemptId: 'first-opening' })).ok, false);
  assert.equal((await library.command(request)).ok, false);
  const reopened = await library.command({ type: 'open', recordId: pending.id, expectedRevision: kept.record.user.revision, attemptId: 'second-opening' });
  assert.equal(reopened.record.user.watchEvents.length, 2);
  const undo = await createLibrary(browser).command({ type: 'undoOpening', attemptId: 'second-opening' });
  assert.equal(undo.record.user.pendingReview, null);
  assert.deepEqual(undo.record.user.watchEvents, pending.user.watchEvents);
  assert.equal(undo.record.user.latestListEntryAt, pending.user.latestListEntryAt);
});

test('Dismiss retains prior activity and a later rediscovery presents dismissal details', async () => {
  const { browser, library } = await watched();
  const pending = (await library.command({ type: 'save' })).record;
  browser.setTime('2026-10-20T13:00:00.000Z');
  const dismissed = await library.command({ type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision: 'dismiss' });
  assert.equal(dismissed.outcome, 'dismissed');
  assert.equal(dismissed.record.user.status, 'dismissed');
  assert.equal(dismissed.record.user.destination, null);
  assert.deepEqual(dismissed.record.user.watchEvents, pending.user.watchEvents);
  assert.equal((await library.command({ type: 'list' })).records.length, 0);
  assert.equal((await library.command({ type: 'undoOpening', attemptId: 'first-opening' })).ok, false);
  browser.setTime('2026-10-20T14:00:00.000Z');
  const again = (await createLibrary(browser).command({ type: 'save' })).record;
  assert.equal(again.id, pending.id);
  assert.equal(again.user.pendingReview.previous.status, 'dismissed');
  assert.equal(again.user.pendingReview.previous.destination, 'Inbox');
  assert.equal(again.user.pendingReview.previous.dismissedAt, '2026-10-20T13:00:00.000Z');
  assert.equal(again.user.firstInboxExitAt, pending.user.firstInboxExitAt);
  assert.equal(again.user.latestListEntryAt, '2026-10-20T14:00:00.000Z');
  assert.equal(browser.tabs.length, 1);
});

test('failed requeue and review writes preserve coherent state across restart', async () => {
  const { browser, library, opened } = await watched();
  browser.failNextWrite();
  await assert.rejects(library.command({ type: 'save' }));
  let current = await createLibrary(browser).command({ type: 'list' });
  assert.equal(current.records.length, 0);
  assert.deepEqual(current.latestOpening.record.user, opened.user);
  const pending = (await library.command({ type: 'save' })).record;
  for (const decision of ['keep', 'dismiss']) {
    browser.failNextWrite();
    await assert.rejects(library.command({ type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision }));
    current = await createLibrary(browser).command({ type: 'list' });
    assert.deepEqual(current.records[0].user, pending.user);
  }
  assert.equal(browser.tabs.length, 1);
});

test('concurrent re-saves retain one pending snapshot and only the first review decision wins', async () => {
  const { browser, library } = await watched();
  const saves = await Promise.all([library.command({ type: 'save' }), library.command({ type: 'save' }), library.command({ type: 'save' })]);
  assert.deepEqual(saves.map(item => item.outcome), ['reviewPending', 'alreadySaved', 'alreadySaved']);
  const pending = saves[0].record;
  for (const item of saves) assert.deepEqual(item.record.user, pending.user);
  let current = await library.command({ type: 'list' });
  assert.equal(current.records.length, 1);
  assert.equal(current.records[0].metadata.observations.length, 4);
  const request = { type: 'review', recordId: pending.id, expectedRevision: pending.user.revision };
  const decisions = await Promise.all([library.command({ ...request, decision: 'keep' }), library.command({ ...request, decision: 'dismiss' })]);
  assert.equal(decisions[0].outcome, 'kept');
  assert.equal(decisions[1].outcome, 'conflict');
  current = await createLibrary(browser).command({ type: 'list' });
  assert.equal(current.records[0].user.status, 'active');
  assert.equal(current.records[0].user.pendingReview, null);
  assert.equal(browser.tabs.length, 1);
});

test('Open and Edit cannot bypass pending review or stale post-Keep revisions', async () => {
  const { browser, library } = await watched();
  const pending = (await library.command({ type: 'save' })).record;
  const open = { type: 'open', recordId: pending.id, expectedRevision: pending.user.revision, attemptId: 'gated-opening' };
  const edit = { type: 'editTitle', recordId: pending.id, expectedRevision: pending.user.revision, personalTitle: 'Staged title' };
  assert.equal((await library.command(open)).outcome, 'reviewRequired');
  assert.equal((await library.command(edit)).outcome, 'reviewRequired');
  const kept = await library.command({ type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision: 'keep' });
  assert.equal((await library.command(open)).outcome, 'conflict');
  assert.equal((await library.command(edit)).outcome, 'conflict');
  const freshEdit = await library.command({ ...edit, expectedRevision: kept.record.user.revision });
  assert.equal(freshEdit.record.user.personalTitle, 'Staged title');
  assert.equal(browser.tabs.length, 1);
});

test('review reconciles an accepted write with a lost acknowledgement', async () => {
  const { browser, library } = await watched();
  const pending = (await library.command({ type: 'save' })).record;
  browser.failNextWrite(true);
  const result = await library.command({ type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision: 'keep' });
  assert.equal(result.outcome, 'kept');
  assert.equal(result.record.user.pendingReview, null);
  assert.deepEqual((await createLibrary(browser).command({ type: 'list' })).records[0].user, result.record.user);
});

test('requeue reconciles a committed save after a lost acknowledgement without another entry', async () => {
  const { browser, library } = await watched();
  browser.failNextWrite(true);
  const result = await library.command({ type: 'save' });
  assert.equal(result.outcome, 'reviewPending');
  const duplicate = await createLibrary(browser).command({ type: 'save' });
  assert.equal(duplicate.outcome, 'alreadySaved');
  assert.deepEqual(duplicate.record.user, result.record.user);
  assert.equal(browser.tabs.length, 1);
});

test('legacy watched activity with no retained opening reports unknown placement', async () => {
  const browser = boundary(); const library = createLibrary(browser);
  const saved = (await library.command({ type: 'save' })).record;
  // Simulates already durable older data only at the preapproved storage boundary.
  const prior = await browser.read();
  prior.records[0].user = { ...saved.user, status: 'watched', destination: null, watchEvents: [{ id: 'legacy-watch', at: '2026-10-19T10:00:00.000Z' }] };
  await browser.write(prior);
  const pending = (await library.command({ type: 'save' })).record;
  assert.equal(pending.user.pendingReview.previous.destination, null);
  assert.equal(pending.user.pendingReview.previous.lastOpenedAt, '2026-10-19T10:00:00.000Z');
  assert.equal(pending.user.pendingReview.previous.user.watchEvents.length, 1);
  const dismissed = await library.command({ type: 'review', recordId: pending.id, expectedRevision: pending.user.revision, decision: 'dismiss' });
  assert.equal(dismissed.record.user.firstInboxExitAt, null);
});

test('URL identity keeps ambiguous routes, negative providers and generic contexts distinct', async () => {
  const browser = boundary(); const library = createLibrary(browser);
  const urls = [
    'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    'https://www.twitch.tv/videos/335921245',
    'https://www.youtube.com/watch?v=JcdmfQs9Xpc',
    'https://youtube.com/playlist?list=PL_EXAMPLE',
    'https://youtube.com/@example',
    'https://youtube.com/results?search_query=video',
    'https://youtube.com/watch?list=PL_EXAMPLE',
    'https://youtube.com/watch?v=bad',
    'https://youtube.com/watch?v=M7lc1UVf-VE&v=M7lc1UVf-VE',
    'https://youtube.com/watch?v=M7lc1UVf-VE&v=JcdmfQs9Xpc',
    'https://youtube.com/embed/M7lc1UVf-VE?v=JcdmfQs9Xpc',
    'https://youtube.com/shorts/M7lc1UVf-VE?v=M7lc1UVf-VE',
    'https://youtu.be/M7lc1UVf-VE?v=JcdmfQs9Xpc',
    'https://youtu.be/M7lc1UVf-VE/extra',
    'https://youtube.com/live/bad',
    'https://youtube.com.example.org/watch?v=M7lc1UVf-VE',
    'https://youtu.be.example.org/M7lc1UVf-VE',
    'https://music.youtube.com.example.org/watch?v=M7lc1UVf-VE',
    'https://www.youtube.com:8443/watch?v=M7lc1UVf-VE',
    'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE',
    'https://twitch.tv/example',
    'https://clips.twitch.tv/ExampleClip',
    'https://twitch.tv/videos/0335921245',
    'https://twitch.tv/videos/335921245?video=335921246',
    'https://twitch.tv/videos/335921245?channel=example',
    'https://player.twitch.tv/?video=v335921245&video=v335921246',
    'https://player.twitch.tv/?video=v335921245&channel=example',
    'https://player.twitch.tv/?video=v335921245&clip=example',
    'https://player.twitch.tv/?video=v0335921245',
    'https://player.twitch.tv/?video=bad',
    'https://player.twitch.tv.example.org/?video=v335921245',
    'https://player.twitch.tv:8443/?video=v335921245',
    'https://example.org/video?part=1#chapter-one',
    'https://example.org/video?part=1#chapter-two',
    'https://example.org/video?part=2#chapter-one',
  ];
  const ids = [];
  for (const url of urls) {
    browser.setActive({ url, title: 'Similar content' });
    const saved = await library.command({ type: 'save' });
    assert.equal(saved.outcome, 'saved', url);
    ids.push(saved.record.id);
  }
  assert.equal(new Set(ids).size, urls.length);
  assert.equal((await library.command({ type: 'list' })).records.length, urls.length);
  for (const url of urls.slice(3)) {
    browser.setActive({ url });
    assert.equal((await library.command({ type: 'save' })).outcome, 'alreadySaved', url);
  }
  for (const url of ['chrome://extensions/', 'file:///video', 'javascript:alert(1)', 'https://user:password@youtube.com/watch?v=M7lc1UVf-VE']) {
    browser.setActive({ url });
    await assert.rejects(library.command({ type: 'save' }));
  }
});
