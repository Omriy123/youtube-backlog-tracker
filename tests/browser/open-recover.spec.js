import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';

test('Open creates a focused new tab and persistent Undo restores Inbox without closing tabs', async () => {
  // Catches fake openings, transient Undo, replaced source tabs and incoherent watched history.
  let app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://example.org/opening#chapter', 'Opening lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const before = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.setViewportSize({ width: 390, height: 780 });
    const opened = app.context.waitForEvent('page');
    await library.getByRole('button', { name: 'Open video', exact: true }).focus();
    await library.getByRole('button', { name: 'Open video', exact: true }).press('Enter');
    const video = await opened; await video.waitForLoadState();
    expect(video).not.toBe(source);
    expect(source.isClosed()).toBe(false);
    await expect(library.getByRole('article')).toHaveCount(0);
    const current = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(current.latestOpening.record.user.status).toBe('watched');
    expect(current.latestOpening.record.user.watchEvents).toHaveLength(1);
    const tabs = await app.worker.evaluate(() => chrome.tabs.query({ active: true, currentWindow: true }));
    expect(tabs[0].url).toBe('https://example.org/opening#chapter');
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    const reopened = await app.context.newPage(); await reopened.goto(`${app.base}/library.html`);
    await reopened.getByRole('button', { name: 'Undo opening', exact: true }).click();
    await expect(reopened.getByRole('article')).toContainText('Opening lecture');
    const restored = await reopened.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(restored.records[0].user).toEqual({ ...before.records[0].user, revision: 3 });
    await expect(reopened.getByRole('status')).toContainText('Opening undone');
  } finally { await app.context.close(); }
});

test('a known opened tab exposes durable Library repair without creating another tab', async () => {
  // Catches hidden recovery UI when tracking writes fail after a real tab opens.
  let app = await launch(undefined, { failWrite: 4 });
  try {
    const { popup } = await capture(app, 'https://example.org/repair', 'Repair lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    let library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Repair lecture', exact: true }).click();
    await expect(library.getByRole('status')).toHaveText('Tab open — Library update not saved');
    await expect(library.getByRole('article')).toHaveCount(1);
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const before = await app.worker.evaluate(() => chrome.tabs.query({}));
    await library.getByRole('button', { name: 'Repair Library update', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    const after = await app.worker.evaluate(() => chrome.tabs.query({}));
    expect(after).toHaveLength(before.length);
    const tracked = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(tracked.latestOpening.record.user.watchEvents).toHaveLength(1);
  } finally { await app.context.close(); }
});

test('uncertain restart offers tab inspection and an explicit warned new opening', async () => {
  // Catches automatic replay and URL-based attribution after a receipt itself was lost.
  let app = await launch(undefined, { failWrite: 3 });
  try {
    const { popup } = await capture(app, 'https://example.org/uncertain', 'Uncertain lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    let library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('status')).toHaveText('Tab open — Library update not saved');
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const recovery = library.getByRole('region', { name: 'Opening recovery' });
    await expect(recovery).toContainText('Opening outcome uncertain');
    await expect(recovery).toContainText('may create a duplicate tab');
    const before = await app.worker.evaluate(() => chrome.tabs.query({}));
    await library.getByRole('button', { name: 'Inspect existing tabs', exact: true }).click();
    await expect(recovery.getByRole('list')).toBeVisible();
    await recovery.getByRole('list').getByRole('button').first().click();
    await expect(library.getByRole('status')).toContainText('Existing tab focused');
    const inspected = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(inspected.records[0].user.watchEvents).toHaveLength(0);
    expect(await app.worker.evaluate(() => chrome.tabs.query({}))).toHaveLength(before.length);
    await library.getByRole('button', { name: 'Open a new tab anyway', exact: true }).click();
    await expect(library.getByRole('button', { name: 'Repair Library update', exact: true })).toBeVisible();
    await library.getByRole('button', { name: 'Repair Library update', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    expect(await app.worker.evaluate(() => chrome.tabs.query({}))).toHaveLength(before.length + 1);
    const after = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(after.latestOpening.record.user.watchEvents).toHaveLength(1);
  } finally { await app.context.close(); }
});
