// Throwaway extension of selected A: original/current titles, full metadata
// history, and default historical search. All examples are fictional.
const historyExamples={
 bridge:[
  {time:'2026-09-01 10:00',title:'How bridges carry their load',description:'A guide to forces, supports, and bridge design.',channel:'Engineering Notes',duration:'24:10',published:'2026-08-24',image:'Original bridge thumbnail',origin:'Browser title at save; other example fields first retrieved shortly afterward'},
  {time:'2026-09-20 15:30',title:'Bridge loads explained',description:'A load tutorial using everyday examples.',channel:'Engineering Notes',duration:'24:10',published:'2026-08-24',image:'Second bridge thumbnail',origin:'YouTube API — fictional observation'},
  {time:'2026-10-12 14:20',title:'Why bridges stay standing',description:'See how a bridge carries traffic safely.',channel:'Engineering Notes',duration:'24:10',published:'2026-08-24',image:'Latest bridge thumbnail',origin:'YouTube API — fictional observation'}
 ],
 camera:[
  {time:'2026-10-05 11:00',title:'Camera basics: exposure',description:'Learn the exposure triangle.',channel:'Field Notes',duration:'18:42',published:'2026-09-22',image:'Original camera thumbnail',origin:'YouTube API — fictional observation'},
  {time:'2026-10-19 14:20',title:'Exposure in practice',description:'A practical guide to shutter speed and aperture.',channel:'Field Notes',duration:'18:42',published:'2026-09-22',image:'Latest camera thumbnail',origin:'YouTube API — fictional observation'}
 ]
};
let historySearch='',versionScopes={personal:true,original:true,intermediate:true,latest:true},detailTab='original';
function versionsFor(r){return historyExamples[r.id]||[{time:'Observation time unknown in this example',title:r.title||'',description:'',channel:null,duration:null,published:null,image:null,origin:r.personal?'Automatic source not supplied in this example':'No automatic metadata yet'}];}
function versionMatches(v,q){return `${v.title} ${v.description}`.toLowerCase().includes(q);}
function matchesHistory(r){
 if(!historySearch.trim())return true;
 const q=historySearch.toLowerCase();
 if(r.url.toLowerCase().includes(q))return true;
 if(versionScopes.personal&&r.personal&&title(r).toLowerCase().includes(q))return true;
 const versions=versionsFor(r);
 const selected=[];
 if(versionScopes.original)selected.push(versions[0]);
 if(versionScopes.latest)selected.push(versions.at(-1));
 if(versionScopes.intermediate)selected.push(...versions.slice(1,-1));
 return selected.some(v=>versionMatches(v,q));
}
function metadataVersion(v,i){return `<section class="metadata-version"><div class="version-heading"><strong>${esc(v.title||'Title unknown')}</strong><span class="muted">${esc(v.time)}</span></div><p class="muted">${esc(v.origin)}</p><div class="saved-thumb" style="background:${['#dce6ec','#e4dfec','#dce9dc'][i%3]}">${esc(v.image||'No saved thumbnail')}<small>Fictional image placeholder</small></div><dl class="details-grid"><dt>Channel</dt><dd>${esc(v.channel||'Unknown')}</dd><dt>Duration</dt><dd>${esc(v.duration||'Unknown')}</dd><dt>Published</dt><dd>${esc(v.published||'Unknown')}</dd></dl><h3>Description</h3><p>${esc(v.description||'No description recorded')}</p></section>`;}
function metadataPanel(r){const versions=versionsFor(r);const selected=detailTab==='history'?versions:detailTab==='latest'?[versions.at(-1)]:[versions[0]];return `<section class="archive-panel"><h2>Saved information</h2><div class="metadata-tabs" aria-label="Metadata versions">${['original','latest','history'].map(t=>`<button data-metadata-tab="${t}" data-record="${r.id}" aria-pressed="${detailTab===t}">${t[0].toUpperCase()+t.slice(1)}${t==='history'?` (${versions.length})`:''}</button>`).join('')}</div>${selected.map((v,i)=>metadataVersion(v,i)).join('')}</section>`;}
const detailBeforeHistory=detail;
detail=function(r){return detailBeforeHistory(r)+metadataPanel(r);};
const renderBeforeHistory=render;
render=function(){
 const allRecords=records;
 records=allRecords.filter(matchesHistory);
 renderBeforeHistory();
 document.getElementById('count').textContent=`${records.length} of ${allRecords.length} videos`;
 for(const r of records){
  const rowNode=document.querySelector(`[data-open="${r.id}"]`)?.closest('.video');
  if(!rowNode)continue;
  const versions=versionsFor(r),last=versions.at(-1);
  if(historyExamples[r.id]){
   rowNode.querySelector('.subtitle').textContent=`${last.channel||'Channel unknown'} · ${last.duration||'Duration unknown'} · ${r.personal?'Personal title':'Saved title'}`;
   rowNode.querySelector('.thumb').textContent='Saved thumbnail (mock)';
  }
  if(versions.length>1){
   const caption=document.createElement('div');caption.className='current-caption';
   caption.textContent=`${r.state==='found'?'YouTube now':'YouTube last known'}: ${last.title}`;
   rowNode.querySelector('.title').after(caption);
  }
  if(historySearch&&versionScopes.intermediate){
   const q=historySearch.toLowerCase();
   const hit=versions.find(v=>versionMatches(v,q));
   const visibleMatches=title(r).toLowerCase().includes(q)||versionMatches(last,q)||r.url.toLowerCase().includes(q);
   if(hit&&!visibleMatches){
    const match=document.createElement('button');match.className='history-hit';match.dataset.historyHit=r.id;
    match.textContent=`Matched historical information: “${hit.title}” · ${hit.time}`;
    rowNode.querySelector('.subtitle').after(match);
   }
  }
 }
 records=allRecords;
 document.getElementById('inbox-count').textContent=records.length;
 renderState();
};
const style=document.createElement('style');
style.textContent=`.scope{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:center}.scope input[type=search]{border:0;outline:0;width:100%;font:inherit;color:#253348;background:transparent}.version-checks{border:0;border-top:1px solid #e2e7ee;padding:9px 0 0;margin:0;display:flex;gap:14px;flex-wrap:wrap}.version-checks legend{font-size:12px;color:#63738a;padding:0 8px 0 0}.version-checks label{font-size:13px;color:#425775;display:flex;align-items:center;gap:5px;cursor:pointer}.version-checks input{width:16px;height:16px;accent-color:#345f98;margin:0}.current-caption{font-size:13px;color:#566a86;margin:4px 0;overflow-wrap:anywhere}.history-hit{display:block;border:0;border-radius:4px;background:#eef3fb;color:#345782;font-size:12px;padding:4px 7px;text-align:left;margin:6px 0;overflow-wrap:anywhere}.archive-panel{border-top:1px solid #ccd7e4;margin-top:24px;padding-top:20px}.metadata-tabs{display:flex;gap:7px;margin:12px 0}.metadata-tabs [aria-pressed=true]{background:#e6eef9;border-color:#7695bf}.metadata-version{border-top:1px solid #e0e6ed;padding:15px 0}.version-heading{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.saved-thumb{height:100px;width:190px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;border-radius:7px;margin:14px 0;font-size:13px;color:#46576b}.saved-thumb small{font-size:10px}dialog{width:min(760px,94vw)}.modalbody{max-height:calc(88vh - 100px)}.prototype-settings{margin-top:20px;padding:15px;background:white;border:1px solid #d2dce8;border-radius:7px}.prototype-settings p{font-size:13px}.scope-hint{font-size:12px;color:#64758c;margin:0 0 14px}`;
document.head.append(style);
const searchRoot=document.querySelector('.scope');
searchRoot.innerHTML='<input id="history-query" type="search" aria-label="Search in Inbox" placeholder="Search in Inbox…"><fieldset class="version-checks"><legend>Search titles / descriptions from</legend><label><input type="checkbox" data-version-scope="personal" checked>Personal</label><label><input type="checkbox" data-version-scope="original" checked>Original</label><label><input type="checkbox" data-version-scope="intermediate" checked>Intermediate</label><label><input type="checkbox" data-version-scope="latest" checked>Latest</label></fieldset>';
const hint=document.createElement('p');hint.className='scope-hint';hint.textContent='Try “Bridge loads explained”: it exists only in an intermediate title. Uncheck Intermediate to exclude it; keep Original and Latest on.';searchRoot.after(hint);
document.getElementById('history-query').addEventListener('input',event=>{historySearch=event.target.value;render();});
searchRoot.addEventListener('change',event=>{if(event.target.dataset.versionScope){versionScopes[event.target.dataset.versionScope]=event.target.checked;render();}});
document.getElementById('reset').addEventListener('click',()=>{historySearch='';versionScopes={personal:true,original:true,intermediate:true,latest:true};detailTab='original';document.getElementById('history-query').value='';document.querySelectorAll('[data-version-scope]').forEach(input=>input.checked=true);render();});
document.addEventListener('click',event=>{
 const tab=event.target.closest('[data-metadata-tab]');
 if(tab){detailTab=tab.dataset.metadataTab;const r=find(tab.dataset.record);if(variant==='B'){render();}else{document.getElementById('modal-body').innerHTML=detail(r);document.querySelector('#modal-body select').value=outcome;}return;}
 const hit=event.target.closest('[data-history-hit]');if(hit){detailTab='history';showDetails(hit.dataset.historyHit);}
});
document.querySelector('.simulation p').textContent+=' The revised mock shows historical search/title/version presentation. Thumbnail blocks are fictional placeholders, not proof of image storage. Backup defaults and removal behavior are specified in the draft, not implemented here.';
render();
window.metadataPrototypeReady=true;
