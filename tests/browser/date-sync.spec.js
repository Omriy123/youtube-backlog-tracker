import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';

test('date preference follows changes in other open Library tabs and dialogs', async () => {
  const app = await launch();
  try {
    const url = 'https://example.org/date-sync';
    await capture(app, url, 'Date sync');
    const first = await app.context.newPage(); await first.goto(`${app.base}/library.html`);
    const second = await app.context.newPage(); await second.goto(`${app.base}/library.html`);
    await second.getByRole('button', { name: 'Captured titles', exact: true }).click();
    const titleDialog = second.getByRole('dialog', { name: 'Captured titles' });
    const before = await first.evaluate(() => chrome.storage.local.get('library'));
    const observed = before.library.records[0].metadata.observations[0].observedAt;
    const israeli = await second.evaluate(at => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at)), observed);
    await first.getByLabel('Date and time display').selectOption('israeli');
    await expect(second.getByLabel('Date and time display')).toHaveValue('israeli');
    await expect(titleDialog).toContainText(israeli);
    expect(await first.evaluate(() => chrome.storage.local.get('library'))).toEqual(before);
    await second.keyboard.press('Escape');
    await first.getByRole('button', { name: 'Open video' }).click();
    const { popup } = await capture(app, url, 'Date sync');
    await popup.getByRole('button', { name: 'Review prior activity' }).click();
    await second.getByRole('button', { name: 'Review prior activity' }).click();
    await second.getByText('Prior Library activity', { exact: true }).click();
    await popup.getByText('Prior Library activity', { exact: true }).click();
    const record = (await first.evaluate(() => chrome.storage.local.get('library'))).library.records[0];
    const opened = record.user.pendingReview.previous.lastOpenedAt;
    const browserTime = await first.evaluate(at => new Intl.DateTimeFormat(navigator.language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(at)), opened);
    const libraryBefore = await first.evaluate(() => chrome.storage.local.get('library'));
    await first.getByLabel('Date and time display').selectOption('browser');
    await expect(second.getByRole('dialog', { name: 'Review prior activity' })).toContainText(`Last opened: ${browserTime}`);
    await expect(popup.getByRole('dialog', { name: 'Review prior activity' })).toContainText(`Last opened: ${browserTime}`);
    await expect(second.getByRole('list', { name: 'Prior Library activity' })).toContainText(browserTime);
    await expect(popup.getByRole('list', { name: 'Prior Library activity' })).toContainText(browserTime);
    expect(await first.evaluate(() => chrome.storage.local.get('library'))).toEqual(libraryBefore);
  } finally { await app.context.close(); }
});
