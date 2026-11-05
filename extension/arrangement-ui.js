import { command, displayTitle } from './shared.js';
import { orderRecords, orderLists, isGlobalValueView } from './arrangement-service.js';
import { organizationButton } from './organization-ui.js';
import { channel, durationSeconds, publicationDate } from './metadata.js';
import { formatDateTime, onDateFormatChanged } from './date-display.js';
import { showReview } from './review-ui.js';

const headers=[['title','Title'],['channel','Channel'],['destination','Destination'],['publication','Published'],['duration','Duration']];
const dates=[['firstSavedAt','First saved'],['firstInboxExitAt','First Inbox-exit'],['latestListEntryAt','Latest list-entry']];
const displayedDates=new Map();
onDateFormatChanged(()=>displayedDates.clear());
function dateText(value) {
  if(!displayedDates.has(value)) {if(displayedDates.size>5000)displayedDates.clear();displayedDates.set(value,formatDateTime(value));}
  return displayedDates.get(value);
}
export function createArrangementController({onChanged,onError,getMovedIds,onMove}) {
  let temporary=new Map(); let flatTemporary=null; let identity=null; let contents=null; let datesExpanded=false; let drag=null; let suppressUntil=0;
  function reset() {temporary.clear();flatTemporary=null;}
  function report(error) {onError(error);const status=document.querySelector('dialog[data-place] [role=status]');if(status)status.textContent=error;}
  function signature(context) {return JSON.stringify([context.scopeId,context.originListId,context.query,['personal','original','intermediate','latest'].map(key=>context.titleScopes?.[key]),context.channelId,context.selectedOnly,context.reviewSelected,context.sort.key,context.sort.direction]);}
  function order(records,context) {
    const next=signature(context);
    // contentRecords describes membership before checkbox-only visibility changes.
    const content=context.contentRecords ?? records;
    const facts=JSON.stringify(content.map(record=>[record.id,record.user.destination,displayTitle(record),channel(record),durationSeconds(record),publicationDate(record),record.user.firstSavedAt,record.user.firstInboxExitAt,record.user.latestListEntryAt,record.user.pendingReview]).sort((a,b)=>a[0].localeCompare(b[0])));
    const relevant=new Set(content.map(record=>record.user.destination));if(context.scopeId)relevant.add(context.scopeId);
    const orders=JSON.stringify(context.lists.filter(list=>relevant.has(list.id)).map(list=>[list.id,list.manualOrder,list.publicationDirection]).sort((a,b)=>a[0].localeCompare(b[0])));
    if(identity!==next || contents!==facts+orders) reset();
    identity=next;contents=facts+orders;
    const lists=context.lists;
    if(isGlobalValueView(context)) {
      const sorted=orderRecords(records,null,context.sort,lists);
      if(!flatTemporary)return sorted;
      const byId=new Map(sorted.map(record=>[record.id,record]));
      return [...flatTemporary.map(id=>byId.get(id)).filter(Boolean),...sorted.filter(record=>!flatTemporary.includes(record.id))];
    }
    const groups=lists.flatMap(list=>{
      const members=records.filter(record=>record.user.destination===list.id);
      const sorted=orderRecords(members,list,context.sort,lists);
      const saved=temporary.get(list.id);
      if(!saved) return sorted;
      const byId=new Map(sorted.map(record=>[record.id,record]));
      return [...saved.map(id=>byId.get(id)).filter(Boolean),...sorted.filter(record=>!saved.includes(record.id))];
    });
    return context.sort.key!=='manual' && context.sort.key!=='publication' && temporary.size===0 ? orderRecords(records,null,context.sort,lists) : groups;
  }
  async function chooseSort(key,context) {
    const current=temporary.size ? {key:'manual'} : context.sort;
    const list=context.lists.find(item=>item.id===context.scopeId);
    const publicationDirection=list?.publicationDirection ?? context.preferences?.libraryPublicationDirection ?? 'asc';
    const direction=key==='publication' ? (current.key===key ? publicationDirection==='asc'?'desc':'asc' : publicationDirection) : current.key===key && key!=='manual' ? current.direction==='asc'?'desc':'asc' : 'asc';
    const result=await command({type:'setOrganizationPreferences',patch:{videoSort:{key,direction}},...(key==='publication'?{destinationIds:list?[list.id]:context.lists.map(item=>item.id)}:{})});
    if(!result.ok) {report(result.error);return;}
    reset();onChanged();
  }
  function renderSortControls(container,context,{hideDensity=false}={}) {
    container.replaceChildren();container.className='sort-controls';
    const active=temporary.size ? 'manual' : context.sort.key;
    const manual=organizationButton('Manual',()=>chooseSort('manual',context));manual.setAttribute('aria-pressed',String(active==='manual'));container.append(manual);
    for(const [key,label] of headers) {
      const button=organizationButton(label,()=>chooseSort(key,context));button.setAttribute('aria-label',`Sort by ${label}`);button.setAttribute('aria-pressed',String(active===key));
      const direction=key==='publication' ? context.lists.find(list=>list.id===context.scopeId)?.publicationDirection ?? context.sort.direction : context.sort.direction;
      if(active===key) button.textContent+=direction==='desc'?' ↓':' ↑';container.append(button);
    }
    const disclosure=document.createElement('details');disclosure.open=datesExpanded;const summary=document.createElement('summary');summary.textContent='Library dates';disclosure.append(summary);
    disclosure.addEventListener('toggle',()=>{datesExpanded=disclosure.open;});
    for(const [key,label] of dates) {const button=organizationButton(label,()=>chooseSort(key,context));button.setAttribute('aria-label',`Sort by ${label}`);button.setAttribute('aria-pressed',String(active===key));disclosure.append(button);}container.append(disclosure);
    for(const [density,label] of hideDensity ? [] : [['thumbnails','Thumbnails'],['compact','Compact']]) {
      const button=organizationButton(label,async()=>{const result=await command({type:'setOrganizationPreferences',patch:{density}});if(result.ok)onChanged();else onError(result.error);});
      button.setAttribute('aria-pressed',String((context.preferences?.density ?? 'thumbnails')===density));container.append(button);
    }
  }
  async function arrange(records,movedIds,beforeId,context,{afterId=null}={}) {
    const moved=records.filter(record=>movedIds.includes(record.id));
    if(!moved.length || moved.length!==movedIds.length) {report('Some videos are outside these results. Choose matching videos or Move instead.');return false;}
    const snapshot=await command({type:'list'});
    if(!snapshot.ok){report(snapshot.error);return false;}
    const latest=moved.map(record=>snapshot.records.find(item=>item.id===record.id));
    if(latest.some((record,index)=>!record || record.user.destination!==moved[index].user.destination)){report('An affected video changed placement. Refresh and choose Place again.');return false;}
    if(latest.some(record=>record.user.pendingReview)) {report('Review prior activity before arranging. Choose Place again after the review.');showReview(latest.find(record=>record.user.pendingReview),{onChanged:()=>{reset();onChanged('Review resolved. Choose Place again to arrange.');}});return false;}
    if(latest.some((record,index)=>record.user.revision!==moved[index].user.revision)){report('An affected video changed. Refresh and choose Place again.');return false;}
    const destinationId=moved[0].user.destination;
    if(moved.some(record=>record.user.destination!==destinationId)) {report('Place arranges videos within one destination. Use Move to change destinations.');return false;}
    const group=records.filter(record=>record.user.destination===destinationId);
    if(beforeId!==null && !group.some(record=>record.id===beforeId)) {report('Choose an insertion position in the same destination.');return false;}
    if(afterId!==null && !group.some(record=>record.id===afterId)) {report('Choose an insertion position in the same destination.');return false;}
    if(movedIds.includes(beforeId) || movedIds.includes(afterId)) return true;
    const remaining=group.map(record=>record.id).filter(id=>!movedIds.includes(id));
    remaining.splice(beforeId===null?remaining.length:remaining.indexOf(beforeId),0,...group.filter(record=>movedIds.includes(record.id)).map(record=>record.id));
    const filtered=Boolean(context.query?.trim() || context.channelId || context.selectedOnly || context.reviewSelected);
    if(filtered) {
      if(isGlobalValueView(context)) {
        const visible=records.filter(record=>!movedIds.includes(record.id));
        const last=visible.findLastIndex(record=>record.user.destination===destinationId);
        const position=afterId!==null ? visible.findIndex(record=>record.id===afterId)+1 : beforeId!==null ? visible.findIndex(record=>record.id===beforeId) : last<0 ? visible.length : last+1;
        visible.splice(position,0,...moved);flatTemporary=visible.map(record=>record.id);
        temporary.set(destinationId,visible.filter(record=>record.user.destination===destinationId).map(record=>record.id));
      } else temporary.set(destinationId,remaining);
      onChanged();return true;
    }
    const list=context.lists.find(item=>item.id===destinationId);
    const result=await command({type:'arrangeVideos',destinationId,displayedIds:group.map(record=>record.id),movedIds,beforeId,expectedManualOrder:list.manualOrder ?? []});
    if(!result.ok) {report(result.error);return false;}
    reset();onChanged(result.outcome);return true;
  }
  function showPlace(records,movedIds,context) {
    const moved=records.find(record=>movedIds.includes(record.id));if(!moved)return;
    const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Place videos');dialog.dataset.place='';
    const heading=document.createElement('h2');heading.textContent='Place videos';
    const label=document.createElement('label');label.textContent='Insertion position';const select=document.createElement('select');select.setAttribute('aria-label','Insertion position');
    for(const record of records.filter(record=>record.user.destination===moved.user.destination && !movedIds.includes(record.id))) {const option=document.createElement('option');option.value=record.id;option.textContent=`Before ${displayTitle(record)}`;select.append(option);}
    const end=document.createElement('option');end.value='';end.textContent='At the end';select.append(end);label.append(select);
    const confirm=organizationButton('Place here',async()=>{confirm.disabled=true;const ok=await arrange(records,movedIds,select.value||null,context);confirm.disabled=false;if(ok)dialog.close();});
    const status=document.createElement('p');status.setAttribute('role','status');
    dialog.append(heading,label,status,confirm,organizationButton('Cancel',()=>dialog.close()));dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();select.focus();
  }
  function clearMarkers() {document.querySelectorAll('.insert-before,.insert-after,.destination-drop').forEach(row=>row.classList.remove('insert-before','insert-after','destination-drop'));}
  function enhanceDestination(target,destinationId) {
    if(destinationId==='Inbox' || destinationId==='Entire Library')return;
    target.addEventListener('dragover',event=>{if(!drag)return;event.preventDefault();clearMarkers();target.classList.add('destination-drop');});
    target.addEventListener('drop',event=>{if(!drag)return;event.preventDefault();event.stopPropagation();const ids=drag.ids;drag=null;clearMarkers();suppressUntil=Date.now()+350;onMove?.(ids,destinationId);});
  }
  function enhanceRow(row,record,{context,records}) {
    row.dataset.recordId=record.id;row.draggable=true;
    row.addEventListener('click',event=>{if(Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
    row.addEventListener('dragstart',event=>{
      if(event.target.closest('button,input,select,a,summary') && !event.target.closest('.title-target')) {event.preventDefault();return;}
      const ids=getMovedIds?.(event,record,records) ?? [record.id];drag={ids,destinationId:record.user.destination,mixed:new Set(records.filter(item=>ids.includes(item.id)).map(item=>item.user.destination)).size>1};
      event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',record.id);row.classList.add('dragging');
    });
    row.addEventListener('dragover',event=>{
      if(!drag)return;
      if((drag.destinationId!==record.user.destination || drag.mixed) && record.user.destination==='Inbox')return;
      event.preventDefault();clearMarkers();if(drag.destinationId!==record.user.destination || drag.mixed){row.classList.add('destination-drop');return;}const rect=row.getBoundingClientRect();row.classList.add(event.clientY<rect.top+rect.height/2?'insert-before':'insert-after');
    });
    row.addEventListener('drop',event=>{
      if(!drag)return;if((drag.destinationId!==record.user.destination || drag.mixed) && record.user.destination==='Inbox')return;event.preventDefault();event.stopPropagation();suppressUntil=Date.now()+350;
      if(drag.destinationId!==record.user.destination || drag.mixed){const ids=drag.ids;drag=null;clearMarkers();onMove?.(ids,record.user.destination);return;}
      if(drag.ids.includes(record.id)){drag=null;clearMarkers();return;}
      const group=records.filter(item=>item.user.destination===record.user.destination);const after=row.classList.contains('insert-after');const flatFiltered=isGlobalValueView(context) && Boolean(context.query?.trim() || context.selectedOnly || context.reviewSelected);const beforeId=after?(flatFiltered?null:group[group.findIndex(item=>item.id===record.id)+1]?.id ?? null):record.id;
      const ids=drag.ids;drag=null;clearMarkers();arrange(records,ids,beforeId,context,{afterId:flatFiltered && after?record.id:null});
    });
    row.addEventListener('dragend',()=>{drag=null;suppressUntil=Date.now()+350;clearMarkers();row.classList.remove('dragging');});
    row.querySelector('.row-content')?.append(organizationButton('Place video',()=>showPlace(records,[record.id],context)));
  }
  return {order,arrange,reset,renderSortControls,enhanceRow,enhanceDestination,showPlace};
}
export function appendLibraryDates(content,record) {
  const line=document.createElement('p');line.className='library-dates muted';line.textContent=dates.map(([key,label])=>`${label}: ${dateText(record.user[key])}`).join(' · ');content.append(line);
}
export function renderOverviewControls(result,{onChanged,onError}) {
  let controls=document.querySelector('#overview-controls');if(!controls){controls=document.createElement('div');controls.id='overview-controls';document.querySelector('nav').before(controls);}controls.replaceChildren();
  const sort=result.organizationPreferences.overviewSort;
  const directions={importance:['Most important first','Least important first'],name:['A to Z','Z to A'],count:['Fewest first','Most first'],duration:['Shortest first','Longest first'],latestAddition:['Oldest first','Newest first']};
  for(const [key,label] of [['importance','Importance'],['name','Name'],['count','Count'],['duration','Known duration'],['latestAddition','Most recent addition']]) {
    const button=organizationButton(label,async()=>{const direction=sort.key===key && sort.direction==='asc'?'desc':'asc';const saved=await command({type:'setOrganizationPreferences',patch:{overviewSort:{key,direction}}});if(saved.ok)onChanged();else onError(saved.error);});button.setAttribute('aria-label',`Sort lists by ${label}`);button.setAttribute('aria-pressed',String(sort.key===key));controls.append(button);
    if(sort.key===key){const direction=directions[key][sort.direction==='desc'?1:0];button.textContent=`${label} · ${direction}`;button.setAttribute('aria-description',`${direction}. Activate to reverse the overview direction.`);}
  }
  const note=document.createElement('p');note.className='muted overview-note';note.textContent='Overview sorting does not change saved importance.';controls.append(note);
  const ordered=orderLists(result.lists,result.listStatistics,sort);const custom=ordered.filter(list=>!list.permanent);
  async function place(id,beforeId) {
    const ids=custom.map(list=>list.id).filter(key=>key!==id);ids.splice(beforeId===null?ids.length:ids.indexOf(beforeId),0,id);
    const saved=await command({type:'setListImportance',listIds:ids});if(!saved.ok){onError(saved.error);return;}
    onChanged();
  }
  let dragged=null;
  for(const list of ordered) {
    const button=document.querySelector(`nav [data-view="${CSS.escape(list.id)}"]`);if(!button)continue;
    button.setAttribute('aria-label',list.name);
    const stats=result.listStatistics[list.id];const detail=document.createElement('small');detail.textContent=`${stats.count} videos · ${Math.floor(stats.duration/60)}m known · ${stats.unknownDurations} duration unknown`;button.append(detail);
    if(list.permanent)continue;
    button.draggable=true;button.addEventListener('dragstart',event=>{dragged=list.id;event.dataTransfer.setData('text/plain',list.id);});
    button.addEventListener('dragover',event=>{if(dragged){event.preventDefault();button.classList.add('insert-before');}});button.addEventListener('dragleave',()=>button.classList.remove('insert-before'));
    button.addEventListener('drop',event=>{event.preventDefault();button.classList.remove('insert-before');if(dragged && dragged!==list.id)place(dragged,list.id);dragged=null;});
  }
  if(custom.length>1) {
    const label=document.createElement('label');label.textContent='Place watch list';const moving=document.createElement('select');moving.setAttribute('aria-label','Watch list to place');const target=document.createElement('select');target.setAttribute('aria-label','Watch list insertion position');
    for(const list of custom){const option=document.createElement('option');option.value=list.id;option.textContent=list.name;moving.append(option);const before=option.cloneNode(true);before.textContent=`Before ${list.name}`;target.append(before);}
    const end=document.createElement('option');end.value='';end.textContent='At the end';target.append(end);label.append(moving,target,organizationButton('Place watch list',()=>{if(moving.value!==target.value)place(moving.value,target.value||null);}));controls.append(label);
  }
}
