import { test, expect } from '@playwright/test';
import { launch, capture, openActionPopup, browserTabs, expectNewFocusedTab } from './helpers.js';

test('rediscovery saves immediately and popup review Keep needs another explicit Open', async () => {
  const app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://example.org/rediscovery#chapter', 'Rediscovery lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const beforeOpening = await browserTabs(app);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await expectNewFocusedTab(app, beforeOpening, 'https://example.org/rediscovery#chapter');
    await source.bringToFront();
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox — review pending');
    const pending = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(pending.records).toHaveLength(1);
    expect(pending.records[0].user.watchEvents).toHaveLength(1);
    const tabs = await app.worker.evaluate(() => chrome.tabs.query({}));
    const badge = popup.getByRole('button', { name: 'Review prior activity', exact: true });
    await badge.click();
    const dialog = popup.getByRole('dialog', { name: 'Review prior activity', exact: true });
    await expect(dialog).toContainText('Previous status: Watched');
    await expect(dialog).toContainText('Previous destination: Inbox');
    await expect(dialog).toContainText('Retained watch events: 1');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await badge.click();
    await dialog.getByRole('button', { name: 'Keep in Inbox', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(popup.getByRole('status')).toContainText('Kept in Inbox');
    expect(await app.worker.evaluate(() => chrome.tabs.query({}))).toHaveLength(tabs.length);
    await library.reload();
    await expect(library.getByRole('button', { name: 'Review prior activity', exact: true })).toHaveCount(0);
    expect(source.isClosed()).toBe(false);
    const beforeAgain = await browserTabs(app);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await expectNewFocusedTab(app, beforeAgain, 'https://example.org/rediscovery#chapter');
    await library.getByRole('button', { name: 'Undo opening', exact: true }).click();
    const restored = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(restored.records[0].user.pendingReview).toBeNull();
    expect(restored.records[0].user.watchEvents).toHaveLength(1);
    expect(restored.records[0].user.latestListEntryAt).toBe(pending.records[0].user.latestListEntryAt);
  } finally { await app.context.close(); }
});

test('pending Library review survives restart and gates Open and Edit without blocking inspection', async () => {
  let app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://example.org/review-restart', 'Pending lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    let library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await source.bringToFront();
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('review pending');
    const before = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close(); app = await launch(profile, { extensionPath });
    library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('button', { name: 'Review prior activity', exact: true })).toBeVisible();
    await expect(library.getByRole('button', { name: 'Undo opening', exact: true })).toBeDisabled();
    await library.getByRole('searchbox').fill('Pending lecture');
    await library.getByRole('button', { name: 'Titles', exact: true }).click();
    await expect(library.getByRole('dialog', { name: 'Captured titles', exact: true })).toBeVisible();
    await library.getByRole('button', { name: 'Close titles', exact: true }).click();
    expect((await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }))).records[0].user).toEqual(before.records[0].user);
    const tabs = await app.worker.evaluate(() => chrome.tabs.query({}));
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    const dialog = library.getByRole('dialog', { name: 'Review prior activity', exact: true });
    await expect(dialog).toContainText('Previous destination: Inbox');
    await dialog.press('Escape');
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(library.getByRole('dialog', { name: 'Edit Personal title', exact: true })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Keep in Inbox', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(library.getByRole('dialog', { name: 'Edit Personal title', exact: true })).toHaveCount(0);
    expect(await app.worker.evaluate(() => chrome.tabs.query({}))).toHaveLength(tabs.length);
    const kept = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(kept.records[0].user.latestListEntryAt).toBe(before.records[0].user.latestListEntryAt);
    expect(kept.records[0].user.firstInboxExitAt).toBe(before.records[0].user.firstInboxExitAt);
    await library.getByRole('button', { name: 'Edit Personal title', exact: true }).click();
    await expect(library.getByRole('dialog', { name: 'Edit Personal title', exact: true })).toBeVisible();
    await library.getByRole('button', { name: 'Cancel', exact: true }).click();
    // Actual second discovery -> Dismiss -> third discovery retains dismissal details.
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    const third = await capture(app, 'https://example.org/review-restart', 'Latest pending lecture');
    await expect(third.popup.getByRole('status')).toContainText('review pending');
    await library.reload();
    await library.getByRole('button', { name: 'Review prior activity', exact: true }).click();
    await dialog.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await third.source.bringToFront();
    await third.popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(third.popup.getByRole('status')).toContainText('review pending');
    await third.popup.getByRole('button', { name: 'Review prior activity', exact: true }).click();
    const prior = third.popup.getByRole('dialog', { name: 'Review prior activity', exact: true });
    await expect(prior).toContainText('Previous status: Dismissed');
    await expect(prior).toContainText('Retained watch events: 2');
    await prior.getByText('Prior Library activity', { exact: true }).click();
    await expect(prior.getByRole('list', { name: 'Prior Library activity', exact: true })).toContainText('Dismissed');
    await expect(prior.getByRole('list', { name: 'Prior Library activity', exact: true })).toContainText('Opened from tracker');
    await prior.getByRole('button', { name: 'Dismiss', exact: true }).click();
    await expect(prior).toHaveCount(0);
    await expect(third.popup.getByRole('status')).toContainText('Dismissed');
  } finally { await app.context.close(); }
});

