import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLibrary } from '../extension/library-service.js';

function record(id, date, extra = {}) {
  return { id, url:`https://example.org/${id}`, identity:id, user:{status:'active',destination:'Inbox',firstSavedAt:'2026-01-01T00:00:00Z',firstInboxExitAt:null,latestListEntryAt:'2026-01-01T00:00:00Z',personalTitle:null,revision:1,watchEvents:[],pendingReview:null},metadata:{publicationDate:date,observations:[{title:id,source:'fixture',observedAt:'2026-01-01T00:00:00Z'}],...extra} };
}
function fixture(records) {
  let durable={version:1,records,history:[],lists:[]}; let next=0; let fail=false;
  const browser={read:async()=>structuredClone(durable),write:async value=>{if(fail)throw Error('Fixture failure');durable=structuredClone(value);},id:()=>`action-${++next}`,now:()=> '2026-10-28T09:00:00Z'};
  return {library:createLibrary(browser),state:()=>structuredClone(durable),set(value){durable=structuredClone(value);},fail(value){fail=value;}};
}
test('remembered sorts keep unknown values last in both directions and Manual falls back to publication',async()=>{
  const f=fixture([record('later','2026-02-01'),record('unknown',null),record('early','2026-01-01')]);
  assert.equal((await f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key:'publication',direction:'asc'}},destinationIds:['Inbox']})).ok,true);
  assert.deepEqual((await f.library.command({type:'list'})).records.map(r=>r.id),['early','later','unknown']);
  await f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key:'publication',direction:'desc'}},destinationIds:['Inbox']});
  assert.deepEqual((await f.library.command({type:'list'})).records.map(r=>r.id),['later','early','unknown']);
  await f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key:'manual',direction:'asc'}}});
  assert.deepEqual((await f.library.command({type:'list'})).records.map(r=>r.id),['later','early','unknown']);
});

test('arranging adopts displayed order atomically and recovery preserves later preferences and metadata',async()=>{
  const f=fixture([record('one','2026-01-01'),record('two','2026-01-02'),record('three','2026-01-03')]);
  const dates=f.state().records.map(r=>r.user);
  const arranged=await f.library.command({type:'arrangeVideos',destinationId:'Inbox',displayedIds:['three','two','one'],movedIds:['one'],beforeId:'three',expectedManualOrder:[]});
  assert.equal(arranged.ok,true);
  assert.deepEqual(f.state().listSettings.Inbox.manualOrder,['one','three','two']);
  assert.deepEqual(f.state().records.map(r=>r.user),dates);
  await f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key:'publication',direction:'desc'},density:'compact'},destinationIds:['Inbox']});
  const state=f.state();state.records[0].metadata.observations.push({title:'A later observation'});f.set(state);
  assert.equal((await f.library.command({type:'organizationUndo',actionId:arranged.actionId})).ok,true);
  assert.equal(f.state().listSettings.Inbox.publicationDirection,'desc');
  assert.equal(f.state().organizationPreferences.density,'compact');
  assert.equal(f.state().records[0].metadata.observations.at(-1).title,'A later observation');
  assert.equal(f.state().listSettings.Inbox.manualOrder,undefined);
});

test('stale arranging and deterministic persistence failure cannot partially save Manual or history',async()=>{
  const f=fixture([record('one','2026-01-01'),record('two','2026-01-02')]);
  const command={type:'arrangeVideos',destinationId:'Inbox',displayedIds:['one','two'],movedIds:['two'],beforeId:'one',expectedManualOrder:[]};
  f.fail(true);const before=f.state();await assert.rejects(f.library.command(command));assert.deepEqual(f.state(),before);f.fail(false);
  const first=await f.library.command(command);assert.equal(first.ok,true);
  const stale=await f.library.command(command);assert.equal(stale.ok,false);
  const state=f.state();state.records[0].user.destination='Backlog';f.set(state);
  const conflict=await f.library.command({type:'organizationUndo',actionId:first.actionId});assert.equal(conflict.ok,false);
  assert.deepEqual(f.state(),state);
});

test('arranged custom Manual is consumed by later move fitting and no-op moves preserve it',async()=>{
  const f=fixture([record('one','2026-01-01'),record('ten','2026-01-10'),record('five','2026-01-05'),record('twenty','2026-01-20'),record('seven','2026-01-07')]);
  const state=f.state();state.lists=[{id:'target',name:'Target',importance:0,manualOrder:[],publicationDirection:'asc'}];state.records.slice(0,4).forEach(record=>record.user.destination='target');f.set(state);
  assert.equal((await f.library.command({type:'arrangeVideos',destinationId:'target',displayedIds:['one','five','ten','twenty'],movedIds:['ten'],beforeId:'five',expectedManualOrder:[]})).ok,true);
  const prepared=await f.library.command({type:'organizationPreview',rows:[{recordId:'seven',to:'target'}]});assert.equal((await f.library.command({type:'organizationCommit',preview:prepared.preview})).ok,true);
  assert.deepEqual(f.state().lists[0].manualOrder,['one','ten','five','seven','twenty']);
  const before=f.state();const keep=await f.library.command({type:'organizationPreview',rows:[{recordId:'seven',to:'target'}]});await f.library.command({type:'organizationCommit',preview:keep.preview});assert.deepEqual(f.state(),before);
});

test('all publication directions and independent preferences survive queued updates without editing Manual',async()=>{
  const f=fixture([record('one','2026-01-01'),record('two',null)]);
  const state=f.state();state.lists=[{id:'custom',name:'Custom',importance:0,manualOrder:['source-order'],publicationDirection:'asc'}];f.set(state);
  await Promise.all([
    f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key:'publication',direction:'desc'}},destinationIds:['Inbox','custom','Backlog']}),
    f.library.command({type:'setOrganizationPreferences',patch:{density:'compact',orientation:'rows'}}),
  ]);
  const result=await f.library.command({type:'list'});
  assert.deepEqual(result.lists.map(list=>list.publicationDirection),['desc','desc','desc']);
  assert.equal(result.organizationPreferences.videoSort.key,'publication');assert.equal(result.organizationPreferences.orientation,'rows');assert.equal(result.organizationPreferences.density,'compact');
  assert.deepEqual(result.lists[1].manualOrder,['source-order']);
  assert.deepEqual(result.listStatistics.Inbox,{count:2,duration:0,unknownDurations:2,latestAddition:1767225600000});
});

test('date duration channel and displayed-title sorts keep missing and tied values honest',async()=>{
  const f=fixture([record('a','2026-01-01',{durationSeconds:60,channelId:'a',channelName:'Channel A'}),record('b','2026-01-01',{durationSeconds:60,channelId:'b',channelName:'Channel B'}),record('c',null,{durationSeconds:null})]);
  const state=f.state();state.records[0].user.personalTitle='Zulu';state.records[1].user.personalTitle='Alpha';state.records[0].user.firstInboxExitAt='2026-02-01T12:00:00Z';state.records[1].user.firstInboxExitAt='2026-01-01T12:00:00Z';f.set(state);
  for(const [key,direction,expected] of [['title','asc',['b','c','a']],['channel','desc',['b','a','c']],['duration','desc',['a','b','c']],['firstInboxExitAt','desc',['a','b','c']],['firstInboxExitAt','asc',['b','a','c']]]) {
    await f.library.command({type:'setOrganizationPreferences',patch:{videoSort:{key,direction}}});
    assert.deepEqual((await f.library.command({type:'list'})).records.map(record=>record.id),expected);
  }
  assert.deepEqual(f.state().records.map(record=>record.user),state.records.map(record=>record.user));assert.equal(f.state().history.length,0);
});
