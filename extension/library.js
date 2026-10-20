import { command, displayTitle } from './shared.js';
import { appendOpenActions, renderOpeningRecovery } from './opening-ui.js';
const container = document.querySelector('#records');
const search = document.querySelector('input[type=search]');
let request = 0;
async function render() {
  const current = ++request;
  const result = await command({ type: 'list', query: search.value });
  if (current !== request) return;
  if (!result.ok) { document.querySelector('[role=status]').textContent = result.error; return; }
  renderOpeningRecovery(result, { onChanged: render });
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
    appendOpenActions(title, content, record, { onChanged: render, onReviewRequired });
    const latest = record.metadata.observations.at(-1);
    if (latest?.title && latest.title !== displayTitle(record)) {
      const observed = document.createElement('p'); observed.className = 'muted';
      observed.textContent = `Latest: ${latest.title} · Captured from browser · ${new Date(latest.observedAt).toLocaleString()}`;
      content.append(observed);
    } row.append(thumbnail, content); container.append(row);
  }
}
function onReviewRequired() {
  document.querySelector('[role=status]').textContent = 'Review prior activity before opening this video.';
}
search.addEventListener('input', render);
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => {
  document.querySelector('h1').textContent = button.dataset.view;
  for (const item of document.querySelectorAll('[data-view]')) item.removeAttribute('aria-current');
  button.setAttribute('aria-current', 'page'); render();
});
render();
