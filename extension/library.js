import { renderOrganizationControls, showMove, organizationButton } from './organization-ui.js';
import { fitArrivals } from './organization-service.js';
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
let request=0;
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
  browse.query=search.value;browse.titleScopes=Object.fromEntries(scopeInputs.map(input=>[input.name,input.checked]));
  document.querySelector('#scope-status').textContent=scopeInputs.some(input=>input.checked)?'URL always included.':'URL-only search. All title scopes are off.';
  const result=await command({type:'list'});
  if(current!==request)return;
  if(!result.ok){document.querySelector('main > [role=status]').textContent=result.error;return;}
  if(browse.scopeId!==null && !result.lists.some(list=>list.id===browse.scopeId))browse.scopeId=null;
  if(!result.lists.some(list=>list.id===browse.originListId))browse.originListId='Inbox';
  const preferences=result.organizationPreferences ?? {};
  browse.density=preferences.density ?? 'thumbnails';browse.orientation=preferences.orientation ?? 'columns';
  if(!browse.anchor)browse.anchor=anchorChannels(result.records,browse.scopeId);
  const derived=deriveBrowse({records:result.records,lists:result.lists,state:browse});
  const view=browse.scopeId ?? 'Entire Library';
  renderOrganizationControls(result,{view,onNavigate:navigate,onChanged:organizationChanged});
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
  container.className=`density-${browse.density} orientation-${browse.orientation}`;
  container.replaceChildren();
  if(!derived.currentResults.length){const empty=document.createElement('p');empty.textContent='No matching saved videos. Clear filters or change scope to continue.';container.append(empty);}
  for(const group of derived.groups) {
    const section=document.createElement('section');section.className='destination-group';
    if(browse.scopeId===null){const heading=document.createElement('h2');heading.append(organizationButton(`Open ${group.name}`,()=>navigate(group.id)));section.append(heading);}
    const rows=document.createElement('div');rows.className='destination-records';
    const saved=(group.manualOrder ?? []).map(id=>group.records.find(record=>record.id===id)).filter(Boolean);
    const ordered=fitArrivals(saved,group.records.filter(record=>!saved.includes(record)),group.publicationDirection);
    for(const record of ordered)rows.append(renderRecord(record,result.lists));
    section.append(rows);container.append(section);
  }
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
  appendReviewBadge(content,record,{onChanged:reviewChanged});
  appendOpenActions(title,content,record,{onChanged:render,onReviewRequired});
  if(image){thumbnail.tabIndex=0;thumbnail.setAttribute('role','button');thumbnail.setAttribute('aria-label',`Open ${displayTitle(record)}`);thumbnail.addEventListener('click',()=>title.querySelector('button')?.click());thumbnail.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();title.querySelector('button')?.click();}});}
  appendTitleTools(content,record,{onChanged:organizationChanged,onReviewRequired});
  content.append(organizationButton('Move video',()=>showMove([record],lists,{onChanged:organizationChanged})));
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
