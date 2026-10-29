import { command, displayTitle } from './shared.js';
import { showReview } from './review-ui.js';
export function organizationButton(label,action) {
  const button=document.createElement('button'); button.type='button'; button.className='secondary'; button.textContent=label; button.addEventListener('click',event=>{event.stopPropagation(); action();}); return button;
}
function dialogFor(name) {
  const dialog=document.createElement('dialog'); dialog.setAttribute('aria-label',name);
  const title=document.createElement('h2'); title.textContent=name; dialog.append(title);
  const status=document.createElement('p'); status.setAttribute('role','status');
  const actions=document.createElement('div'); actions.className='title-tools';
  dialog.addEventListener('close',()=>dialog.remove(),{once:true}); document.body.append(dialog);
  return {dialog,status,actions};
}
export function editList(list,{onChanged}) {
  const {dialog,status,actions}=dialogFor(list ? 'Rename list' : 'Create watch list');
  const label=document.createElement('label'); label.textContent='List name'; const input=document.createElement('input'); input.value=list?.name ?? ''; label.append(input); dialog.append(label,status,actions);
  const save=organizationButton('Save list',async()=>{
    save.disabled=true;
    const result=await command({type:list ? 'renameList' : 'createList',listId:list?.id,name:input.value}); save.disabled=false;
    if(!result.ok) {status.textContent=result.error;return;}
    dialog.close(); onChanged(result.outcome,result.list?.id);
  }); actions.append(save,organizationButton('Cancel',()=>dialog.close())); dialog.showModal(); input.focus();
}
export function renderOrganizationControls(result,{view,onNavigate,onChanged,onDelete}) {
  const nav=document.querySelector('nav'); nav.replaceChildren();
  const views=[{id:'Entire Library',name:'Entire Library'},...result.lists];
  for(const list of views) {
    const button=organizationButton(list.name,()=>onNavigate(list.id)); button.dataset.view=list.id;
    if(view===list.id) button.setAttribute('aria-current','page'); nav.append(button);
  }
  const management=document.querySelector('#list-management'); management.replaceChildren();
  management.append(organizationButton('Create watch list',()=>editList(null,{onChanged})));
  const list=result.lists.find(item=>item.id===view && !item.permanent);
  if(list) {
    management.append(organizationButton('Rename list',()=>editList(list,{onChanged})));
    const custom=result.lists.filter(item=>!item.permanent); const index=custom.findIndex(item=>item.id===list.id);
    for(const [label,offset] of [['More important',-1],['Less important',1]]) {
      const button=organizationButton(label,async()=>{
        const ids=custom.map(item=>item.id); [ids[index],ids[index+offset]]=[ids[index+offset],ids[index]];
        const saved=await command({type:'setListImportance',listIds:ids}); onChanged(saved.ok ? saved.outcome : saved.error);
      }); button.disabled=index+offset<0 || index+offset>=custom.length; management.append(button);
    }
  }
  if(onDelete) {
    const managementMenu=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Delete a watch list';managementMenu.append(summary);
    for(const custom of result.lists.filter(list=>!list.permanent))managementMenu.append(organizationButton(`Delete ${custom.name} list`,()=>onDelete(custom.id)));
    management.append(managementMenu);
  }
  const recovery=document.querySelector('#organization-recovery'); recovery.replaceChildren();
  const actions=result.organizationActions ?? [];
  if(actions.length) {
    const label=document.createElement('p'); label.textContent='Recover organization changes'; recovery.append(label);
    const select=document.createElement('select'); select.setAttribute('aria-label','Organization change to recover');
    const labels={createList:'Created watch list',renameList:'Renamed watch list',setListImportance:'Changed list importance',organizationCommit:'Moved videos',arrangeVideos:'Arranged videos',statusCommit:'Changed watched or dismissed status',removalCommit:'Removed videos or deleted list'};
    for(const action of actions.slice().reverse()) {const option=document.createElement('option');option.value=action.id;option.textContent=`${labels[action.command] ?? 'Organization change'} · ${new Date(action.at).toLocaleString()}`;select.append(option);}
    recovery.append(select,organizationButton('Undo organization change',async()=>{
      const undone=await command({type:'organizationUndo',actionId:select.value}); onChanged(undone.ok ? undone.outcome : undone.error);
    }));
  }
}
export async function showMove(records,lists,{onChanged,onProcessed,initialDestination}={}) {
  const {dialog,status,actions}=dialogFor('Move videos');
  let frozen=null;let generation=0;let saving=false;
  const excluded=new Set();const choices=new Map(records.map(record=>[record.id,initialDestination ?? 'keep']));
  const live=new Map(records.map(record=>[record.id,record]));
  const count=document.createElement('p');const table=document.createElement('table');const head=document.createElement('thead');const heading=document.createElement('tr');
  for(const text of ['Video','From','To']) {const th=document.createElement('th');th.textContent=text;heading.append(th);}head.append(heading);table.append(head);const body=document.createElement('tbody');table.append(body);
  const name=id=>lists.find(list=>list.id===id)?.name ?? 'Destination unavailable';
  function destinations(select,value) {
    for(const list of [{id:'keep',name:'Keep in the current list'},...lists.filter(list=>list.id!=='Inbox')]){const option=document.createElement('option');option.value=list.id;option.textContent=list.name;select.append(option);}
    if(value!=='keep' && !lists.some(list=>list.id===value && list.id!=='Inbox')){const invalid=document.createElement('option');invalid.value=value;invalid.textContent='Unavailable destination - choose again';select.append(invalid);}
    select.value=value;
  }
  if(records.length>1) {
    const label=document.createElement('label');label.textContent='Shared destination';const shared=document.createElement('select');shared.setAttribute('aria-label','Shared destination');destinations(shared,'keep');label.append(shared);
    dialog.append(label,organizationButton('Set the same destination for all',()=>{for(const record of records)choices.set(record.id,shared.value);refresh();}));
  }
  async function reviewRecord(record) {
    showReview(record,{onChanged:async(message,updated)=>{
      if(updated?.user.status!=='active')excluded.add(record.id);
      await refresh();status.textContent='Review resolved. Review the refreshed move and confirm separately.';
      onChanged?.('Review resolved. Move still awaits confirmation.');
    }});
  }
  function paint() {
    body.replaceChildren();count.textContent=`${records.length-excluded.size} included / ${records.length} requested`;
    for(const initial of records) {
      const record=live.get(initial.id);const row=document.createElement('tr');const title=document.createElement('td');title.textContent=displayTitle(record ?? initial);const from=document.createElement('td');from.textContent=record?name(record.user.destination):'No longer active';
      const cell=document.createElement('td');const select=document.createElement('select');select.setAttribute('aria-label',`Destination for ${displayTitle(initial)}`);destinations(select,choices.get(initial.id));select.disabled=excluded.has(initial.id) || saving;select.addEventListener('change',()=>{choices.set(initial.id,select.value);refresh();});cell.append(select);
      if(record?.user.pendingReview)cell.append(organizationButton(`Review ${displayTitle(record)}`,()=>reviewRecord(record)));
      if(records.length>1 || record?.user.pendingReview || !record) {
        const label=document.createElement('label');label.className='move-exclusion';const exclude=document.createElement('input');exclude.type='checkbox';exclude.checked=excluded.has(initial.id);exclude.setAttribute('aria-label',`Exclude ${displayTitle(initial)} from this move`);exclude.addEventListener('change',()=>{exclude.checked?excluded.add(initial.id):excluded.delete(initial.id);refresh();});label.append(exclude,document.createTextNode('Exclude from this move'));cell.append(label);
      }
      row.append(title,from,cell);body.append(row);
    }
  }
  const confirm=organizationButton('Confirm move',async()=>{
    if(!frozen || saving)return;saving=true;confirm.disabled=true;dialog.inert=true;
    const result=await command({type:'organizationCommit',preview:frozen});saving=false;dialog.inert=false;
    if(result.ok){onProcessed?.(result.processedIds);dialog.close();onChanged?.(result.outcome,result);return;}
    status.textContent=result.error;
    if(result.preview){frozen=result.preview;if(frozen.lists)lists=frozen.lists;for(const row of frozen.rows)live.set(row.recordId,row.record);paint();}
    else if(result.outcome==='stale'){await refresh();status.textContent=result.error;}
    if(result.outcome==='reviewRequired')reviewRecord(result.records[0]);
    confirm.disabled=!frozen;
  });
  dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
  async function refresh() {
    const current=++generation;frozen=null;confirm.disabled=true;
    const snapshot=await command({type:'list'});if(current!==generation)return;
    if(!snapshot.ok){status.textContent=snapshot.error;return;}
    lists=snapshot.lists;live.clear();for(const record of snapshot.records)live.set(record.id,record);paint();
    const rows=records.filter(record=>!excluded.has(record.id)).map(record=>({recordId:record.id,to:choices.get(record.id)}));
    if(!rows.length){status.textContent='No included videos. Excluded videos stay selected.';return;}
    const result=await command({type:'organizationPreview',rows});if(current!==generation)return;
    if(result.ok){frozen=result.preview;status.textContent=frozen.rows.some(row=>row.blocked)?'Review prior activity or explicitly exclude unresolved rows before moving.':'Review every destination before confirming.';}else status.textContent=result.error;
    confirm.disabled=!frozen;
  }
  actions.append(confirm,organizationButton('Refresh move preview',refresh),organizationButton('Cancel',()=>dialog.close()));dialog.append(count,table,status,actions);dialog.showModal();await refresh();
}
