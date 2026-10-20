import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';
import { resolve } from 'node:path';
import { mkdir, mkdtemp, cp, rename, writeFile } from 'node:fs/promises';

test('Personal title saves durably and clearing restores the captured Original', async () => {
  // Installed workflow catches unsaved success, authored/automatic mixing and lost restart state.
  let app = await launch();
  try {
    const { popup } = await capture(app, 'https://example.org/personal', 'Original lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    let library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await library.getByRole('textbox', { name: 'Personal title', exact: true }).fill('My deliberate lesson');
    await library.getByRole('button', { name: 'Save title', exact: true }).click();
    await expect(library.getByRole('status')).toContainText('Personal title saved');
    await expect(library.getByRole('heading', { name: 'My deliberate lesson', exact: true })).toBeVisible();
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('heading', { name: 'My deliberate lesson', exact: true })).toBeVisible();
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await expect(library.getByRole('textbox', { name: 'Personal title', exact: true })).toHaveValue('My deliberate lesson');
    await library.getByRole('button', { name: 'Clear Personal title', exact: true }).click();
    await expect(library.getByRole('status')).toContainText('Personal title cleared');
    await expect(library.getByRole('heading', { name: 'Original lecture', exact: true })).toBeVisible();
    await library.reload();
    await expect(library.getByRole('heading', { name: 'Original lecture', exact: true })).toBeVisible();
  } finally { await app.context.close(); }
});

