import { command } from './shared.js';
import { appendReviewBadge } from './review-ui.js';
import { createBrowserAdapter } from './browser.js';
import { setDateFormat } from './date-display.js';
const preferenceReady = createBrowserAdapter().readDateFormat().then(setDateFormat).catch(() => {});
const save = document.querySelector('#save');
const status = document.querySelector('[role=status]');
const review = document.createElement('div'); status.before(review);
function renderReview(record) {
  review.replaceChildren();
  if (record) appendReviewBadge(review, record, { onChanged(message, updated) { status.textContent = message; renderReview(updated); } });
}
save.addEventListener('click', async () => {
  save.disabled = true;
  status.textContent = 'Saving…';
  await preferenceReady;
  const result = await command({ type: 'save' });
  status.textContent = result.ok ? (result.outcome === 'alreadySaved' ? 'Already saved' : 'Saved to Inbox') + (result.record.user.pendingReview ? ' — review pending' : '') : result.error;
  if (result.ok) renderReview(result.record);
  save.disabled = false;
});
document.querySelector('#library').addEventListener('click', async () => {
  const result = await command({ type: 'openLibrary' });
  if (!result.ok) status.textContent = result.error;
});
