import {deriveBrowse} from './browse-model.js';
import {displayTitle} from './shared.js';
import {completeInitialPlacement} from './placement-state.js';
import {saveManualOrder} from './list-order.js';

// Removal stays inside the organization's single history/write transaction.
export function removalPreview(state,command,{lists,orderFor,placement}) {
  const list=lists.find(list=>list.id===command.listId && !list.permanent);
  if(!list)return {ok:false,error:'Only an existing custom watch list can be removed.'};
  if(!['whole','matches'].includes(command.scope))return {ok:false,error:'Choose whole-list deletion or matching-only removal.'};
  const scope=command.scope;
  let effect=command.effect ?? null;let to=command.to ?? null;
  if(effect!==null && !['move','dismiss'].includes(effect))return {ok:false,error:'Choose Move or Dismiss explicitly.'};
  const excludedIds=[...new Set(command.excludedIds ?? [])];
  if(scope==='whole' && excludedIds.length)return {ok:false,error:'Whole-list deletion cannot exclude videos. Resolve reviews or cancel.'};
  const source=orderFor(list.id);
  let records=source;
  if(scope==='matches') {
    if(!Array.isArray(command.recordIds))return {ok:false,error:'Choose an explicit current matching set.'};
    if(command.filterContext) {
      const context=command.filterContext;
      records=deriveBrowse({records:source,lists,state:{scopeId:list.id,query:context.query ?? '',titleScopes:context.titleScopes,channelId:context.channelId ?? null,anchor:[]},selectedOnly:Boolean(context.selectedOnly),selectedIds:new Set(context.selectedIds ?? [])}).currentResults;
    } else records=source.filter(record=>command.recordIds.includes(record.id));
    const positions=new Map(command.recordIds.map((id,index)=>[id,index]));
    records=records.slice().sort((a,b)=>(positions.get(a.id) ?? Infinity)-(positions.get(b.id) ?? Infinity));
  }
  const rows=records.map(record=>({recordId:record.id,record:structuredClone(record),from:list.id,excluded:excludedIds.includes(record.id),blocked:Boolean(record.user.pendingReview)}));
  const affected=rows.filter(row=>!row.excluded);
  const empty=scope==='whole' && source.length===0;
  if(empty){effect=null;to=null;}
  const target=effect==='move'?lists.find(list=>list.id===to):null;
  const validationError=effect==='move' && to!==null && (!target || (scope==='whole'&&to===list.id) || (scope==='matches'&&to==='Inbox')) ? 'Choose an available destination. Inbox is allowed only for whole-list deletion.' : null;
  const signature=JSON.stringify({list,scope,effect,to,excludedIds:excludedIds.slice().sort(),rows:rows.map(row=>({id:row.recordId,user:placement(row.record.user),title:displayTitle(row.record),excluded:row.excluded})),target:target?{list:target,members:orderFor(target.id).map(record=>({id:record.id,user:placement(record.user)}))}:null});
  const preview={listId:list.id,listName:list.name,scope,effect,to,recordIds:command.recordIds ?? [],filterContext:command.filterContext ?? null,excludedIds,rows,lists,empty,signature,ready:!validationError&&(empty || (affected.length>0 && (effect==='dismiss'||(effect==='move'&&Boolean(target))))),validationError};
  return validationError?{ok:false,error:validationError,preview}:{ok:true,preview};
}

export function applyRemoval(state,preview,{lists,orderFor,fitArrivals,now}) {
  const rows=preview.rows.filter(row=>!row.excluded);const ids=new Set(rows.map(row=>row.recordId));
  const moving=preview.effect==='move'?rows.filter(row=>row.from!==preview.to):[];
  const changed=preview.effect==='dismiss'?rows:moving;
  const changedIds=new Set(changed.map(row=>row.recordId));
  const sourceBaseline=orderFor(preview.listId).filter(record=>!changedIds.has(record.id));
  const targetBaseline=moving.length?orderFor(preview.to).filter(record=>!changedIds.has(record.id)):[];
  for(const row of changed) {
    const record=state.records.find(record=>record.id===row.recordId);
    completeInitialPlacement(state,record,now);
    if(preview.effect==='dismiss') {
      record.user.lastDismissal={at:now,destination:preview.listId,destinationName:preview.listName};record.user.status='dismissed';record.user.destination=null;record.user.pendingReview=null;
    } else {record.user.destination=preview.to;record.user.latestListEntryAt=now;}
    record.user.revision++;
  }
  if(changed.length && preview.scope==='matches')saveManualOrder(state,preview.listId,sourceBaseline.map(record=>record.id));
  if(moving.length)saveManualOrder(state,preview.to,fitArrivals(targetBaseline,moving.map(row=>state.records.find(record=>record.id===row.recordId)),lists.find(list=>list.id===preview.to).publicationDirection).map(record=>record.id));
  if(preview.scope==='whole') {state.lists=state.lists.filter(list=>list.id!==preview.listId);delete state.listSettings[preview.listId];}
  return {processedIds:[...ids],deletedListId:preview.scope==='whole'?preview.listId:null,effect:preview.empty?'empty':preview.effect,to:preview.effect==='move'?preview.to:null,outcome:preview.scope==='whole'?'List deleted. Videos and prior history retained.':changed.length?'Matching removal saved. List retained.':'Kept in the current list.'};
}
