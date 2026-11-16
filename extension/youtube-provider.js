const text=value=>typeof value==='string' && value.trim() ? value : null;
function duration(value) {
  if(typeof value!=='string')return null;
  const match=value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if(!match || !match.slice(1).some(item=>item!==undefined))return null;
  return Number(match[1] ?? 0)*86400+Number(match[2] ?? 0)*3600+Number(match[3] ?? 0)*60+Number(match[4] ?? 0);
}
const timeout=signal=>signal ? AbortSignal.any([signal,AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000);
export async function fetchYoutubeVideo(videoId,key,{signal}={}) {
  try {
    const url=new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part','snippet,contentDetails');url.searchParams.set('id',videoId);
    url.searchParams.set('fields','items(id,snippet(title,description,channelId,channelTitle,publishedAt,thumbnails),contentDetails(duration)),error(code,errors(reason))');
    // Keep the credential out of request URLs and error messages.
    const response=await fetch(url,{headers:{'X-Goog-Api-Key':key},credentials:'omit',redirect:'error',signal:timeout(signal)});
    const data=await response.json();
    if(!response.ok) {
      const reasons=data.error?.errors?.map(error=>error.reason) ?? [];
      const quota=response.status===429 || reasons.some(reason=>['quotaExceeded','dailyLimitExceeded','rateLimitExceeded','userRateLimitExceeded'].includes(reason));
      if(quota)return {outcome:'quota',error:'YouTube request allowance is exhausted. Completed information is retained; retry explicitly later.'};
      if(response.status===400 || response.status===401 || response.status===403)return {outcome:'rejected',error:'YouTube rejected setup. Check the API key, enabled YouTube Data API and key restrictions.'};
      return {outcome:'failed',error:'YouTube could not complete the request. Retry explicitly later.'};
    }
    if(!Array.isArray(data.items))return {outcome:'failed',error:'YouTube returned an incomplete response. Retry explicitly.'};
    const item=data.items.find(item=>item.id===videoId);
    if(!item)return {outcome:'noResult'};
    const snippet=item.snippet ?? {};
    const thumbnailReferences=Object.values(snippet.thumbnails ?? {}).filter(item=>typeof item?.url==='string' && /^https:\/\/i\.ytimg\.com\//.test(item.url)).map(item=>({url:item.url,width:item.width ?? null,height:item.height ?? null})).sort((a,b)=>(b.width ?? 0)-(a.width ?? 0));
    return {outcome:'retrieved',fields:{title:text(snippet.title),description:text(snippet.description),channel:text(snippet.channelId)?{id:snippet.channelId,name:text(snippet.channelTitle)}:null,publicationDate:text(snippet.publishedAt),durationSeconds:duration(item.contentDetails?.duration),thumbnailReferences}};
  } catch {return {outcome:'network',error:'Network request failed. Check your connection and retry.'};}
}
export async function fetchThumbnail(url,{signal}={}) {
  if(!/^https:\/\/i\.ytimg\.com\//.test(url))throw Error('Unsupported thumbnail host');
  const response=await fetch(url,{credentials:'omit',redirect:'error',signal:timeout(signal)});
  if(!response.ok)throw Error('Image request failed');
  const mimeType=response.headers.get('content-type')?.split(';')[0];
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(mimeType))throw Error('Unusable image');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(!bytes.length)throw Error('Empty image');
  let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
  return {dataUrl:`data:${mimeType};base64,${btoa(binary)}`,mimeType,bytes:bytes.length};
}
