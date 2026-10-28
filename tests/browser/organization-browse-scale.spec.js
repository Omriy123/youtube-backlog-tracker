import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('representative browse distributions retain responsive controls and record measured interactions', async()=>{
  test.setTimeout(180000);
  const app=await launch();const evidence={browser:app.context.browser().version(),desktopChrome:process.env.CHROME_PATH ?? null,measurements:[],viewports:[],limitations:['Headless installed-browser automation; physical pointer ergonomics and subjective comfort are not established.','Observed timings are workload observations, not a latency guarantee.']};
  const output=resolve('.scratch/validation/organization-browse');await mkdir(output,{recursive:true});
  try{
    const {popup}=await capture(app,'https://example.org/scale-base','Scale base');await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const page=await app.context.newPage();
    for(const workload of [{total:1000,active:1000,channels:100,lists:8},{total:3000,active:1900,channels:550,lists:24}]){
      await app.worker.evaluate(async config=>{
        const {library}=await chrome.storage.local.get('library');const base=library.records[0];
        library.lists=Array.from({length:config.lists},(_,i)=>({id:`list${i}`,name:`Watch list ${i}`,importance:i,manualOrder:[],publicationDirection:'asc'}));
        library.records=Array.from({length:config.total},(_,i)=>({...structuredClone(base),id:`r${i}`,identity:`fixture-scale-${i}`,url:`https://example.org/scale${i}`,user:{...base.user,status:i<config.active?'active':i%2?'watched':'dismissed',destination:i<config.active*.7?'Inbox':`list${i%config.lists}`},metadata:{channelId:i%11?`channel${i%config.channels}`:null,channelName:i%11?`Recorded channel ${i%config.channels}`:null,durationSeconds:i%9?120+i:null,observations:[{title:`Original bridge ${i}`,description:'First observed description',source:'synthetic-test-fixture',observedAt:'2026-10-01T00:00:00Z'},{title:`Middle lesson ${i}`,description:'Retained history searchable phrase',source:'synthetic-test-fixture',observedAt:'2026-10-02T00:00:00Z'},{title:`Latest lesson ${i}`,description:'Latest description',source:'synthetic-test-fixture',observedAt:'2026-10-03T00:00:00Z'}]}}));
        await chrome.storage.local.set({library});
      },workload);
      let started=Date.now();await page.goto(`${app.base}/library.html`);await expect(page.getByRole('article')).toHaveCount(Math.ceil(workload.active*.7));const loadMs=Date.now()-started;
      started=Date.now();await page.getByRole('searchbox').fill('scale0');await expect(page.getByRole('article')).toHaveCount(1);const queryMs=Date.now()-started;
      started=Date.now();await page.getByRole('button',{name:'Search entire Library',exact:true}).click();await expect(page.getByRole('button',{name:'Across Library',exact:true})).toHaveAttribute('aria-pressed','true');const scopeMs=Date.now()-started;
      started=Date.now();await page.getByRole('button',{name:'Compact',exact:true}).click();await expect(page.getByRole('button',{name:'Compact',exact:true})).toHaveAttribute('aria-pressed','true');const densityMs=Date.now()-started;
      await page.getByRole('searchbox').fill('bridge');await expect(page.getByRole('article')).toHaveCount(workload.active);
      const channelButton=page.locator('[data-channel-id]').first();const before=await channelButton.boundingBox();
      const channelId=await channelButton.getAttribute('data-channel-id');
      const expectedChannelCount=await app.worker.evaluate(async id=>{const {library}=await chrome.storage.local.get('library');return library.records.filter(record=>record.user.status==='active' && record.metadata.channelId===id).length;},channelId);
      started=Date.now();await channelButton.click();await expect(page.getByRole('article')).toHaveCount(expectedChannelCount);const channelMs=Date.now()-started;
      evidence.measurements.push({...workload,retainedObservationsPerRecord:3,loadMs,queryMs,scopeMs,densityMs,channelMs,activeDomRows:await page.getByRole('article').count()});
      await page.getByRole('button',{name:'Rows',exact:true}).click();await page.screenshot({path:resolve(output,`workload-${workload.total}.png`),fullPage:true});
      expect(await page.locator('[data-channel-id]').first().boundingBox()).toEqual(before);
    }
    for(const viewport of [{width:2560,height:1440},{width:1440,height:900},{width:1280,height:500},{width:390,height:844},{width:768,height:1200}]){
      await page.setViewportSize(viewport);
      await page.getByRole('button',{name:'Columns',exact:true}).click();await page.getByRole('button',{name:'Thumbnails',exact:true}).click();
      await expect(page.getByRole('button',{name:'Search entire Library',exact:true})).toBeVisible();
      await page.getByRole('button',{name:'Clear filters',exact:true}).click();await page.getByRole('searchbox').fill('scale0');
      await page.getByRole('button',{name:'Rows',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(1);
      const measured=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,devicePixelRatio,scrollbarWidth:innerWidth-document.documentElement.clientWidth}));
      expect(measured.scrollWidth).toBeLessThanOrEqual(measured.width);expect(measured.scrollbarWidth).toBe(0);
      await page.getByRole('button',{name:'Search entire Library',exact:true}).focus();await expect(page.getByRole('button',{name:'Search entire Library',exact:true})).toBeFocused();
      evidence.viewports.push({...viewport,measured});await page.screenshot({path:resolve(output,`viewport-${viewport.width}x${viewport.height}.png`),fullPage:true});
    }
    for(const zoom of [1.25,1.5]){
      await page.evaluate(async factor=>{const tab=await chrome.tabs.getCurrent();await chrome.tabs.setZoom(tab.id,factor);},zoom);
      evidence.viewports.push({zoom,measured:await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,devicePixelRatio}))});
      expect(evidence.viewports.at(-1).measured.scrollWidth).toBeLessThanOrEqual(evidence.viewports.at(-1).measured.width);
      await page.getByRole('button',{name:'Clear filters',exact:true}).focus();await expect(page.getByRole('button',{name:'Clear filters',exact:true})).toBeFocused();
      await page.screenshot({path:resolve(output,`zoom-${zoom}.png`),fullPage:true});
    }
  } finally {await writeFile(resolve(output,'evidence.json'),JSON.stringify(evidence,null,2));await app.context.close();}
});
