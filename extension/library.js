import { renderOrganizationControls, showMove, organizationButton } from './organization-ui.js';
import { createArrangementController, appendLibraryDates, renderOverviewControls } from './arrangement-ui.js';
import { orderLists } from './arrangement-service.js';
import { command, displayTitle } from './shared.js';
import { appendOpenActions, renderOpeningRecovery } from './opening-ui.js';
import { appendTitleTools } from './title-ui.js';
import { appendReviewBadge, showReview } from './review-ui.js';
import { createBrowserAdapter } from './browser.js';
import { setDateFormat } from './date-display.js';
const container = document.querySelector('#records');
const search = document.querySelector('input[type=search]');
const scopeInputs = [...document.querySelectorAll('.search-scopes input')];
const dateFormat = document.querySelector('#date-format');
const browser = createBrowserAdapter();
let request = 0;
let view = 'Inbox';
const arrangements=createArrangementController({onChanged:message=>organizationChanged(message ?? ''),onError:message=>{document.querySelector('main > [role=status]').textContent=message;}});
const sortControls=document.createElement('div');sortControls.id='arrangement-controls';container.before(sortControls);
function organizationChanged(message, target) { document.querySelector('main > [role=status]').textContent=message; if(typeof target==='string') view=target; render(); }
async function render() {
  const current = ++request;
  const scopes = Object.fromEntries(scopeInputs.map(input => [input.name, input.checked]));
  document.querySelector('#scope-status').textContent = scopeInputs.some(input => input.checked) ? 'URL always included.' : 'URL-only search. All title scopes are off.';
  const result = await command({ type: 'list', query: search.value, scopes });
  if (current !== request) return;
  if (!result.ok) { document.querySelector('[role=status]').textContent = result.error; return; }
  if(view!=='Entire Library' && !result.lists.some(list=>list.id===view)) view='Entire Library';
  result.lists=orderLists(result.lists,result.listStatistics,result.organizationPreferences.overviewSort);
  renderOrganizationControls(result,{view,onNavigate(id){view=id;render();},onChanged:organizationChanged});
  renderOverviewControls(result,{onChanged:render,onError:message=>organizationChanged(message)});
  document.querySelector('h1').textContent=result.lists.find(list=>list.id===view)?.name ?? view;
  result.records=result.records.filter(record=>view==='Entire Library' || record.user.destination===view);
  const context={scopeId:view==='Entire Library'?null:view,originListId:view,query:search.value,titleScopes:scopes,channelId:null,selectedOnly:false,reviewSelected:false,sort:result.organizationPreferences.videoSort,preferences:result.organizationPreferences,lists:result.lists};
  result.records=arrangements.order(result.records,context);
  arrangements.renderSortControls(sortControls,context);
  document.body.dataset.density=result.organizationPreferences.density ?? 'thumbnails';
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
    appendLibraryDates(content,record);
    appendReviewBadge(content, record, { onChanged: reviewChanged });
    appendOpenActions(title, content, record, { onChanged: render, onReviewRequired });
    appendTitleTools(content, record, {
      onChanged(message) { document.querySelector('main > [role=status]').textContent = message; render(); },
      onReviewRequired,
    });
    content.append(organizationButton('Move video',()=>showMove([record],result.lists,{onChanged:organizationChanged})));
    row.append(thumbnail, content);arrangements.enhanceRow(row,record,{context,records:result.records});container.append(row);
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
browser.watchLibraryChanges(render);
browser.watchDateFormatChanges(value => {
  dateFormat.value = value === 'israeli' ? 'israeli' : 'browser';
  setDateFormat(dateFormat.value);
  render();
});
dateFormat.addEventListener('change', async () => {
  const selected = dateFormat.value;
  dateFormat.disabled = true;
  try {
    await browser.writeDateFormat(selected);
    setDateFormat(selected);
    await render();
  } catch {
    dateFormat.value = await browser.readDateFormat().catch(() => 'browser');
    document.querySelector('main > [role=status]').textContent = 'Date and time preference was not saved.';
  } finally { dateFormat.disabled = false; }
});
for (const input of scopeInputs) input.addEventListener('change', render);
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => {
  document.querySelector('h1').textContent = button.dataset.view;
  for (const item of document.querySelectorAll('[data-view]')) item.removeAttribute('aria-current');
  button.setAttribute('aria-current', 'page'); render();
});
browser.readDateFormat().then(value => {
  dateFormat.value = value === 'israeli' ? 'israeli' : 'browser';
  setDateFormat(dateFormat.value);
  render();
}).catch(() => render());
