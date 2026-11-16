import { recordEnrichmentCompletion } from './enrichment-operation-service.js';
// Provider requests never hold the Library's mutation queue. Accepted results
// reread the newest document before committing, preserving concurrent user work.
export function createEnrichmentCommands(browser, transact) {
  const pending = new Map();
  let credentialQueue=Promise.resolve();
  async function credential(){return await browser.readYoutubeCredential?.() ?? {key:null,revision:null};}
  async function current(revision){return (await credential()).revision===revision;}
  const failure=(outcome,error)=>({ok:false,outcome,error});
  async function pull(message,signal) {
    const setup=await credential();
    if(message.expectedCredentialRevision && message.expectedCredentialRevision!==setup.revision)return failure('credentialChanged','YouTube setup changed. Retry unfinished work explicitly.');
    if(!setup.key)return failure('setupRequired','Configure your personal YouTube API key first.');
    const record=await transact(state=>structuredClone(state.records.find(item=>item.id===message.recordId)));
    if(!record)return failure('notFound','This saved video no longer exists.');
    if(!/^youtube:[A-Za-z0-9_-]{11}$/.test(record.identity))return {ok:true,outcome:'skipped',record,imageOutcome:'notAttempted'};
    if(message.imageOnly && !record.metadata.current?.thumbnailReferences?.length)return failure('noImage','No retained thumbnail reference to retry.');
    let response;
    try {response=message.imageOnly ? {outcome:'imageOnly',fields:record.metadata.current} : await browser.fetchYoutubeVideo(record.identity.slice(8),setup.key,{signal});}
    catch {response={outcome:'network',error:'Network request failed. Check your connection and retry.'};}
    if(!await current(setup.revision))return failure('credentialChanged','YouTube setup changed. This response was not accepted.');
    const observedAt=browser.now();
    let image={outcome:'missing',acquiredAt:null,url:null};
    if(['retrieved','imageOnly'].includes(response.outcome)) {
      const url=response.fields?.thumbnailReferences?.[0]?.url;
      if(url) {
        try {image={...await browser.fetchThumbnail(url,{signal}),outcome:'retrieved',url,acquiredAt:browser.now()};}
        catch {image={outcome:'failed',url,acquiredAt:browser.now(),error:'Thumbnail could not be saved. Retry its image explicitly.'};}
      }
    }
    image.requestId=message.requestId;
    if(!await current(setup.revision))return failure('credentialChanged','YouTube setup changed. This response was not accepted.');
    try {
      return await transact(async state=>{
        if(!await current(setup.revision))return failure('credentialChanged','YouTube setup changed. This response was not accepted.');
        const target=state.records.find(item=>item.id===record.id);
        if(!target)return failure('notFound','This saved video no longer exists.');
        const metadata=target.metadata;
        metadata.checks ??=[];
        if(response.outcome==='imageOnly') {
          // A retry records image evidence without inventing another text check.
          metadata.imageAcquisitions ??=[];
          metadata.imageAcquisitions.push(image);
          if(image.outcome==='retrieved' && metadata.current?.observedAt===record.metadata.current?.observedAt)metadata.current.image=image;
        } else {
          metadata.checks.push({id:browser.id(),requestId:message.requestId,source:'youtube-api',observedAt,outcome:response.outcome,imageOutcome:image.outcome,error:response.error ?? null});
          if(response.outcome==='retrieved') {
            const fields=response.fields ?? {};
            const observation={source:'youtube-api',observedAt,title:fields.title ?? null,description:fields.description ?? null,channel:fields.channel ?? null,publicationDate:fields.publicationDate ?? null,durationSeconds:fields.durationSeconds ?? null,thumbnailReferences:fields.thumbnailReferences ?? [],image};
            metadata.observations.push(observation);metadata.current=structuredClone(observation);
          }
        }
        recordEnrichmentCompletion(state,message,{outcome:response.outcome,imageOutcome:image.outcome,error:response.error ?? null});
        try {await browser.write(state);}
        catch(error) {
          // A rejected acknowledgement can follow a successful durable write.
          const durable=await browser.read();
          if(JSON.stringify(durable?.records.find(item=>item.id===target.id)?.metadata)!==JSON.stringify(metadata))throw error;
        }
        const success=['retrieved','imageOnly','noResult'].includes(response.outcome);
        return {ok:success,outcome:response.outcome,record:target,imageOutcome:image.outcome,error:response.error ?? null};
      });
    } catch {return failure('storage','Metadata was not saved. Prior information is retained. Free local disk space or browser storage and retry.');}
  }
  function request(message) {
    if(pending.has(message.recordId))return pending.get(message.recordId);
    const abort=new AbortController(),requestId=browser.id();
    const task=credentialQueue.then(()=>pull({...message,requestId},abort.signal)).finally(()=>{if(pending.get(message.recordId)?.task===task)pending.delete(message.recordId);});
    const operation={task,abort,requestId};pending.set(message.recordId,operation);return operation;
  }
  function command(message) {
    if(message.type==='enrichmentSettings')return (async()=>({ok:true,configured:Boolean((await credential()).key),storageBytes:await transact(state=>new TextEncoder().encode(JSON.stringify(state.records.map(record=>record.metadata))).length)}))();
    if(message.type==='metadataDetails')return transact(state=>({ok:true,record:structuredClone(state.records.find(item=>item.id===message.recordId) ?? null)}));
    if(message.type==='setYoutubeKey') {
      const change=credentialQueue.then(async()=>{
        if(message.key!==null && typeof message.key!=='string')return failure('invalidSetup','Enter a personal API key or remove it.');
        await transact(async()=>{
          await browser.writeYoutubeCredential({key:message.key?.trim() || null,revision:browser.id()});
          for(const operation of pending.values())operation.abort.abort();
          pending.clear();
        });
        return {ok:true,configured:Boolean(message.key?.trim())};
      });credentialQueue=change.catch(()=>{});return change;
    }
    if(message.type==='testYoutubeConnection')return (async()=>{
      await credentialQueue;const setup=await credential();
      if(!setup.key)return failure('setupRequired','Configure your personal YouTube API key first.');
      let result;try {result=await browser.fetchYoutubeVideo('jNQXAC9IVRw',setup.key);}catch{return failure('network','Network request failed. Check your connection and retry.');}
      if(!await current(setup.revision))return failure('credentialChanged','YouTube setup changed. Test again.');
      return {ok:['retrieved','noResult'].includes(result.outcome),outcome:result.outcome,error:result.error ?? null};
    })();
    if(message.type==='pullMetadata') {
      return request(message).task;
    }
    return null;
  }
  return {command,request};
}
