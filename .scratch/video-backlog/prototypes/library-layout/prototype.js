// THROWAWAY UI study. No storage, network metadata, external tabs, or production integration.
// Question: which structure best supports choosing, triaging, and channel browsing?
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {A:'Sidebar · refined', B:'Lists side by side', C:'Compact Library table'};
const channels = ['Studio North','Practical Engineering','The Coding Desk','Field Notes','Slow Science','Design Matters','Live Workshop','Independent video'];
const topics = ['Why cities keep building around rivers','A small tool that changed my workflow','Inside an abandoned mountain observatory','Designing systems that survive mistakes','The hidden geometry of everyday things','Building a tiny studio from scratch','What a year of field recordings taught me','A surprisingly useful introduction to graphs','Restoring an old machine, one part at a time','How we make sense of enormous numbers','Walking through a city without a map','A conversation about creative constraints'];
const colors = ['#487266','#786752','#64728c','#61784a','#977358','#537680','#7d6680','#61736d'];
let dragList = null, dropHint = null, dragSuppressUntil = 0;
let state, undoStack = [], selected = new Set(), dragIds = [], lastMessage = 'Demo ready. Pick a list, sort the Inbox, or compare all three layouts.';
const view = {variant:['A','B','C'].includes(new URLSearchParams(location.search).get('variant')) ? new URLSearchParams(location.search).get('variant') : 'A', scope:'inbox',channel:'',search:'',sort:'release',overview:'importance',density:'thumbnail',showChannels:false,channelHome:'inbox',channelNavScope:'inbox',sortDirection:'asc',groupLayout:'columns'};
function seed() {
  const lists = [
    {id:'inbox',name:'Inbox',permanent:true}, {id:'backlog',name:'Backlog',permanent:true},
    {id:'tonight',name:'Tonight',rank:1}, {id:'learn',name:'Deep learning',rank:2},
    {id:'weekend',name:'Weekend long reads',rank:3}, {id:'inspire',name:'Creative fuel',rank:4}
  ].map(l=>({...l,manual:false,direction:'asc',order:[]}));
  const videos = Array.from({length:84},(_,i)=>{
    const list = lists[i<24 ? 0 : i<42 ? 1 : i<54 ? 2 : i<66 ? 3 : i<76 ? 4 : 5];
    const channel = channels[i%8];
    const provider = i%11===0 ? 'Twitch' : i%13===0 ? 'Web' : 'YouTube';
    const date = new Date(Date.UTC(2025,8,1+(i*17)%370)).toISOString().slice(0,10);
    const saved = new Date(Date.UTC(2026,8,1+i%30)).toISOString();
    const title = i===13 ? 'Saved link · title not retrieved' : `${topics[i%12]}${i>=12 ? ' · '+(Math.floor(i/12)+1) : ''}`;
    return {id:'v'+i,title,channel,provider,url:provider==='YouTube'?`https://www.youtube.com/watch?v=demo-${i}`:provider==='Twitch'?`https://www.twitch.tv/videos/demo-${i}`:`https://example.com/videos/${i}`,duration:i%9===0?null:360+(i*347)%6900,release:i%17===0?null:date,saved,exit:list.id==='inbox'?null:saved,entered:saved,list:list.id,status:'active',availability:i%19===0?'Unavailable':i%23===0?'Private':i===13?'Not checked':'Available',description:i===13?'':`A saved episode from ${channel}. ${topics[i%12]}. Includes a practical walkthrough, background research, and a conversation about the tradeoffs. Search “fieldwork” to find this fixture. Chapter notes: introduction, fieldwork, lessons learned.`,history:i%10===0?[{action:'Watched on an earlier occasion',from:'backlog',at:'2026-07-12T18:00:00Z'},{action:'Queued again after repeat-save review',from:'history',to:list.id,at:saved}]:[{action:'Saved',to:list.id,at:saved}]};
  });
  // Four retained history records leave 80 active videos; Inbox has 24 and Tonight 12.
  [79,80,81,82].forEach((i,n)=>{videos[i].status=n%2?'dismissed':'watched';videos[i].history.push({action:videos[i].status,from:videos[i].list,at:'2026-10-01T17:00:00Z'});videos[i].list=null;});
  lists.forEach(l=>{l.order=videos.filter(v=>v.list===l.id).sort((a,b)=>compareMissing(a.release,b.release)).map(v=>v.id);});
  return {lists,videos,log:[],tabGroup:null};
}
function reset(){state=seed();undoStack=[];selected.clear();Object.assign(view,{scope:'inbox',channel:'',search:'',sort:'release',overview:'importance',density:'thumbnail',showChannels:false,channelHome:'inbox',channelNavScope:'inbox',sortDirection:'asc',groupLayout:'columns'});lastMessage='Demo reset: 84 records, 80 active, 4 in history.';render();}
function list(id){return state.lists.find(l=>l.id===id);}
function listName(id){return list(id)?.name ?? (id==='history'?'History':id || 'History');}
function video(id){return state.videos.find(v=>v.id===id);}
function compareMissing(a,b,desc=false){if(a==null)return b==null?0:1;if(b==null)return -1;return (typeof a==='number'?a-b:String(a).localeCompare(String(b)))*(desc?-1:1);}
function duration(s){if(s==null)return 'Unknown';const m=Math.floor(s/60);return m>=60?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`;}
function active(id){return state.videos.filter(v=>v.status==='active'&&(!id||v.list===id));}
function stats(id){const vs=active(id),unknown=vs.filter(v=>v.duration==null).length;return `${vs.length} videos · ${duration(vs.reduce((s,v)=>s+(v.duration||0),0))} known${unknown?' + '+unknown+' unknown':''}`;}
function date(value){return value?value.slice(0,10):'Unknown';}
function orderedLists(){
  const ls=state.lists.filter(l=>!l.permanent);
  if(view.overview==='importance')ls.sort((a,b)=>a.rank-b.rank);
  else if(view.overview==='name')ls.sort((a,b)=>a.name.localeCompare(b.name));
  else {const value=l=>view.overview==='count'?active(l.id).length:view.overview==='duration'?active(l.id).reduce((s,v)=>s+(v.duration||0),0):active(l.id).map(v=>v.entered).sort().at(-1)||'';ls.sort((a,b)=>compareMissing(value(a),value(b),true));}
  return [list('inbox'),...ls,list('backlog')];
}
function matches(v){const q=view.search.toLowerCase();return (!view.channel||v.channel===view.channel)&&(!q||[v.title,v.description,v.channel,v.url].some(t=>t.toLowerCase().includes(q)));}
function videosIn(scope=view.scope,includeHidden=false){
  const result=active(scope==='all'?null:scope).filter(v=>includeHidden||matches(v));
  return result.sort((a,b)=>{
    const l=list(scope),desc=(view.sort==='release'?(l?.direction||view.sortDirection):view.sortDirection)==='desc';
    if(view.sort==='manual'){
      if(a.list!==b.list)return state.lists.indexOf(list(a.list))-state.lists.indexOf(list(b.list));
      const dest=list(a.list);
      return dest.manual?dest.order.indexOf(a.id)-dest.order.indexOf(b.id):compareMissing(a.release,b.release,dest.direction==='desc');
    }
    const key=view.sort==='duration'?'duration':view.sort;
    return compareMissing(key==='destination'?listName(a.list):a[key],key==='destination'?listName(b.list):b[key],desc);
  });
}
function displayed(){return view.variant==='B'?orderedLists().flatMap(l=>boardVideos(l.id)):videosIn();}
function snapshot(label){undoStack.push({state:structuredClone(state),label});if(undoStack.length>30)undoStack.shift();}
function log(message){lastMessage=message;state.log.push({at:new Date().toISOString(),message});console.info('[Library prototype]',message,structuredClone(state));}
function perform(label,fn){snapshot(label);fn();log(label);selected.clear();render();}
function move(ids,dest){
  const vs=ids.map(video).filter(v=>v?.status==='active'&&v.list!==dest);
  if(!list(dest)||dest==='inbox'){log('Ordinary moves cannot return videos to Inbox. Undo can reverse an Inbox departure.');render();return;}
  if(!vs.length)return;
  perform(`Moved ${vs.length} video${vs.length===1?'':'s'} to ${listName(dest)}.`,()=>vs.forEach(v=>relocate(v,dest)));
}
function relocate(v,dest){const old=v.list,now=new Date().toISOString();if(old)list(old).order=list(old).order.filter(id=>id!==v.id);v.history.push({action:'Moved',from:old,to:dest,at:now});if(old==='inbox'&&!v.exit)v.exit=now;v.list=dest;v.entered=now;list(dest).order.push(v.id);}
function reorder(id,target,after=false){
  const v=video(id),t=video(target);
  if(!v||!t||v.list!==t.list||id===target)return;
  const arrangement=videosIn(v.list,true).map(x=>x.id);
  perform(`Rearranged ${listName(v.list)}. Switched to saved manual order; future arrivals append.`,()=>{
    const l=list(v.list);l.order=arrangement;l.manual=true;
    l.order.splice(l.order.indexOf(id),1);l.order.splice(l.order.indexOf(target)+(after?1:0),0,id);
    view.sort='manual';
  });
}
function nudge(id,delta){const v=video(id),vs=videosIn(v.list),index=vs.findIndex(x=>x.id===id),target=vs[index+delta];if(!target)return;if(delta<0)reorder(id,target.id);else reorder(target.id,id);}
function mark(ids,status){const vs=ids.map(video).filter(v=>v?.status==='active');if(!vs.length)return;perform(`${vs.length} video(s) marked ${status}. Former placements are in history.`,()=>vs.forEach(v=>retire(v,status)));}
function retire(v,status){const now=new Date().toISOString();v.history.push({action:status,from:v.list,at:now});if(v.list==='inbox'&&!v.exit)v.exit=now;list(v.list).order=list(v.list).order.filter(id=>id!==v.id);v.status=status;v.list=null;}
function openVideos(ids,name){const vs=ids.map(video).filter(v=>v?.status==='active');if(!vs.length)return;
  modal(`<h2>Open ${vs.length} video${vs.length===1?'':'s'}${vs.length>1?' in a tab group':''}?</h2><p>${vs.length>10?`<strong>${vs.length} tabs will open. This may take time.</strong><br>`:''}This demo simulates successful tab creation and marks each opened video watched. Unavailable videos are included.</p><p class="muted">No external tabs will open. Playback is not checked.</p><div class="inline"><button class="primary" id="confirm-open">Simulate opening ${vs.length}</button><button data-action="close">Cancel</button></div>`);
  $('#confirm-open').onclick=()=>{perform(`Simulated ${vs.length} tabs in “${name}”; all successfully created tabs marked watched.`,()=>{state.tabGroup={name,simulated:true,tabs:vs.map(v=>({id:v.id,title:v.title,url:v.url,availability:v.availability,created:true}))};vs.forEach(v=>retire(v,'watched'));});closeOverlay();showTabs();};
}
function showTabs(){const group=state.tabGroup;if(!group)return;modal(`<h2>Simulated tab group · ${esc(group.name)}</h2><p>${group.tabs.length} tabs created · all marked watched · no playback claim.</p>${group.tabs.map(t=>`<div class="history-row">▣ ${esc(t.title)} <span class="badge">${esc(t.availability)}</span><small>${esc(t.url)}</small></div>`).join('')}<p>Undo restores former list placement and manual order.</p><button data-action="close">Close</button>`);}
function importance(id,delta){const ranked=state.lists.filter(l=>!l.permanent).sort((a,b)=>a.rank-b.rank),idx=ranked.findIndex(l=>l.id===id),other=ranked[idx+delta];if(!other)return;perform(`Changed importance of ${listName(id)}.`,()=>{[ranked[idx].rank,other.rank]=[other.rank,ranked[idx].rank];view.overview='importance';});}
function reorderList(id,target){
  if(id===target||!list(id)||!list(target)||list(id).permanent||list(target).permanent)return;
  const ranked=orderedLists().filter(l=>!l.permanent);
  const item=ranked.splice(ranked.findIndex(l=>l.id===id),1)[0];
  ranked.splice(ranked.findIndex(l=>l.id===target),0,item);
  perform(`Moved ${listName(id)} before ${listName(target)} in saved list importance.`,()=>{
    ranked.forEach((l,i)=>l.rank=i+1);view.overview='importance';
  });
}
function deleteList(id){const l=list(id);if(!l||l.permanent)return;modal(`<h2>Delete “${esc(l.name)}”</h2><p>Choose what happens to its ${active(id).length} active videos. This demo allows Undo of the entire deletion.</p><div class="delete-options"><label><input type="radio" name="delete-mode" value="move"> Move all videos to <select id="delete-dest" aria-label="Deletion destination">${state.lists.filter(x=>x.id!==id).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><label><input type="radio" name="delete-mode" value="dismiss"> Dismiss all videos and keep history</label></div><div class="inline"><button id="confirm-delete">Delete with chosen action</button><button data-action="close">Cancel</button></div><p id="delete-error" role="status"></p>`);
  $('#confirm-delete').onclick=()=>{const mode=$('input[name=delete-mode]:checked')?.value;if(!mode){$('#delete-error').textContent='Choose Move or Dismiss first.';return;}const dest=$('#delete-dest').value;perform(`Deleted ${l.name}; ${mode==='move'?'moved videos to '+listName(dest):'dismissed its videos'}.`,()=>{active(id).forEach(v=>mode==='move'?relocate(v,dest):retire(v,'dismissed'));state.lists=state.lists.filter(x=>x.id!==id);state.lists.filter(x=>!x.permanent).sort((a,b)=>a.rank-b.rank).forEach((x,i)=>x.rank=i+1);if(view.scope===id)view.scope='all';});closeOverlay();};
}
function options(items,value){return items.map(([key,label])=>`<option value="${key}" ${key===value?'selected':''}>${esc(label)}</option>`).join('');}
function overviewSelect(){return `<label class="muted">List overview <select data-control="overview" aria-label="List overview sort">${options([['importance','Importance'],['name','Name'],['count','Video count'],['duration','Known duration'],['recent','Most recent addition']],view.overview)}</select></label>`;}
function listTools(l){return l.permanent?'':`<span class="list-tools"><button data-action="importance-up" data-id="${l.id}" aria-label="Raise ${esc(l.name)} importance" ${l.rank===1?'disabled':''}>↑</button><button data-action="importance-down" data-id="${l.id}" aria-label="Lower ${esc(l.name)} importance" ${l.rank===state.lists.length-2?'disabled':''}>↓</button><button data-action="delete-list" data-id="${l.id}" aria-label="Delete ${esc(l.name)}">×</button></span>`;}
function navigation(){
  const item=l=>`<div class="nav-item ${view.scope===l.id?'current':''}" data-drop-list="${l.id}" ${l.permanent?'':`data-reorder-list="${l.id}"`}>${l.permanent?'':`<span class="handle list-handle" draggable="true" data-drag-list="${l.id}" title="Drag to change list importance">⠿</span>`}<button class="destination" data-action="scope" data-id="${l.id}"><span class="importance">${l.permanent?(l.id==='inbox'?'◫':'◷'):'#'+l.rank}</span> &nbsp;${esc(l.name)}<small>${stats(l.id)}</small></button>${listTools(l)}</div>`;
  return `<aside class="sidebar"><div class="eyebrow">Your collection</div><div class="nav-item ${view.scope==='all'?'current':''}"><button class="destination" data-action="scope" data-id="all">▦ &nbsp; All active videos<small>${stats()}</small></button></div><section class="nav-section"><div class="eyebrow">Initial review</div>${item(list('inbox'))}</section><section class="nav-section"><div class="eyebrow">Watch lists</div>${overviewSelect()}${orderedLists().filter(l=>!l.permanent).map(item).join('')}<p class="footer-hint">Drag handles to reorder watch lists.<br>Drop videos onto a list to move them.</p></section><section class="nav-section"><div class="eyebrow">Saved for later</div>${item(list('backlog'))}</section><section class="nav-section"><button class="quiet" data-action="history">◴ &nbsp; History (${state.videos.filter(v=>v.status!=='active').length})</button></section></aside>`;
}
function channelChips(){
  const pool=active(view.scope==='all'?null:view.scope);
  const anchor=list(view.channelNavScope)?view.channelNavScope:'all';
  const rankingPool=active(anchor==='all'?null:anchor);
  const ranked=channels.map(name=>({name,count:pool.filter(v=>v.channel===name).length,rankCount:rankingPool.filter(v=>v.channel===name).length})).filter(c=>c.rankCount>0||c.count>0||c.name===view.channel).sort((a,b)=>b.rankCount-a.rankCount||a.name.localeCompare(b.name));
  const visible=view.showChannels?ranked:ranked.slice(0,5);
  if(view.channel&&!visible.some(c=>c.name===view.channel))visible.push(ranked.find(c=>c.name===view.channel));
  return `<section class="channel-picker" aria-label="Browse by channel"><small>Channels · most videos first</small><div class="channel-rail"><button data-action="channel" data-id="" class="${!view.channel?'active':''}">All channels · <span class="channel-count">${pool.length}</span></button>${visible.filter(Boolean).map(c=>`<span class="channel-choice"><button class="${view.channel===c.name?'active':''}" data-action="channel" data-id="${esc(c.name)}">${esc(c.name)} · <span class="channel-count">${c.count}</span></button>${view.channel===c.name?`<button class="scope-link ${view.scope==='all'?'active':''}" data-action="channel-library" aria-pressed="${view.scope==='all'}" title="${view.scope==='all'?'Return to '+esc(listName(list(view.channelHome)?view.channelHome:'inbox')):'Show this channel across the Library'}"><span class="toggle-track" aria-hidden="true"><span></span></span>Across Library</button>`:''}</span>`).join('')}${ranked.length>5?`<button class="channel-expand" data-action="expand-channels" aria-expanded="${view.showChannels}">${view.showChannels?'Show fewer':'Show all '+ranked.length+' channels'} ${view.showChannels?'−':'+'}</button>`:''}</div></section>`;
}
function channelSelect(){return `<select data-control="channel" aria-label="Filter by channel">${options([['','All channels'],...channels.map(c=>[c,c])],view.channel)}</select>`;}
function sortDirection(){return (view.sort==='release'?list(view.scope)?.direction:null)||view.sortDirection;}
function sortButton(key,label){return `<button class="sort-button ${view.sort===key?'active':''}" data-action="sort" data-id="${key}" title="${key==='manual'?'Return to the saved arrangement':'Sort by '+label+'; click again to reverse'}">${label}${view.sort===key?(key==='manual'?' ✓':sortDirection()==='asc'?' ↑':' ↓'):key==='manual'?'':' ↕'}</button>`;}
function sortHeader(key,label){return `<th aria-sort="${view.sort===key?(sortDirection()==='asc'?'ascending':'descending'):'none'}">${sortButton(key,label)}</th>`;}
function sortBy(key){
  if(key!=='manual'){
    const direction=view.sort===key&&sortDirection()==='asc'?'desc':view.sort===key?'asc':key==='release'?(list(view.scope)?.direction||'asc'):'asc';
    view.sortDirection=direction;
    if(key==='release'){if(list(view.scope))list(view.scope).direction=direction;else state.lists.forEach(l=>l.direction=direction);}
  }
  view.sort=key;render();
}
function toolbar(){
  const grouped=view.variant==='A'&&view.channel&&view.scope==='all', noHeaders=grouped||view.variant==='B';
  return `<div class="toolbar direct-sorts"><div class="sort-shortcuts">${noHeaders?sortButton('title','Title')+sortButton('release','Published')+sortButton('duration','Duration'):''}<details class="date-sorts"><summary>Library dates</summary><div class="date-sort-buttons">${sortButton('saved','First saved')}${sortButton('exit','First Inbox exit')}${sortButton('entered','Latest list entry')}</div></details>${['saved','exit','entered'].includes(view.sort)?`<small class="current-sort">${{saved:'First saved',exit:'First Inbox exit',entered:'Latest list entry'}[view.sort]} ${sortDirection()==='asc'?'↑':'↓'}</small>`:''}</div>${view.variant==='B'?channelSelect():''}${view.channel&&view.variant!=='A'?'<button class="small" data-action="channel-library">Channel across Library ↗</button>':''}<span class="spacer"></span>${view.variant==='A'?`<div class="density-switch" aria-label="Video display"><button data-action="density" data-id="compact" aria-pressed="${view.density==='compact'}" class="${view.density==='compact'?'active':''}">☷ Compact</button><button data-action="density" data-id="thumbnail" aria-pressed="${view.density==='thumbnail'}" class="${view.density==='thumbnail'?'active':''}">▧ Thumbnails</button></div>`:''}<button class="small" data-action="clear-filters">Clear filters</button></div>`;
}
function batch(){const vs=displayed();return `<div class="collection-actions"><label class="select-all-label"><input type="checkbox" id="select-all" aria-label="Select all ${vs.length} displayed videos" ${vs.length&&vs.every(v=>selected.has(v.id))?'checked':''} ${!vs.length?'disabled':''}> Select all ${vs.length} ${view.channel||view.search?'results':'videos'}</label>${view.variant==='B'?'<small>Across visible columns</small>':''}${sortButton('manual','Manual')}<span class="spacer"></span><button class="small" data-action="undo" ${!undoStack.length?'disabled':''}>↶ Undo</button>${view.scope!=='all'?`<button class="primary" data-action="open-list" title="Opens every video in this list, including videos hidden by filters" ${!active(view.scope).length?'disabled':''}>Open entire list · ${active(view.scope).length}</button>`:''}</div>${selected.size?`<div class="batch contextual"><span class="selection">${selected.size} selected</span><small>Drag to a list, or</small><select id="move-destination" aria-label="Move selected videos to"><option value="">Move to…</option>${state.lists.filter(l=>l.id!=='inbox').map(l=>`<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select><button data-action="move">Move</button><button data-action="open-selected">Open selected</button><button data-action="watched">Watched</button><button data-action="dismiss">Dismiss</button><span class="spacer"></span><button class="quiet" data-action="clear-selection">Clear selection ×</button></div>`:''}`;}

function thumb(v){return `<button class="thumb" draggable="false" data-action="open-one" data-id="${v.id}" style="--tile:${colors[channels.indexOf(v.channel)]}" aria-label="Open ${esc(v.title)} (simulation)" title="Open video (simulation)">${v.provider==='Twitch'?'LIVE':v.channel.split(' ').map(s=>s[0]).join('')}<span>${duration(v.duration)}</span></button>`;}
function titleLink(v){return `<button class="video-title title-link" draggable="false" data-action="open-one" data-id="${v.id}" title="Open video (simulation)">${esc(v.title)}</button>`;}

function badge(v){return v.availability!=='Available'?`<span class="badge warn">${esc(v.availability)}</span>`:'';}
function checkbox(v){return `<input type="checkbox" data-select="${v.id}" aria-label="Select ${esc(v.title)}" ${selected.has(v.id)?'checked':''}>`;}
function orderControls(v){return '<span class="handle" title="Drag to arrange; the line previews the drop position">⠿</span>';}
function row(v){return `<article class="list-row ${selected.has(v.id)?'selected':''}" draggable="true" data-video="${v.id}">${orderControls(v)}${checkbox(v)}${thumb(v)}<div class="body">${titleLink(v)}<div class="metadata"><button class="channel" data-action="channel" data-id="${esc(v.channel)}">${esc(v.channel)}</button><span>${date(v.release)}</span><span>${esc(v.provider)}</span><span class="badge">${esc(listName(v.list))}</span>${badge(v)}</div></div><div class="row-actions"><button class="small" data-action="details" data-id="${v.id}">Details</button><button class="small primary" data-action="open-one" data-id="${v.id}">${['Unavailable','Private'].includes(v.availability)?'Open anyway':'Open ↗'}</button></div></article>`;}
function heading(){return `<div class="heading"><div><div class="eyebrow">${view.variant==='A'?'A / Your preferred layout, refined':view.variant==='B'?'B / Sort with destinations in view':'C / More Library, less scrolling'}</div><h1>${view.variant==='B'?'Your lists, together':view.scope==='all'?'All active videos':esc(listName(view.scope))}</h1><p>${view.variant==='B'?'Move a batch across lists. Scroll sideways for more destinations.':view.scope==='inbox'?'A first pass. Decide what deserves your time.':view.scope==='backlog'?'Reviewed, saved for later. Nothing lost.':'Choose your next watch, or make room for something new.'}</p></div><small>${stats(view.scope==='all'?null:view.scope)}</small></div>${searchControls()}`;}

function searchControls(){
  const all=view.scope==='all', local=list(view.channelHome)?view.channelHome:'inbox';
  return `<div class="list-search" role="search"><label for="search" class="search-label">Search</label><input type="search" id="search" aria-label="Search ${all?'Library':esc(listName(view.scope))} titles, channels, descriptions and URLs" placeholder="Search ${all?'entire Library':esc(listName(view.scope))}…" value="${esc(view.search)}"><button data-action="search-library" aria-pressed="${all}" class="search-scope-toggle ${all?'active':''}" title="${all?'Return to searching '+esc(listName(local)):'Search active videos in every list'}"><span class="toggle-track" aria-hidden="true"><span></span></span>Search entire Library</button><small class="search-context">Searching ${all?'all active lists':esc(listName(view.scope))}${view.channel?' · Channel filter: '+esc(view.channel):''}</small></div>`;
}

function inspector(){return `<details class="inspector" id="inspector"><summary>Prototype state & interaction log · ${state.log.length} actions · ${undoStack.length} undo steps</summary><p class="footer-hint">Mock state is shared across variants and resets on refresh. JSON includes every record, placement, order, history event, view, and simulated tab.</p><pre id="state-json"></pre></details>`;}
function empty(){return '<div class="empty">No matching videos.<br>Clear filters or choose another list.</div>';}
function VariantA(){const grouped=view.channel&&view.scope==='all';return `<div class="shell">${navigation()}<main class="main refined ${view.density==='compact'?'compact-mode':''}">${heading()}${channelChips()}${toolbar()}<div class="notice" role="status">${esc(lastMessage)}</div>${batch()}${grouped?channelGroups():compactTable()}${inspector()}</main></div>`;}
function channelGroups(){
  const groups=orderedLists().filter(l=>videosIn(l.id).length);
  return `<div class="group-heading inline"><strong>${esc(view.channel)} · by destination</strong><small>${groups.length} lists</small><span class="spacer"></span><span class="density-switch"><button data-action="group-layout" data-id="rows" class="${view.groupLayout==='rows'?'active':''}">Rows</button><button data-action="group-layout" data-id="columns" class="${view.groupLayout==='columns'?'active':''}">Columns</button></span></div><div class="channel-board ${view.groupLayout}">${groups.map(l=>`<section class="channel-group" data-drop-list="${l.id}"><header><button class="quiet" data-action="scope" data-id="${l.id}"><strong>${esc(l.name)}</strong></button><small>${videosIn(l.id).length} matching videos</small></header><div class="group-videos">${videosIn(l.id).map(card).join('')}</div></section>`).join('')||empty()}</div>`;
}
function compactTable(){return `<div class="table-wrap ${view.density==='thumbnail'?'thumbnail-table':''}"><table><thead><tr><th aria-label="Drag to arrange">⠿</th><th>Select</th>${sortHeader('title','Video')}${sortHeader('channel','Channel')}${sortHeader('destination','Destination')}${sortHeader('duration','Duration')}${sortHeader('release','Published')}<th>Details</th></tr></thead><tbody>${videosIn().map(v=>`<tr draggable="true" data-video="${v.id}" class="${selected.has(v.id)?'selected':''}"><td>${orderControls(v)}</td><td>${checkbox(v)}</td><td class="title-cell"><div class="title-content">${view.density==='thumbnail'?thumb(v):''}<div>${titleLink(v)} ${badge(v)}<small>${v.provider}</small></div></div></td><td><button class="channel" data-action="channel" data-id="${esc(v.channel)}">${esc(v.channel)}</button></td><td><span class="badge">${esc(listName(v.list))}</span></td><td>${duration(v.duration)}</td><td>${date(v.release)}</td><td><button class="small" data-action="details" data-id="${v.id}">Details</button></td></tr>`).join('')}</tbody></table>${videosIn().length?'':empty()}</div>`;}

function card(v){return `<article class="video-card ${selected.has(v.id)?'selected':''}" draggable="true" data-video="${v.id}"><div class="inline">${checkbox(v)}${titleLink(v)}${orderControls(v)}</div><div class="metadata"><button class="channel" data-action="channel" data-id="${esc(v.channel)}">${esc(v.channel)}</button><span>${duration(v.duration)}</span>${badge(v)}</div><div class="metadata">${date(v.release)} · ${v.provider} <span class="badge">${esc(listName(v.list))}</span></div><div class="row-actions">${thumb(v)}<button class="small" data-action="details" data-id="${v.id}">Details</button><button class="small" data-action="open-one" data-id="${v.id}">Open${['Unavailable','Private'].includes(v.availability)?' anyway':' ↗'}</button></div></article>`;}
function VariantB(){return `<main class="board-main">${heading()}<div class="inline">${overviewSelect()}<span class="spacer"></span><button class="small" data-action="scope" data-id="all">All active</button><small>Focused list:</small><select data-control="scope" aria-label="Focused list">${options([['all','All active'],...state.lists.map(l=>[l.id,l.name])],view.scope)}</select></div>${toolbar()}${batch()}<div class="notice" role="status">${esc(lastMessage)}</div><p class="footer-hint">${view.channel?`Channel filter applies ${view.scope==='all'?'across the Library':'within '+esc(listName(view.scope))}. Other columns stay visible as move targets.`:'All columns are visible. The focused list sets the Open entire list action.'} Drag onto a video to switch to manual order and insert before it; drag onto a column heading to move.</p><div class="board">${orderedLists().map(l=>`<section class="column ${view.scope===l.id?'focused':''}" data-drop-list="${l.id}"><header class="column-header"><div class="inline"><button class="quiet" data-action="scope" data-id="${l.id}"><strong>${l.permanent?'':l.rank+'. '}${esc(l.name)}</strong></button><span class="spacer"></span>${listTools(l)}</div><small>${stats(l.id)}</small><div class="inline" style="margin-top:8px"><button class="small" data-action="open-column" data-id="${l.id}">Open all ${active(l.id).length}</button><button class="small" data-action="column-direction" data-id="${l.id}">${l.direction==='asc'?'Oldest ↑':'Newest ↓'}</button></div></header><div class="column-items">${boardVideos(l.id).map(card).join('')||empty()}</div></section>`).join('')}</div>${inspector()}</main>`;}
function boardVideos(id){if((view.channel||view.search)&&view.scope!=='all'&&view.scope!==id)return [];return videosIn(id);}
// The board's filter scope is explicit: all columns or one focused list.
function VariantC(){return `<main class="table-main">${heading()}<div class="inline">${overviewSelect()}<span class="spacer"></span><small>Importance controls:</small>${list(view.scope)?listTools(list(view.scope)):''}</div><nav class="nav-tabs"><button data-action="scope" data-id="all" class="${view.scope==='all'?'active':''}">All active · ${active().length}</button>${orderedLists().map(l=>`<button class="${view.scope===l.id?'active':''}" data-action="scope" data-id="${l.id}" data-drop-list="${l.id}" title="${stats(l.id)}">${l.permanent?'':l.rank+'. '}${esc(l.name)} · ${active(l.id).length}<small style="display:block">${stats(l.id).split(' · ')[1]}</small></button>`).join('')}</nav><div class="channel-rail"><button data-action="channel" data-id="" class="${!view.channel?'active':''}">All channels</button>${channels.map(c=>`<button class="${view.channel===c?'active':''}" data-action="channel" data-id="${esc(c)}">${esc(c)} · ${active(view.scope==='all'?null:view.scope).filter(v=>v.channel===c).length}</button>`).join('')}</div>${toolbar()}${batch()}<div class="notice" role="status">${esc(lastMessage)}</div>${compactTable()}<p class="footer-hint">Drag onto a list tab to move. Rearranging within a list switches to Saved manual order.</p>${inspector()}</main>`;}
function render(){
  const inspectorOpen=$('#inspector')?.open;
  $('#app').innerHTML=`<header class="topbar"><div class="brand"><span class="brand-mark">▷</span> Library <span class="badge">LAYOUT STUDY</span></div><div class="top-actions"><span class="muted">${active().length} active · ${state.lists.length} lists</span><button class="small" data-action="history">History</button><button class="small" data-action="reset">Reset demo</button></div></header><div class="prototype-note"><span>THROWAWAY PROTOTYPE · fictional sample data · changes stay in memory</span><span>No real tabs or saved changes</span></div>${({A:VariantA,B:VariantB,C:VariantC}[view.variant])()}`;
  // Equivalent development gate for a standalone artifact: local previews only.
  const local=location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  $('#switcher').innerHTML=local?`<div class="switcher"><button data-action="previous" aria-label="Previous layout">←</button><div class="label"><strong>${view.variant} · ${names[view.variant]}</strong><small>← → compare layouts · edits carry across</small></div><button data-action="next" aria-label="Next layout">→</button><button data-action="compare">Compare</button></div>`:'';
  if(inspectorOpen){$('#inspector').open=true;updateInspector();}
  $('#inspector').ontoggle=()=>{if($('#inspector').open)updateInspector();};
  $('#search').oninput=e=>{const position=e.target.selectionStart;view.search=e.target.value;selected.clear();render();$('#search').focus();$('#search').setSelectionRange(position,position);};
  $('#select-all').indeterminate=displayed().some(v=>selected.has(v.id))&&!displayed().every(v=>selected.has(v.id));
  $('#select-all').onchange=e=>{displayed().forEach(v=>e.target.checked?selected.add(v.id):selected.delete(v.id));render();};
  document.querySelectorAll('[data-select]').forEach(el=>el.onchange=e=>{e.target.checked?selected.add(el.dataset.select):selected.delete(el.dataset.select);render();});
  document.querySelectorAll('[data-control]').forEach(el=>el.onchange=()=>{view[el.dataset.control]=el.value;if(el.dataset.control==='scope'){view.channelNavScope=el.value;if(el.value!=='all')view.channelHome=el.value;}selected.clear();render();});
  wireDrag();
}
function updateInspector(){$('#state-json').textContent=JSON.stringify({view,selected:[...selected],undoSteps:undoStack.map(x=>x.label),quickSaveWatchLists:state.lists.filter(l=>!l.permanent).sort((a,b)=>a.rank-b.rank).slice(0,3).map(l=>l.name),...state},null,2);}
function switchVariant(delta){const keys=['A','B','C'];view.variant=keys[(keys.indexOf(view.variant)+delta+3)%3];const url=new URL(location.href);url.searchParams.set('variant',view.variant);history.replaceState(null,'',url);render();console.info('[Library prototype] Variant switch',structuredClone({view,state,selection:[...selected]}));}
function clearDropMarker(){
  $('#drop-marker')?.remove();dropHint=null;
  document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));
}
function markInsertion(el,e){
  clearDropMarker();
  const horizontal=!!el.closest('.channel-board.rows'), rect=el.getBoundingClientRect();
  const after=horizontal?e.clientX>rect.left+rect.width/2:e.clientY>rect.top+rect.height/2;
  dropHint={id:el.dataset.video,after};
  const marker=document.createElement('div');marker.id='drop-marker';marker.className=horizontal?'vertical':'horizontal';
  marker.innerHTML='<span>Drop here</span>';
  Object.assign(marker.style,horizontal?{left:(after?rect.right:rect.left)+'px',top:rect.top+'px',height:rect.height+'px'}:{left:rect.left+'px',top:(after?rect.bottom:rect.top)+'px',width:rect.width+'px'});
  document.body.append(marker);
}
function wireDrag(){
  document.querySelectorAll('[data-video]').forEach(el=>{
    el.ondragstart=e=>{clearDropMarker();dragList=null;dragSuppressUntil=Date.now()+500;const id=el.dataset.video;dragIds=selected.has(id)?[...selected]:[id];e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';};
    el.ondragend=()=>{dragIds=[];dragSuppressUntil=Date.now()+250;clearDropMarker();};
    el.ondragover=e=>{
      if(dragList||!dragIds.length)return;e.preventDefault();e.stopPropagation();
      const src=video(dragIds[0]),target=video(el.dataset.video);
      if(src.list===target.list&&dragIds.length===1&&src.id!==target.id)markInsertion(el,e);
      else {clearDropMarker();if(src.list!==target.list&&target.list!=='inbox')el.classList.add('drop-target');}
    };
    el.ondragleave=e=>{if(!el.contains(e.relatedTarget))clearDropMarker();};
    el.ondrop=e=>{
      e.preventDefault();e.stopPropagation();if(dragList)return;
      const target=video(el.dataset.video),src=video(dragIds[0]);if(!src)return;
      const after=dropHint?.id===target.id?dropHint.after:false;clearDropMarker();
      if(src.list===target.list){if(dragIds.length>1){log('Reorder one video at a time; batch selection is for moving between lists.');render();}else reorder(src.id,target.id,after);}else move(dragIds,target.list);
      dragIds=[];dragSuppressUntil=Date.now()+250;
    };
  });
  document.querySelectorAll('[data-drag-list]').forEach(el=>{
    el.ondragstart=e=>{clearDropMarker();e.stopPropagation();dragIds=[];dragList=el.dataset.dragList;e.dataTransfer.setData('text/plain','list:'+dragList);e.dataTransfer.effectAllowed='move';};
    el.ondragend=()=>{dragList=null;clearDropMarker();};
  });
  document.querySelectorAll('[data-drop-list]').forEach(el=>{
    el.ondragover=e=>{if(dragList&&!el.dataset.reorderList)return;if(!dragList&&el.dataset.dropList==='inbox')return;e.preventDefault();clearDropMarker();el.classList.add('drop-target');};
    el.ondragleave=e=>{if(!el.contains(e.relatedTarget))el.classList.remove('drop-target');};
    el.ondrop=e=>{e.preventDefault();clearDropMarker();if(dragList){reorderList(dragList,el.dataset.reorderList);dragList=null;}else {move(dragIds,el.dataset.dropList);dragIds=[];}};
  });
}
function modal(html,wide=false){$('#overlay').innerHTML=`<div class="backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="Prototype dialog">${html}</section></div>`;$('#overlay button')?.focus();}
function closeOverlay(){$('#overlay').innerHTML='';}
function details(id){const v=video(id);$('#overlay').innerHTML=`<div class="backdrop"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Video details"><button data-action="close">Close ×</button><h2>${esc(v.title)}</h2><div class="inline"><span class="badge">${esc(v.provider)}</span>${badge(v)}<span class="badge">${esc(v.status==='active'?listName(v.list):v.status)}</span></div><p><button class="channel" data-action="detail-channel" data-id="${esc(v.channel)}">${esc(v.channel)} · browse this channel</button></p><dl><dt>Duration</dt><dd>${duration(v.duration)}</dd><dt>Publication date</dt><dd>${date(v.release)}</dd><dt>First saved</dt><dd>${date(v.saved)}</dd><dt>First Inbox exit</dt><dd>${v.exit?date(v.exit):'Not recorded'}</dd><dt>Latest list entry</dt><dd>${date(v.entered)}</dd><dt>Saved URL</dt><dd>${esc(v.url)}</dd></dl><h2>Description</h2><p>${esc(v.description||'No metadata available. The saved URL and editable title remain usable.')}</p><label>Editable title<textarea id="edit-title">${esc(v.title)}</textarea></label><button data-action="save-title" data-id="${id}">Save mock title</button><h2>History & former placement</h2>${v.history.map(h=>`<div class="history-row">${esc(h.action)}${h.from?' · from '+esc(listName(h.from)):''}${h.to?' → '+esc(listName(h.to)):''}<small>${esc(h.at)}</small></div>`).join('')}<p class="muted">History here is a layout fixture. Exact production retention and restoration rules remain open.</p>${v.status==='active'?`<div class="inline"><button class="primary" data-action="open-one" data-id="${id}">Simulate open${['Private','Unavailable'].includes(v.availability)?' anyway':''}</button><button data-action="dismiss-one" data-id="${id}">Dismiss</button>${v.availability!=='Available'?`<button data-action="retry" data-id="${id}">Retry metadata (mock)</button>`:''}</div>`:''}</aside></div>`;$('#overlay button').focus();}
function historyView(){modal(`<h2>Retained history</h2><p>Watched and dismissed records are hidden from active views. Details preserve former placement and previous watch events.</p>${state.videos.filter(v=>v.status!=='active').map(v=>`<div class="history-row"><div class="inline"><strong>${esc(v.title)}</strong><span class="badge">${v.status}</span><button class="small" data-action="details" data-id="${v.id}">Details / history</button></div><small>Former destination: ${esc(listName(v.history.at(-1).from))}</small></div>`).join('')||empty()}<p><button data-action="close">Close</button></p>`,true);}
function compare(){modal(`<div class="eyebrow">One collection · three ways to work</div><h2>Which layout makes your next step obvious?</h2><div class="compare-grid"><article><h3>A · Sidebar</h3><p>Your preferred sidebar, with compact/thumbnail views and expandable channel shortcuts.</p><p>Tradeoff: moving between lists relies on the sidebar or batch selector.</p><button data-action="choose-variant" data-id="A">Try A</button></article><article><h3>B · Side by side</h3><p>Source and destination stay in sight. Good for Inbox triage and dragging.</p><p>Tradeoff: more horizontal scrolling; long titles and many lists compete for space.</p><button data-action="choose-variant" data-id="B">Try B</button></article><article><h3>C · Compact table</h3><p>More records and comparable metadata per screen. Good for scanning and batches.</p><p>Tradeoff: weaker visual recognition and a busier toolbar.</p><button data-action="choose-variant" data-id="C">Try C</button></article></div><h3>Try the same tasks in each</h3><ol><li>Pick a video from Tonight; expand its description.</li><li>Move three Inbox videos to Tonight and three to Backlog. Undo once.</li><li>Find Studio North within Inbox, then across the Library.</li><li>Drag a video to switch to Manual, then change to duration and back.</li><li>Compare list overview by importance, count, and duration.</li></ol><p>Use Reset demo for an identical starting point. Arrow-key switching preserves your edits. A combination is welcome: choose navigation, density, and moving separately.</p><p class="muted">Tell the assistant what worked and what felt cumbersome; feedback is recorded in layout-feedback.md. A is the preferred base. Its refined preview adds compact/thumbnail views and ranked channel shortcuts; selection details remain under review.</p><button data-action="close">Back to the prototype</button>`,true);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;if(b.dataset.action==='open-one'&&Date.now()<dragSuppressUntil)return;const id=b.dataset.id;
  switch(b.dataset.action){
    case 'next':switchVariant(1);break;case 'previous':switchVariant(-1);break;
    case 'choose-variant':switchVariant(['A','B','C'].indexOf(id)-['A','B','C'].indexOf(view.variant));closeOverlay();break;
    case 'compare':compare();break;case 'close':closeOverlay();break;
    case 'scope':view.scope=id;view.channelNavScope=id;if(id!=='all')view.channelHome=id;selected.clear();render();break;
    case 'density':view.density=id;render();break;
    case 'sort':sortBy(id);break;
    case 'group-layout':view.groupLayout=id;render();break;
    case 'expand-channels':view.showChannels=!view.showChannels;render();break;
    case 'clear-selection':selected.clear();render();break;
    case 'channel-local':if(list(view.channelHome))view.scope=view.channelHome;selected.clear();render();break;
    case 'channel':view.channel=id;selected.clear();render();break;
    case 'detail-channel':view.channel=id;selected.clear();render();closeOverlay();break;
    case 'channel-library':if(view.scope==='all'){view.scope=list(view.channelHome)?view.channelHome:'inbox';}else{view.channelHome=view.scope;view.scope='all';}selected.clear();render();break;
    case 'search-library':if(view.scope==='all'){view.scope=list(view.channelHome)?view.channelHome:'inbox';}else{view.channelHome=view.scope;view.scope='all';}selected.clear();render();break;
    case 'clear-filters':view.channel='';view.search='';selected.clear();render();break;
    case 'reset':reset();closeOverlay();break;
    case 'move':{const dest=$('#move-destination').value;if(dest)move([...selected],dest);else{lastMessage='Choose a destination beside Move first.';render();}break;}
    case 'undo':{const prev=undoStack.pop();if(prev){state=prev.state;if(view.scope!=='all'&&!list(view.scope))view.scope='all';selected.clear();log('Undid: '+prev.label);render();}break;}
    case 'open-one':openVideos([id],listName(video(id).list));break;
    case 'open-selected':openVideos([...selected],'Selected videos');break;
    case 'open-list':openVideos(active(view.scope).map(v=>v.id),listName(view.scope));break;
    case 'open-column':openVideos(active(id).map(v=>v.id),listName(id));break;
    case 'watched':mark([...selected],'watched');break;case 'dismiss':mark([...selected],'dismissed');break;
    case 'dismiss-one':mark([id],'dismissed');closeOverlay();break;
    case 'details':details(id);break;case 'history':historyView();break;
    case 'save-title':{const title=$('#edit-title').value.trim();if(title){perform('Edited a mock title.',()=>video(id).title=title);details(id);}break;}
    case 'retry':perform('Simulated metadata retry: no new information. Existing availability retained.',()=>{});details(id);break;
    case 'direction':list(view.scope).direction=list(view.scope).direction==='asc'?'desc':'asc';render();break;
    case 'column-direction':list(id).direction=list(id).direction==='asc'?'desc':'asc';render();break;
    case 'up':nudge(id,-1);break;case 'down':nudge(id,1);break;
    case 'importance-up':importance(id,-1);break;case 'importance-down':importance(id,1);break;
    case 'delete-list':deleteList(id);break;
  }
});
document.addEventListener('scroll',()=>{if(dropHint)clearDropMarker();},true);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeOverlay();return;}
  if(e.target.closest?.('input,textarea,select,[contenteditable]')||$('#overlay').children.length||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();switchVariant(e.key==='ArrowRight'?1:-1);}
});
reset();
