import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';

test('Library date choice updates captured and prior-activity times without editing Library data', async () => {
  test.setTimeout(60000);
  let app = await launch();
  try {
    const url = 'https://example.org/date-display';
    for (const title of ['Original Alpha', 'Middle Beta', 'Latest Gamma']) {
      const { popup } = await capture(app, url, title);
      await expect(popup.getByRole('status')).toContainText(/Saved to Inbox|Already saved/);
    }
    let library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const before = await library.evaluate(() => chrome.storage.local.get('library'));
    const observedAt = before.library.records[0].metadata.observations[0].observedAt;
    const middleObservedAt = before.library.records[0].metadata.observations[1].observedAt;
    const browserTime = await library.evaluate(at => new Intl.DateTimeFormat(navigator.language, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(at)), observedAt);
    const israeliTime = await library.evaluate(at => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at)), observedAt);
    const middleIsraeliTime = await library.evaluate(at => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at)), middleObservedAt);
    await expect(library.getByLabel('Date and time display')).toHaveValue('browser');
    await library.getByRole('button', { name: 'Captured titles', exact: true }).click();
    await expect(library.getByRole('dialog', { name: 'Captured titles' })).toContainText(browserTime);
    await library.keyboard.press('Escape');
    await library.getByLabel('Date and time display').selectOption('israeli');
    expect(await library.evaluate(() => chrome.storage.local.get('library'))).toEqual(before);
    await library.getByRole('button', { name: 'Captured titles', exact: true }).click();
    await expect(library.getByRole('dialog', { name: 'Captured titles' })).toContainText(israeliTime);
    await library.keyboard.press('Escape');
    await library.getByRole('searchbox').fill('Beta');
    await expect(library.getByRole('button', { name: /Matched title from .*Middle Beta/ })).toContainText(middleIsraeliTime);
    await library.getByRole('searchbox').fill('');
    await library.getByRole('button', { name: 'Open video' }).click();
    const reopenedCapture = await capture(app, url, 'Latest Gamma');
    await expect(reopenedCapture.popup.getByRole('status')).toContainText('review pending');
    await reopenedCapture.popup.getByRole('button', { name: 'Review prior activity' }).click();
    const popupReview = reopenedCapture.popup.getByRole('dialog', { name: 'Review prior activity' });
    const openedAt = (await reopenedCapture.popup.evaluate(() => chrome.storage.local.get('library'))).library.records[0].user.pendingReview.previous.lastOpenedAt;
    const popupOpenedTime = await reopenedCapture.popup.evaluate(at => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at)), openedAt);
    await expect(popupReview).toContainText(`Last opened: ${popupOpenedTime}`);
    await reopenedCapture.popup.keyboard.press('Escape');
    await library.reload();
    await library.getByRole('button', { name: 'Review prior activity' }).click();
    const review = library.getByRole('dialog', { name: 'Review prior activity' });
    const lastOpenedAt = (await library.evaluate(() => chrome.storage.local.get('library'))).library.records[0].user.pendingReview.previous.lastOpenedAt;
    const openedTime = await library.evaluate(at => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at)), lastOpenedAt);
    await expect(review).toContainText(`Last opened: ${openedTime}`);
    await library.keyboard.press('Escape');
    const after = await library.evaluate(() => chrome.storage.local.get('library'));
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByLabel('Date and time display')).toHaveValue('israeli');
    expect(await library.evaluate(() => chrome.storage.local.get('library'))).toEqual(after);
    expect(after.library.records[0].metadata.observations[0]).toEqual(before.library.records[0].metadata.observations[0]);
  } finally { await app.context.close(); }
});
