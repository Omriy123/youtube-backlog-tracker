import {command} from './shared.js';
import {showMetadataDetails} from './enrichment-ui.js';

function button(label,action){const item=document.createElement('button');item.type='button';item.className='secondary';item.textContent=label;item.addEventListener('click',action);return item;}
function paragraph(text){const item=document.createElement('p');item.textContent=text;return item;}
const names={retrieved:'Retrieved',noResult:'No resource returned',skipped:'Skipped',notAttempted:'Not attempted',network:'Network failure',quota:'Request allowance exhausted',storage:'Storage failure',credentialChanged:'Setup changed',setupRequired:'Setup required',rejected:'Setup rejected'};

export function appendEnrichmentOperations(parent,{getListId,onChanged}) {
  const controls=document.createElement('div');controls.className='title-tools enrichment-operation-controls';
  const status=paragraph('');status.setAttribute('role','status');status.hidden=true;
  const results=document.createElement('section');results.className='enrichment-operation-results';results.setAttribute('role','region');results.setAttribute('aria-label','Metadata retrieval results');results.hidden=true;
  const heading=document.createElement('h2');heading.textContent='Metadata retrieval results';
  const progress=paragraph('');progress.setAttribute('role','status');
  const counts=paragraph('');const actions=document.createElement('div');actions.className='title-tools';
  const entries=document.createElement('ol');const more=button('Show 100 more results',()=>{limit+=100;paint(current);});
  let current=null,limit=100,timer=null,request=0;
  const cancel=button('Cancel further retrieval',async()=>{const result=await command({type:'cancelEnrichment',operationId:current.id});if(result.operation)paint(result.operation);});
  const retry=button('Retry unfinished retrieval',async()=>{retry.disabled=true;const result=await command({type:'retryEnrichment',operationId:current.id});retry.disabled=false;if(result.operation)paint(result.operation);else status.textContent=result.error;});
  actions.append(cancel,retry,button('Hide retrieval results',()=>{results.hidden=true;}));
  results.append(heading,progress,counts,actions,entries,more);
  function paint(operation){
    current=operation;if(!operation){progress.textContent='No metadata retrieval operation retained.';counts.textContent='';entries.replaceChildren();cancel.hidden=true;retry.hidden=true;more.hidden=true;return;}
    const running=operation.status==='running';const value=operation.counts;
    progress.textContent=`${operation.status==='cancelled'?'Cancelled':operation.status==='interrupted'?'Interrupted':operation.status==='paused'?'Paused':running?'Retrieving metadata':'Retrieval finished'}. ${operation.explanation ?? ''}`;
    counts.textContent=`Requested: ${value.requested} · Retrieved: ${value.retrieved} · No result: ${value.noResult} · Failed: ${value.failed} · Skipped: ${value.skipped} · Not attempted/cancelled: ${value.notAttempted} · Image failures: ${value.imageFailed}`;
    cancel.hidden=!running;retry.hidden=running || !(value.failed || value.noResult || value.notAttempted || value.imageFailed);
    entries.replaceChildren();
    for(const target of operation.targets.slice(0,limit)){
      const row=document.createElement('li');const label=paragraph(`${target.title} — ${target.inFlight && running?'In flight':names[target.outcome] ?? 'Failed'}${target.outcome==='retrieved'?` · Image: ${target.imageOutcome}${target.imageOutcome==='failed'?'; text retained':''}`:''}${target.error?` · ${target.error}`:''}`);
      const inspect=button('Inspect saved metadata',async()=>{const result=await command({type:'metadataDetails',recordId:target.recordId});if(result.record)showMetadataDetails(result.record,{onChanged});});
      row.append(label,inspect);entries.append(row);
    }
    more.hidden=operation.targets.length<=limit;
    clearTimeout(timer);if(running)timer=setTimeout(refresh,500);
  }
  async function refresh(){const token=++request;const result=await command({type:'enrichmentOperation'});if(token!==request)return;if(result.ok){if(result.operation?.status==='interrupted')results.hidden=false;paint(result.operation);}else{status.hidden=false;status.textContent=result.error;}}
  async function start(scope){
    status.hidden=false;
    const listId=getListId();if(scope==='list' && !listId){status.textContent='Select a list before pulling its current members.';return;}
    status.textContent='Preparing retrieval targets…';const result=await command({type:'startEnrichment',scope,listId});
    if(!result.ok){status.textContent=result.error;return;}status.textContent='Targets fixed at invocation. You can keep using the Library.';limit=100;results.hidden=false;paint(result.operation);
  }
  const list=button('Pull list metadata',()=>start('list'));
  controls.append(list,button('Pull entire Library metadata',()=>start('library')),button('Retrieval results',()=>{results.hidden=false;refresh();}),button('Retained video metadata',()=>retained(onChanged)));
  parent.append(controls,status,results);refresh();
  return {update(){list.disabled=!getListId();}};
}

async function retained(onChanged){
  const view=document.createElement('dialog');view.setAttribute('aria-label','Retained video metadata');const heading=document.createElement('h2');heading.textContent='Retained video metadata';
  const help=paragraph('Inspect or deliberately retrieve information for watched and dismissed videos. This does not change their status or verify playback.');
  const label=document.createElement('label');label.textContent='Find retained video';const query=document.createElement('input');query.type='search';label.append(query);
  const body=document.createElement('div');const status=paragraph('');status.setAttribute('role','status');let limit=50;
  const result=await command({type:'retainedMetadataRecords'});const records=result.records ?? [];
  function render(){body.replaceChildren();const matches=records.filter(item=>`${item.title} ${item.url}`.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()));status.textContent=records.length?`${matches.length} retained matches`:'No retained watched or dismissed videos.';
    for(const record of matches.slice(0,limit)){const section=document.createElement('section');section.append(paragraph(`${record.title} · ${record.status}`),button('Inspect retained metadata',async()=>{const detail=await command({type:'metadataDetails',recordId:record.id});if(detail.record)showMetadataDetails(detail.record,{onChanged});}),button('Pull retained metadata',async event=>{const source=event.currentTarget;source.disabled=true;const acquired=await command({type:'pullMetadata',recordId:record.id});source.disabled=false;status.textContent=acquired.ok?`${names[acquired.outcome] ?? acquired.outcome}. Image: ${acquired.imageOutcome}.`:acquired.error;onChanged?.();}));body.append(section);}
    if(matches.length>limit)body.append(button('Show 50 more retained videos',()=>{limit+=50;render();}));
  }
  query.addEventListener('input',()=>{limit=50;render();});view.append(heading,help,label,status,body,button('Close retained metadata',()=>view.close()));view.addEventListener('close',()=>view.remove(),{once:true});document.body.append(view);render();view.showModal();query.focus();
}
