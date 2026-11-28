import { test, expect } from '@playwright/test';
import { launch, capture, openActionPopup, takeScreenshot } from './helpers.js';

test('toolbar save leaves source open and finds the persisted video in Inbox', async () => {
  // Catches a missing durable capture, false success, implicit Library tab, or lost read.
  const app = await launch();
  try {
    const { source, popup } = await capture(app, 'https://www.youtube.com/watch?v=M7lc1UVf-VE', 'A useful lecture');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    expect(source.isClosed()).toBe(false);
    expect(app.context.pages().filter(page => page.url().endsWith('/library.html'))).toHaveLength(0);
    await popup.getByRole('button', { name: 'Open Library', exact: true }).click();
    await expect.poll(() => app.context.pages().some(page => page.url().endsWith('/library.html'))).toBe(true);
    const library = app.context.pages().find(page => page.url().endsWith('/library.html'));
    await expect(library.getByRole('article')).toHaveCount(1);
    await expect(library.getByRole('article')).toContainText('A useful lecture');
    await library.getByRole('searchbox').fill('useful');
    await expect(library.getByRole('article')).toHaveCount(1);
    await popup.close();
    await library.reload();
    await expect(library.getByRole('article')).toContainText('A useful lecture');
  } finally { await app.context.close(); }
});

test('repeat captures retain Original and every later title while preserving one Inbox record', async () => {
  // Catches duplicate records, lost intermediate metadata, date resets and a Latest-only display.
  const app = await launch();
  try {
    const first = await capture(app, 'https://www.youtube.com/watch?v=M7lc1UVf-VE', 'Original lecture');
    await expect(first.popup.getByRole('status')).toContainText('Saved to Inbox');
    const before = await first.popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    for (const [url, title] of [['https://youtu.be/M7lc1UVf-VE?t=120', 'Middle lecture'], ['https://www.youtube.com/watch?v=M7lc1UVf-VE&list=PL_EXAMPLE', 'Latest lecture']]) {
      const { popup } = await capture(app, url, title);
      await expect(popup.getByRole('status')).toContainText('Already saved');
    }
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('article')).toHaveCount(1);
    await expect(library.getByRole('heading', { name: 'Original lecture', exact: true })).toBeVisible();
    await expect(library.getByRole('article')).toContainText('Latest lecture');
    await expect(library.getByRole('article')).toContainText('Captured from browser');
    for (const title of ['Original lecture', 'Middle lecture', 'Latest lecture', 'M7lc1UVf-VE']) {
      await library.getByRole('searchbox').fill(title);
      await expect(library.getByRole('article')).toHaveCount(1);
    }
    const after = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(after.records[0].id).toBe(before.records[0].id);
    expect(after.records[0].user).toEqual(before.records[0].user);
    expect(after.records[0].metadata.observations.map(item => item.title)).toEqual(['Original lecture', 'Middle lecture', 'Latest lecture']);
  } finally { await app.context.close(); }
});


test('Twitch VOD references merge without merging distinct uploads or ambiguous links', async () => {
  // Catches over-broad provider matching and a missing bounded Twitch identity.
  const app = await launch();
  try {
    const inputs = [
      ['https://www.twitch.tv/videos/335921245?t=1h2m3s', 'Saved to Inbox'],
      ['https://twitch.tv/videos/335921245', 'Already saved'],
      ['https://www.twitch.tv/videos/335921246', 'Saved to Inbox'],
      ['https://www.youtube.com/watch?v=M7lc1UVf-VE', 'Saved to Inbox'],
      ['https://youtube.com.example.org/watch?v=M7lc1UVf-VE', 'Saved to Inbox'],
      ['https://www.youtube.com/watch?v=M7lc1UVf-VE&v=JcdmfQs9Xpc', 'Saved to Inbox'],
      ['https://www.youtube.com/playlist?list=PL_EXAMPLE', 'Saved to Inbox'],
      ['https://example.org/video?part=1', 'Saved to Inbox'],
      ['https://example.org/video?part=2', 'Saved to Inbox'],
      ['https://www.youtube.com:8443/watch?v=M7lc1UVf-VE', 'Saved to Inbox'],
      ['https://www.twitch.tv:8443/videos/335921245', 'Saved to Inbox'],
    ];
    let popup;
    for (const [url, outcome] of inputs) {
      ({ popup } = await capture(app, url, 'Same title is not identity'));
      await expect(popup.getByRole('status')).toContainText(outcome);
    }
    const result = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(result.records).toHaveLength(10);
    expect(result.records.filter(record => record.identity === 'twitch:335921245')).toHaveLength(1);
  } finally { await app.context.close(); }
});


