import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';
import { completeWorkflow } from '../workflows/complete-workflow.js';

test('Personal and retained titles survive rediscovery, two openings, reviewed Undo and two restarts', async () => {
  test.setTimeout(90000);
  await completeWorkflow({ launch, save: async (...args) => {
    const result = await capture(...args);
    await expect(result.popup.getByRole('status')).toHaveText(/Saved to Inbox|Already saved/);
    return result;
  } });
});

test('a prepared editor cannot bypass a later rediscovery or overwrite its reviewed decision', async () => {
  const app = await launch();
  try {
    const { popup } = await capture(app, 'https://example.org/interleaved-editor', 'Interleaved lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const first = await app.context.newPage(); await first.goto(`${app.base}/library.html`);
    const other = await app.context.newPage(); await other.goto(`${app.base}/library.html`);
    await first.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    const editor = first.getByRole('dialog', { name: 'Edit Personal title', exact: true });
    await editor.getByLabel('Personal title', { exact: true }).fill('Prepared before rediscovery');
    await other.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(other.getByRole('article')).toHaveCount(0);
    const openingId = (await other.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }))).latestOpening.attemptId;
    const repeated = await capture(app, 'https://example.org/interleaved-editor', 'Later automatic lecture');
    await expect(repeated.popup.getByRole('status')).toContainText('review pending');
    await editor.getByRole('button', { name: 'Save title', exact: true }).click();
    await expect(editor).toHaveCount(0);
    const review = first.getByRole('dialog', { name: 'Review prior activity', exact: true });
    await expect(review).toBeVisible();
    await review.getByRole('button', { name: 'Keep in Inbox', exact: true }).click();
    await expect(review).toHaveCount(0);
    let state = await other.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(state.records[0].user.personalTitle).toBeNull();
    expect(state.records[0].user.watchEvents).toHaveLength(1);
    await expect(first.getByRole('button', { name: 'Undo opening', exact: true })).toHaveCount(0);
    await first.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await first.getByLabel('Personal title', { exact: true }).fill('Later deliberate decision');
    await first.getByRole('button', { name: 'Save title', exact: true }).click();
    state = await other.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    const unsafe = await other.evaluate(attemptId => chrome.runtime.sendMessage({ type: 'undoOpening', attemptId }), openingId);
    expect(unsafe.ok).toBe(false);
    expect(unsafe.error).toMatch(/later user decision/);
    await expect(other.getByRole('article')).toContainText('Later deliberate decision');
  } finally { await app.context.close(); }
});
