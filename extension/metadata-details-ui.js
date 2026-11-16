import {command,displayTitle} from './shared.js';
import {formatDateTime,onDateFormatChanged} from './date-display.js';
import {showReview} from './review-ui.js';
import {showStatus} from './status-ui.js';

export const metadataOutcomes={retrieved:'Metadata returned',noResult:'No resource returned',network:'Check failed: network',quota:'Check failed: request allowance',rejected:'Check failed: setup rejected',failed:'Check failed'};
export function metadataEvidence(record) {
  const check=record.metadata.checks?.at(-1);
  return check?`${metadataOutcomes[check.outcome] ?? 'Check failed'} · ${formatDateTime(check.observedAt)}`:'Not checked';
}
function paragraph(text){const node=document.createElement('p');node.textContent=text;return node;}
function button(label,action){const node=document.createElement('button');node.type='button';node.className='secondary';node.textContent=label;node.addEventListener('click',action);return node;}
function provenance(observation) {
  return `Source: ${observation.source ?? 'unknown'} · Observed ${formatDateTime(observation.observedAt)}`;
}
const fields=[['title','Title'],['description','Description'],['channel','Channel'],['durationSeconds','Duration'],['publicationDate','Published'],['thumbnailReferences','Thumbnail references'],['image','Image']];
function usable(key,value) {
  if(key==='image')return typeof value?.dataUrl==='string';
  if(key==='channel')return Boolean(value?.id);
  if(key==='thumbnailReferences')return value?.length>0;
  return value!==null && value!==undefined && value!=='';
}
function appendField(parent,key,value) {
  if(key==='image') {
    parent.append(paragraph(`Image: ${value?.outcome ?? 'missing'} · Acquired ${formatDateTime(value?.acquiredAt)}`));
    if(value?.dataUrl?.startsWith('data:image/')){const image=document.createElement('img');image.src=value.dataUrl;image.alt='Retained thumbnail';image.className='metadata-image';parent.append(image);}
    if(value?.error)parent.append(paragraph(value.error));return;
  }
  let content;
  if(key==='channel')content=value?.id?`${value.name ?? 'Channel name unknown'} · ${value.id}`:'Channel unknown';
  else if(key==='durationSeconds')content=typeof value==='number'?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'Duration unknown';
  else if(key==='publicationDate')content=value?formatDateTime(value):'Publication date unknown';
  else if(key==='thumbnailReferences')content=value?.length?value.map(item=>item.url).join('\n'):'No thumbnail reference recorded';
  else content=value ?? `${key==='title'?'Title':'Description'} missing`;
  const label=fields.find(item=>item[0]===key)[1];
  const node=paragraph(`${label}: ${content}`);node.className='metadata-field';parent.append(node);
}
function selectedValues(observation) {
  return JSON.stringify(fields.map(([key])=>key==='image'?observation.image?.dataUrl ?? null:observation[key] ?? null));
}

