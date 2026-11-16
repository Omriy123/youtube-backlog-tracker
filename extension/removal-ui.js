import {command,displayTitle} from './shared.js';
import {organizationButton as button} from './organization-ui.js';
import {showReview} from './review-ui.js';

export async function showRemoval(request,{onCompleted,onChanged}) {
  request=structuredClone(request);request.effect=null;request.to=null;request.excludedIds=[];
  const dialog=document.createElement('dialog');dialog.className='removal-dialog';dialog.setAttribute('aria-label',request.scope==='whole'?'Delete entire list':'Remove matching videos');
  const heading=document.createElement('h2');heading.textContent=request.scope==='whole'?'Delete entire list':'Remove matching videos';
  const summary=document.createElement('p');const scopeNote=document.createElement('p');
  scopeNote.textContent=request.scope==='whole'?'Includes every active video in this custom list, including hidden results. Prior history and saved video identities are retained.':'Only current matching videos are affected. The list and its other contents remain.';
  const effectLabel=document.createElement('label');effectLabel.textContent='Removal effect';const effect=document.createElement('select');effect.setAttribute('aria-label','Removal effect');
  for(const [value,label] of [['','Choose effect'],['move','Move videos'],['dismiss','Dismiss videos']]){const option=document.createElement('option');option.value=value;option.textContent=label;effect.append(option);}effectLabel.append(effect);
  const destinationLabel=document.createElement('label');destinationLabel.textContent='Removal destination';const destination=document.createElement('select');destination.setAttribute('aria-label','Removal destination');destinationLabel.append(destination);destinationLabel.hidden=true;
  const table=document.createElement('table');table.className='removal-preview';const head=document.createElement('tr');for(const label of ['Video','From','Effect']){const cell=document.createElement('th');cell.textContent=label;head.append(cell);}const thead=document.createElement('thead');thead.append(head);const body=document.createElement('tbody');table.append(thead,body);
  const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const actions=document.createElement('div');actions.className='title-tools';
  let frozen=null;let generation=0;let saving=false;
  const confirm=button(request.scope==='whole'?'Confirm deletion':'Confirm matching removal',async()=>{
    if(!frozen || !frozen.ready || saving)return;saving=true;confirm.disabled=true;effect.disabled=true;destination.disabled=true;cancel.disabled=true;
    const result=await command({type:'removalCommit',preview:frozen});saving=false;effect.disabled=false;destination.disabled=false;cancel.disabled=false;
    if(result.ok){dialog.close();onCompleted(result);return;}
    if(result.preview){frozen=result.preview;paint();}
    status.textContent=result.error;confirm.disabled=!frozen?.ready;
    // Review controls never commit the prepared removal automatically.
  });
  confirm.disabled=true;
  const refreshButton=button('Refresh removal preview',()=>refresh());
  const cancel=button('Cancel',()=>dialog.close());actions.append(confirm,refreshButton,cancel);
  effect.addEventListener('change',()=>{request.effect=effect.value || null;destinationLabel.hidden=effect.value!=='move';refresh();});
  destination.addEventListener('change',()=>{request.to=destination.value || null;refresh();});
  function paint() {
    const preview=frozen;if(!preview)return;
    if(preview.empty){request.effect=null;request.to=null;effect.value='';}
    summary.textContent=`${preview.listName}: ${preview.rows.length} active ${preview.rows.length===1?'video':'videos'}${request.scope==='whole'?' in the entire list':' matching current filters'}.`;
    effectLabel.hidden=preview.empty;destinationLabel.hidden=preview.empty || request.effect!=='move';
    destination.replaceChildren();const choose=document.createElement('option');choose.value='';choose.textContent='Choose destination';destination.append(choose);
    const targets=preview.lists.filter(list=>(request.scope==='whole'?list.id!==request.listId:list.id!=='Inbox'));
    for(const list of targets){const option=document.createElement('option');option.value=list.id;option.textContent=list.name;destination.append(option);}
    if(request.to && !targets.some(list=>list.id===request.to)){const invalid=document.createElement('option');invalid.value=request.to;invalid.textContent='Unavailable destination - choose again';destination.append(invalid);}
    destination.value=request.to ?? '';
    body.replaceChildren();
    for(const row of preview.rows){
      const line=document.createElement('tr');const title=document.createElement('td');title.textContent=displayTitle(row.record);const from=document.createElement('td');from.textContent=preview.listName;
      const outcome=document.createElement('td');outcome.textContent=row.excluded?'Excluded':request.effect==='dismiss'?'Dismiss (history retained)':request.effect==='move'?(preview.lists.find(list=>list.id===request.to)?.name ?? 'Choose destination'):'Choose effect';
      if(row.blocked){
        outcome.append(button(`Review ${displayTitle(row.record)}`,()=>showReview(row.record,{onChanged:async message=>{await refresh();status.textContent='Review resolved. Review the refreshed titles and confirm separately.';onChanged?.(message);}})));
        if(request.scope==='matches'){
          const label=document.createElement('label');label.textContent=`Exclude ${displayTitle(row.record)}`;const check=document.createElement('input');check.type='checkbox';check.checked=row.excluded;check.setAttribute('aria-label',label.textContent);
          check.addEventListener('change',()=>{request.excludedIds=check.checked?[...new Set([...request.excludedIds,row.recordId])]:request.excludedIds.filter(id=>id!==row.recordId);refresh();});label.prepend(check);outcome.append(label);
        }
      }
      line.append(title,from,outcome);body.append(line);
    }
    table.hidden=preview.empty;
    confirm.disabled=saving || !preview.ready;
  }
  async function refresh(){
    if(saving)return;const current=++generation;frozen=null;confirm.disabled=true;
    const result=await command({type:'removalPreview',...request});if(current!==generation || !dialog.open)return;
    if(result.preview){frozen=result.preview;paint();}
    status.textContent=result.ok?(frozen.empty?'This list is empty. Confirm deletion explicitly.':frozen.rows.some(row=>row.blocked&&!row.excluded)&&request.effect==='move'?'Resolve pending reviews or cancel. Whole-list deletion cannot exclude unresolved rows.':'Review all affected titles and choose the effect before confirming.'):result.error;
  }
  dialog.append(heading,scopeNote,summary,effectLabel,destinationLabel,table,status,actions);dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});dialog.addEventListener('close',()=>{generation++;dialog.remove();},{once:true});document.body.append(dialog);dialog.showModal();await refresh();
}
