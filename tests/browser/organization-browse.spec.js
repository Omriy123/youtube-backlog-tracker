import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';

async function fixture(app) {
  const { popup } = await capture(app, 'https://example.org/browse', 'Original bridge');
  await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
  await app.worker.evaluate(async () => {
    const { library } = await chrome.storage.local.get('library');
    const base = library.records[0];
    library.lists = [{ id:'list-a', name:'Tonight', importance:0, manualOrder:[], publicationDirection:'asc' }];
    library.records = Array.from({length:9}, (_,index) => ({ ...structuredClone(base), id:`r${index}`, identity:`fixture${index}`, url:`https://example.org/fixture${index}`,
      user:{...base.user,destination:index===8?'list-a':'Inbox'},
      metadata:{channelId:index===7?null:`c${index===8?0:index%7}`,channelName:index<2||index===8?'Same name':`Channel ${index%7}`,durationSeconds:index?100:null,
        observations:[{title:`Original bridge ${index}`,description:'Original description',source:'fixture',observedAt:'2026-10-20T10:00:00Z'}, {title:`Latest ${index}`,description:'Retained needle',source:'fixture',observedAt:'2026-10-21T10:00:00Z'},{title:`Current ${index}`,description:'Current description',source:'fixture',observedAt:'2026-10-22T10:00:00Z'}]}
    }));
    library.records.push({...structuredClone(base),id:'watched-fixture',user:{...base.user,status:'watched'}});
    await chrome.storage.local.set({library});
  });
}

