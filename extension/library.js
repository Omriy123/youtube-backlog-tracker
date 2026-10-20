import { command, displayTitle } from './shared.js';
import { appendOpenActions, renderOpeningRecovery } from './opening-ui.js';
import { appendTitleTools } from './title-ui.js';
import { appendReviewBadge, showReview } from './review-ui.js';
import { createBrowserAdapter } from './browser.js';
const container = document.querySelector('#records');
const search = document.querySelector('input[type=search]');
const scopeInputs = [...document.querySelectorAll('.search-scopes input')];
let request = 0;
async function render() {
  const current = ++request;
  const scopes = Object.fromEntries(scopeInputs.map(input => [input.name, input.checked]));
  document.querySelector('#scope-status').textContent = scopeInputs.some(input => input.checked) ? 'URL always included.' : 'URL-only search. All title scopes are off.';
  const result = await command({ type: 'list', query: search.value, scopes });
  if (current !== request) return;
  if (!result.ok) { document.querySelector('[role=status]').textContent = result.error; return; }
  renderOpeningRecovery(result, { onChanged: render, onReviewRequired });
  document.querySelector('#count').textContent = `${result.records.length} saved ${result.records.length === 1 ? 'video' : 'videos'}`;
  container.replaceChildren();
  if (!result.records.length) { const empty = document.createElement('p'); empty.textContent = search.value ? 'No matching saved videos.' : 'Your Inbox is ready. Save a video from the toolbar.'; container.append(empty); }
  for (const record of result.records) {
    const row = document.createElement('article');
    const thumbnail = document.createElement('div'); thumbnail.className = 'thumbnail'; thumbnail.textContent = 'No thumbnail';
    const content = document.createElement('div'); content.className = 'row-content';
    const title = document.createElement('h2'); title.textContent = displayTitle(record);
    const url = document.createElement('p'); url.className = 'url'; url.textContent = record.url;
    const missing = document.createElement('p'); missing.className = 'muted'; missing.textContent = 'Channel unknown · Duration unknown · Publication date unknown';
    content.append(title, url, missing);
    appendReviewBadge(content, record, { onChanged: reviewChanged });
    appendOpenActions(title, content, record, { onChanged: render, onReviewRequired });
    appendTitleTools(content, record, {
      onChanged(message) { document.querySelector('main > [role=status]').textContent = message; render(); },
      onReviewRequired,
    });
    row.append(thumbnail, content); container.append(row);
  }
}
function reviewChanged(message) {
  document.querySelector('main > [role=status]').textContent = message;
  render();
}
function onReviewRequired(record) {
  document.querySelector('main > [role=status]').textContent = 'Review prior activity before opening or editing this video.';
  showReview(record, { onChanged: reviewChanged });
}
search.addEventListener('input', render);
createBrowserAdapter().watchLibraryChanges(render);
for (const input of scopeInputs) input.addEventListener('change', render);
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => {
  document.querySelector('h1').textContent = button.dataset.view;
  for (const item of document.querySelectorAll('[data-view]')) item.removeAttribute('aria-current');
  button.setAttribute('aria-current', 'page'); render();
});
render();