test('a failed Personal title write remains visible and retains the last durable authored title', async () => {
  const app = await launch(undefined, { failWrite: 3 });
  try {
    const { popup } = await capture(app, 'https://example.org/title-failure', 'Original lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await library.getByRole('textbox', { name: 'Personal title', exact: true }).fill('Durable lesson');
    await library.getByRole('button', { name: 'Save title', exact: true }).click();
    await expect(library.getByRole('heading', { name: 'Durable lesson', exact: true })).toBeVisible();
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    const editor = library.getByRole('dialog', { name: 'Edit Personal title', exact: true });
    await editor.getByRole('textbox', { name: 'Personal title', exact: true }).fill('Uncommitted change');
    await editor.getByRole('button', { name: 'Save title', exact: true }).click();
    await expect(editor.getByRole('status')).toContainText('not saved');
    await expect(editor.getByRole('textbox')).toHaveValue('Uncommitted change');
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
    await library.reload();
    await expect(library.getByRole('heading', { name: 'Durable lesson', exact: true })).toBeVisible();
  } finally { await app.context.close(); }
});

test('missing titles and unknown provenance remain honest in URL fallback and retained inspection', async () => {
  // Chrome supplies tab-title/time/source defaults; override only the copied approved browser boundary.
  await mkdir(resolve('.scratch/extensions'), { recursive: true });
  const extensionPath = await mkdtemp(resolve('.scratch/extensions/title-observations-'));
  await cp(resolve('extension'), extensionPath, { recursive: true });
  await rename(resolve(extensionPath, 'browser.js'), resolve(extensionPath, 'actual-browser.js'));
  const observations = [
    { title: null, source: null, observedAt: null },
    { title: 'First usable Alpha', source: 'browser-tab', observedAt: '2026-10-20T10:00:00.000Z' },
    { title: 'Middle Beta', source: null, observedAt: null },
    { title: null, source: 'browser-tab', observedAt: '2026-10-20T12:00:00.000Z' },
  ];
  await writeFile(resolve(extensionPath, 'browser.js'), `
    import { createBrowserAdapter as actual } from './actual-browser.js';
    export function createBrowserAdapter() {
      const browser = actual(); const capture = browser.capture;
      const observations = ${JSON.stringify(observations)}; let index = 0;
      browser.capture = async () => ({ ...await capture(), ...observations[index++] });
      return browser;
    }
  `);
  const app = await launch(undefined, { extensionPath });
  try {
    const url = 'https://example.org/missing-title';
    let { popup } = await capture(app, url, 'Fixture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('heading', { name: url, exact: true })).toBeVisible();
    for (let index = 1; index < observations.length; index++) {
      ({ popup } = await capture(app, url, 'Fixture'));
      await expect(popup.getByRole('status')).toContainText('Already saved');
    }
    await library.reload();
    await expect(library.getByRole('heading', { name: 'First usable Alpha', exact: true })).toBeVisible();
    await expect(library.getByRole('article')).toContainText('Latest: Title unavailable');
    const before = await library.evaluate(() => chrome.storage.local.get('library'));
    await library.getByRole('searchbox').fill('Beta');
    await library.getByRole('button', { name: 'Matched title from Observation time unknown: Middle Beta', exact: true }).click();
    const dialog = library.getByRole('dialog', { name: 'Captured titles', exact: true });
    await expect(dialog.getByRole('region', { name: 'Matched title version', exact: true })).toContainText('Source unknown');
    await expect(dialog.getByRole('region', { name: 'Matched title version', exact: true })).toContainText('Observation time unknown');
    await expect(dialog.getByRole('heading', { name: /Observation \d/ })).toHaveCount(4);
    await dialog.getByRole('button', { name: 'Latest', exact: true }).click();
    await expect(dialog.getByRole('region', { name: 'Title observations', exact: true })).toContainText('Title unavailable');
    await library.keyboard.press('Escape');
    await library.getByRole('button', { name: 'Inbox', exact: true }).click();
    expect(await library.evaluate(() => chrome.storage.local.get('library'))).toEqual(before);
    await library.setViewportSize({ width: 390, height: 600 });
    expect(await library.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await app.context.close(); }
});

test('retained title search has independent scopes, authored precedence and URL-only mode', async () => {
  test.setTimeout(60000);
  // Captures through actual tabs; checks search never mutates user state or creates duplicate results.
  const app = await launch();
  try {
    const url = 'https://example.org/version-scope';
    let { popup } = await capture(app, url, 'Original Alpha');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await library.getByRole('textbox', { name: 'Personal title', exact: true }).fill('Personal Delta');
    await library.getByRole('button', { name: 'Save title', exact: true }).click();
    await expect(library.getByRole('heading', { name: 'Personal Delta', exact: true })).toBeVisible();
    const before = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    for (const title of ['Intermediate Beta', 'Latest Gamma']) {
      ({ popup } = await capture(app, url, title));
      await expect(popup.getByRole('status')).toContainText('Already saved');
    }
    await library.reload();
    await expect(library.getByRole('heading', { name: 'Personal Delta', exact: true })).toBeVisible();
    for (const name of ['Personal', 'Original', 'Intermediate', 'Latest']) await expect(library.getByRole('checkbox', { name, exact: true })).toBeChecked();
    for (const query of ['Delta', 'Alpha', 'Beta', 'Gamma', 'version-scope']) {
      await library.getByRole('searchbox').fill(query); await expect(library.getByRole('article')).toHaveCount(1);
    }
    await library.getByRole('checkbox', { name: 'Intermediate', exact: true }).uncheck();
    await library.getByRole('searchbox').fill('Beta'); await expect(library.getByRole('article')).toHaveCount(0);
    for (const query of ['Alpha', 'Gamma']) {
      await library.getByRole('searchbox').fill(query); await expect(library.getByRole('article')).toHaveCount(1);
    }
    for (const name of ['Personal', 'Original', 'Latest']) await library.getByRole('checkbox', { name, exact: true }).uncheck();
    await expect(library.getByText('URL-only search. All title scopes are off.', { exact: true })).toBeVisible();
    await library.getByRole('searchbox').fill('Delta'); await expect(library.getByRole('article')).toHaveCount(0);
    await library.getByRole('searchbox').fill('version-scope'); await expect(library.getByRole('article')).toHaveCount(1);
    for (const [name, query] of [['Personal', 'Delta'], ['Original', 'Alpha'], ['Intermediate', 'Beta'], ['Latest', 'Gamma']]) {
      await library.getByRole('checkbox', { name, exact: true }).check();
      await library.getByRole('searchbox').fill(query); await expect(library.getByRole('article')).toHaveCount(1);
      await library.getByRole('checkbox', { name, exact: true }).uncheck();
    }
    const after = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(after.records[0].user).toEqual(before.records[0].user);
    await library.close(); const reopened = await app.context.newPage(); await reopened.goto(`${app.base}/library.html`);
    await expect(reopened.getByRole('searchbox')).toHaveValue('');
    for (const name of ['Personal', 'Original', 'Intermediate', 'Latest']) await expect(reopened.getByRole('checkbox', { name, exact: true })).toBeChecked();
  } finally { await app.context.close(); }
});

test('a historical match opens its exact retained version with honest capture provenance', async () => {
  const app = await launch();
  try {
    for (const title of ['Original Alpha', `${'Earlier context '.repeat(14)}Intermediate Beta`, 'Latest Gamma']) {
      const { popup } = await capture(app, 'https://example.org/title-history', title);
      await expect(popup.getByRole('status')).toContainText(/Saved to Inbox|Already saved/);
    }
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const before = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    await library.getByRole('searchbox').fill('Beta');
    await expect(library.getByRole('heading', { name: 'Original Alpha', exact: true })).toBeVisible();
    const match = library.getByRole('button', { name: /Matched title from .*Intermediate Beta/ });
    await expect(match).toBeVisible(); await match.click();
    const dialog = library.getByRole('dialog', { name: 'Captured titles', exact: true });
    const selected = dialog.getByRole('region', { name: 'Matched title version', exact: true });
    await expect(selected).toContainText('Intermediate Beta');
    await expect(selected).toContainText('Captured from browser');
    await expect(selected).toContainText('Observed');
    await expect(dialog.getByRole('region', { name: 'Title observations', exact: true })).toContainText('Latest Gamma');
    await dialog.getByRole('button', { name: 'Original', exact: true }).click();
    await expect(dialog.getByRole('region', { name: 'Title observations', exact: true })).toContainText('Original Alpha');
    await expect(dialog.getByRole('region', { name: 'Title observations', exact: true })).not.toContainText('Intermediate Beta');
    await dialog.getByRole('button', { name: 'Latest', exact: true }).click();
    await expect(dialog.getByRole('region', { name: 'Title observations', exact: true })).toContainText('Latest Gamma');
    await library.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
    await expect(match).toBeFocused();
    const after = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(after.records[0].user).toEqual(before.records[0].user);
  } finally { await app.context.close(); }
});
