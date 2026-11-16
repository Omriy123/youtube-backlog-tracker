import {showRemoval} from './removal-ui.js';
import { appendYoutubeSetup, appendEnrichmentTools } from './enrichment-ui.js';
import { appendEnrichmentOperations } from './enrichment-operation-ui.js';
import { renderOrganizationControls, showMove, organizationButton } from './organization-ui.js';
import { createArrangementController, appendLibraryDates, renderOverviewControls } from './arrangement-ui.js';
import { orderLists, isGlobalValueView } from './arrangement-service.js';
import { orderRecords } from './arrangement-service.js';
import { createSelectionController } from './selection-ui.js';
import { showStatus } from './status-ui.js';
import { command, displayTitle } from './shared.js';
import { appendOpenActions, renderOpeningRecovery } from './opening-ui.js';
import { appendTitleTools } from './title-ui.js';
import { appendReviewBadge, showReview } from './review-ui.js';
import { createBrowserAdapter } from './browser.js';
import { setDateFormat, formatDateTime } from './date-display.js';
import { channel, durationSeconds, publicationDate, thumbnailUrl } from './metadata.js';
import { createBrowseState, anchorChannels, deriveBrowse } from './browse-model.js';
import { renderBrowseControls } from './browse-ui.js';
const container=document.querySelector('#records');
const search=document.querySelector('input[type=search]');
const scopeInputs=[...document.querySelectorAll('.search-scopes input')];
const dateFormat=document.querySelector('#date-format');
const browser=createBrowserAdapter();
const browse=createBrowseState();
const youtubeSetup=document.createElement('div');youtubeSetup.className='title-tools';document.querySelector('main').prepend(youtubeSetup);appendYoutubeSetup(youtubeSetup,{onChanged:()=>render()});
const enrichmentHeader=document.createElement('div');youtubeSetup.after(enrichmentHeader);
const enrichmentOperations=appendEnrichmentOperations(enrichmentHeader,{getListId:()=>browse.scopeId,onChanged:()=>render()});
const selection=createSelectionController({onChanged:()=>render(),onMove:records=>moveRecords(records),onPlace:(records,current,context)=>placeRecords(records,current,context),onStatus:(records,effect)=>showStatus(orderedSelection(records),latest.lists,effect,{onChanged:organizationChanged,onProcessed:selection.processed})});
const arrangements=createArrangementController({onChanged:message=>organizationChanged(message ?? ''),onError:message=>{document.querySelector('main > [role=status]').textContent=message;},getMovedIds:(event,record,records)=>event.ctrlKey && selection.selectedIds.has(record.id)?records.filter(item=>selection.selectedIds.has(item.id)).map(item=>item.id):[record.id],onMove:(ids,to)=>moveRecords(latest.records.filter(record=>ids.includes(record.id)),to)});
const sortControls=document.createElement('div');sortControls.id='arrangement-controls';container.before(sortControls);
container.before(selection.controls);container.after(selection.panel);
const removalControls=document.createElement('section');removalControls.className='title-tools';removalControls.setAttribute('aria-label','List cleanup');container.before(removalControls);
let request=0;
let latest=null;
function orderedSelection(records) {
  if(!latest)return [];
  const ids=new Set(records.map(record=>record.id));
  return latest.lists.flatMap(list=>{
    const visible=selection.currentResults.filter(record=>record.user.destination===list.id);
    const full=orderRecords(latest.records.filter(record=>record.user.destination===list.id),list,latest.organizationPreferences.videoSort,latest.lists);
    const visibleIds=new Set(visible.map(record=>record.id));let next=0;
    return full.map(record=>visibleIds.has(record.id)?visible[next++]:record).filter(record=>ids.has(record.id));
  });
}
function moveRecords(records,initialDestination) {
  if(!latest)return;
  showMove(orderedSelection(records),latest.lists,{onChanged:organizationChanged,onProcessed:ids=>selection.processed(ids),initialDestination});
}
function placeRecords(records,current,context) {
  if(records.some(record=>!current.some(item=>item.id===record.id)) || new Set(records.map(record=>record.user.destination)).size>1) {
    const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Place selection scope');const heading=document.createElement('h2');heading.textContent='Choose a Place scope';const explanation=document.createElement('p');explanation.textContent='Some selected videos are outside current results or span destinations. Place arranges matching videos in one destination. Use Move for the full selection.';
    const matches=current.filter(record=>records.some(item=>item.id===record.id));const place=organizationButton(`Place matching selected (${matches.length})`,()=>{dialog.close();placeRecords(matches,current,context);});place.disabled=!matches.length || new Set(matches.map(record=>record.user.destination)).size>1;
    dialog.append(heading,explanation,place,organizationButton('Move this selection',()=>{dialog.close();moveRecords(records);}),organizationButton('Cancel',()=>dialog.close()));dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();return;
  }
  arrangements.showPlace(current,records.map(record=>record.id),context);
}
function removeList(listId,scope) {
  if(!latest)return;
  const impacted=browse.scopeId===listId || browse.originListId===listId;
  const context=selection.context;
  showRemoval({listId,scope,recordIds:selection.currentResults.filter(record=>record.user.destination===listId).map(record=>record.id),filterContext:{query:context.query,titleScopes:context.titleScopes,channelId:context.channelId,selectedOnly:selection.selectedOnly,selectedIds:[...selection.selectedIds]}},{onChanged:organizationChanged,onCompleted(result){
    selection.processed(result.processedIds);
    if(result.deletedListId && (impacted || browse.scopeId===result.deletedListId || browse.originListId===result.deletedListId)) {
      browse.scopeId=result.effect==='move'?result.to:null;browse.originListId=result.effect==='move'?result.to:'Inbox';browse.anchor=null;
    }
    organizationChanged(result.outcome);
  }});
}
function navigate(id) {
  browse.scopeId=id==='Entire Library'?null:id;
  if(browse.scopeId!==null) browse.originListId=id;
  browse.anchor=null;render();
}
function organizationChanged(message,target) {
  document.querySelector('main > [role=status]').textContent=message;
  if(typeof target==='string') navigate(target);else render();
}
async function render() {
  const current=++request;
  removalControls.inert=true;container.inert=true;container.setAttribute('aria-busy','true');selection.controls.inert=true;selection.panel.inert=true;
  browse.query=search.value;browse.titleScopes=Object.fromEntries(scopeInputs.map(input=>[input.name,input.checked]));
  document.querySelector('#scope-status').textContent=scopeInputs.some(input=>input.checked)?'URL always included.':'URL-only search. All title scopes are off.';
  const result=await command({type:'list'});
  if(current!==request)return;
  if(!result.ok){document.querySelector('main > [role=status]').textContent=result.error;container.inert=false;container.setAttribute('aria-busy','false');selection.controls.inert=false;selection.panel.inert=false;return;}
  if(browse.scopeId!==null && !result.lists.some(list=>list.id===browse.scopeId))browse.scopeId=null;
  if(!result.lists.some(list=>list.id===browse.originListId))browse.originListId='Inbox';
  const preferences=result.organizationPreferences ?? {};
  result.lists=orderLists(result.lists,result.listStatistics,preferences.overviewSort);
  latest=result;
  enrichmentOperations.update();
  browse.density=preferences.density ?? 'thumbnails';browse.orientation=preferences.orientation ?? 'columns';
  if(!browse.anchor){browse.anchor=anchorChannels(result.records,browse.scopeId);browse.anchorScopeId=browse.scopeId;}
  else {
    // Keep existing shortcut positions while adding newly acquired identities.
    // Scope toggles retain the original shortcut population and ordering.
    const known=new Map(anchorChannels(result.records,browse.anchorScopeId).map(item=>[item.id,item]));
    const ids=new Set(browse.anchor.map(item=>item.id));
    browse.anchor=browse.anchor.map(item=>({...item,...known.get(item.id)}));
    for(const item of known.values())if(!ids.has(item.id))browse.anchor.push(item);
  }
  const content=deriveBrowse({records:result.records,lists:result.lists,state:browse});
  const derived=deriveBrowse({records:result.records,lists:result.lists,state:browse,selectedIds:selection.selectedIds,selectedOnly:selection.selectedOnly});
  const context={scopeId:browse.scopeId,originListId:browse.originListId,query:browse.query,titleScopes:browse.titleScopes,channelId:browse.channelId,selectedOnly:selection.selectedOnly,reviewSelected:false,contentRecords:content.currentResults,sort:preferences.videoSort,preferences,lists:result.lists};
  const orderedRecords=arrangements.order(derived.currentResults,context);
  arrangements.renderSortControls(sortControls,context,{hideDensity:true});
  const view=browse.scopeId ?? 'Entire Library';
  renderOrganizationControls(result,{view,onNavigate:navigate,onChanged:organizationChanged,onDelete:id=>removeList(id,'whole')});
  renderOverviewControls(result,{onChanged:render,onError:message=>organizationChanged(message)});
  for(const button of document.querySelectorAll('nav [data-view]'))arrangements.enhanceDestination(button,button.dataset.view);
  renderBrowseControls(browse,derived,{
    onScope(){browse.scopeId=browse.scopeId===null?browse.originListId:null;render();},
    onChannel(id){browse.channelId=id;render();},
    onExpand(){browse.expandedChannels=!browse.expandedChannels;render();},
    onClear(){search.value='';browse.channelId=null;for(const input of scopeInputs)input.checked=true;render();},
    async onPreference(key,value){const saved=await command({type:'setOrganizationPreferences',patch:{[key]:value}});if(!saved.ok)document.querySelector('main > [role=status]').textContent=saved.error;render();}
  });
  document.querySelector('h1').textContent=result.lists.find(list=>list.id===view)?.name ?? 'Entire Library';
  renderOpeningRecovery(result,{onChanged:render,onReviewRequired});
  document.querySelector('#count').textContent=`${derived.currentResults.length} saved ${derived.currentResults.length===1?'video':'videos'}`;
  const globalValues=isGlobalValueView(context);
  container.className=`density-${browse.density} orientation-${browse.orientation}${globalValues?' global-results':''}`;
  container.replaceChildren();
  if(!derived.currentResults.length){const empty=document.createElement('p');empty.textContent='No matching saved videos. Clear filters or change scope to continue.';container.append(empty);}
  function appendRows(records,parent) {
    const rows=document.createElement('div');rows.className='destination-records';
    for(const record of records) {
      const row=renderRecord(record,result.lists);arrangements.enhanceRow(row,record,{context,records:orderedRecords});selection.enhanceRow(row,record);rows.append(row);
    }
    parent.append(rows);
  }
  if(globalValues && orderedRecords.length) {
    const destinations=document.createElement('section');destinations.setAttribute('aria-label','Matching destinations');destinations.className='title-tools';
    for(const group of derived.groups) {
      destinations.append(organizationButton(`Open ${group.name}`,()=>navigate(group.id)));
      if(!group.permanent)destinations.append(organizationButton(`Delete entire ${group.name} list`,()=>removeList(group.id,'whole')),organizationButton(`Remove matching from ${group.name}`,()=>removeList(group.id,'matches')));
    }
    container.append(destinations);appendRows(orderedRecords,container);
  } else for(const group of derived.groups) {
    const section=document.createElement('section');section.className='destination-group';
    if(browse.scopeId===null){const heading=document.createElement('h2');heading.append(organizationButton(`Open ${group.name}`,()=>navigate(group.id)));section.append(heading);}
    if(browse.scopeId===null && !group.permanent){const actions=document.createElement('div');actions.className='title-tools';actions.append(organizationButton(`Delete entire ${group.name} list`,()=>removeList(group.id,'whole')),organizationButton(`Remove matching from ${group.name}`,()=>removeList(group.id,'matches')));section.append(actions);}
    appendRows(orderedRecords.filter(record=>record.user.destination===group.id),section);container.append(section);
  }
  selection.update(result,orderedRecords,context);
  removalControls.replaceChildren();const cleanupList=result.lists.find(list=>list.id===browse.scopeId && !list.permanent);
  if(cleanupList){const matching=organizationButton('Remove matching videos',()=>removeList(cleanupList.id,'matches'));matching.disabled=!selection.currentResults.length;removalControls.append(organizationButton('Delete entire list',()=>removeList(cleanupList.id,'whole')),matching);}
  removalControls.inert=false;
  container.inert=false;container.setAttribute('aria-busy','false');selection.controls.inert=false;selection.panel.inert=false;
}
function renderRecord(record,lists) {
  const row=document.createElement('article');row.dataset.recordId=record.id;
  const thumbnail=document.createElement('div');thumbnail.className='thumbnail';
  const image=thumbnailUrl(record);if(image){const img=document.createElement('img');img.src=image;img.alt='';img.loading='lazy';thumbnail.append(img);}else thumbnail.textContent='No thumbnail';
  const content=document.createElement('div');content.className='row-content';
  const title=document.createElement('h2');title.textContent=displayTitle(record);
  const url=document.createElement('p');url.className='url';url.textContent=record.url;
  const metadata=document.createElement('p');metadata.className='muted';
  const duration=durationSeconds(record);const published=publicationDate(record);
  metadata.textContent=`${channel(record)?.name ?? 'Channel unknown'} · ${duration===null?'Duration unknown':`${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}`} · ${published===null?'Publication date unknown':formatDateTime(new Date(published).toISOString())}`;
  const origin=document.createElement('p');origin.className='record-origin';origin.textContent=`From: ${lists.find(list=>list.id===record.user.destination)?.name ?? 'Destination unavailable'}`;
  content.append(title,url,metadata,origin);
  appendLibraryDates(content,record);
  appendReviewBadge(content,record,{onChanged:reviewChanged});
  appendOpenActions(title,content,record,{onChanged:render,onReviewRequired});
  if(image){thumbnail.tabIndex=0;thumbnail.setAttribute('role','button');thumbnail.setAttribute('aria-label',`Open ${displayTitle(record)}`);thumbnail.addEventListener('click',()=>title.querySelector('button')?.click());thumbnail.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();title.querySelector('button')?.click();}});}
  appendTitleTools(content,record,{onChanged:organizationChanged,onReviewRequired});
  appendEnrichmentTools(content,record,{onChanged:()=>render()});
  content.append(organizationButton('Move video',()=>moveRecords([record])));
  for(const [effect,label] of [['watched','Mark watched'],['dismissed','Dismiss']])content.append(organizationButton(label,()=>showStatus([record],lists,effect,{onChanged:organizationChanged,onProcessed:selection.processed})));
  row.append(thumbnail,content);return row;
}
function reviewChanged(message){organizationChanged(message);}
function onReviewRequired(record){document.querySelector('main > [role=status]').textContent='Review prior activity before opening or editing this video.';showReview(record,{onChanged:reviewChanged});}
search.addEventListener('input',render);for(const input of scopeInputs)input.addEventListener('change',render);
browser.watchLibraryChanges(render);
browser.watchDateFormatChanges(value=>{dateFormat.value=value==='israeli'?'israeli':'browser';setDateFormat(dateFormat.value);render();});
dateFormat.addEventListener('change',async()=>{
  const selected=dateFormat.value;dateFormat.disabled=true;
  try{await browser.writeDateFormat(selected);setDateFormat(selected);await render();}
  catch{dateFormat.value=await browser.readDateFormat().catch(()=>'browser');document.querySelector('main > [role=status]').textContent='Date and time preference was not saved.';}
  finally{dateFormat.disabled=false;}
});
browser.readDateFormat().then(value=>{dateFormat.value=value==='israeli'?'israeli':'browser';setDateFormat(dateFormat.value);render();}).catch(()=>render());