export function showMetadataDetails(record,{onChanged,onOpen,onDismiss,selectedIndex=null}={}) {
  const dialog=document.createElement('dialog');dialog.className='metadata-dialog';dialog.setAttribute('aria-label','Metadata details');
  const heading=document.createElement('h2');heading.textContent='Metadata details';
  const summary=document.createElement('div');
  const tabs=document.createElement('div');tabs.className='title-tools';tabs.setAttribute('aria-label','Metadata versions');
  const panel=document.createElement('section');panel.setAttribute('aria-label','Saved metadata');
  const status=paragraph('');status.setAttribute('role','status');
  let view=selectedIndex===null?'Original':'History';
  const observations=record.metadata.observations ?? [];
  const selections=[];
  function render() {
    summary.replaceChildren(paragraph(displayTitle(record)),paragraph(metadataEvidence(record)),paragraph('YouTube checks do not verify playback. No resource returned does not identify deletion or private status. Metadata history is separate from Library action History.'));
    const success=observations.filter(item=>item.source==='youtube-api').at(-1);
    summary.append(paragraph(success?`Last successful retrieval: ${formatDateTime(success.observedAt)}`:'No successful YouTube retrieval retained.'));
    for(const tab of selections)tab.setAttribute('aria-pressed',String(tab.textContent===view));
    panel.replaceChildren();
    if(view==='Original') {
      panel.append(paragraph('First usable automatic value for each field. Fields can have different sources and observation times.'));
      for(const [key,label] of fields) {
        const candidates=key==='image'?[...observations,...(record.metadata.imageAcquisitions ?? []).map(image=>({image,source:'youtube-thumbnail',observedAt:image.acquiredAt}))].filter(item=>usable(key,item[key])).sort((a,b)=>(Date.parse(a[key]?.acquiredAt) || 0)-(Date.parse(b[key]?.acquiredAt) || 0)):observations.filter(item=>usable(key,item[key]));
        const original=candidates[0];const section=document.createElement('section');section.className='metadata-original-field';
        appendField(section,key,original?.[key]);section.append(paragraph(original?provenance(original):`${label}: no usable automatic value recorded.`));panel.append(section);
      }
    } else if(view==='Latest') {
      panel.append(paragraph('Latest recorded automatic information. A successful observation with a missing field stays missing; a failed check preserves the last success.'));
      for(const [key] of fields) {
        const observation=key==='image' && record.metadata.current?record.metadata.current:observations.findLast(item=>Object.hasOwn(item,key));
        const section=document.createElement('section');section.className='metadata-latest-field';appendField(section,key,observation?.[key]);
        section.append(paragraph(observation?provenance(observation):'No automatic observation recorded.'));panel.append(section);
      }
    } else {
      if(!observations.length)panel.append(paragraph('No automatic observations retained.'));
      for(let index=0;index<observations.length;index++) {
        const observation=observations[index];const section=document.createElement('section');section.className='metadata-version';section.setAttribute('role','region');section.setAttribute('aria-label',index===selectedIndex?'Matched metadata version':'Metadata observation');
        if(index===selectedIndex){section.classList.add('matched-version');section.tabIndex=-1;}
        const name=document.createElement('h3');name.textContent=`Observation ${index+1}${index===selectedIndex?' · Search match':''}`;
        section.append(name,paragraph(provenance(observation)));
        const previous=observations[index-1];section.append(paragraph(previous && selectedValues(previous)===selectedValues(observation)?'Unchanged selected metadata':'Recorded selected metadata'));
        for(const [key] of fields)appendField(section,key,observation[key]);panel.append(section);
      }
      const checks=document.createElement('section');const label=document.createElement('h3');label.textContent='Every YouTube check';checks.append(label);
      for(const check of record.metadata.checks ?? [])checks.append(paragraph(`${metadataOutcomes[check.outcome] ?? 'Check failed'} · ${provenance(check)}${check.error?` · ${check.error}`:''}`));
      if(!record.metadata.checks?.length)checks.append(paragraph('Not checked.'));panel.append(checks);
      for(const image of record.metadata.imageAcquisitions ?? []){const section=document.createElement('section');section.append(paragraph('Separate image acquisition'));appendField(section,'image',image);panel.append(section);}
    }
  }
  for(const name of ['Original','Latest','History']){const tab=button(name,()=>{view=name;render();});selections.push(tab);tabs.append(tab);}
  const actions=document.createElement('div');actions.className='title-tools';
  async function retrieve(imageOnly=false) {
    pull.disabled=true;status.textContent=imageOnly?'Retrieving thumbnail…':'Retrieving metadata and thumbnail…';
    const result=await command({type:'pullMetadata',recordId:record.id,imageOnly});pull.disabled=false;
    status.textContent=result.ok?`${metadataOutcomes[result.outcome] ?? result.outcome}. Image: ${result.imageOutcome}.`:result.error;
    if(result.record){record=result.record;observations.splice(0,observations.length,...(record.metadata.observations ?? []));render();}
    onChanged?.();
  }
  const pull=button('Pull metadata',()=>retrieve());actions.append(pull);
  if(['failed','cancelled'].includes(record.metadata.current?.image?.outcome))actions.append(button('Retry thumbnail only',()=>retrieve(true)));
  if(record.user.status==='active') {
    actions.append(button('Open video',async()=>{
      if(onOpen){dialog.close();onOpen(record);return;}
      const result=await command({type:'open',recordId:record.id,expectedRevision:record.user.revision,attemptId:crypto.randomUUID()});
      if(result.outcome==='reviewRequired'){dialog.close();showReview(result.record,{onChanged});return;}
      status.textContent=result.ok?'Opened in a new tab · Playback not verified':result.error;onChanged?.();
    }),button('Dismiss',async()=>{
      if(onDismiss){dialog.close();onDismiss(record);return;}
      const result=await command({type:'list'});if(!result.ok){status.textContent=result.error;return;}
      dialog.close();showStatus([record],result.lists,'dismissed',{onChanged:onChanged ?? (()=>{}),onProcessed:()=>{}});
    }));
  }
  actions.append(button('Close metadata',()=>dialog.close()));
  dialog.append(heading,summary,tabs,panel,status,actions);document.body.append(dialog);render();
  const unsubscribe=onDateFormatChanged(render);dialog.addEventListener('close',()=>{unsubscribe();dialog.remove();},{once:true});dialog.showModal();
  if(selectedIndex!==null){const matched=panel.querySelector('.matched-version');matched?.focus();matched?.scrollIntoView({block:'nearest'});}
}