for (const decision of ['Keep in Inbox', 'Dismiss']) {
  test(`failed ${decision} review stays pending in the popup and Library`, async () => {
    const app = await launch(undefined, { failWrite: 6 });
    try {
      const { source, popup } = await capture(app, 'https://example.org/failed-review', 'Failure lecture');
      await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
      const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
      await library.getByRole('button', { name: 'Open video', exact: true }).click();
      await expect(library.getByRole('article')).toHaveCount(0);
      await source.bringToFront();
      await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
      await expect(popup.getByRole('status')).toContainText('review pending');
      const pending = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
      await popup.getByRole('button', { name: 'Review prior activity', exact: true }).click();
      const dialog = popup.getByRole('dialog', { name: 'Review prior activity', exact: true });
      await dialog.getByRole('button', { name: decision, exact: true }).click();
      await expect(dialog.getByRole('status')).toContainText('not saved');
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await library.reload();
      await expect(library.getByRole('button', { name: 'Review prior activity', exact: true })).toBeVisible();
      const after = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
      expect(after.records[0].user).toEqual(pending.records[0].user);
      await library.getByRole('button', { name: 'Review prior activity', exact: true }).click();
      await library.getByRole('dialog', { name: 'Review prior activity', exact: true }).getByRole('button', { name: decision, exact: true }).click();
      await expect(library.getByRole('dialog', { name: 'Review prior activity', exact: true })).toHaveCount(0);
      await expect(library.locator('main > [role=status]')).toContainText(decision === 'Dismiss' ? 'Dismissed' : 'Kept in Inbox');
    } finally { await app.context.close(); }
  });
}

