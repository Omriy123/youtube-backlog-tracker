import { command, displayTitle } from './shared.js';

export function appendOpenActions(title, content, record, { onChanged, onReviewRequired }) {
  async function open() {
    const result = await command({ type: 'open', recordId: record.id, expectedRevision: record.user.revision, attemptId: crypto.randomUUID() });
    if (result.outcome === 'reviewRequired') { onReviewRequired(record); return; }
    document.querySelector('[role=status]').textContent = result.ok ? 'Opened in a new tab · Playback not verified' : result.error;
    await onChanged();
  }
  const target = document.createElement('button'); target.className = 'title-target'; target.textContent = displayTitle(record); target.addEventListener('click', open);
  title.replaceChildren(target);
  const button = document.createElement('button'); button.textContent = 'Open video'; button.addEventListener('click', open); content.append(button);
}

export function renderOpeningRecovery(result, { onChanged }) {
  const container = document.querySelector('#opening-recovery'); container.replaceChildren();
  for (const recovery of result.recoveries ?? []) {
    const section = document.createElement('div'); section.className = 'recovery';
    const label = document.createElement('p'); label.textContent = `${recovery.message} · ${displayTitle(recovery.record)}`;
    section.append(label);
    if (recovery.outcome === 'known' || recovery.outcome === 'failed') {
      const repair = document.createElement('button'); repair.textContent = recovery.outcome === 'failed' ? 'Finish failed opening recovery' : 'Repair Library update';
      repair.disabled = !recovery.canRepair;
      repair.addEventListener('click', async () => {
        const response = await command({ type: 'repairOpening', attemptId: recovery.attemptId });
        document.querySelector('[role=status]').textContent = response.ok ? 'Library update saved · No additional tab opened' : response.error;
        await onChanged();
      }); section.append(repair);
    } else {
      const warning = document.createElement('p'); warning.textContent = 'Inspect existing tabs first. Opening again may create a duplicate tab. Inspection does not mark the video watched.';
      const inspectedTabs = document.createElement('ul'); inspectedTabs.hidden = true;
      const inspect = document.createElement('button'); inspect.textContent = 'Inspect existing tabs';
      inspect.addEventListener('click', async () => {
        const response = await command({ type: 'inspectOpening', attemptId: recovery.attemptId });
        if (!response.ok) { document.querySelector('[role=status]').textContent = response.error; return; }
        inspectedTabs.replaceChildren(); inspectedTabs.hidden = false;
        for (const tab of response.tabs) {
          const item = document.createElement('li');
          const focus = document.createElement('button'); focus.textContent = `Focus existing tab: ${tab.title || tab.url || 'Untitled tab'}`;
          focus.addEventListener('click', async () => {
            const focused = await command({ type: 'focusOpeningTab', attemptId: recovery.attemptId, tabId: tab.id });
            document.querySelector('[role=status]').textContent = focused.ok ? 'Existing tab focused · Opening outcome remains uncertain' : focused.error;
          });
          const url = document.createElement('span'); url.textContent = ` ${tab.url || 'URL unavailable'}`;
          item.append(focus, url); inspectedTabs.append(item);
        }
      });
      const fresh = document.createElement('button'); fresh.textContent = 'Open a new tab anyway';
      fresh.addEventListener('click', async () => {
        const response = await command({ type: 'newOpening', attemptId: recovery.attemptId, newAttemptId: crypto.randomUUID(), expectedRevision: recovery.record.user.revision, acknowledgePossibleDuplicate: true });
        document.querySelector('[role=status]').textContent = response.ok ? 'Opened a new tab · The earlier attempt remains unverified' : response.error;
        await onChanged();
      });
      section.append(warning, inspect, inspectedTabs, fresh);
    }
    if (recovery.reason) { const reason = document.createElement('p'); reason.textContent = recovery.reason; section.append(reason); }
    container.append(section);
  }
  if (result.latestOpening) {
    const label = document.createElement('p'); label.textContent = `Opened: ${displayTitle(result.latestOpening.record)} · Playback not verified`;
    const undo = document.createElement('button'); undo.textContent = 'Undo opening';
    undo.disabled = !result.latestOpening.canUndo;
    undo.addEventListener('click', async () => {
      const response = await command({ type: 'undoOpening', attemptId: result.latestOpening.attemptId });
      document.querySelector('[role=status]').textContent = response.ok ? 'Opening undone · Browser tabs left open' : response.error;
      await onChanged();
    });
    container.append(label, undo);
    if (result.latestOpening.reason) { const reason = document.createElement('p'); reason.textContent = result.latestOpening.reason; container.append(reason); }
  }
}
