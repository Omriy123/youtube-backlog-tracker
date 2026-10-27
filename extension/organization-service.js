export function organizationLists(state) {
  return [
    { id: 'Inbox', name: 'Inbox', permanent: true, manualOrder: [], publicationDirection: 'asc' },
    ...(state.lists ?? []).slice().sort((a, b) => a.importance - b.importance),
    { id: 'Backlog', name: 'Backlog', permanent: true, manualOrder: [], publicationDirection: 'asc' },
  ].map(list => ({ ...list, ...(state.listSettings?.[list.id] ?? {}) }));
}
function canonical(value) { return Array.isArray(value) ? value.map(canonical) : value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])) : value; }
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const fail = error => ({ ok: false, error });
async function persist(state,browser,actionId) {
  try { await browser.write(state); }
  catch(error) {
    const durable=await browser.read();
    if(!durable?.history.some(item=>item.id===actionId)) throw error;
  }
}
const placement = user => Object.fromEntries(['status','destination','firstSavedAt','firstInboxExitAt','latestListEntryAt','pendingReview','lastDismissal','watchEvents'].map(key => [key, user[key] ?? null]));
export function publicationDate(record) {
  const value = record.metadata.publicationDate ?? record.metadata.publishedAt ?? record.metadata.observations.findLast(item => item.publicationDate || item.publishedAt)?.publicationDate ?? record.metadata.observations.findLast(item => item.publishedAt)?.publishedAt;
  const date = Date.parse(value); return Number.isFinite(date) ? date : null;
}
export function fitArrivals(existing, incoming, direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1;
  const order = [...existing];
  const sorted = incoming.map((record, index) => ({ record, index, date: publicationDate(record) })).sort((a,b) => a.date === null ? (b.date === null ? a.index-b.index : 1) : b.date === null ? -1 : sign*(a.date-b.date) || a.index-b.index);
  for (const {record,date} of sorted) {
    if (date === null) { order.push(record); continue; }
    let last = -1;
    for (let index = 0; index < order.length; index++) {
      const anchor = publicationDate(order[index]);
      if (anchor !== null && sign*(anchor-date) <= 0) last=index;
    }
    const next = order.findIndex((item,index) => index > last && publicationDate(item) !== null && sign*(publicationDate(item)-date) > 0);
    order.splice(next < 0 ? order.length : next,0,record);
  }
  return order;
}
function orderFor(state,id) {
  const list = organizationLists(state).find(item => item.id===id);
  const records=state.records.filter(item => item.user.status==='active' && item.user.destination===id);
  const ids=list?.manualOrder ?? [];
  if(!ids.length) return fitArrivals([],records,list?.publicationDirection);
  return [...ids.map(key=>records.find(item=>item.id===key)).filter(Boolean), ...records.filter(item=>!ids.includes(item.id))];
}
function preview(state,command) {
  const lists=organizationLists(state);
  const ids=new Set(); const rows=[];
  for (const input of command.rows ?? []) {
    if (ids.has(input.recordId)) continue;
    ids.add(input.recordId);
    const record=state.records.find(item=>item.id===input.recordId);
    if (!record || record.user.status!=='active') return fail('An affected video is no longer active. Refresh the preview.');
    const to=input.to==='keep' ? record.user.destination : input.to;
    const target=lists.find(item=>item.id===to);
    if (!target || (to==='Inbox' && to!==record.user.destination && !command.allowInbox)) return fail('Choose an available destination. Ordinary moves cannot return videos to Inbox.');
    rows.push({recordId:record.id,to,record:structuredClone(record),from:record.user.destination,blocked:Boolean(record.user.pendingReview)});
  }
  const targetIds=[...new Set(rows.map(row=>row.to))];
  const signature=JSON.stringify({rows:rows.map(row=>({id:row.recordId,to:row.to,user:placement(row.record.user)})),targets:targetIds.map(id=>({list:lists.find(list=>list.id===id),members:orderFor(state,id).map(record=>({id:record.id,user:placement(record.user)}))}))});
  return {ok:true,preview:{rows,signature,allowInbox:Boolean(command.allowInbox)}};
}
function resources(state) {
  return { lists: structuredClone(state.lists ?? []), listSettings: structuredClone(state.listSettings ?? {}), records: state.records.map(record=>({id:record.id,user:placement(record.user)})) };
}
function deltas(before,after) {
  const result=[];
  for (const kind of ['lists','records']) {
    for (const id of new Set([...before[kind],...after[kind]].map(item=>item.id))) {
      const old=before[kind].find(item=>item.id===id) ?? null;
      const value=after[kind].find(item=>item.id===id) ?? null;
      if (!same(old,value)) {
        if(kind==='lists' && old && value) {
          for(const field of new Set([...Object.keys(old),...Object.keys(value)])) if(!same(old[field] ?? null,value[field] ?? null)) result.push({kind,id,field,before:old[field] ?? null,after:value[field] ?? null});
        } else result.push({kind,id,before:old,after:value});
      }
    }
  }
  for (const id of new Set([...Object.keys(before.listSettings),...Object.keys(after.listSettings)])) {
    const old=before.listSettings[id] ?? null; const value=after.listSettings[id] ?? null;
    for(const field of new Set([...Object.keys(old ?? {}),...Object.keys(value ?? {})])) if(!same(old?.[field] ?? null,value?.[field] ?? null)) result.push({kind:'listSettings',id,field,before:old?.[field] ?? null,after:value?.[field] ?? null});
  }
  return result;
}
export async function executeOrganization(state,browser,command) {
  if (command.type==='organizationPreview') return preview(state,command);
  if (!['createList','renameList','setListImportance','organizationCommit','organizationUndo'].includes(command.type)) return null;
  const before=resources(state); state.lists ??= []; state.listSettings ??= {};
  let outcome='Organization saved'; let result={};
  if (command.type==='organizationUndo') {
    const action=state.history.find(item=>item.id===command.actionId && item.type==='organization');
    if (!action || state.history.some(item=>item.type==='undoOrganization' && item.actionId===action.id)) return fail('This organization change is no longer available to undo.');
    const current=resources(state);
    for(const change of action.changes) {
      const resource=change.kind==='listSettings' ? current.listSettings[change.id] ?? null : current[change.kind].find(item=>item.id===change.id) ?? null;
      const value=change.field ? resource?.[change.field] ?? null : resource;
      if(!same(value,change.after)) return fail('A newer relevant decision conflicts with recovery. Keep that decision or undo it first.');
      if(change.kind==='lists' && !change.field && change.before===null && state.records.some(item=>item.user.destination===change.id)) return fail('This list now contains videos. Move them before undoing its creation.');
      const restoredName=change.kind==='lists' ? change.field==='name' ? change.before : !change.field ? change.before?.name : null : null;
      if(restoredName && organizationLists(state).some(item=>item.id!==change.id && item.name.trim().toLowerCase()===restoredName.toLowerCase())) return fail('Recovery would conflict with an existing list name. Rename that list first.');
    }
    for(const change of action.changes) {
      if(change.kind==='records') {
        const record=state.records.find(item=>item.id===change.id);
        Object.assign(record.user,change.before.user); record.user.revision++;
      } else if(change.kind==='listSettings') {
        state.listSettings[change.id] ??= {};
        if(change.before===null) delete state.listSettings[change.id][change.field]; else state.listSettings[change.id][change.field]=structuredClone(change.before);
        if(!Object.keys(state.listSettings[change.id]).length) delete state.listSettings[change.id];
      } else if(change.field) {
        const list=state.lists.find(item=>item.id===change.id);
        if(change.before===null) delete list[change.field]; else list[change.field]=structuredClone(change.before);
      } else {
        state.lists=state.lists.filter(item=>item.id!==change.id);
        if(change.before) state.lists.push(structuredClone(change.before));
      }
    }
    const undoId=browser.id();
    state.history.push({id:undoId,type:'undoOrganization',actionId:action.id,at:browser.now()});
    await persist(state,browser,undoId); return {ok:true,outcome:'Organization change undone'};
  }
  if (command.type==='createList' || command.type==='renameList') {
    const name=typeof command.name==='string' ? command.name.trim() : '';
    if(!name) return fail('Enter a nonempty list name.');
    if(organizationLists(state).some(item=>item.id!==command.listId && item.name.trim().toLowerCase()===name.toLowerCase())) return fail('A list with this name already exists.');
    if(command.type==='createList') {
      const list={id:browser.id(),name,importance:state.lists.length,manualOrder:[],publicationDirection:'asc'}; state.lists.push(list); result.list=list;
    } else {
      const list=state.lists.find(item=>item.id===command.listId);
      if(!list) return fail('Only an existing custom watch list can be renamed.');
      list.name=name; result.list=list;
    }
  }
  if(command.type==='setListImportance') {
    const ids=command.listIds;
    if(!Array.isArray(ids) || new Set(ids).size!==state.lists.length || ids.length!==state.lists.length || ids.some(id=>!state.lists.some(list=>list.id===id))) return fail('Watch lists changed. Refresh their importance order.');
    state.lists.forEach(list=>list.importance=ids.indexOf(list.id));
  }
  if(command.type==='organizationCommit') {
    const expected=command.preview;
    const fresh=preview(state,{rows:expected?.rows,allowInbox:false});
    if(!fresh.ok) return {...fresh,outcome:'stale'};
    if(fresh.preview.signature!==expected.signature) return {ok:false,outcome:'stale',error:'Affected videos or destinations changed. Review the refreshed preview and confirm again.',preview:fresh.preview};
    if(fresh.preview.rows.some(row=>row.blocked)) return {ok:false,outcome:'reviewRequired',error:'Review prior activity before moving. Review alone does not execute this move.',records:fresh.preview.rows.filter(row=>row.blocked).map(row=>row.record)};
    const moving=fresh.preview.rows.filter(row=>row.from!==row.to);
    const movedIds=new Set(moving.map(row=>row.recordId));
    const affected=[...new Set(moving.flatMap(row=>[row.from,row.to]))];
    const baselines=new Map(affected.map(id=>[id,orderFor(state,id).filter(record=>!movedIds.has(record.id))]));
    const time=browser.now();
    for(const row of moving) {
      const record=state.records.find(item=>item.id===row.recordId);
      record.user.destination=row.to; record.user.latestListEntryAt=time; record.user.firstInboxExitAt ??= time; record.user.revision++;
    }
    for(const id of affected) {
      const list=organizationLists(state).find(item=>item.id===id);
      const arrivals=moving.filter(row=>row.to===id).map(row=>state.records.find(item=>item.id===row.recordId));
      const manualOrder=fitArrivals(baselines.get(id),arrivals,list.publicationDirection).map(record=>record.id);
      if(list.permanent) state.listSettings[id]={...(state.listSettings[id] ?? {}),manualOrder};
      else state.lists.find(item=>item.id===id).manualOrder=manualOrder;
    }
    outcome=moving.length ? 'Move saved' : 'Kept in the current list'; result.processedIds=fresh.preview.rows.map(row=>row.recordId);
  }
  const changes=deltas(before,resources(state));
  if(!changes.length) return {ok:true,outcome,...result};
  const actionId=browser.id(); state.history.push({id:actionId,type:'organization',command:command.type,at:browser.now(),changes});
  await persist(state,browser,actionId);
  return {ok:true,outcome,actionId,...result};
}
export function organizationSummary(state) {
  const recovered=new Set(state.history.filter(item=>item.type==='undoOrganization').map(item=>item.actionId));
  return {lists:organizationLists(state),organizationActions:state.history.filter(item=>item.type==='organization' && !recovered.has(item.id)).map(({id,command,at})=>({id,command,at}))};
}



