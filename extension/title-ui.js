import { command } from './shared.js';
import { titleVersions } from './title-service.js';
import { formatDateTime, onDateFormatChanged } from './date-display.js';
import {showMetadataDetails} from './metadata-details-ui.js';

function button(label, action) {
  const element = document.createElement('button'); element.type = 'button'; element.className = 'secondary'; element.textContent = label;
  element.addEventListener('click', action); return element;
}

function observedTime(value) {
  const formatted = formatDateTime(value);
  return formatted === 'Unknown' ? 'Observation time unknown' : formatted;
}
function sourceLabel(value) {
  return value === 'browser-tab' ? 'Captured from browser' : value ? `Source: ${value}` : 'Source unknown';
}
function describeObservation(observation) {
  const observed = observedTime(observation?.observedAt);
  return `${sourceLabel(observation?.source)} · ${observed === 'Observation time unknown' ? '' : 'Observed '}${observed}`;
}

function inspectTitles(record, selectedIndex = null) {
  const { original, latest, observations } = titleVersions(record);
  const dialog = document.createElement('dialog'); dialog.setAttribute('aria-label', 'Captured titles');
  const heading = document.createElement('h2'); heading.textContent = 'Captured titles';
  const explanation = document.createElement('p'); explanation.className = 'muted';
  explanation.textContent = record.metadata.observations.some(item=>item.source==='youtube-api')
    ? 'Automatic title observations include browser captures and deliberate YouTube retrievals, each with its actual source and time. Original is the first usable title; Latest is the most recent observation. Metadata history is separate from Personal title edits and Library History.'
    : 'This build captures the current browser-tab title on Save. Original and Latest can be the same observation. Captured title history is separate from Personal title edits and Library History. Latest means the most recent capture, not a fresh YouTube API lookup. Editing a Personal title does not create an Intermediate capture.';
  const controls = document.createElement('div'); controls.className = 'title-tools';
  const panel = document.createElement('div'); panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Title observations');
  const selections = [];
  let currentView;
  function show(view) {
    currentView = view;
    for (const item of selections) item.setAttribute('aria-pressed', String(item.dataset.view === view));
    panel.replaceChildren();
    const indices = view === 'Original' ? original < 0 ? [] : [original] : view === 'Latest' ? latest < 0 ? [] : [latest] : observations.map((_, index) => index);
    if (!indices.length) { const empty = document.createElement('p'); empty.textContent = 'No usable title captured.'; panel.append(empty); }
    for (const index of indices) {
      const observation = observations[index];
      const version = document.createElement('section'); version.className = 'title-version';
      const matched = view === 'History' && index === selectedIndex;
      if (matched) { version.setAttribute('role', 'region'); version.setAttribute('aria-label', 'Matched title version'); version.classList.add('matched-version'); version.tabIndex = -1; }
      const name = document.createElement('h3'); name.textContent = `Observation ${index + 1}${index === original ? ' · Original' : ''}${index === latest ? ' · Latest' : ''}${matched ? ' · Search match' : ''}`;
      const title = document.createElement('p'); title.textContent = observation.title || 'Title unavailable';
      if(observation.description) { const description=document.createElement('p');description.textContent=observation.description; version.append(description); }
      const provenance = document.createElement('p'); provenance.className = 'muted'; provenance.textContent = describeObservation(observation);
      version.append(name, title, provenance); panel.append(version);
    }
  }
  for (const name of ['Original', 'Latest', 'History']) { const item = button(name === 'History' ? 'Captured title history' : name, () => show(name)); item.dataset.view = name; selections.push(item); controls.append(item); }
  const close = button('Close titles', () => dialog.close());
  dialog.append(heading, explanation, controls, panel, close); document.body.append(dialog);
  show(selectedIndex === null ? 'Original' : 'History');
  const unsubscribe = onDateFormatChanged(() => show(currentView));
  dialog.addEventListener('close', () => { unsubscribe(); dialog.remove(); }, { once: true });
  dialog.showModal();
  if (selectedIndex !== null) { const selected = panel.querySelector('.matched-version'); selected?.focus(); selected?.scrollIntoView({ block: 'nearest' }); }
}

export function appendTitleTools(content, record, { onChanged, onReviewRequired }) {
  const tools = document.createElement('div'); tools.className = 'title-tools';
  const { original, latest, observations } = titleVersions(record);
  if (record.user.personalTitle) { const authored = document.createElement('p'); authored.className = 'muted'; authored.textContent = 'Personal title'; content.append(authored); }
  if (latest >= 0 && (!observations[latest].title || observations[latest].title !== observations[original]?.title)) {
    const automatic = document.createElement('p'); automatic.className = 'muted';
    automatic.textContent = `Latest: ${observations[latest].title || 'Title unavailable'} · ${describeObservation(observations[latest])}`; content.append(automatic);
  }
  if (record.historicalMatch) {
    const match = record.historicalMatch;
    const link = button(`Matched ${match.field ?? 'title'} from ${observedTime(match.observedAt)}: ${match.excerpt}`, () => record.metadata.checks?.length ? showMetadataDetails(record,{onChanged,selectedIndex:match.index}) : inspectTitles(record, match.index));
    link.classList.add('historical-match'); content.append(link);
  }
  tools.append(button('Captured titles', () => inspectTitles(record)));
  if (record.user.status !== 'active') { content.append(tools); return; }
  const edit = button('Edit Personal title', () => {
    if (record.user.pendingReview) { onReviewRequired(record); return; }
    const dialog = document.createElement('dialog'); dialog.setAttribute('aria-label', 'Edit Personal title');
    const heading = document.createElement('h2'); heading.textContent = 'Edit Personal title';
    const form = document.createElement('form');
    const label = document.createElement('label'); label.textContent = 'Personal title';
    const input = document.createElement('input'); input.value = record.user.personalTitle ?? ''; label.append(input);
    const help = document.createElement('p'); help.className = 'muted'; help.textContent = 'Give this video your own title. Clearing restores its captured title or saved URL.';
    const status = document.createElement('p'); status.setAttribute('role', 'status');
    const actions = document.createElement('div'); actions.className = 'title-tools';
    const save = button('Save title', () => {}); save.type = 'submit';
    let saving = false;
    async function submit(value) {
      if (saving) return;
      saving = true; for (const item of [save, clear]) item.disabled = true;
      const result = await command({ type: 'editTitle', recordId: record.id, expectedRevision: record.user.revision, personalTitle: value });
      saving = false; for (const item of [save, clear]) item.disabled = false;
      if (!result.ok) { status.textContent = result.error; return; }
      if (result.outcome === 'reviewRequired') { dialog.close(); onReviewRequired(result.record); return; }
      dialog.close();
      onChanged(result.outcome === 'titleCleared' ? 'Personal title cleared.' : result.outcome === 'unchanged' ? 'Personal title unchanged.' : 'Personal title saved.');
    }
    const clear = button('Clear Personal title', () => submit(null));
    const cancel = button('Cancel', () => dialog.close());
    actions.append(save, clear, cancel); form.append(label, help, actions, status); dialog.append(heading, form);
    form.addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog); dialog.showModal(); input.focus();
  });
  tools.prepend(edit); content.append(tools);
}
