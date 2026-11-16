import { command } from './shared.js';
import {showMetadataDetails,metadataEvidence,metadataOutcomes} from './metadata-details-ui.js';
export {showMetadataDetails,metadataEvidence} from './metadata-details-ui.js';

function button(label,action){const item=document.createElement('button');item.type='button';item.className='secondary';item.textContent=label;item.addEventListener('click',action);return item;}
function paragraph(text){const item=document.createElement('p');item.textContent=text;return item;}
function dialog(label){const item=document.createElement('dialog');item.setAttribute('aria-label',label);const title=document.createElement('h2');title.textContent=label;item.append(title);item.addEventListener('close',()=>item.remove(),{once:true});document.body.append(item);return item;}
const outcomeLabel=metadataOutcomes;

export function appendYoutubeSetup(parent,{onChanged}) {
  parent.append(button('YouTube setup',async()=>{
    const view=dialog('YouTube setup');const result=await command({type:'enrichmentSettings'});
    view.append(paragraph('Enrichment is manual in this build. Saving, browsing and opening need no API key. Setup alone does not retrieve Library information.'));
    const steps=document.createElement('ol');
    for(const text of ['Create or select a personal project in Google Cloud Console.','Enable YouTube Data API v3 in APIs & Services → Library.','Create an API key in Credentials. Restrict it to YouTube Data API v3; check restrictions if Test connection is rejected.']){const item=document.createElement('li');item.textContent=text;steps.append(item);}
    const link=document.createElement('a');link.href='https://developers.google.com/youtube/data/getting-started';link.target='_blank';link.rel='noreferrer';link.textContent='Official YouTube setup instructions';view.append(steps,link);
    const label=document.createElement('label');label.textContent='Personal API key';const input=document.createElement('input');input.type='password';input.autocomplete='off';input.spellcheck=false;label.append(input);
    const status=paragraph(result.configured?'A key is configured. Enter another key to replace it.':'No key configured.');status.setAttribute('role','status');
    const usage=paragraph(`Retained metadata and images: ${((result.storageBytes ?? 0)/1024).toFixed(1)} KiB. Retained locally; this build does not back up enriched data. History and images are not automatically pruned.`);
    const controls=document.createElement('div');controls.className='title-tools';
    const save=button('Save key',async()=>{save.disabled=true;const key=input.value;input.value='';const saved=await command({type:'setYoutubeKey',key});save.disabled=false;status.textContent=saved.ok?'Key saved. Use Test connection or Pull metadata explicitly.':saved.error;});
    const test=button('Test connection',async()=>{test.disabled=true;status.textContent='Testing one known public video; Library records are unchanged.';const tested=await command({type:'testYoutubeConnection'});test.disabled=false;status.textContent=tested.ok?(tested.outcome==='noResult'?'Connection accepted; no resource returned for the test video.':'Connection usable. Library records are unchanged.'):tested.error;});
    const remove=button('Remove key',async()=>{const saved=await command({type:'setYoutubeKey',key:null});input.value='';status.textContent=saved.ok?'Key removed. Retained information is unchanged.':saved.error;if(saved.ok)onChanged?.();});
    controls.append(save,test,remove,button('Close setup',()=>view.close()));view.append(label,status,usage,controls);view.showModal();input.focus();
  }));
}

export function appendEnrichmentTools(parent,record,{onChanged}) {
  const tools=document.createElement('div');tools.className='title-tools metadata-tools';
  const inspect=button(metadataEvidence(record),()=>showMetadataDetails(record,{onChanged}));inspect.setAttribute('aria-label',`Metadata details: ${metadataEvidence(record)}`);
  const status=paragraph('');status.setAttribute('role','status');status.hidden=true;
  const pull=button('Pull metadata',async()=>{pull.disabled=true;status.hidden=false;status.textContent='Retrieving metadata and image…';const result=await command({type:'pullMetadata',recordId:record.id});pull.disabled=false;status.textContent=result.ok?`${outcomeLabel[result.outcome] ?? result.outcome}. Image: ${result.imageOutcome}`:result.error;if(result.ok)onChanged?.();});
  tools.append(inspect,pull);parent.append(tools,status);
}
