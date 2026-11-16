import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLibrary} from '../extension/library-service.js';

function fixture(){
  let state=null,credential=null,id=0,time=0;
  const browser={calls:[],captureUrl:'https://youtu.be/abcdefghijk',response:{outcome:'retrieved',fields:{title:'Provider title',description:'Description',thumbnailReferences:[{url:'https://i.ytimg.com/vi/abcdefghijk/default.jpg'}]}},
    async capture(){return {url:browser.captureUrl,title:'Captured',source:'browser-tab',observedAt:'2026-11-01T00:00:00Z'};},
    async read(){return structuredClone(state);},async write(value){if(browser.failWrite)throw Error('storage');state=structuredClone(value);},
    async readYoutubeCredential(){return structuredClone(credential);},async writeYoutubeCredential(value){credential=structuredClone(value);},
    async fetchYoutubeVideo(id,key){browser.calls.push(id);return browser.response;},async fetchThumbnail(){return {dataUrl:'data:image/png;base64,aGVsbG8=',bytes:5};},
    now(){return new Date(Date.UTC(2026,10,16,0,0,time++)).toISOString();},id(){return `id${++id}`;},async createTab(){return {id:1};},async listTabs(){return [];},async paceEnrichment(){},
  };return browser;
}
async function save(library,browser,url){browser.captureUrl=url;return (await library.command({type:'save'})).record;}
async function completed(library){for(let i=0;i<100;i++){const result=await library.command({type:'enrichmentOperation'});if(result.operation && result.operation.status!=='running')return result.operation;await new Promise(resolve=>setImmediate(resolve));}throw Error('operation did not finish');}

test('Library retrieval freezes deduplicated targets including retained and skipped records without changing user state',async()=>{
  const browser=fixture(),library=createLibrary(browser);
  const first=await save(library,browser,'https://youtu.be/abcdefghijk');
  const second=await save(library,browser,'https://youtu.be/lmnopqrstuv');
  await save(library,browser,'https://example.org/fallback');
  await library.command({type:'open',recordId:second.id,expectedRevision:second.user.revision,attemptId:'opening'});
  await library.command({type:'setYoutubeKey',key:'fixture'});
  const started=await library.command({type:'startEnrichment',scope:'library'});
  assert.equal(started.ok,true);
  const operation=await completed(library);
  assert.equal(operation.counts.requested,3);assert.equal(operation.counts.retrieved,2);assert.equal(operation.counts.skipped,1);
  assert.equal(new Set(browser.calls).size,2);
  assert.deepEqual((await library.command({type:'metadataDetails',recordId:first.id})).record.user,first.user);
  assert.equal((await library.command({type:'metadataDetails',recordId:second.id})).record.user.status,'watched');
  assert.equal((await createLibrary(browser).command({type:'enrichmentOperation'})).operation.status,'completed');
});

test('cancel accounts for an in-flight result, repeated activation shares work, and retry excludes successful text',async()=>{
  const browser=fixture(),library=createLibrary(browser);
  const first=await save(library,browser,'https://youtu.be/abcdefghijk');await save(library,browser,'https://youtu.be/lmnopqrstuv');
  await library.command({type:'setYoutubeKey',key:'fixture'});
  let release,arrived;const started=new Promise(resolve=>{arrived=resolve;});
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);arrived();return new Promise(resolve=>{release=resolve;});};
  const job=await library.command({type:'startEnrichment',scope:'list',listId:'Inbox'});await started;
  await save(library,browser,'https://youtu.be/zyxwvutsrqp');
  const again=await library.command({type:'startEnrichment',scope:'library'});assert.equal(again.operation.id,job.operation.id);
  assert.equal((await library.command({type:'editTitle',recordId:first.id,expectedRevision:first.user.revision,personalTitle:'Concurrent title'})).ok,true);
  await library.command({type:'cancelEnrichment',operationId:job.operation.id});
  release(browser.response);
  const cancelled=await completed(library);assert.equal(cancelled.status,'cancelled');assert.equal(cancelled.counts.retrieved,1);assert.equal(cancelled.counts.notAttempted,1);
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);return browser.response;};
  await library.command({type:'retryEnrichment',operationId:job.operation.id});
  const finished=await completed(library);assert.equal(finished.counts.requested,2);assert.equal(finished.counts.retrieved,2);assert.deepEqual(browser.calls,['abcdefghijk','lmnopqrstuv']);
  assert.equal((await library.command({type:'metadataDetails',recordId:first.id})).record.user.personalTitle,'Concurrent title');
});