test('a failed save reports failure and preserves the previous coherent Library', async () => {
  // Catches confirming before persistence or leaking an uncommitted record into subsequent reads.
  const app = await launch(undefined, { failWrite: 2 });
  try {
    const first = await capture(app, 'https://example.org/first', 'First saved video');
    await expect(first.popup.getByRole('status')).toContainText('Saved to Inbox');
    const { source, popup } = await capture(app, 'https://example.org/second', 'Unsaved video');
    await expect(popup.getByRole('status')).toContainText('not saved');
    expect(source.isClosed()).toBe(false);
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('article')).toHaveCount(1);
    await expect(library.getByRole('article')).toContainText('First saved video');
    await library.reload();
    await expect(library.getByRole('article')).toHaveCount(1);
    await expect(library.getByRole('article')).not.toContainText('Unsaved video');
  } finally { await app.context.close(); }
});

test('a URL-only capture remains findable after closing and restarting Chromium', async () => {
  // Catches transient persistence and invented automatic titles when browser title is absent.
  let app = await launch(undefined, { missingTitle: true });
  try {
    const { popup } = await capture(app, 'https://example.org/untitled?part=2#chapter', '');
    await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const profile = app.profile; const extensionPath = app.extensionPath;
    await app.context.close();
    app = await launch(profile, { extensionPath });
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('heading', { name: 'https://example.org/untitled?part=2#chapter', exact: true })).toBeVisible();
    await library.getByRole('searchbox').fill('part=2');
    await expect(library.getByRole('article')).toHaveCount(1);
    const result = await library.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(result.records[0].metadata.observations[0]).toMatchObject({ title: null, source: 'browser-tab' });
    expect(Number.isNaN(Date.parse(result.records[0].metadata.observations[0].observedAt))).toBe(false);
  } finally { await app.context.close(); }
});

test('the action opens its actual popup and captures the current browser tab', async () => {
  // Catches incorrect current-tab capture when invoked from the extension action surface.
  const app = await launch();
  try {
    await app.context.route('https://example.org/action', route => route.fulfill({ contentType: 'text/html', body: '<title>Action capture</title>' }));
    const source = await app.context.newPage(); await source.goto('https://example.org/action');
    const popup = await openActionPopup(app);
    expect(await popup.evaluate('document.body.innerText')).toContain('Save to Inbox');
    await popup.evaluate("document.querySelector('#save').click()");
    await expect.poll(() => popup.evaluate("document.querySelector('[role=status]').textContent")).toContain('Saved to Inbox');
    expect(source.isClosed()).toBe(false);
    const library = await app.context.newPage(); await library.goto(`${app.base}/library.html`);
    await expect(library.getByRole('article')).toContainText('Action capture');
    await takeScreenshot(library, { path: '.scratch/populated-library.png', fullPage: true });
  } finally { await app.context.close(); }
});




test('unsupported browser pages cannot create Library records', async () => {
  // Catches accepting extension/internal URLs into a collection of usable HTTP(S) links.
  const app = await launch();
  try {
    const source = await app.context.newPage();
    const popup = await app.context.newPage(); await popup.goto(`${app.base}/popup.html`);
    await source.bringToFront();
    await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
    await expect(popup.getByRole('status')).toContainText('not saved');
    const result = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'list' }));
    expect(result.records).toHaveLength(0);
  } finally { await app.context.close(); }
});
