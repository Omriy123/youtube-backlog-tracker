const supported=identity=>/^youtube:[A-Za-z0-9_-]{11}$/.test(identity);
const unfinishedImage=target=>['failed','cancelled'].includes(target.imageOutcome);
const unfinished=target=>!['retrieved','skipped'].includes(target.outcome) || unfinishedImage(target);
const latest=state=>state.enrichmentOperations?.at(-1) ?? null;

function snapshotTargets(state,message) {
  const seen=new Set();
  return state.records.filter(record=>message.scope==='library' || (record.user.status==='active' && record.user.destination===message.listId)).filter(record=>{if(seen.has(record.identity))return false;seen.add(record.identity);return true;}).map(record=>({recordId:record.id,identity:record.identity,title:record.user.personalTitle || record.metadata.observations.find(item=>item.title)?.title || record.url,url:record.url,outcome:supported(record.identity)?'notAttempted':'skipped',imageOutcome:'notAttempted',error:supported(record.identity)?null:'This link has no supported YouTube identity.',inFlight:false}));
}

export function recordEnrichmentCompletion(state,message,result) {
  const operation=state.enrichmentOperations?.find(item=>item.id===message.operationId);
  const target=operation?.targets.find(item=>item.recordId===message.recordId);
  if(!target || operation.attempt!==message.operationAttempt)return;
  target.outcome=message.imageOnly?'retrieved':result.outcome;
  target.imageOutcome=result.imageOutcome ?? (message.imageOnly?'failed':'notAttempted');target.error=result.error ?? null;target.inFlight=false;
}

function summary(operation,liveId,error) {
  if(!operation)return null;
  const value=structuredClone(operation);
  if(value.status==='running' && value.id!==liveId){value.status=value.targets.every(target=>!unfinished(target))?'completed':'interrupted';value.explanation=value.status==='completed'?'Every target result was retained before retrieval stopped.':'Retrieval was interrupted. Completed information is retained; retry unfinished work explicitly.';}
  if(error)value.explanation=error;
  const counts={requested:value.targets.length,retrieved:0,noResult:0,failed:0,skipped:0,notAttempted:0,imageFailed:0,imageNotAttempted:0};
  for(const target of value.targets){
    if(['retrieved','noResult','skipped'].includes(target.outcome))counts[target.outcome]++;
    else if(target.outcome==='notAttempted')counts.notAttempted++;
    else counts.failed++;
    if(target.imageOutcome==='failed')counts.imageFailed++;
    if(target.imageOutcome==='cancelled')counts.imageNotAttempted++;
  }
  value.counts=counts;return value;
}

// A shared single-video request can commit before its operation journal update.
// Reconcile only the exact reserved request, never unrelated later observations.
function reconciled(state,operation) {
  if(!operation)return null;
  const value=structuredClone(operation);
  for(const target of value.targets) {
    if(!target.inFlight || !target.requestId)continue;
    const metadata=state.records.find(record=>record.id===target.recordId)?.metadata;
    const evidence=target.imageOnly?metadata?.imageAcquisitions?.find(item=>item.requestId===target.requestId):metadata?.checks?.find(item=>item.requestId===target.requestId);
    if(!evidence)continue;
    target.outcome=target.imageOnly?'retrieved':evidence.outcome;
    target.imageOutcome=target.imageOnly?evidence.outcome:evidence.imageOutcome;
    target.error=evidence.error ?? null;target.inFlight=false;
  }
  return value;
}

