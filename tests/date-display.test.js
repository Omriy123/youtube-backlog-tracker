import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime } from '../extension/date-display.js';

test('browser choice follows a usable locale while Israeli choice forces day/month/year and 24-hour time', () => {
  const at = '2026-10-20T10:05:00.000Z';
  assert.equal(formatDateTime(at, 'browser', 'en-US'), new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(at)));
  assert.equal(formatDateTime(at, 'israeli', 'en-US', 'UTC'), '20/10/2026, 10:05');
});

test('unavailable browser locale falls back to Israeli display', () => {
  const at = '2026-10-20T10:05:00.000Z';
  assert.equal(formatDateTime(at, 'browser', '', 'UTC'), '20/10/2026, 10:05');
  assert.equal(formatDateTime(at, 'browser', 'not_a_locale', 'UTC'), '20/10/2026, 10:05');
});

test('unknown timestamps stay unknown', () => {
  for (const value of [null, '', 'not-a-date', '2026-13-20T10:05:00Z', '2026-02-30T10:05:00Z']) {
    assert.equal(formatDateTime(value, 'israeli', 'en-US'), 'Unknown');
  }
});
