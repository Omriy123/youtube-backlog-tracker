import { chromium, expect } from '@playwright/test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { completeWorkflow } from '../tests/workflows/complete-workflow.js';
import { openActionPopup } from '../tests/browser/helpers.js';

const validationRoot = resolve('.scratch/validation/actual-chrome');
await mkdir(validationRoot, { recursive: true });
const output = await mkdtemp(resolve(validationRoot, 'run-'));
const profile = resolve(output, 'profile');
const extensionPath = resolve(process.env.EXTENSION_PATH ?? 'extension');
const executablePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
let version;
async function launch(existingProfile = profile) {
  const context = await chromium.launchPersistentContext(existingProfile, {
    executablePath, headless: true, ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--enable-unsafe-extension-debugging'],
  });
  try {
    const cdp = await context.browser().newBrowserCDPSession();
    version = await cdp.send('Browser.getVersion');
    // This automation registration is session-scoped; the profile's Library persists.
    const { id } = await cdp.send('Extensions.loadUnpacked', { path: extensionPath });
    const worker = context.serviceWorkers().find(item => item.url().includes(id)) ?? await context.waitForEvent('serviceworker');
    return { context, profile: existingProfile, extensionPath, worker, base: `chrome-extension://${id}` };
  } catch (error) { await context.close(); throw error; }
}
async function save(app, url, title) {
  const source = await app.context.newPage(); await source.goto(url);
  await source.evaluate(value => { document.title = value; }, title);
  await source.bringToFront();
  const popup = await openActionPopup(app);
  // An actual toolbar popup has no tabs.getCurrent result; a popup-as-tab does.
  expect(await popup.evaluate('chrome.tabs.getCurrent().then(tab => tab ?? null)')).toBeNull();
  await popup.evaluate("document.querySelector('#save').click()");
  await expect.poll(() => popup.evaluate("document.querySelector('body > [role=status]').textContent")).toMatch(/Saved to Inbox|Already saved/);
  await popup.close();
  return { source };
}
const screenshots = [];
const result = await completeWorkflow({ launch, save, screenshot: async (page, name) => {
  const path = resolve(output, `${name}.png`);
  await page.screenshot({ path, fullPage: true }); screenshots.push(path);
} });
const evidence = { checkedAt: new Date().toISOString(), executablePath, extensionPath, browser: version.product, ...result, screenshots };
await writeFile(resolve(output, 'result.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
