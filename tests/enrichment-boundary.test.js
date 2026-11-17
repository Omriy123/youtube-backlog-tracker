import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';
import { fetchYoutubeVideo } from '../extension/youtube-provider.js';

function fixture() {
  let state=null,credential=null,id=0,clock=0;
  const browser={
    calls:[],failWrite:false,
    async capture(){return {url:'https://youtu.be/abcdefghijk',title:'Captured original',source:'browser-tab',observedAt:'2026-11-01T00:00:00Z'};},
    async read(){return structuredClone(state);},
    async write(value){if(browser.failWrite)throw Error('capacity');state=structuredClone(value);},
    async readYoutubeCredential(){return structuredClone(credential);},
    async writeYoutubeCredential(value){credential=structuredClone(value);},
    async fetchYoutubeVideo(videoId,key){browser.calls.push({videoId,key});return browser.response;},
    async fetchThumbnail(){return {dataUrl:'data:image/png;base64,aGVsbG8=',mimeType:'image/png',bytes:5};},
    async createTab(url){return {id:99,url,windowId:1};},async listTabs(){return [];},
    now(){return new Date(Date.UTC(2026,10,16,0,0,clock++)).toISOString();},id(){return `id-${++id}`;},
    response:{outcome:'retrieved',fields:{title:'Latest YouTube title',description:'Real description',channel:{id:'channel-1',name:'Creator'},durationSeconds:125,publicationDate:'2026-10-01T00:00:00Z',thumbnailReferences:[{url:'https://i.ytimg.com/vi/abcdefghijk/default.jpg'}]}},
  };
  return browser;
}
async function saved(browser){const library=createLibrary(browser);const result=await library.command({type:'save'});return {library,record:result.record};}

test('a structured invalid-key HTTP 400 remains a setup rejection without exposing provider text',async()=>{
  const browser=fixture();browser.fetchYoutubeVideo=fetchYoutubeVideo;
  const {library}=await saved(browser);await library.command({type:'setYoutubeKey',key:'private-fixture-key'});
  const before=await browser.read();const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'Reflected private-fixture-key',errors:[{reason:'badRequest'}],details:[{reason:'API_KEY_INVALID'}]}}),{status:400});
  try {
    const result=await library.command({type:'testYoutubeConnection'});
    assert.equal(result.outcome,'rejected');assert.equal(result.ok,false);
    assert.equal(result.error.includes('private-fixture-key'),false);
    assert.equal((await library.command({type:'enrichmentSettings'})).configured,true);
    assert.deepEqual(await browser.read(),before);
  }finally{globalThis.fetch=originalFetch;}
});

test('thumbnail acquisition falls back to another retained reference, including image-only retry',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);
  await library.command({type:'setYoutubeKey',key:'fixture'});
  const first='https://i.ytimg.com/vi/abcdefghijk/fhddefault.jpg';
  const next='https://i.ytimg.com/vi/abcdefghijk/maxresdefault.jpg';
  browser.response.fields.thumbnailReferences=[{url:first},{url:next}];
  let available=false;const attempts=[];
  browser.fetchThumbnail=async url=>{attempts.push(url);if(url===first || !available)throw Error('Image unavailable');return {dataUrl:'data:image/png;base64,aGVsbG8=',bytes:5};};
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).imageOutcome,'failed');
  available=true;attempts.length=0;
  const retried=await library.command({type:'pullMetadata',recordId:record.id,imageOnly:true});
  assert.equal(retried.imageOutcome,'retrieved');
  assert.deepEqual(attempts,[first,next]);
  assert.equal(retried.record.metadata.current.image.url,next);
  assert.equal(browser.calls.length,1);
  attempts.length=0;
  const pulled=await library.command({type:'pullMetadata',recordId:record.id});
  assert.equal(pulled.imageOutcome,'retrieved');
  assert.deepEqual(attempts,[first,next]);
  const reopened=createLibrary(browser);
  assert.equal((await reopened.command({type:'metadataDetails',recordId:record.id})).record.metadata.current.image.url,next);
});

