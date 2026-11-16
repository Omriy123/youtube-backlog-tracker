import {mkdtemp,mkdir,cp,rename,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// Controlled HTTP responses at the established provider boundary. Production
// parsing, image encoding, messaging, UI and durable storage remain unchanged.
export async function metadataProviderFixture() {
  await mkdir(resolve('.scratch/extensions'),{recursive:true});
  const path=await mkdtemp(resolve('.scratch/extensions/metadata-browse-'));
  await cp(resolve('extension'),path,{recursive:true});
  await rename(resolve(path,'browser.js'),resolve(path,'actual-browser.js'));
  const picture=(await readFile(resolve('tests/fixtures/youtube-thumbnail.jpg'))).toString('base64');
  await writeFile(resolve(path,'browser.js'),`
    import {createBrowserAdapter as actual} from './actual-browser.js';
    const network=globalThis.fetch;let checks=0;
    globalThis.fetch=async(url,options)=>{
      const address=String(url);
      if(address.startsWith('https://www.googleapis.com/youtube/v3/videos')) {
        const phase=Math.min(checks++,2);
        const titles=['First provider title','Intermediate bridge lesson','Newest bridge title'];
        const descriptions=['First useful description','Retained structural needle','Newest description'];
        return new Response(JSON.stringify({items:[{id:new URL(address).searchParams.get('id'),snippet:{title:titles[phase],description:descriptions[phase],channelId:'UC-metadata',channelTitle:'Recorded engineering channel',publishedAt:'2026-10-01T12:00:00Z',thumbnails:{default:{url:'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',width:480,height:360}}},contentDetails:phase===2?{}:{duration:'PT2M5S'}}]}),{headers:{'Content-Type':'application/json'}});
      }
      if(address.startsWith('https://i.ytimg.com/'))return new Response(Uint8Array.from(atob('${picture}'),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/jpeg'}});
      return network(url,options);
    };
    export function createBrowserAdapter(){return actual();}
  `);
  return path;
}