test('quota pauses remaining targets and image-only retry retains one successful text observation',async()=>{
  const browser=fixture(),library=createLibrary(browser);
  const first=await save(library,browser,'https://youtu.be/abcdefghijk');await save(library,browser,'https://youtu.be/lmnopqrstuv');await save(library,browser,'https://youtu.be/zyxwvutsrqp');
  await library.command({type:'setYoutubeKey',key:'fixture'});
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);return id==='lmnopqrstuv'?{outcome:'quota',error:'Allowance exhausted'}:browser.response;};
  browser.fetchThumbnail=async()=>{throw Error('image');};
  const job=await library.command({type:'startEnrichment',scope:'library'});const paused=await completed(library);
  assert.equal(paused.status,'paused');assert.equal(paused.counts.retrieved,1);assert.equal(paused.counts.imageFailed,1);assert.equal(paused.counts.failed,1);assert.equal(paused.counts.notAttempted,1);
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);return browser.response;};browser.fetchThumbnail=async()=>({dataUrl:'data:image/png;base64,aGVsbG8=',bytes:5});
  await library.command({type:'retryEnrichment',operationId:job.operation.id});const retried=await completed(library);
  assert.equal(retried.counts.retrieved,3);assert.equal(retried.counts.imageFailed,0);assert.deepEqual(browser.calls,['abcdefghijk','lmnopqrstuv','lmnopqrstuv','zyxwvutsrqp']);
  assert.equal((await library.command({type:'metadataDetails',recordId:first.id})).record.metadata.observations.length,2);
});

test('restart explains interrupted targets without requests, then explicitly retries only unfinished work',async()=>{
  const browser=fixture(),library=createLibrary(browser);
  await save(library,browser,'https://youtu.be/abcdefghijk');await save(library,browser,'https://youtu.be/lmnopqrstuv');
  await library.command({type:'setYoutubeKey',key:'fixture'});
  let secondStarted;const arrived=new Promise(resolve=>{secondStarted=resolve;});
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);if(id==='lmnopqrstuv'){secondStarted();return new Promise(()=>{});}return browser.response;};
  const job=await library.command({type:'startEnrichment',scope:'library'});await arrived;
  const restarted=createLibrary(browser);const interrupted=(await restarted.command({type:'enrichmentOperation'})).operation;
  assert.equal(interrupted.status,'interrupted');assert.equal(interrupted.counts.retrieved,1);assert.equal(browser.calls.length,2);
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);return browser.response;};
  await restarted.command({type:'retryEnrichment',operationId:job.operation.id});assert.equal((await completed(restarted)).counts.retrieved,2);
  assert.deepEqual(browser.calls,['abcdefghijk','lmnopqrstuv','lmnopqrstuv']);
});

test('a failed final summary write cannot hide coherently completed metadata or replay it after restart',async()=>{
  const browser=fixture(),library=createLibrary(browser);await save(library,browser,'https://youtu.be/abcdefghijk');await library.command({type:'setYoutubeKey',key:'fixture'});
  const write=browser.write;browser.write=async value=>{if(value.enrichmentOperations?.at(-1)?.status==='completed')throw Error('capacity');return write(value);};
  await library.command({type:'startEnrichment',scope:'library'});await completed(library);
  const restarted=createLibrary(browser);const result=await restarted.command({type:'enrichmentOperation'});
  assert.equal(result.operation.counts.retrieved,1);assert.equal(result.operation.status,'completed');assert.equal(browser.calls.length,1);
});

