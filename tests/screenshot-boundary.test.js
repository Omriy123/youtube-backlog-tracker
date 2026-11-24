import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

// Screenshots must go through takeScreenshot in tests/browser/helpers.js,
// which masks the YouTube key field. A raw Playwright screenshot call anywhere
// else in the tests or scripts could capture a key.
const helper = resolve('tests/browser/helpers.js');

async function sourceFiles(folder) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(m?js)$/.test(entry.name)) files.push(resolve(path));
  }
  return files;
}

test('no test or script takes a screenshot except through the masking helper', async () => {
  const raw = [];
  for (const file of [...await sourceFiles('tests'), ...await sourceFiles('scripts')]) {
    if (file === helper) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => { if (/\.screenshot\s*\(/.test(line)) raw.push(`${relative(resolve('.'), file)}:${index + 1}`); });
  }
  assert.deepEqual(raw, []);
});
