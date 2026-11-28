import {test,expect} from '@playwright/test';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {launch,capture,browserTabs,takeScreenshot} from './helpers.js';
import {metadataProviderFixture} from './metadata-provider-fixture.js';
test.use({actionTimeout:10000});

test('retrieved channels appear immediately and metadata details expose per-field originals and exact historical matches offline',async()=>{
  const extensionPath=await metadataProviderFixture();let app=await launch(undefined,{extensionPath});
  try {
    const saved=await capture(app,'https://youtu.be/abcdefghijk','Captured title before YouTube retrieval');
    await expect(saved.popup.getByRole('status')).toContainText('Saved to Inbox');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.evaluate(()=>chrome.runtime.sendMessage({type:'setYoutubeKey',key:'controlled-fixture'}));
    await page.getByRole('button',{name:'Pull metadata',exact:true}).click();
    await expect(page.getByRole('button',{name:'Recorded engineering channel · 1',exact:true})).toBeVisible();
    for(let index=0;index<3;index++) {
      await page.getByRole('button',{name:'Pull metadata',exact:true}).click();
      await expect.poll(()=>page.evaluate(async()=>{const result=await chrome.runtime.sendMessage({type:'list'});return result.records[0].metadata.checks.length;})).toBe(index+2);
    }
    await expect(page.locator('article')).toContainText('Duration unknown');
    await page.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
    const dialog=page.getByRole('dialog',{name:'Metadata details'});
    await expect(dialog.getByRole('button',{name:'Original',exact:true})).toHaveAttribute('aria-pressed','true');
    const versionTabs=dialog.locator('[aria-label="Metadata versions"] button');
    for(const name of ['Original','Latest','History']) {
      await dialog.getByRole('button',{name,exact:true}).click();
      const borders=await versionTabs.evaluateAll(tabs=>tabs.map(tab=>({pressed:tab.getAttribute('aria-pressed'),border:getComputedStyle(tab).borderBottomStyle,width:getComputedStyle(tab).borderBottomWidth})));
      expect(borders.find(tab=>tab.pressed==='true').border).toBe('double');
      expect(borders.filter(tab=>tab.pressed==='false').every(tab=>tab.border==='solid')).toBe(true);
      expect(new Set(borders.map(tab=>tab.width)).size).toBe(1);
    }
    await dialog.getByRole('button',{name:'Original',exact:true}).click();
    await expect(dialog).toContainText('Captured title before YouTube retrieval');
    await expect(dialog).toContainText('First useful description');
    await expect(dialog).toContainText('Source: browser-tab');
    await expect(dialog).toContainText('Source: youtube-api');
    await dialog.getByRole('button',{name:'Latest',exact:true}).click();
    await expect(dialog).toContainText('Newest description');await expect(dialog).toContainText('Duration unknown');
    await dialog.getByRole('button',{name:'History',exact:true}).click();
    await expect(dialog.getByRole('region',{name:'Metadata observation'})).toHaveCount(5);
    await expect(dialog.getByText('Unchanged selected metadata', {exact:true})).toHaveCount(1);
    await dialog.getByRole('button',{name:'Close metadata'}).click();
    await page.getByRole('searchbox').fill('structural needle');
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('button',{name:/Matched description from/}).click();
    await expect(page.getByRole('region',{name:'Matched metadata version'})).toContainText('Retained structural needle');
    await page.getByRole('button',{name:'Close metadata'}).click();
    await page.getByRole('checkbox',{name:'Intermediate',exact:true}).uncheck();await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('checkbox',{name:'Intermediate',exact:true}).check();await expect(page.getByRole('article')).toHaveCount(1);
    for(const name of ['Personal','Original','Intermediate','Latest'])await page.getByRole('checkbox',{name,exact:true}).uncheck();
    await expect(page.getByText('URL-only search. All title scopes are off.')).toBeVisible();await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('searchbox').fill('abcdefghijk');await expect(page.getByRole('article')).toHaveCount(1);
    await app.context.close();app=await launch(app.profile,{extensionPath});await app.context.setOffline(true);
    const reopened=await app.context.newPage();await reopened.goto(`${app.base}/library.html`);
    await expect(reopened.getByRole('searchbox')).toHaveValue('');
    for(const name of ['Personal','Original','Intermediate','Latest'])await expect(reopened.getByRole('checkbox',{name,exact:true})).toBeChecked();
    await reopened.getByRole('button',{name:/Metadata details: Metadata returned/}).click();
    await expect(reopened.getByRole('dialog').getByRole('img').first()).toBeVisible();
  }finally{await app.context.close();}
});