test('URL variants share uploads while actual Open preserves the first saved context', async () => {
  const app = await launch();
  try {
    const firstUrl = 'https://www.youtube.com/watch?v=M7lc1UVf-VE&t=120&list=PL_EXAMPLE#chapter';
    const youtube = [firstUrl, 'https://youtu.be/M7lc1UVf-VE?t=50', 'https://youtube.com/embed/M7lc1UVf-VE?start=5', 'https://www.youtube.com/shorts/M7lc1UVf-VE', 'https://www.youtube.com/live/M7lc1UVf-VE', 'https://m.youtube.com/watch?v=M7lc1UVf-VE', 'https://music.youtube.com/watch?v=M7lc1UVf-VE&list=RD_EXAMPLE'];
    const twitch = ['https://www.twitch.tv/videos/335921245?t=2h3m', 'https://twitch.tv/videos/335921245/', 'https://player.twitch.tv/?video=v335921245&parent=example.org&t=1m', 'https://player.twitch.tv/?video=335921245&parent=example.org'];
    let popup;
    for (const [index, url] of youtube.entries()) {
      ({ popup } = await capture(app, url, `YouTube observation ${index}`));
      await expect(popup.getByRole('status')).toHaveText(index ? 'Already saved' : 'Saved to Inbox');
    }
    for (const [index, url] of twitch.entries()) {
      ({ popup } = await capture(app, url, `Twitch observation ${index}`));
      await expect(popup.getByRole('status')).toHaveText(index ? 'Already saved' : 'Saved to Inbox');
    }
    const result = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(result.records).toHaveLength(2);
    expect(result.records[0].url).toBe(firstUrl);
    expect(result.records[0].metadata.observations).toHaveLength(youtube.length);
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    const beforeOpening = await browserTabs(app);
    await library.getByRole('article').filter({ hasText: 'YouTube observation 0' }).getByRole('button', { name: 'Open video', exact: true }).click();
    await expect.poll(async () => (await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }))).latestOpening?.record.user.status).toBe('watched');
    await expectNewFocusedTab(app, beforeOpening, firstUrl);
  } finally { await app.context.close(); }
});

test('returning to an open Library refreshes pending rediscovery without clearing search', async () => {
  const app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://example.org/return-review', 'Returning lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('searchbox').fill('Returning');
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await source.bringToFront();
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('review pending');
    await library.bringToFront();
    await expect(library.getByRole('button', { name: 'Review prior activity', exact: true })).toBeVisible();
    await expect(library.getByRole('searchbox')).toHaveValue('Returning');
    await library.getByRole('button', { name: 'Review prior activity', exact: true }).click();
    await expect(library.getByRole('dialog', { name: 'Review prior activity', exact: true })).toContainText('Previous status: Watched');
  } finally { await app.context.close(); }
});

test('the actual toolbar popup saves rediscovery and resolves its prior-activity dialog', async () => {
  const app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://example.org/toolbar-review', 'Toolbar review lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await source.bringToFront();
    const actual = await openActionPopup(app);
    await actual.evaluate("document.querySelector('#save').click()");
    await expect.poll(() => actual.evaluate("document.querySelector('body > [role=status]').textContent")).toContain('review pending');
    await actual.evaluate("document.querySelector('.review-badge').click()");
    expect(await actual.evaluate("document.querySelector('dialog').textContent")).toContain('Previous status: Watched');
    await actual.evaluate("[...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Keep in Inbox').click()");
    await expect.poll(() => actual.evaluate("document.querySelector('body > [role=status]').textContent")).toContain('Kept in Inbox');
    await expect.poll(() => actual.evaluate("document.querySelector('dialog[open]') === null")).toBe(true);
    expect(source.url()).toBe('https://example.org/toolbar-review');
    const kept = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(kept.records[0].user.pendingReview).toBeNull();
    expect(kept.records[0].user.watchEvents).toHaveLength(1);
  } finally { await app.context.close(); }
});

test('failed rediscovery save retains the watched record and an explicit retry requeues it', async () => {
  const app = await launch(undefined, { failWrite: 5 });
  try {
    const { source, popup } = await capture(app, 'https://example.org/failed-requeue', 'Failed requeue lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await library.getByRole('button', { name: 'Open video', exact: true }).click();
    await expect(library.getByRole('article')).toHaveCount(0);
    await source.bringToFront();
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('not saved');
    await expect(popup.getByRole('button', { name: 'Review prior activity', exact: true })).toHaveCount(0);
    const failed = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(failed.records).toHaveLength(0);
    expect(failed.latestOpening.record.user.status).toBe('watched');
    expect(failed.latestOpening.record.user.watchEvents).toHaveLength(1);
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('review pending');
    await expect(library.getByRole('button', { name: 'Review prior activity', exact: true })).toBeVisible();
  } finally { await app.context.close(); }
});
