import { test, expect } from '@playwright/test';
import { launch, takeScreenshot } from './helpers.js';

// Obviously fake, and not shaped like a real Google key.
const placeholders = ['PLACEHOLDER-NOT-A-KEY', 'ANOTHER-MUCH-LONGER-PLACEHOLDER-NOT-A-KEY-AT-ALL'];

test('screenshots of the YouTube setup screen look the same whatever is typed in the key field', async () => {
  const app = await launch();
  try {
    const page = await app.context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${app.base}/library.html`);
    await page.getByRole('button', { name: 'YouTube setup', exact: true }).click();
    const setup = page.getByRole('dialog', { name: 'YouTube setup' });
    const key = setup.getByLabel('Personal API key');
    await expect(key).toBeVisible();

    // Capture the same screen with different field contents. If any trace of the
    // content (characters, dots or their count) reached the image, the captures
    // would differ. Comparing bytes needs no judgement about colours.
    async function captures(value, { plainText = false } = {}) {
      await key.fill(value);
      // A plain-text field stands for a future change that shows the key as text.
      await key.evaluate((input, type) => { input.type = type; }, plainText ? 'text' : 'password');
      await expect(key).toHaveValue(value);
      return { page: await takeScreenshot(page, { fullPage: true }), dialog: await takeScreenshot(setup) };
    }
    const empty = await captures('');
    for (const value of placeholders) {
      for (const plainText of [false, true]) {
        const shot = await captures(value, { plainText });
        expect(shot.page.equals(empty.page), `page capture with ${value}${plainText ? ' as text' : ''}`).toBe(true);
        expect(shot.dialog.equals(empty.dialog), `dialog capture with ${value}${plainText ? ' as text' : ''}`).toBe(true);
      }
    }
  } finally { await app.context.close(); }
});
