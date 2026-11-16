import {command,displayTitle} from './shared.js';
import {organizationButton} from './organization-ui.js';
import {showReview} from './review-ui.js';

export async function showStatus(records,lists,effect,{onChanged,onProcessed}) {
  const name=effect==='watched'?'Mark watched':'Dismiss';const requested=records.map(record=>record.id);const excluded=new Set();let frozen=null;let generation=0;let saving=false;
  const dialog=document.createElement('dialog');dialog.setAttribute('aria-label',name);const heading=document.createElement('h2');heading.textContent=name;
  const explanation=document.createElement('p');explanation.textContent=effect==='watched'?'Record an explicit watch without opening tabs. This does not verify playback.':'Remove these videos from active lists while retaining their records and prior activity. Dismiss also resolves any pending dismissal decision.';
  const table=document.createElement('table');const status=document.createElement('p');status.setAttribute('role','status');const count=document.createElement('p');
  const confirm=organizationButton(`Confirm ${name}`,async()=>{
    if(!frozen || saving)return;saving=true;confirm.disabled=true;dialog.inert=true;
    const result=await command({type:'statusCommit',preview:frozen});saving=false;dialog.inert=false;
    if(result.ok){onProcessed(result.processedIds);dialog.close();onChanged(result.outcome);return;}
    if(result.preview){frozen=result.preview;paint(frozen.records);}else if(result.outcome==='stale')frozen=null;
    status.textContent=result.error;confirm.disabled=!frozen;
    if(result.outcome==='reviewRequired')review(result.records[0]);
  });
  dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();});
  function review(record) {
    showReview(record,{onChanged:async(message,updated)=>{
      if(updated?.user.status!=='active')excluded.add(record.id);
      await refresh();status.textContent='Review resolved. Review this action and confirm separately.';onChanged('Review resolved. Status action still awaits confirmation.');
    }});
  }
  function paint(current) {
    table.replaceChildren();const head=document.createElement('tr');for(const text of ['Video','From','Effect']){const th=document.createElement('th');th.textContent=text;head.append(th);}const thead=document.createElement('thead');thead.append(head);table.append(thead);const body=document.createElement('tbody');table.append(body);
    for(const initial of records) {
      const record=current.find(record=>record.id===initial.id);const row=document.createElement('tr');const title=document.createElement('td');title.textContent=displayTitle(record ?? initial);const from=document.createElement('td');from.textContent=record?lists.find(list=>list.id===record.user.destination)?.name ?? 'Destination unavailable':'No longer active';const action=document.createElement('td');action.append(document.createTextNode(excluded.has(initial.id)?'Excluded':name));
      if(record?.user.pendingReview && effect==='watched')action.append(organizationButton(`Review ${displayTitle(record)}`,()=>review(record)));
      const label=document.createElement('label');label.className='move-exclusion';const check=document.createElement('input');check.type='checkbox';check.checked=excluded.has(initial.id);check.setAttribute('aria-label',`Exclude ${displayTitle(initial)} from this action`);check.addEventListener('change',()=>{check.checked?excluded.add(initial.id):excluded.delete(initial.id);refresh();});label.append(check,document.createTextNode('Exclude from this action'));action.append(label);row.append(title,from,action);body.append(row);
    }
    count.textContent=`${requested.length-excluded.size} included / ${requested.length} requested`;
  }
  async function refresh() {
    const current=++generation;frozen=null;confirm.disabled=true;
    const snapshot=await command({type:'list'});if(current!==generation)return;
    if(!snapshot.ok){status.textContent=snapshot.error;return;}lists=snapshot.lists;paint(snapshot.records);
    const ids=requested.filter(id=>!excluded.has(id));if(!ids.length){status.textContent='No included videos. Excluded videos stay selected.';return;}
    const result=await command({type:'statusPreview',recordIds:ids,effect});if(current!==generation)return;
    if(result.ok){frozen=result.preview;status.textContent=effect==='watched' && frozen.records.some(record=>record.user.pendingReview)?'Review prior activity or explicitly exclude unresolved videos.':'Review the included titles before confirming.';}else status.textContent=result.error;
    confirm.disabled=!frozen;
  }
  dialog.append(heading,explanation,count,table,status,confirm,organizationButton('Refresh action preview',refresh),organizationButton('Cancel',()=>dialog.close()));dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();await refresh();
}
