import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

function boundary() {
  let durable = null; let active = { url: 'https://example.org/first', title: 'First tab', source: 'browser-tab', observedAt: '2026-10-20T10:00:00.000Z' }; let nextId = 0;
  return {
    setActive(value) { active = { ...active, ...value }; },
    async capture() { return structuredClone(active); },
    async read() { return structuredClone(durable); },
    async write(value) { durable = structuredClone(value); },
    now() { return '2026-10-20T10:00:00.000Z'; },
    id() { return `fixture-${++nextId}`; },
  };
}

test('queued saves retain the tab observed when each Save was invoked', async () => {
  // Catches capture deferred until after queue delay; actual browser scheduling cannot deterministically induce this race.
  const browser = boundary(); const library = createLibrary(browser);
  const first = library.command({ type: 'save' });
  browser.setActive({ url: 'https://example.org/second', title: 'Second tab' });
  const second = library.command({ type: 'save' });
  await Promise.all([first, second]);
  const result = await library.command({ type: 'list' });
  assert.deepEqual(result.records.map(record => record.url), ['https://example.org/first', 'https://example.org/second']);
});