export function createEnrichmentOperationCommands(browser,transact,enrichment) {
  let live=null,lastError=null;
  let activation=Promise.resolve();
  async function persist(state){
    try{await browser.write(state);}catch(error){const durable=await browser.read();if(JSON.stringify(durable?.enrichmentOperations)!==JSON.stringify(state.enrichmentOperations))throw error;}
  }
  const result=()=>transact(state=>({ok:true,operation:summary(reconciled(state,latest(state)),live?.id,lastError)}));
  async function update(id,action){return transact(async state=>{const operation=state.enrichmentOperations?.find(item=>item.id===id);if(!operation)return null;action(operation);await persist(state);return structuredClone(operation);});}
  async function run(session) {
    try {
      let operation=await transact(state=>structuredClone(latest(state)));
      for(const target of operation.targets) {
        if(session.stop)break;
        if(!unfinished(target))continue;
        const credential=await browser.readYoutubeCredential?.();
        if(credential?.revision!==session.credentialRevision){session.reason='setupChanged';break;}
        if(browser.paceEnrichment)await browser.paceEnrichment();
        else await new Promise(resolve=>setTimeout(resolve,250));
        if(session.stop)break;
        if((await browser.readYoutubeCredential?.())?.revision!==session.credentialRevision){session.reason='setupChanged';break;}
        await update(session.id,value=>{value.targets.find(item=>item.recordId===target.recordId).inFlight=true;});
        const message={type:'pullMetadata',recordId:target.recordId,imageOnly:target.outcome==='retrieved' && unfinishedImage(target),operationId:session.id,operationAttempt:operation.attempt,expectedCredentialRevision:session.credentialRevision};
        const retrieval=enrichment.request(message);
        session.retrieval=retrieval;if(session.stop)retrieval.stopFurther();
        await update(session.id,value=>{const row=value.targets.find(item=>item.recordId===target.recordId);row.requestId=retrieval.requestId;row.imageOnly=message.imageOnly;});
        const response=await retrieval.task;
        // Successful acquisition commits its target outcome with its metadata.
        // Setup/storage/unsupported failures happen before that commit.
        await transact(async state=>{
          const durable=state.enrichmentOperations.find(item=>item.id===session.id);
          const row=durable.targets.find(item=>item.recordId===target.recordId);
          if(row.inFlight){recordEnrichmentCompletion(state,message,response);await persist(state);}
        });
        if(['quota','credentialChanged','setupRequired','rejected','requestRejected','storage'].includes(response.outcome)){session.reason=response.outcome;break;}
      }
      await update(session.id,value=>{
        value.status=session.stop?'cancelled':session.reason?'paused':'completed';value.finishedAt=browser.now();
        value.explanation=session.stop?'Further requests stopped. Any completed in-flight result is retained.':session.reason==='quota'?'Request allowance exhausted. Retry unfinished work explicitly later.':session.reason==='requestRejected'?'The provider request format was rejected. Update the extension before retrying unfinished work.':session.reason?'Check setup or storage and retry unfinished work explicitly.':'Image failures are reported separately.';
      });
    } catch {
      lastError='Operation results could not be saved. Prior information is retained. Free local storage and retry explicitly; completed metadata will not be repeated.';
    } finally {if(live===session)live=null;}
  }
  function activate(message,retry) {
    // Enter the mutation queue at invocation, before credential IO or later
    // user commands can change which videos belonged to the selected list.
    const frozen=retry?null:transact(state=>snapshotTargets(state,message));
    frozen?.catch(()=>{});
    const task=activation.then(async()=>{
      if(live)return result();
      const targets=retry?null:await frozen;
      lastError=null;
      const credential=await browser.readYoutubeCredential?.();
      if(!credential?.key)return {ok:false,outcome:'setupRequired',error:'Configure your personal YouTube API key first.'};
      const operation=await transact(async state=>{
        let value;
        if(retry){
          value=latest(state);
          if(!value || value.id!==message.operationId)return null;
          Object.assign(value,reconciled(state,value));
          if(!value.targets.some(unfinished))return null;
          value.attempt++;value.status='running';value.finishedAt=null;value.explanation='Retrying unfinished work; successful text retrieval is retained.';
          for(const target of value.targets)target.inFlight=false;
        }else{
          if(!['library','list'].includes(message.scope))throw Error('Choose list or Library retrieval.');
          value={id:browser.id(),scope:message.scope,listId:message.listId ?? null,startedAt:browser.now(),status:'running',attempt:1,targets};
          state.enrichmentOperations ??=[];state.enrichmentOperations.push(value);
        }
        await persist(state);return structuredClone(value);
      });
      if(!operation)return {ok:false,outcome:'nothingToRetry',error:'No unfinished retrieval work is available for this operation.'};
      const session={id:operation.id,credentialRevision:credential.revision,stop:false};live=session;
      void run(session);
      return {ok:true,operation:summary(operation,session.id)};
    }).catch(()=>({ok:false,outcome:'storage',error:'Could not save retrieval targets. Check storage and retry.'}));
    activation=task.catch(()=>{});return task;
  }
  function command(message) {
    if(message.type==='startEnrichment')return activate(message,false);
    if(message.type==='retryEnrichment')return activate(message,true);
    if(message.type==='enrichmentOperation')return result();
    if(message.type==='cancelEnrichment')return (async()=>{if(live && live.id===message.operationId){live.stop=true;live.retrieval?.stopFurther();}return result();})();
    if(message.type==='retainedMetadataRecords')return transact(state=>({ok:true,records:state.records.filter(record=>record.user.status!=='active').map(record=>({id:record.id,title:record.user.personalTitle || record.metadata.observations.find(item=>item.title)?.title || record.url,status:record.user.status,url:record.url}))}));
    return null;
  }
  return {command};
}