test('metadata Open preserves pending rediscovery review and Dismiss uses its existing confirmation',async()=>{
  const app=await launch(undefined,{extensionPath:await metadataProviderFixture()});
  try {
    const saved=await capture(app,'https://youtu.be/abcdefghijk','Review fixture');
    await expect(saved.popup.getByRole('status')).toContainText('Saved to Inbox');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'Open video',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(0);
    const savedAgain=await capture(app,'https://youtu.be/abcdefghijk','Review fixture again');
    await expect(savedAgain.popup.getByRole('status')).toContainText('Saved to Inbox');
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('button',{name:'Metadata details: Not checked',exact:true}).click();
    const before=(await browserTabs(app)).length;
    await page.getByRole('dialog',{name:'Metadata details'}).getByRole('button',{name:'Open video',exact:true}).click();
    await expect(page.getByRole('dialog',{name:/Review prior/})).toBeVisible();expect((await browserTabs(app)).length).toBe(before);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Metadata details: Not checked',exact:true}).click();
    await page.getByRole('dialog',{name:'Metadata details'}).getByRole('button',{name:'Dismiss',exact:true}).click();
    await expect(page.getByRole('dialog',{name:'Dismiss',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Confirm Dismiss',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(0);
  }finally{await app.context.close();}
});

test('retained metadata browsing scales and both densities keep selected/history controls reachable',async()=>{
  test.setTimeout(180000);
  const app=await launch(undefined,{extensionPath:await metadataProviderFixture()});
  const output=resolve('.scratch/validation/metadata-browse');await mkdir(output,{recursive:true});
  const evidence={measurements:[],limits:['Controlled provider responses and synthetic workloads; not authenticated API or capacity guarantees.','Headless installed Chrome; physical input comfort and manual installation remain human checks.']};
  try {
    await capture(app,'https://youtu.be/abcdefghijk','A long captured engineering title with original provenance and retained image fixture');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.evaluate(()=>chrome.runtime.sendMessage({type:'setYoutubeKey',key:'controlled-fixture'}));
    for(let i=0;i<3;i++)await page.evaluate(async()=>{const result=await chrome.runtime.sendMessage({type:'list'});return chrome.runtime.sendMessage({type:'pullMetadata',recordId:result.records[0].id});});
    for(const workload of [{total:1000,active:1000,channels:100},{total:3000,active:1900,channels:550}]) {
      await app.worker.evaluate(async config=>{
        const {library}=await chrome.storage.local.get('library');const base=library.records[0];
        library.records=Array.from({length:config.total},(_,index)=>{
          const record=structuredClone(base);record.id=`metadata-scale-${index}`;record.identity=`youtube:${String(index).padStart(11,'0')}`;record.url=`https://youtu.be/${String(index).padStart(11,'0')}`;
          record.user.status=index<config.active?'active':index%2?'watched':'dismissed';
          const channel={id:`scale-channel-${index%config.channels}`,name:`Synthetic recorded channel ${index%config.channels}`};
          for(const observation of record.metadata.observations){if(Object.hasOwn(observation,'channel'))observation.channel=channel;if(observation.image && index>0)observation.image={outcome:'missing',acquiredAt:null};}
          record.metadata.observations[2].description=`Synthetic retained structural needle ${index}`;
          record.metadata.current.channel=channel;if(index>0)record.metadata.current.image={outcome:'missing',acquiredAt:null};
          return record;
        });await chrome.storage.local.set({library});
      },workload);
      const started=Date.now();await page.reload();await expect(page.getByRole('article')).toHaveCount(workload.active);const loadMs=Date.now()-started;
      const searchStarted=Date.now();await page.getByRole('searchbox').fill('structural needle 17');await expect(page.getByRole('article')).toHaveCount(workload.total===1000?11:111);const searchMs=Date.now()-searchStarted;
      await page.getByRole('button',{name:/Matched description from/}).first().click();await expect(page.getByRole('region',{name:'Matched metadata version'})).toContainText('Synthetic retained structural needle');
      await page.getByRole('button',{name:'Close metadata'}).click();
      evidence.measurements.push({...workload,loadMs,searchMs});
    }
    await page.getByRole('searchbox').fill('00000000000');await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('checkbox',{name:'Select all current results',exact:true}).check();
    for(const density of ['Thumbnails','Compact']) {
      await page.getByRole('button',{name:density,exact:true}).click();
      await expect(page.getByRole('button',{name:density,exact:true})).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('#records')).toHaveClass(new RegExp(`\\bdensity-${density.toLowerCase()}\\b`));
      await expect(page.locator('#records')).toHaveAttribute('aria-busy','false');
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        await takeScreenshot(page,{path:resolve(output,`${density}-${width}-selected.png`),fullPage:true});
        const details=page.getByRole('button',{name:/Metadata details: Metadata returned/});
        await expect(page.locator('#records')).toHaveAttribute('aria-busy','false');
        await details.focus();await expect(details).toBeFocused();await details.press('Enter');
        const dialog=page.getByRole('dialog',{name:'Metadata details'});await dialog.getByRole('button',{name:'History',exact:true}).click();
        await takeScreenshot(page,{path:resolve(output,`${density}-${width}-history.png`),fullPage:true});
        await dialog.getByRole('button',{name:'Close metadata'}).focus();await expect(dialog.getByRole('button',{name:'Close metadata'})).toBeFocused();await page.keyboard.press('Escape');
      }
    }
    console.log('metadata browse workload',JSON.stringify(evidence.measurements));
  }finally{await writeFile(resolve(output,'evidence.json'),JSON.stringify(evidence,null,2));await app.context.close();}
});
