import {test,expect} from '@playwright/test';
import {mkdtemp,mkdir,cp,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {launch,capture,takeScreenshot} from './helpers.js';

async function fixture(){
  await mkdir(resolve('.scratch/extensions'),{recursive:true});
  const path=await mkdtemp(resolve('.scratch/extensions/close-controls-'));
  await cp(resolve('extension'),path,{recursive:true});
  await rename(resolve(path,'browser.js'),resolve(path,'actual-browser.js'));
  await writeFile(resolve(path,'browser.js'),`
    import {createBrowserAdapter as actual} from './actual-browser.js';
    export function createBrowserAdapter(){const browser=actual();browser.paceEnrichment=async()=>{};browser.fetchYoutubeVideo=async()=>{if(globalThis.holdCloseFixture)await new Promise(resolve=>{globalThis.releaseCloseFixture=resolve;});return {outcome:'retrieved',fields:{title:'Controlled long metadata',description:'A long retained description for pointer-close testing. '.repeat(150)}};};return browser;}
  `);
  const app=await launch(undefined,{extensionPath:path});
  try {
    const saved=await capture(app,'https://youtu.be/abcdefghijk','Close-control fixture');
    await expect(saved.popup.getByRole('status')).toContainText('Saved to Inbox');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.evaluate(()=>chrome.runtime.sendMessage({type:'setYoutubeKey',key:'controlled-fixture'}));
    return {...app,page};
  }catch(error){await app.context.close();throw error;}
}
async function reachable(control){
  await expect(control).toBeInViewport({ratio:1});
  expect(await control.evaluate(node=>{const box=node.getBoundingClientRect();return node.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));})).toBe(true);
}

test('metadata close remains pointer reachable with long Original Latest and History content',async()=>{
  const app=await fixture(),{page}=app;
  try {
    await page.getByRole('button',{name:'Pull metadata',exact:true}).click();
    await expect(page.getByRole('button',{name:/Metadata details: Metadata returned/})).toBeVisible();
    for(const density of ['Thumbnails','Compact'])for(const width of [1440,390]){
      await page.setViewportSize({width,height:700});
      await page.getByRole('button',{name:density,exact:true}).click();
      for(const version of ['Original','Latest','History']){
        await page.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
        const dialog=page.getByRole('dialog',{name:'Metadata details'});
        await dialog.getByRole('button',{name:version,exact:true}).click();
        const close=dialog.getByRole('button',{name:'Close metadata',exact:true});
        await reachable(close);
        await dialog.evaluate(node=>{node.scrollTop=node.scrollHeight;});
        await reachable(close);
        if(version==='History')await takeScreenshot(dialog,{path:resolve(`.scratch/close-metadata-${density}-${width}.png`)});
        await close.click();await expect(dialog).toHaveCount(0);
      }
    }
    await page.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
    await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Metadata details'})).toHaveCount(0);
  }finally{await app.context.close();}
});

test('retrieval results can be pointer closed after scrolling and reopened without losing outcomes',async()=>{
  const app=await fixture(),{page}=app;
  try {
    await app.worker.evaluate(async()=>{
      const {library}=await chrome.storage.local.get('library');const base=library.records[0];
      library.records=Array.from({length:20},(_,index)=>{const record=structuredClone(base);record.id=`close-${index}`;record.identity=`youtube:${String(index).padStart(11,'0')}`;record.url=`https://youtu.be/${String(index).padStart(11,'0')}`;return record;});
      await chrome.storage.local.set({library});
    });
    await page.reload();await page.getByRole('button',{name:'Pull entire Library metadata',exact:true}).click();
    const results=page.getByRole('region',{name:'Metadata retrieval results'});
    await expect(results.getByRole('status')).toContainText('Retrieval finished');
    await expect(results).toContainText('Retrieved: 20');
    for(const density of ['Thumbnails','Compact'])for(const width of [1440,390]){
      await page.setViewportSize({width,height:700});await page.getByRole('button',{name:density,exact:true}).click();
      await page.getByRole('button',{name:'Retrieval results',exact:true}).click();
      await results.scrollIntoViewIfNeeded();await results.evaluate(node=>{node.scrollTop=node.scrollHeight;});
      const close=results.getByRole('button',{name:'Hide retrieval results',exact:true});
      await reachable(close);
      await takeScreenshot(results,{path:resolve(`.scratch/close-results-${density}-${width}.png`)});
      await close.click();await expect(results).toBeHidden();
      await page.getByRole('button',{name:'Retrieval results',exact:true}).click();
      await expect(results).toBeVisible();await expect(results).toContainText('Retrieved: 20');
    }
    await app.worker.evaluate(()=>{globalThis.holdCloseFixture=true;});
    await page.getByRole('button',{name:'Pull entire Library metadata',exact:true}).click();
    await expect.poll(()=>app.worker.evaluate(()=>typeof globalThis.releaseCloseFixture)).toBe('function');
    await results.getByRole('button',{name:'Hide retrieval results',exact:true}).click();
    await expect(results).toBeHidden();
    expect(await page.evaluate(async()=>(await chrome.runtime.sendMessage({type:'enrichmentOperation'})).operation.status)).toBe('running');
    await app.worker.evaluate(()=>{globalThis.holdCloseFixture=false;globalThis.releaseCloseFixture();});
    await expect.poll(()=>page.evaluate(async()=>(await chrome.runtime.sendMessage({type:'enrichmentOperation'})).operation.status)).toBe('completed');
    await expect(results).toBeHidden();
    await page.getByRole('button',{name:'Retrieval results',exact:true}).click();
    await expect(results.getByRole('status')).toContainText('Retrieval finished');
    await expect(results).toContainText('Retrieved: 20');
  }finally{await app.context.close();}
});
