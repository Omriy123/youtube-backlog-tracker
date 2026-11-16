// Project only recorded metadata; absence is not a provider guess.
function value(record, keys) {
  const metadata=record.metadata ?? {};
  if(metadata.current?.source==='youtube-api') {
    for(const key of keys)if(Object.hasOwn(metadata.current,key))return metadata.current[key];
    return null;
  }
  for(const item of [metadata.current,metadata,...(metadata.observations ?? []).slice().reverse()]) {
    if(!item) continue;
    for(const key of keys) if(Object.hasOwn(item,key)) return item[key];
  }
  return null;
}
export function channel(record) {
  const recorded=value(record,['channel']);
  const id=recorded?.id ?? value(record,['channelId']);
  if(typeof id!=='string' || !id.trim()) return null;
  const name=recorded?.name ?? value(record,['channelName']);
  return {id,name:typeof name==='string' && name.trim() ? name : 'Channel name unknown'};
}
export function durationSeconds(record) {
  const duration=value(record,['durationSeconds']);
  return typeof duration==='number' && Number.isFinite(duration) && duration>=0 ? duration : null;
}
export function publicationDate(record) {
  const date=value(record,['publicationDate','publishedAt']);
  const parsed=typeof date==='string' ? Date.parse(date) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}
export function thumbnailUrl(record) {
  const retained=record.metadata?.current?.image?.dataUrl;
  if(typeof retained==='string' && /^data:image\/(?:png|jpeg|webp|gif);base64,/.test(retained))return retained;
  // A provider thumbnail reference is not an acquired image. Never fetch it
  // merely by rendering a row (including when a prior image request failed).
  if(record.metadata?.current?.source==='youtube-api')return null;
  const url=value(record,['thumbnailUrl']);
  return typeof url==='string' && /^https?:\/\//i.test(url) ? url : null;
}
