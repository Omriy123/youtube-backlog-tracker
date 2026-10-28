import { channel } from './metadata.js';
import { matchRecordTitles } from './title-service.js';
export const UNKNOWN_CHANNEL='__unknown__';
export function createBrowseState() {
  return {scopeId:'Inbox',originListId:'Inbox',query:'',titleScopes:{personal:true,original:true,intermediate:true,latest:true},channelId:null,expandedChannels:false,anchor:null,density:'thumbnails',orientation:'columns'};
}
export function anchorChannels(records,scopeId) {
  const channels=new Map();
  for(const record of records) {
    if(scopeId!==null && record.user.destination!==scopeId) continue;
    const known=channel(record);if(!known) continue;
    const item=channels.get(known.id) ?? {...known,count:0};item.count++;channels.set(known.id,item);
  }
  return [...channels.values()].sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function deriveBrowse({records,lists,state,selectedIds=new Set(),selectedOnly=false}) {
  const base=records.filter(record=>record.user.status==='active' && (state.scopeId===null || record.user.destination===state.scopeId) && (!selectedOnly || selectedIds.has(record.id))).flatMap(record=>{
    const match=matchRecordTitles(record,state.query,state.titleScopes);
    return match.matched ? [{...record,historicalMatch:match.historicalMatch}] : [];
  });
  const channelCounts=new Map();for(const record of base) {const id=channel(record)?.id ?? UNKNOWN_CHANNEL;channelCounts.set(id,(channelCounts.get(id) ?? 0)+1);}
  const currentResults=base.filter(record=>state.channelId===null || (channel(record)?.id ?? UNKNOWN_CHANNEL)===state.channelId);
  const anchor=state.anchor ?? anchorChannels(records,state.scopeId);
  const visibleChannels=state.expandedChannels ? anchor.slice() : anchor.slice(0,5);
  if(state.channelId && state.channelId!==UNKNOWN_CHANNEL && !visibleChannels.some(item=>item.id===state.channelId)) {
    const selected=anchor.find(item=>item.id===state.channelId) ?? records.map(channel).find(item=>item?.id===state.channelId);
    visibleChannels.push(selected ?? {id:state.channelId,name:'Channel name unknown'});
  }
  return {currentResults,channelCounts,visibleChannels,channelTotal:anchor.length,groups:lists.map(list=>({...list,records:currentResults.filter(record=>record.user.destination===list.id)})).filter(group=>group.records.length)};
}
