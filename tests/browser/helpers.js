import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdtemp, mkdir, cp, rename, writeFile } from 'node:fs/promises';

const extension = resolve('extension');
export async function launch(profile, { failWrite = 0, missingTitle = false, extensionPath } = {}) {
  await mkdir(resolve('.scratch/profiles'), { recursive: true });
  profile ??= await mkdtemp(resolve('.scratch/profiles/browser-'));
  let installedExtension = extensionPath ?? extension;
  if (failWrite || missingTitle) {
    await mkdir(resolve('.scratch/extensions'), { recursive: true });
    installedExtension = await mkdtemp(resolve('.scratch/extensions/failure-'));
    await cp(extension, installedExtension, { recursive: true });
    await rename(resolve(installedExtension, 'browser.js'), resolve(installedExtension, 'actual-browser.js'));
    // Test-only replacement at the approved persistence adapter boundary; production stays untouched.
    await writeFile(resolve(installedExtension, 'browser.js'), `
      import { createBrowserAdapter as actual } from './actual-browser.js';
      export function createBrowserAdapter() {
        const browser = actual(); let writes = 0; const write = browser.write; const capture = browser.capture;
        browser.write = state => { if (++writes === ${failWrite}) throw new Error('Fixture persistence failure'); return write(state); };
        if (${missingTitle}) browser.capture = async () => ({ ...await capture(), title: null });
        return browser;
      }
    `);
  }
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${installedExtension}`, `--load-extension=${installedExtension}`],
  });
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker', { timeout: 5000 });
  const base = `chrome-extension://${new URL(worker.url()).host}`;
  return { context, base, profile, worker, extensionPath: installedExtension };
}
export async function capture(app, url, title) {
  await app.context.route(request => request.href === url.split('#')[0], route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Fixture</title><p>Video fixture</p>' }));
  const source = await app.context.newPage();
  await source.goto(url);
  await source.evaluate(value => { document.title = value; }, title);
  const popup = await app.context.newPage();
  await popup.goto(`${app.base}/popup.html`);
  await source.bringToFront();
  await popup.getByRole('button', { name: 'Save to Inbox', exact: true }).evaluate(button => button.click());
  return { source, popup };
}





// Chromium exposes action popups as CDP targets but Playwright does not attach them as Pages.
export async function openActionPopup(app) {
  await app.worker.evaluate(() => chrome.action.openPopup());
  const cdp = await app.context.browser().newBrowserCDPSession();
  const { targetInfos } = await cdp.send('Target.getTargets');
  const target = targetInfos.find(item => item.url === `${app.base}/popup.html`);
  if (!target) throw new Error('Action popup was not opened.');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
  let nextId = 0;
  return {
    async evaluate(expression) {
      const id = ++nextId;
      const response = new Promise(resolve => {
        function receive(event) {
          const value = JSON.parse(event.message);
          if (event.sessionId === sessionId && value.id === id) {
            cdp.off('Target.receivedMessageFromTarget', receive); resolve(value);
          }
        }
        cdp.on('Target.receivedMessageFromTarget', receive);
      });
      await cdp.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }) });
      const result = await response;
      if (result.error || result.result.exceptionDetails) throw new Error(JSON.stringify(result));
      return result.result.result.value;
    },
  };
}
