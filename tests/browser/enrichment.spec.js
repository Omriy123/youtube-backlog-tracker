import {test,expect} from '@playwright/test';
import {mkdtemp,mkdir,cp,rename,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {launch,capture} from './helpers.js';

// Controlled provider HTTP boundary; real production parser, UI, local storage,
// runtime messaging and image encoding run inside the installed extension.
async function providerExtension() {
  await mkdir(resolve('.scratch/extensions'),{recursive:true});
  const path=await mkdtemp(resolve('.scratch/extensions/enrichment-'));
  await cp(resolve('extension'),path,{recursive:true});
  await rename(resolve(path,'browser.js'),resolve(path,'actual-browser.js'));
  const picture=(await readFile(resolve('tests/fixtures/youtube-thumbnail.jpg'))).toString('base64');
  await writeFile(resolve(path,'browser.js'),`
    import {createBrowserAdapter as actual} from './actual-browser.js';
    const network=globalThis.fetch;
    globalThis.fetch=async(url,options)=>{
      const address=String(url);
      if(address.startsWith('https://www.googleapis.com/youtube/v3/videos')) {
        if(options.headers['X-Goog-Api-Key']==='rejected-fixture')return new Response(JSON.stringify({error:{errors:[{reason:'keyInvalid'}]}}),{status:403});
        return new Response(JSON.stringify({items:[{id:new URL(address).searchParams.get('id'),snippet:{title:'Provider title with retained picture',description:'A retained provider description',channelId:'UC-fixture',channelTitle:'Example creator',publishedAt:'2026-10-01T12:00:00Z',thumbnails:{default:{url:'https://i.ytimg.com/vi/abcdefghijk/default.jpg',width:120,height:90}}},contentDetails:{duration:'PT2M5S'}}]}),{headers:{'Content-Type':'application/json'}});
      }
      if(address.startsWith('https://i.ytimg.com/'))return new Response(Uint8Array.from(atob('${picture}'),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/jpeg'}});
      return network(url,options);
    };
    export function createBrowserAdapter(){return actual();}
  `);
  return path;
}

test('optional setup and deliberate acquisition present retained metadata and image after process restart',async()=>{
  const extensionPath=await providerExtension();let app=await launch(undefined,{extensionPath});let profile=app.profile;
  try {
    await capture(app,'https://youtu.be/abcdefghijk','Captured original title');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await expect(page.getByRole('heading',{name:'Captured original title',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Pull metadata',exact:true}).click();
    await expect(page.getByRole('status').filter({hasText:'Configure your personal'})).toBeVisible();
    await page.getByRole('button',{name:'YouTube setup',exact:true}).click();
    const setup=page.getByRole('dialog',{name:'YouTube setup'});
    await setup.getByLabel('Personal API key').fill('rejected-fixture');await setup.getByRole('button',{name:'Save key',exact:true}).click();
    await setup.getByRole('button',{name:'Test connection',exact:true}).click();await expect(setup.getByRole('status')).toContainText('rejected setup');
    await setup.getByLabel('Personal API key').fill('controlled-fixture');await setup.getByRole('button',{name:'Save key',exact:true}).click();
    await setup.getByRole('button',{name:'Test connection',exact:true}).click();await expect(setup.getByRole('status')).toContainText('Connection usable');
    await setup.getByRole('button',{name:'Close setup'}).click();
    await expect(page.getByRole('button',{name:'Metadata details: Not checked',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Pull metadata',exact:true}).click();
    await expect(page.getByRole('button',{name:/Metadata details: Metadata returned/})).toBeVisible();
    await expect(page.locator('article .thumbnail img')).toHaveAttribute('src',/^data:image\/jpeg;base64,/);
    await expect(page.getByRole('heading',{name:'Captured original title',exact:true})).toBeVisible();
    await expect(page.locator('article')).toContainText('Example creator');await expect(page.locator('article')).toContainText('2:05');
    for(const density of ['Thumbnails','Compact']) {
      await page.getByRole('button',{name:density,exact:true}).click();
      for(const width of [1440,640]) {await page.setViewportSize({width,height:900});await page.screenshot({path:resolve(`.scratch/enrichment-${density}-${width}.png`),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
    }
    await page.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
    await expect(page.getByRole('dialog',{name:'Metadata details'})).toContainText('A retained provider description');
    await page.screenshot({path:resolve('.scratch/enrichment-details-640.png'),fullPage:true});
    await app.context.close();
    app=await launch(profile,{extensionPath});await app.context.setOffline(true);
    const reopened=await app.context.newPage();await reopened.goto(`${app.base}/library.html`);
    await expect(reopened.locator('article')).toContainText('Example creator');
    await reopened.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
    await expect(reopened.getByRole('dialog',{name:'Metadata details'}).getByRole('img',{name:'Retained thumbnail'})).toBeVisible();
  } finally {await app.context.close();}
});