test('channel scopes reverse together, count other channels, retain filters and group destinations', async () => {
  const app=await launch(); try {
    await fixture(app); const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await expect(page.getByRole('article')).toHaveCount(8);
    await expect(page.getByRole('button',{name:'Channel unknown · 1',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Show all 7 channels',exact:true}).click();
    await page.getByRole('button',{name:'Same name · 1',exact:true}).first().click();
    await page.getByRole('searchbox').fill('bridge');
    await expect(page.getByRole('article')).toHaveCount(1);
    const toggle=page.getByRole('button',{name:'Search entire Library',exact:true});
    const before=await toggle.boundingBox();await toggle.click();
    await expect(page.getByRole('button',{name:'Across Library',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('article')).toHaveCount(2);
    expect(await toggle.boundingBox()).toEqual(before);
    await page.getByRole('button',{name:'Open Tonight',exact:true}).click();
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('searchbox')).toHaveValue('bridge');
    await page.getByRole('button',{name:'Across Library',exact:true}).click();
    await page.getByRole('button',{name:'Across Library',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Tonight',exact:true})).toBeVisible();
    await page.getByRole('searchbox').fill('no such result');
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('button',{name:/Same name · 0/})).toBeVisible();
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await expect(page.getByRole('article')).toHaveCount(1);
  } finally {await app.context.close();}
});

test('retained descriptions inspect exact source, presentation survives reopen and browsing never changes membership', async()=>{
  const app=await launch();try {
    await fixture(app);const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    const before=await app.worker.evaluate(async()=> (await chrome.storage.local.get('library')).library.records);
    await page.getByRole('searchbox').fill('Retained needle');await expect(page.getByRole('article')).toHaveCount(8);
    await page.getByRole('button',{name:/Matched description from/}).first().click();
    await expect(page.getByRole('dialog')).toContainText('Retained needle');await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Compact',exact:true}).click();await page.getByRole('button',{name:'Rows',exact:true}).click();
    await page.reload();await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByRole('button',{name:'Compact',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('button',{name:'Rows',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await app.worker.evaluate(async()=> (await chrome.storage.local.get('library')).library.records)).toEqual(before);
  }finally {await app.context.close();}
});



test('shortcuts stay anchored, identities stay distinct, own-channel counts and URL-only scope stay truthful', async()=>{
  const app=await launch();try{
    await fixture(app);const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    const anchor=await page.locator('[data-channel-id]').evaluateAll(buttons=>buttons.map(button=>button.dataset.channelId));
    expect(anchor).toEqual(['c2','c3','c4','c5','c6','__unknown__']);
    await page.getByRole('searchbox').fill('bridge 0');
    expect(await page.locator('[data-channel-id]').evaluateAll(buttons=>buttons.map(button=>button.dataset.channelId))).toEqual(anchor);
    await expect(page.getByRole('button',{name:'Channel 2 · 0',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Show all 7 channels',exact:true}).click();
    await expect(page.locator('[data-channel-id=c0]')).toHaveAccessibleName('Same name · 1');
    await expect(page.locator('[data-channel-id=c0]')).toHaveAttribute('aria-description','Recorded channel identity: c0');
    await expect(page.locator('[data-channel-id=c0] .channel-identity')).toHaveText('c0');
    await expect(page.locator('[data-channel-id=c1]')).toHaveAccessibleName('Same name · 0');
    await page.locator('[data-channel-id=c0]').click();
    await page.getByRole('button',{name:'Show fewer channels',exact:true}).click();
    await expect(page.locator('[data-channel-id=c0]')).toBeVisible();
    await page.getByRole('searchbox').fill('bridge 1');
    await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('button',{name:'Show all 7 channels',exact:true}).click();
    await expect(page.locator('[data-channel-id=c1]')).toHaveAccessibleName('Same name · 1');
    await page.locator('[data-channel-id=c1]').click();await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.locator('[data-channel-id=c1]')).toBeFocused();
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.getByRole('searchbox').fill('Same name');await expect(page.getByRole('article')).toHaveCount(2);
    for(const name of ['Personal','Original','Intermediate','Latest'])await page.getByRole('checkbox',{name,exact:true}).uncheck();
    await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('searchbox').fill('fixture0');await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.getByRole('searchbox').fill('Retained needle');await expect(page.getByRole('article')).toHaveCount(8);
    await page.getByRole('checkbox',{name:'Intermediate',exact:true}).uncheck();await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('checkbox',{name:'Intermediate',exact:true}).check();await expect(page.getByRole('article')).toHaveCount(8);
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await page.locator('[data-channel-id=__unknown__]').click();await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article')).toContainText('Channel unknown');
  }finally{await app.context.close();}
});

test('channel count digit changes keep neighboring shortcut positions fixed',async()=>{
  const app=await launch();try{
    await fixture(app);
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');const seed=library.records[0];for(let index=0;index<9;index++)library.records.push({...structuredClone(seed),id:`extra${index}`,identity:`extra${index}`,user:{...seed.user,destination:'list-a'}});await chrome.storage.local.set({library});});
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);await page.getByRole('button',{name:'Show all 7 channels',exact:true}).click();
    const before=await page.locator('[data-channel-id=c1]').boundingBox();
    await page.getByRole('button',{name:'Search entire Library',exact:true}).click();await expect(page.locator('[data-channel-id=c0]')).toContainText('11');
    expect(await page.locator('[data-channel-id=c1]').boundingBox()).toEqual(before);
  }finally{await app.context.close();}
});

test('Original description scope starts at its first usable observation and unchanged Latest stays quiet',async()=>{
  const app=await launch();try{
    await fixture(app);await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records=library.records.slice(0,1);library.records[0].metadata.observations=[{title:'Stable title',description:null,source:'fixture',observedAt:null},{title:'Stable title',description:'First usable description',source:'fixture',observedAt:'2026-10-21T00:00:00Z'},{title:'Stable title',description:'Newest description',source:'fixture',observedAt:'2026-10-22T00:00:00Z'}];await chrome.storage.local.set({library});});
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await expect(page.getByText(/^Latest: Stable title/)).toHaveCount(0);
    for(const name of ['Personal','Intermediate','Latest'])await page.getByRole('checkbox',{name,exact:true}).uncheck();
    await page.getByRole('searchbox').fill('First usable description');await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('button',{name:/Matched description from/}).click();await expect(page.getByRole('dialog')).toContainText('First usable description');
  }finally{await app.context.close();}
});

test('failed presentation persistence retains durable preference and permits retry',async()=>{
  const app=await launch(undefined,{failWrite:2});try{
    await fixture(app);const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'Compact',exact:true}).click();await expect(page.getByRole('status')).toContainText('not saved');
    await expect(page.getByRole('button',{name:'Thumbnails',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Compact',exact:true}).click();await expect(page.getByRole('button',{name:'Compact',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.reload();await expect(page.getByRole('button',{name:'Compact',exact:true})).toHaveAttribute('aria-pressed','true');
  }finally{await app.context.close();}
});

test('long historical description matches expose the matching excerpt',async()=>{
  const app=await launch();try{
    await fixture(app);await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records=library.records.slice(0,1);library.records[0].metadata.observations[1].description='Earlier context '.repeat(30)+'Deep historical needle';await chrome.storage.local.set({library});});
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);await page.getByRole('searchbox').fill('Deep historical needle');
    await expect(page.getByRole('button',{name:/Matched description from/})).toContainText('Deep historical needle');
  }finally{await app.context.close();}
});
