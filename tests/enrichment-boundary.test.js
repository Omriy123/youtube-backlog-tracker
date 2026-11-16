import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

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