test('thumbnail fallback stops when the key changes between image attempts',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);
  await library.command({type:'setYoutubeKey',key:'fixture'});
  browser.response.fields.thumbnailReferences=[{url:'https://i.ytimg.com/first.jpg'},{url:'https://i.ytimg.com/next.jpg'}];
  const attempts=[];
  browser.fetchThumbnail=async url=>{attempts.push(url);await library.command({type:'setYoutubeKey',key:'replacement-fixture'});throw Error('Image unavailable');};
  const result=await library.command({type:'pullMetadata',recordId:record.id});
  assert.equal(result.outcome,'credentialChanged');assert.equal(attempts.length,1);
  assert.equal((await library.command({type:'metadataDetails',recordId:record.id})).record.metadata.current,undefined);
});

test('optional setup makes no requests and single-video retrieval retains coherent source information and image offline',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);
  assert.equal((await library.command({type:'enrichmentSettings'})).configured,false);
  await library.command({type:'setYoutubeKey',key:'private-fixture-key'});
  assert.equal(browser.calls.length,0);
  const result=await library.command({type:'pullMetadata',recordId:record.id});
  assert.equal(result.outcome,'retrieved');assert.equal(result.imageOutcome,'retrieved');
  const reopened=createLibrary(browser);
  const details=await reopened.command({type:'metadataDetails',recordId:record.id});
  assert.equal(details.record.metadata.current.title,'Latest YouTube title');
  assert.equal(details.record.metadata.observations[0].title,'Captured original');
  assert.equal(details.record.metadata.observations[1].source,'youtube-api');
  assert.equal(details.record.metadata.current.image.dataUrl,'data:image/png;base64,aGVsbG8=');
  assert.deepEqual(details.record.user,record.user);
  assert.equal(browser.calls.length,1);
  assert.equal(JSON.stringify(await library.command({type:'enrichmentSettings'})).includes('private-fixture-key'),false);
});

test('opening Undo after enrichment preserves later automatic versions, images and authored values',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);await library.command({type:'setYoutubeKey',key:'fixture'});
  const opened=await library.command({type:'open',recordId:record.id,expectedRevision:record.user.revision,attemptId:'test-opening'});
  assert.equal(opened.outcome,'opened');
  await library.command({type:'pullMetadata',recordId:record.id});
  const before=(await library.command({type:'metadataDetails',recordId:record.id})).record.metadata;
  const result=await library.command({type:'undoOpening',attemptId:'test-opening'});
  assert.equal(result.ok,true);
  const latest=(await library.command({type:'metadataDetails',recordId:record.id})).record;
  assert.equal(latest.user.status,'active');assert.deepEqual(latest.metadata,before);assert.equal(latest.user.firstSavedAt,record.user.firstSavedAt);
});

test('same-video requests share one result and a replacement key permits a fresh request while old work is in flight',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);await library.command({type:'setYoutubeKey',key:'old-fixture'});
  let release,started;const arrived=new Promise(resolve=>{started=resolve;});
  browser.fetchYoutubeVideo=async(id,key)=>{browser.calls.push({id,key});if(key==='old-fixture'){started();return new Promise(resolve=>{release=resolve;});}return browser.response;};
  const first=library.command({type:'pullMetadata',recordId:record.id});await arrived;
  const repeat=library.command({type:'pullMetadata',recordId:record.id});assert.equal(first,repeat);
  await library.command({type:'setYoutubeKey',key:'new-fixture'});
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).outcome,'retrieved');
  release(browser.response);assert.equal((await first).outcome,'credentialChanged');
  const latest=(await library.command({type:'metadataDetails',recordId:record.id})).record;
  assert.equal(latest.metadata.checks.length,1);assert.equal(browser.calls.length,2);
});

