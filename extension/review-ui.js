import { command } from './shared.js';
import { formatDateTime, onDateFormatChanged } from './date-display.js';

function button(label, action) {
  const item = document.createElement('button'); item.type = 'button'; item.className = 'secondary'; item.textContent = label;
  item.addEventListener('click', action); return item;
}
function time(value) {
  return formatDateTime(value);
}

export function showReview(record, { onChanged }) {
  const pending = record.user.pendingReview;
  if (!pending) return;
  const previous = pending.previous ?? {};
  const before = previous.user ?? {};
  const dialog = document.createElement('dialog'); dialog.setAttribute('aria-label', 'Review prior activity');
  const heading = document.createElement('h2'); heading.textContent = 'Review prior activity';
  const inInbox = record.user.destination === 'Inbox';
  const explanation = document.createElement('p'); explanation.textContent = `Saved ${inInbox ? 'in Inbox' : 'in this destination'} with review pending. Keep confirms staying here. Opening, editing or moving needs a separate action afterward. Watched records do not establish playback.`;
  dialog.append(heading, explanation);
  function line(label, value) { const p = document.createElement('p'); p.textContent = `${label}: ${value}`; dialog.append(p); }
  const dateUpdates = [];
  function dateLine(label, value) { const p = document.createElement('p'); const update = () => { p.textContent = `${label}: ${time(value)}`; }; dateUpdates.push(update); update(); dialog.append(p); }
  const priorStatus = previous.status ?? pending.priorStatus;
  line('Previous status', priorStatus === 'watched' ? 'Watched' : priorStatus === 'dismissed' ? 'Dismissed' : 'Unknown');
  line('Previous destination', previous.destinationName ?? (['Inbox','Backlog'].includes(previous.destination)?previous.destination:previous.destination?'Destination unavailable':'Unknown'));
  dateLine('Last activity', previous.lastActivityAt);
  dateLine('Last opened', previous.lastOpenedAt);
  dateLine('Last watch event', previous.lastWatchedAt);
  dateLine('Last dismissed', previous.dismissedAt);
  dateLine('First saved', before.firstSavedAt);
  dateLine('First Inbox-exit', before.firstInboxExitAt);
  dateLine('Previous list-entry', before.latestListEntryAt);
  const events = before.watchEvents ?? [];
  line('Retained watch events', events.length);
  for (const event of events) dateLine(event.source==='manual'?'Marked watched':'Opened', event.at);
  if (previous.activity?.length) {
    const activity = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Prior Library activity';
    const list = document.createElement('ul'); list.setAttribute('aria-label', 'Prior Library activity');
    const labels = { save: 'Saved', opening: 'Opened from tracker', undoOpening: 'Opening undone', editTitle: 'Personal title changed', rediscovery: 'Returned to Inbox for review', keepRediscovery: 'Kept in Inbox', dismissRediscovery: 'Dismissed' };
    for (const event of previous.activity) { const item = document.createElement('li'); const update = () => { item.textContent = `${labels[event.type] ?? 'Library change'} · ${time(event.at)}`; }; dateUpdates.push(update); update(); list.append(item); }
    activity.append(summary, list); dialog.append(activity);
  }
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  const actions = document.createElement('div'); actions.className = 'title-tools';
  let saving = false;
  async function decide(decision) {
    if (saving) return;
    saving = true; for (const item of actions.children) item.disabled = true;
    status.textContent = 'Saving review…';
    const result = await command({ type: 'review', recordId: record.id, expectedRevision: record.user.revision, decision });
    saving = false; for (const item of actions.children) item.disabled = false;
    if (!result.ok) { status.textContent = result.error; return; }
    dialog.close();
    onChanged(result.outcome === 'kept' ? `Kept ${inInbox ? 'in Inbox' : 'here'}. Choose Open or Edit when ready.` : 'Dismissed. Prior history retained.', result.record);
  }
  actions.append(button(inInbox ? 'Keep in Inbox' : 'Leave here', () => decide('keep')), button('Dismiss', () => decide('dismiss')), button('Cancel', () => dialog.close()));
  dialog.addEventListener('cancel', event => { if (saving) event.preventDefault(); });
  const unsubscribe = onDateFormatChanged(() => { for (const update of dateUpdates) update(); });
  dialog.addEventListener('close', () => { unsubscribe(); dialog.remove(); }, { once: true });
  dialog.append(status, actions); document.body.append(dialog); dialog.showModal();
}

export function appendReviewBadge(content, record, options) {
  if (!record.user.pendingReview) return;
  const badge = button('Review prior activity', () => showReview(record, options));
  badge.classList.add('review-badge'); content.append(badge);
}
