import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLibrary} from '../extension/library-service.js';

function fixture() {
  let state=null,id=0;
  return {async capture(){return {url:'https://youtu.be/abcdefghijk',title:'Original needle',source:'browser-tab',observedAt:null};},async read(){return structuredClone(state);},async write(value){state=structuredClone(value);},now(){return '2026-11-16T12:00:00Z';},id(){return `browse-${++id}`;}};
}
test('a latest description match is current even when an older title also matches',async()=>{
  const browser=fixture();const library=createLibrary(browser);await library.command({type:'save'});
  const state=await browser.read();state.records[0].metadata.observations.push({title:'Newest name',description:'Latest needle description',source:'youtube-api',observedAt:'2026-11-16T12:00:00Z'});await browser.write(state);
  const found=await library.command({type:'list',query:'needle'});
  assert.equal(found.records.length,1);assert.equal(found.records[0].historicalMatch,null);
});
test('a later browser capture does not reclassify the latest provider description as Intermediate',async()=>{
  const browser=fixture();const library=createLibrary(browser);await library.command({type:'save'});
  const state=await browser.read();state.records[0].metadata.observations.push({title:'Provider title',description:'Latest provider explanation',source:'youtube-api',observedAt:'2026-11-15T12:00:00Z'});await browser.write(state);
  await library.command({type:'save'});
  const latest=await library.command({type:'list',query:'provider explanation',scopes:{personal:false,original:false,intermediate:false,latest:true}});
  assert.equal(latest.records.length,1);assert.equal(latest.records[0].historicalMatch,null);
  const intermediate=await library.command({type:'list',query:'provider explanation',scopes:{personal:false,original:false,intermediate:true,latest:false}});
  assert.equal(intermediate.records.length,0);
});
