export function titleVersions(record) {
  const observations = record.metadata.observations;
  const original = observations.findIndex(item => Boolean(item.title));
  const latest = observations.length - 1;
  return { original, latest, observations };
}

export function matchRecordTitles(record, query, scopes) {
  const text = (query ?? '').trim().toLocaleLowerCase();
  if (!text) return { matched: true, historicalMatch: null };
  const includes = value => typeof value === 'string' && value.toLocaleLowerCase().includes(text);
  const enabled = name => scopes ? scopes[name] === true : true;
  const url = includes(record.url);
  const personal = enabled('personal') && includes(record.user.personalTitle);
  const { original, latest, observations } = titleVersions(record);
  const matches = observations.flatMap((item, index) => {
    const selected = (index === original && enabled('original')) || (index === latest && enabled('latest')) || (index !== original && index !== latest && enabled('intermediate'));
    return selected && includes(item.title) ? [index] : [];
  });
  let historicalMatch = null;
  if (!url && !personal && !matches.includes(latest) && matches.length) {
    const index = matches[0]; const observation = observations[index];
    const start = Math.max(0, observation.title.toLocaleLowerCase().indexOf(text) - 45);
    const end = Math.min(observation.title.length, start + 140);
    historicalMatch = { index, ...observation, excerpt: `${start ? '…' : ''}${observation.title.slice(start, end)}${end < observation.title.length ? '…' : ''}` };
  }
  return { matched: url || personal || matches.length > 0, historicalMatch };
}

export async function editTitle(state, browser, message) {
  const record = state.records.find(item => item.id === message.recordId);
  if (!record || record.user.status !== 'active') {
    return { ok: false, outcome: 'notEditable', error: 'Personal titles can be edited for active videos only.' };
  }
  if (record.user.pendingReview) return { ok: true, outcome: 'reviewRequired', recordId: record.id, record };
  if (message.expectedRevision !== record.user.revision) {
    return { ok: false, outcome: 'conflict', error: 'This video changed. Close the editor and try again.', record };
  }
  if (message.personalTitle !== null && typeof message.personalTitle !== 'string') {
    return { ok: false, error: 'Enter a Personal title or clear it.' };
  }
  const title = message.personalTitle?.trim() || null;
  if (title === record.user.personalTitle) return { ok: true, outcome: 'unchanged', record };
  const before = structuredClone(record.user);
  record.user.personalTitle = title;
  record.user.revision++;
  state.history.push({ id: browser.id(), type: 'editTitle', recordId: record.id, at: browser.now(), before, after: structuredClone(record.user) });
  await browser.write(state);
  return { ok: true, outcome: title ? 'titleSaved' : 'titleCleared', record };
}