test('failed image-only retry preserves successful text for another explicit retry',async()=>{
  const browser=fixture(),library=createLibrary(browser);const record=await save(library,browser,'https://youtu.be/abcdefghijk');await library.command({type:'setYoutubeKey',key:'fixture'});
  browser.fetchThumbnail=async()=>{throw Error('network');};const job=await library.command({type:'startEnrichment',scope:'library'});await completed(library);
  const write=browser.write;let failOnce=true;browser.write=async value=>{if(failOnce && value.records[0].metadata.imageAcquisitions?.length){failOnce=false;throw Error('storage');}return write(value);};
  await library.command({type:'retryEnrichment',operationId:job.operation.id});await completed(library);
  browser.fetchThumbnail=async()=>({dataUrl:'data:image/png;base64,aGVsbG8=',bytes:5});await library.command({type:'retryEnrichment',operationId:job.operation.id});const done=await completed(library);
  assert.equal(done.counts.retrieved,1);assert.equal(done.counts.imageFailed,0);assert.deepEqual(browser.calls,['abcdefghijk']);
  assert.equal((await library.command({type:'metadataDetails',recordId:record.id})).record.metadata.observations.length,2);
});

test('a key replacement during request pacing stops the old operation before another request starts',async()=>{
  const browser=fixture(),library=createLibrary(browser);await save(library,browser,'https://youtu.be/abcdefghijk');await library.command({type:'setYoutubeKey',key:'old-fixture'});
  let release,arrived;const pacing=new Promise(resolve=>{arrived=resolve;});browser.paceEnrichment=()=>{arrived();return new Promise(resolve=>{release=resolve;});};
  await library.command({type:'startEnrichment',scope:'library'});await pacing;await library.command({type:'setYoutubeKey',key:'replacement-fixture'});release();const paused=await completed(library);
  assert.equal(paused.status,'paused');assert.equal(browser.calls.length,0);assert.equal(paused.counts.notAttempted,1);
});

test('sharing an existing single pull reconciles its saved result after a failed batch-journal write and restart',async()=>{
  const browser=fixture(),library=createLibrary(browser);const record=await save(library,browser,'https://youtu.be/abcdefghijk');await library.command({type:'setYoutubeKey',key:'fixture'});
  let release,arrived;const started=new Promise(resolve=>{arrived=resolve;});browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);arrived();return new Promise(resolve=>{release=resolve;});};
  const single=library.command({type:'pullMetadata',recordId:record.id});await started;
  const job=await library.command({type:'startEnrichment',scope:'library'});
  for(let i=0;i<100;i++){if((await library.command({type:'enrichmentOperation'})).operation.targets[0].inFlight)break;await new Promise(resolve=>setImmediate(resolve));}
  const write=browser.write;browser.write=async value=>{if(value.records[0].metadata.current && value.enrichmentOperations?.[0]?.targets[0]?.inFlight===false)throw Error('journal capacity');return write(value);};
  release(browser.response);await single;await completed(library);browser.write=write;
  const restarted=createLibrary(browser);const recovered=(await restarted.command({type:'enrichmentOperation'})).operation;
  assert.equal(recovered.counts.retrieved,1);assert.equal(recovered.status,'completed');
  await restarted.command({type:'retryEnrichment',operationId:job.operation.id});assert.equal(browser.calls.length,1);
});

test('an unrelated later manual retrieval cannot invent completion for an interrupted operation',async()=>{
  const browser=fixture(),library=createLibrary(browser);const record=await save(library,browser,'https://youtu.be/abcdefghijk');await library.command({type:'setYoutubeKey',key:'fixture'});
  let arrived;const started=new Promise(resolve=>{arrived=resolve;});
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);arrived();return new Promise(()=>{});};
  await library.command({type:'startEnrichment',scope:'library'});await started;
  const restarted=createLibrary(browser);
  browser.fetchYoutubeVideo=async id=>{browser.calls.push(id);return browser.response;};
  await restarted.command({type:'pullMetadata',recordId:record.id});
  const operation=(await restarted.command({type:'enrichmentOperation'})).operation;
  assert.equal(operation.status,'interrupted');assert.equal(operation.counts.retrieved,0);assert.equal(operation.counts.notAttempted,1);
});
