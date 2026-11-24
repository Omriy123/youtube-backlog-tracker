import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

// Screenshots must go through takeScreenshot in tests/browser/helpers.js,
// which masks the YouTube key field. Any other route to a picture of a page
// could capture a key: a raw Playwright screenshot call, a browser-level
// capture command, or Playwright's automatic failure screenshots, videos and
// traces. Videos and automatic screenshots are taken without the mask, and a
// trace also stores what was typed into each field. To keep a picture as
// evidence, take it through takeScreenshot; for failure detail, keep logs and
// the list report instead.
const helper = resolve('tests/browser/helpers.js');
const self = resolve('tests/screenshot-boundary.test.js');
const skipped = new Set(['node_modules', '.git', '.scratch']);

async function files(folder, keep) {
  const found = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) { if (!skipped.has(entry.name)) found.push(...await files(path, keep)); }
    else if (keep(entry.name)) found.push(resolve(path));
  }
  return found;
}

// Each matching line is reported as "file:line".
async function offendingLines(paths, pattern) {
  const found = [];
  for (const file of paths) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, index) => { if (pattern.test(line)) found.push(`${relative(resolve('.'), file)}:${index + 1}`); });
  }
  return found;
}

const isCode = name => /\.(m?js|cjs)$/.test(name);
async function codeOutsideHelper() {
  return [...await files('tests', isCode), ...await files('scripts', isCode)].filter(file => file !== helper && file !== self);
}

test('no test or script takes a screenshot except through the masking helper', async () => {
  assert.deepEqual(await offendingLines(await codeOutsideHelper(), /\.screenshot\s*\(/), []);
});

test('no test or script reaches the screenshot method by bracket access', async () => {
  assert.deepEqual(await offendingLines(await codeOutsideHelper(), /\[\s*['"`]screenshot['"`]\s*\]/), []);
});

test('no test or script uses a browser-level capture command', async () => {
  assert.deepEqual(await offendingLines(await codeOutsideHelper(), /captureScreenshot|startScreencast/), []);
});

test('no test or script records a video or a trace', async () => {
  assert.deepEqual(await offendingLines(await codeOutsideHelper(), /recordVideo|tracing\s*\.\s*start/), []);
});

test('no Playwright config switches on automatic screenshots, videos or traces', async () => {
  const configs = await files('.', name => /^playwright(\..*)?\.config\.[cm]?[jt]s$/.test(name));
  assert.ok(configs.length > 0, 'expected at least playwright.config.js');
  assert.deepEqual(await offendingLines(configs, /\b(screenshot|video|trace)\s*:(?!\s*['"`]off['"`])/), []);
});

// A spec file can switch the same options on for itself with
// test.use({ video: 'on' }) or a `use: { ... }` block, which no config shows.
// The block can span lines and hold nested objects, so read it whole by
// matching its braces, then report the line of the offending option.
test('no test or script switches on automatic screenshots, videos or traces in a use block', async () => {
  const found = [];
  for (const file of await codeOutsideHelper()) {
    const source = await readFile(file, 'utf8');
    for (const start of source.matchAll(/\buse\s*(?:\(|:)\s*\{/g)) {
      let depth = 0, end = start.index + start[0].length - 1;
      for (; end < source.length; end++) {
        if (source[end] === '{') depth++;
        else if (source[end] === '}' && --depth === 0) break;
      }
      const block = source.slice(start.index, end + 1);
      for (const option of block.matchAll(/\b(screenshot|video|trace)\s*:(?!\s*['"`]off['"`])/g)) {
        const line = source.slice(0, start.index + option.index).split('\n').length;
        found.push(`${relative(resolve('.'), file)}:${line}`);
      }
    }
  }
  assert.deepEqual(found, []);
});
