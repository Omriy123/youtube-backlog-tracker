# Watch lists and placement validation

Issue: #52. Contract: [Library organization](../specs/library-organization.md).

Validated on Windows with the installed desktop Google Chrome executable at
`C:/Program Files/Google/Chrome/Application/chrome.exe`, loaded unpacked through
the existing browser/persistence workflow. The shared launcher uses the
`CHROME_PATH` option documented in [development](../development.md).

- Full installed-Chrome browser suite: 40 passed, including the first ten new
  organization workflows; boundary regressions: 34 passed; build completed.
- Final organization suite adds a recovery independence regression: 11 passed.
- After the final review-dialog wording and narrow-viewport adjustments, the
  organization plus rediscovery suites passed all 19 workflows in installed Chrome.
- Creation, trimmed/case-insensitive conflicts including permanent destinations,
  stable identity on rename, keyboard importance controls, Undo and reopening.
- Explicit Video / From / To moves, Inbox exclusion, dates and exact no-op
  storage equality. Move Undo preserves later Personal title edits.
- Fixture observations are explicitly synthetic: out-of-order Manual anchors,
  equal and unknown dates, reversed publication direction, initial publication
  order and preserved existing relative order are checked in durable storage.
- Pending review requires separate confirmation after Keep. Affected placement
  changes refresh the preview; unrelated list creation and metadata observations
  preserve its usability. Failed writes leave durable placement/history intact
  and the dialog available for explicit retry.
- Selective recovery rejects relevant newer naming decisions while preserving
  unrelated later list names, Personal titles and automatic observations.
- Existing save/find/open/recover, title search, rediscovery, repair and restart
  workflows remain covered by the full regression suite.

The create/rename/recover/reopen UI workflow uses a 390 × 780 CSS-pixel viewport;
other browser tests use Playwright's default viewport. Input is browser-driven
pointer/keyboard automation. This is not evidence of physical mouse/trackpad
gestures, owner hardware testing, or representative-scale latency. Those
combined delivery checks remain with the integration validation ticket.

Organization persistence adds optional lists/settings and recoverable history
entries on mutation. Reading an older Library does not rewrite its records,
history, automatic observations or factual dates.
