import { organizationLists, fitArrivals } from './organization-service.js';
import { channel, durationSeconds, publicationDate } from './metadata.js';
import { displayTitle } from './shared.js';

export const videoSortKeys = ['manual','publication','title','channel','destination','duration','firstSavedAt','firstInboxExitAt','latestListEntryAt'];
export const overviewSortKeys = ['importance','name','count','duration','latestAddition'];
const collator=new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});
export function organizationPreferences(state) {
  return {videoSort:{key:'manual',direction:'asc'},overviewSort:{key:'importance',direction:'asc'},...state.organizationPreferences};
}
function compare(a,b,direction) {
  if(a===null || a===undefined || a==='') return b===null || b===undefined || b==='' ? 0 : 1;
  if(b===null || b===undefined || b==='') return -1;
  const value=typeof a==='number' && typeof b==='number' ? a-b : collator.compare(String(a),String(b));
  return direction==='desc' ? -value : value;
}
export function orderRecords(records,list,sort={key:'manual',direction:'asc'},lists=[]) {
  if(sort.key==='manual') {
    const ids=list?.manualOrder ?? [];
    if(!ids.length) return records.map((record,index)=>({record,index,date:publicationDate(record)})).sort((a,b)=>compare(a.date,b.date,list?.publicationDirection)||a.index-b.index).map(item=>item.record);
    const byId=new Map(records.map(record=>[record.id,record]));
    const saved=ids.map(id=>byId.get(id)).filter(Boolean);
    return fitArrivals(saved,records.filter(record=>!ids.includes(record.id)),list?.publicationDirection);
  }
  const value=record=>{
    if(sort.key==='publication') return publicationDate(record);
    if(sort.key==='title') return displayTitle(record);
    if(sort.key==='channel') {const name=channel(record)?.name;return name==='Channel name unknown' ? null : name ?? null;}
    if(sort.key==='duration') return durationSeconds(record);
    if(sort.key==='destination') return lists.find(item=>item.id===record.user.destination)?.name ?? null;
    const date=Date.parse(record.user[sort.key]); return Number.isFinite(date) ? date : null;
  };
  const direction=sort.key==='publication' && list ? list.publicationDirection : sort.direction;
  return records.map((record,index)=>({record,index,value:value(record)})).sort((a,b)=>compare(a.value,b.value,direction)||a.index-b.index).map(item=>item.record);
}
export function listStatistics(records,lists) {
  return Object.fromEntries(lists.map(list=>{
    const members=records.filter(record=>record.user.status==='active' && record.user.destination===list.id);
    const durations=members.map(durationSeconds);
    const dates=members.map(record=>Date.parse(record.user.latestListEntryAt)).filter(Number.isFinite);
    return [list.id,{count:members.length,duration:durations.reduce((sum,value)=>sum+(value??0),0),unknownDurations:durations.filter(value=>value===null).length,latestAddition:dates.length?Math.max(...dates):null}];
  }));
}
export function orderLists(lists,statistics,sort={key:'importance',direction:'asc'}) {
  const custom=lists.filter(list=>!list.permanent).map((list,index)=>({list,index}));
  custom.sort((a,b)=>{
    const value=list=>['count','duration','latestAddition'].includes(sort.key) ? statistics[list.id]?.[sort.key] : list[sort.key];
    return compare(value(a.list),value(b.list),sort.direction)||a.index-b.index;
  });
  return [...lists.filter(list=>list.id==='Inbox'),...custom.map(item=>item.list),...lists.filter(list=>list.id==='Backlog')];
}
export function arrangedRecords(state,records) {
  const lists=organizationLists(state); const {videoSort}=organizationPreferences(state);
  if(videoSort.key!=='manual' && videoSort.key!=='publication') return orderRecords(records,null,videoSort,lists);
  return lists.flatMap(list=>orderRecords(records.filter(record=>record.user.destination===list.id),list,videoSort,lists));
}
export async function executeArrangementPreferences(state,browser,command) {
  if(command.type!=='setOrganizationPreferences') return null;
  const patch=command.patch;
  if(!patch || typeof patch!=='object' || Array.isArray(patch)) return {ok:false,error:'Choose valid Library preferences.'};
  const keys={videoSort:videoSortKeys,overviewSort:overviewSortKeys,density:['thumbnails','compact'],orientation:['columns','rows']};
  for(const [key,value] of Object.entries(patch)) {
    if(!Object.hasOwn(keys,key) || (key.endsWith('Sort') ? !value || !keys[key].includes(value.key) || !['asc','desc'].includes(value.direction) : !keys[key].includes(value))) return {ok:false,error:'Choose valid Library preferences.'};
  }
  if(patch.videoSort?.key==='publication') {
    const lists=organizationLists(state); const ids=command.destinationIds ?? lists.map(list=>list.id);
    if(!Array.isArray(ids) || ids.some(id=>!lists.some(list=>list.id===id))) return {ok:false,error:'A destination changed. Refresh before sorting.'};
    state.listSettings ??= {};
    for(const id of ids) state.listSettings[id]={...state.listSettings[id],publicationDirection:patch.videoSort.direction};
    if(ids.length===lists.length) state.organizationPreferences={...state.organizationPreferences,libraryPublicationDirection:patch.videoSort.direction};
  }
  state.organizationPreferences={...organizationPreferences(state),...patch};
  await browser.write(state);
  return {ok:true,organizationPreferences:organizationPreferences(state)};
}
