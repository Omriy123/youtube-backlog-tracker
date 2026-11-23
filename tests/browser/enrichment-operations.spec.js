import {test,expect} from '@playwright/test';
import {mkdtemp,mkdir,cp,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {launch,capture} from './helpers.js';

async function fixtureExtension({quotaFirst=false}={}){
  await mkdir(resolve('.scratch/extensions'),{recursive:true});const path=await mkdtemp(resolve('.scratch/extensions/batch-'));
  await cp(resolve('extension'),path,{recursive:true});await rename(resolve(path,'browser.js'),resolve(path,'actual-browser.js'));
  await writeFile(resolve(path,'browser.js'),`
    import {createBrowserAdapter as actual} from './actual-browser.js';
    export function createBrowserAdapter(){const browser=actual();let calls=0;browser.paceEnrichment=async()=>new Promise(resolve=>setTimeout(resolve,400));browser.fetchYoutubeVideo=async()=>${quotaFirst} && ++calls===1?{outcome:'quota',error:'Controlled quota failure'}:({outcome:'retrieved',fields:{title:'Controlled batch title',description:'Controlled batch description'}});return browser;}
  `);return path;
}

test('list and Library retrieval expose cancel, retry and retained records while the Library remains usable',async()=>{
  const extensionPath=await fixtureExtension();const app=await launch(undefined,{extensionPath});
  try{
    await capture(app,'https://youtu.be/abcdefghijk','First batch record');await capture(app,'https://youtu.be/lmnopqrstuv','Second batch record');await capture(app,'https://example.org/batch','Unsupported batch record');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'YouTube setup',exact:true}).click();const setup=page.getByRole('dialog',{name:'YouTube setup'});await setup.getByLabel('Personal API key').fill('controlled-fixture');await setup.getByRole('button',{name:'Save key',exact:true}).click();await expect(setup.getByRole('status')).toContainText('Key saved');await setup.getByRole('button',{name:'Close setup'}).click();
    await page.getByRole('button',{name:'Pull list metadata',exact:true}).click();
    const results=page.getByRole('region',{name:'Metadata retrieval results'});await expect(results).toBeVisible();
    await results.getByRole('button',{name:'Cancel further retrieval'}).click();await expect(results.getByRole('status')).toContainText('Cancelled');
    await results.getByRole('button',{name:'Retry unfinished retrieval'}).click();await expect(results.getByRole('status')).toContainText('Retrieval finished');
    await expect(results).toContainText('Retrieved: 2');await expect(results).toContainText('Skipped: 1');
    for(const density of ['Thumbnails','Compact']){await page.getByRole('button',{name:density,exact:true}).click();for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:resolve(`.scratch/batch-${density}-${width}.png`),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
    await page.getByRole('button',{name:'Pull entire Library metadata',exact:true}).click();await expect(results.getByRole('status')).toContainText('Retrieval finished');
    await page.getByRole('button',{name:'Retained video metadata',exact:true}).click();await expect(page.getByRole('dialog',{name:'Retained video metadata'})).toContainText('No retained watched or dismissed videos');
  }finally{await app.context.close();}
});

test('quota results show paused and unfinished work for deliberate retry with readable narrow controls',async()=>{
  const extensionPath=await fixtureExtension({quotaFirst:true});const app=await launch(undefined,{extensionPath});
  try{
    await capture(app,'https://youtu.be/abcdefghijk','Quota first');await capture(app,'https://youtu.be/lmnopqrstuv','Quota unfinished');const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'YouTube setup',exact:true}).click();const setup=page.getByRole('dialog',{name:'YouTube setup'});await setup.getByLabel('Personal API key').fill('controlled-fixture');await setup.getByRole('button',{name:'Save key',exact:true}).click();await expect(setup.getByRole('status')).toContainText('Key saved');await setup.getByRole('button',{name:'Close setup'}).click();
    await page.getByRole('button',{name:'Pull list metadata',exact:true}).click();const results=page.getByRole('region',{name:'Metadata retrieval results'});await expect(results.getByRole('status')).toContainText('Paused');await expect(results).toContainText('Failed: 1');await expect(results).toContainText('Not attempted/cancelled: 1');
    for(const density of ['Thumbnails','Compact']){await page.getByRole('button',{name:density,exact:true}).click();for(const width of [1440,390]){await page.setViewportSize({width,height:900});await results.getByRole('button',{name:'Retry unfinished retrieval'}).focus();await expect(results.getByRole('button',{name:'Retry unfinished retrieval'})).toBeFocused();await page.screenshot({path:resolve(`.scratch/batch-quota-${density}-${width}.png`),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}}
    await results.getByRole('button',{name:'Retry unfinished retrieval'}).click();await expect(results.getByRole('status')).toContainText('Retrieval finished');await expect(results).toContainText('Retrieved: 2');
  }finally{await app.context.close();}
});

test('representative batch targets and cancellation remain inspectable without rendering thousands of result controls',async()=>{
  test.setTimeout(120000);const extensionPath=await fixtureExtension();const app=await launch(undefined,{extensionPath});const evidence=[];
  try{
    await capture(app,'https://youtu.be/abcdefghijk','Scale seed');const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'YouTube setup',exact:true}).click();const setup=page.getByRole('dialog',{name:'YouTube setup'});await setup.getByLabel('Personal API key').fill('controlled-fixture');await setup.getByRole('button',{name:'Save key',exact:true}).click();await expect(setup.getByRole('status')).toContainText('Key saved');await setup.getByRole('button',{name:'Close setup'}).click();
    for(const workload of [{total:1000,active:1000,channels:100},{total:3000,active:1900,channels:550}]){
      await app.worker.evaluate(async config=>{const {library}=await chrome.storage.local.get('library');const seed=library.records[0];library.records=Array.from({length:config.total},(_,index)=>({...structuredClone(seed),id:`scale${index}`,identity:index%10?`youtube:${String(index).padStart(11,'0')}`:`generic:${index}`,url:`https://example.org/scale${index}`,user:{...seed.user,status:index<config.active?'active':index%2?'watched':'dismissed'},metadata:{channelId:`channel${index%config.channels}`,channelName:`Fixture creator ${index%config.channels}`,observations:[{title:`Synthetic scale video ${index}`,source:'synthetic-fixture',observedAt:null}]}}));await chrome.storage.local.set({library});},workload);
      await page.reload();await page.getByRole('searchbox').fill('scale0');await expect(page.getByRole('article')).toHaveCount(1);
      const started=Date.now();await page.getByRole('button',{name:'Pull entire Library metadata',exact:true}).click();const results=page.getByRole('region',{name:'Metadata retrieval results'});await expect(results).toContainText(`Requested: ${workload.total}`);const snapshotMs=Date.now()-started;
      const cancelStarted=Date.now();await results.getByRole('button',{name:'Cancel further retrieval'}).click();await expect(results.getByRole('status')).toContainText('Cancelled');const cancelMs=Date.now()-cancelStarted;
      expect(await results.getByRole('button',{name:'Inspect saved metadata',exact:true}).count()).toBe(100);await expect(results.getByRole('button',{name:'Show 100 more results'})).toBeVisible();
      evidence.push({...workload,snapshotMs,cancelMs,browser:app.context.browser().version(),limitations:'Synthetic fixtures, controlled provider responses, no authenticated provider capacity claim.'});
    }
    await mkdir(resolve('.scratch/validation/batch-enrichment'),{recursive:true});await writeFile(resolve('.scratch/validation/batch-enrichment/scale.json'),JSON.stringify(evidence,null,2));
  }finally{await app.context.close();}
});