test('unchanged checks are retained; successful missing fields replace stale values while failed checks preserve current',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);await library.command({type:'setYoutubeKey',key:'fixture'});
  await library.command({type:'pullMetadata',recordId:record.id});await library.command({type:'pullMetadata',recordId:record.id});
  browser.response={outcome:'retrieved',fields:{title:'Only title'}};
  await library.command({type:'pullMetadata',recordId:record.id});
  browser.response={outcome:'quota',error:'Quota exhausted. Retry explicitly later.'};
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).outcome,'quota');
  const {record:latest}=await library.command({type:'metadataDetails',recordId:record.id});
  assert.equal(latest.metadata.observations.length,4);assert.equal(latest.metadata.checks.length,4);
  assert.equal(latest.metadata.current.durationSeconds,null);assert.equal(latest.metadata.current.channel,null);
  assert.equal(latest.metadata.current.title,'Only title');assert.notEqual(latest.metadata.checks[0].observedAt,latest.metadata.checks[1].observedAt);
});

test('image failure permits image-only retry without duplicating text observations and failed writes retain prior archive',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);await library.command({type:'setYoutubeKey',key:'fixture'});
  browser.fetchThumbnail=async()=>{throw Error('network');};
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).imageOutcome,'failed');
  browser.fetchThumbnail=async()=>({dataUrl:'data:image/png;base64,aGVsbG8=',bytes:5});
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id,imageOnly:true})).imageOutcome,'retrieved');
  browser.failWrite=true;
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).outcome,'storage');
  browser.failWrite=false;
  const {record:latest}=await createLibrary(browser).command({type:'metadataDetails',recordId:record.id});
  assert.equal(latest.metadata.observations.length,2);assert.equal(latest.metadata.checks.length,1);assert.equal(browser.calls.length,2);
  assert.equal(latest.metadata.current.image.outcome,'retrieved');
});

test('disconnect during a request rejects late results and leaves independent user edits usable',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);await library.command({type:'setYoutubeKey',key:'fixture'});
  let release,started;const arrived=new Promise(resolve=>{started=resolve;});
  browser.fetchYoutubeVideo=async()=>{started();return await new Promise(resolve=>{release=resolve;});};
  const retrieval=library.command({type:'pullMetadata',recordId:record.id});await arrived;
  await library.command({type:'setYoutubeKey',key:null});
  assert.equal((await library.command({type:'editTitle',recordId:record.id,expectedRevision:record.user.revision,personalTitle:'My title'})).ok,true);
  release(browser.response);assert.equal((await retrieval).outcome,'credentialChanged');
  const {record:latest}=await library.command({type:'metadataDetails',recordId:record.id});
  assert.equal(latest.user.personalTitle,'My title');assert.equal(latest.metadata.observations.length,1);
});

test('unsupported saved links are skipped without requiring setup or changing the record',async()=>{
  const browser=fixture();
  browser.capture=async()=>({url:'https://example.org/video',title:'Fallback title',source:'browser-tab',observedAt:null});
  const {library,record}=await saved(browser);
  const result=await library.command({type:'pullMetadata',recordId:record.id});
  assert.equal(result.outcome,'skipped');
  assert.equal(browser.calls.length,0);
  assert.deepEqual((await library.command({type:'metadataDetails',recordId:record.id})).record,record);
});

test('no resource is retained as check evidence without erasing last successful metadata or changing review',async()=>{
  const browser=fixture();const {library,record}=await saved(browser);
  await library.command({type:'setYoutubeKey',key:'fixture'});
  await library.command({type:'pullMetadata',recordId:record.id});
  const before=(await library.command({type:'metadataDetails',recordId:record.id})).record;
  browser.response={outcome:'noResult'};
  assert.equal((await library.command({type:'pullMetadata',recordId:record.id})).outcome,'noResult');
  const after=(await createLibrary(browser).command({type:'metadataDetails',recordId:record.id})).record;
  assert.deepEqual(after.metadata.current,before.metadata.current);
  assert.equal(after.metadata.checks.at(-1).outcome,'noResult');
  assert.equal(after.metadata.observations.length,before.metadata.observations.length);
  assert.deepEqual(after.user,before.user);
});
