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
export function renderOrganizationControls(result,{view,onNavigate,onChanged}) {
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
  const recovery=document.querySelector('#organization-recovery'); recovery.replaceChildren();
  const actions=result.organizationActions ?? [];
  if(actions.length) {
    const label=document.createElement('p'); label.textContent='Recover organization changes'; recovery.append(label);
    const select=document.createElement('select'); select.setAttribute('aria-label','Organization change to recover');
    const labels={createList:'Created watch list',renameList:'Renamed watch list',setListImportance:'Changed list importance',organizationCommit:'Moved videos'};
    for(const action of actions.slice().reverse()) {const option=document.createElement('option');option.value=action.id;option.textContent=`${labels[action.command] ?? 'Organization change'} · ${new Date(action.at).toLocaleString()}`;select.append(option);}
    recovery.append(select,organizationButton('Undo organization change',async()=>{
      const undone=await command({type:'organizationUndo',actionId:select.value}); onChanged(undone.ok ? undone.outcome : undone.error);
    }));
  }
}
export async function showMove(records,lists,{onChanged}) {
  const {dialog,status,actions}=dialogFor('Move videos');
  let frozen=null;
  const table=document.createElement('table'); const head=document.createElement('thead'); const heading=document.createElement('tr');
  for(const text of ['Video','From','To']) {const th=document.createElement('th');th.textContent=text;heading.append(th);}head.append(heading);table.append(head);
  const body=document.createElement('tbody');table.append(body);const choices=new Map();
  const name=id=>lists.find(item=>item.id===id)?.name ?? id;
  for(const record of records) {
    const row=document.createElement('tr'); const title=document.createElement('td');title.textContent=displayTitle(record);const from=document.createElement('td');from.textContent=name(record.user.destination);
    const cell=document.createElement('td');const select=document.createElement('select');select.setAttribute('aria-label',`Destination for ${displayTitle(record)}`);
    for(const list of [{id:'keep',name:'Keep in the current list'},...lists.filter(list=>list.id!=='Inbox')]) {const option=document.createElement('option');option.value=list.id;option.textContent=list.name;select.append(option);}
    choices.set(record.id,select); select.addEventListener('change',refresh);cell.append(select);row.append(title,from,cell);body.append(row);
  }
  const confirm=organizationButton('Confirm move',async()=>{
    if(!frozen) return; confirm.disabled=true;
    const result=await command({type:'organizationCommit',preview:frozen});confirm.disabled=false;
    if(result.ok) {dialog.close();onChanged(result.outcome,result);return;}
    status.textContent=result.error;
    if(result.preview) {frozen=result.preview;updateOrigins();}
    if(result.outcome==='reviewRequired') {
      const review=result.records[0];
      showReview(review,{onChanged:async()=>{await refresh();status.textContent='Review resolved. Review the refreshed move and confirm separately.';onChanged('Review resolved. Move still awaits confirmation.');}});
    }
  });
  function updateOrigins() {
    if(frozen?.lists) lists=frozen.lists;
    for(const [index,row] of [...body.children].entries()) {
      const item=frozen?.rows.find(item=>item.recordId===records[index].id);
      if(item) row.children[1].textContent=name(item.from);
      for(const option of choices.get(records[index].id).options) if(option.value!=='keep') option.textContent=name(option.value);
    }
  }
  async function refresh() {
    frozen=null;confirm.disabled=true;
    const result=await command({type:'organizationPreview',rows:records.map(record=>({recordId:record.id,to:choices.get(record.id).value}))});
    if(result.ok) {frozen=result.preview;updateOrigins();status.textContent=frozen.rows.some(row=>row.blocked) ? 'Review prior activity is required before movement.' : 'Review every destination before confirming.';} else status.textContent=result.error;
    confirm.disabled=!frozen;
  }
  actions.append(confirm,organizationButton('Refresh move preview',refresh),organizationButton('Cancel',()=>dialog.close()));dialog.append(table,status,actions);dialog.showModal();await refresh();
}
