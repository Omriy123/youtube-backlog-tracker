import { test, expect } from '@playwright/test';
import { launch } from './helpers.js';

async function seed(app) {
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
  await page.evaluate(async()=>{
    const records=[['one','Zulu','2026-01-01',90],['two','Alpha','2026-01-02',30],['three','Bravo','2026-01-03',null],['four','Delta',null,60],['five','Echo','2026-01-05',120]].map(([id,title,publicationDate,durationSeconds],index)=>({id,identity:`fixture:${id}`,url:`https://example.org/${id}`,user:{status:'active',destination:'Inbox',firstSavedAt:`2026-01-0${index+1}T12:00:00Z`,firstInboxExitAt:null,latestListEntryAt:`2026-01-0${index+1}T12:00:00Z`,revision:1,personalTitle:null,watchEvents:[],pendingReview:null},metadata:{publicationDate,durationSeconds,channelId:index%2?'channel-a':null,channelName:index%2?'Recorded channel':null,observations:[{title,source:'test-fixture',observedAt:'2026-01-01T12:00:00Z'}]}}));
    await chrome.storage.local.set({library:{version:1,records,history:[],lists:[],listSettings:{Inbox:{manualOrder:['one','two','three','four','five']}}}});
  });await page.reload();return page;
}
async function ids(page) {return page.locator('#records article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId));}
async function request(page,message) {return page.evaluate(message=>chrome.runtime.sendMessage(message),message);}

test('clickable headers and expandable Library dates persist honest sorts across density and reopening',async()=>{
  const app=await launch();try {
    const page=await seed(app);
    await page.getByRole('button',{name:'Sort by Title',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['two','three','four','five','one']);
    await page.getByRole('button',{name:'Sort by Title',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['one','five','four','three','two']);
    await page.getByRole('button',{name:'Sort by Duration',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['two','four','one','five','three']);
    await page.getByRole('button',{name:'Compact',exact:true}).click();
    await page.getByText('Library dates',{exact:true}).click();
    await page.getByRole('button',{name:'Sort by First Inbox-exit',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['one','two','three','four','five']);
    await expect(page.locator('#records')).toContainText('First Inbox-exit: Unknown');
    await page.reload();
    await expect(page.getByRole('button',{name:'Compact',exact:true})).toHaveAttribute('aria-pressed','true');
    expect((await request(page,{type:'list'})).organizationPreferences.videoSort.key).toBe('firstInboxExitAt');
  }finally{await app.context.close();}
});

test('filtered Place preserves saved Manual and dates; presentation retains temporary order and filter changes reset it',async()=>{
  const app=await launch();try {
    const page=await seed(app);const before=await page.evaluate(()=>chrome.storage.local.get('library'));
    await page.getByRole('searchbox').fill('https://example.org/');
    await page.locator('[data-record-id=five]').getByRole('button',{name:'Place video',exact:true}).click();
    const place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('one');await place.getByRole('button',{name:'Place here',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);
    expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    await page.getByRole('button',{name:'Compact',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);
    await page.setViewportSize({width:430,height:780});await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);
    await page.getByRole('searchbox').fill('');await expect.poll(()=>ids(page)).toEqual(['one','two','three','four','five']);
    await page.getByRole('searchbox').fill('https://example.org/');await expect.poll(()=>ids(page)).toEqual(['one','two','three','four','five']);
  }finally{await app.context.close();}
});

test('unfiltered Place adopts displayed sort, survives restart and Undo protects a later conflict',async()=>{
  let app=await launch();try {
    let page=await seed(app);await page.getByRole('button',{name:'Sort by Title',exact:true}).click();
    await page.locator('[data-record-id=one]').getByRole('button',{name:'Place video',exact:true}).click();
    await page.getByRole('dialog',{name:'Place videos',exact:true}).getByRole('combobox').selectOption('three');
    await page.getByRole('button',{name:'Place here',exact:true}).click();
    await expect.poll(()=>ids(page)).toEqual(['two','one','three','four','five']);
    const action=(await request(page,{type:'list'})).organizationActions.at(-1);
    expect(action.command).toBe('arrangeVideos');
    const profile=app.profile;await app.context.close();app=await launch(profile);page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await expect.poll(()=>ids(page)).toEqual(['two','one','three','four','five']);
    await page.locator('[data-record-id=five]').getByRole('button',{name:'Place video',exact:true}).click();
    await page.getByRole('dialog',{name:'Place videos',exact:true}).getByRole('combobox').selectOption('one');await page.getByRole('button',{name:'Place here',exact:true}).click();
    expect((await request(page,{type:'organizationUndo',actionId:action.id})).ok).toBe(false);
    await expect.poll(()=>ids(page)).toEqual(['two','five','one','three','four']);
  }finally{await app.context.close();}
});

test('exact insertion marker and ordinary row drag move one video without opening it',async()=>{
  const app=await launch();try {
    const page=await seed(app);const tabs=(await app.context.pages()).length;
    const source=page.locator('[data-record-id=five]');const target=page.locator('[data-record-id=one]');
    const dataTransfer=await page.evaluateHandle(()=>new DataTransfer());
    await source.dispatchEvent('dragstart',{dataTransfer});const box=await target.boundingBox();
    await target.dispatchEvent('dragover',{dataTransfer,clientY:box.y+1});await expect(target).toHaveClass(/insert-before/);
    await target.dispatchEvent('drop',{dataTransfer,clientY:box.y+1});
    await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);
    await expect(page.locator('.insert-before,.insert-after')).toHaveCount(0);
    expect((await app.context.pages()).length).toBe(tabs);
    expect((await request(page,{type:'list'})).records.every(record=>record.user.status==='active')).toBe(true);
  }finally{await app.context.close();}
});

test('automated mouse drag can start on the opening title and release without opening a tab',async()=>{
  const app=await launch();try {
    const page=await seed(app);await page.setViewportSize({width:1440,height:2400});const tabCount=app.context.pages().length;
    await page.locator('[data-record-id=five] .title-target').dragTo(page.locator('[data-record-id=one]'),{targetPosition:{x:10,y:1}});
    await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);expect(app.context.pages()).toHaveLength(tabCount);
    expect((await request(page,{type:'list'})).records.every(record=>record.user.status==='active')).toBe(true);
  }finally{await app.context.close();}
});

test('overview statistics keep unknown duration honest and Place adopts displayed order as Importance',async()=>{
  const app=await launch();try {
    const page=await seed(app);
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.lists=[{id:'z',name:'Zebra',importance:0,manualOrder:[],publicationDirection:'asc'},{id:'a',name:'Alpha',importance:1,manualOrder:[],publicationDirection:'asc'},{id:'m',name:'Middle',importance:2,manualOrder:[],publicationDirection:'asc'}];library.records[0].user.destination='z';library.records[2].user.destination='z';await chrome.storage.local.set({library});});
    await page.reload();await page.getByRole('button',{name:'Sort lists by Name',exact:true}).click();
    const names=()=>page.locator('nav [data-view]').evaluateAll(buttons=>buttons.map(button=>button.dataset.view));
    await expect.poll(names).toEqual(['Entire Library','Inbox','a','m','z','Backlog']);
    await expect(page.getByRole('navigation').getByRole('button',{name:'Zebra',exact:true})).toContainText('2 videos · 1m known · 1 duration unknown');
    expect((await request(page,{type:'list'})).lists.filter(list=>!list.permanent).map(list=>list.id)).toEqual(['z','a','m']);
    await page.getByRole('combobox',{name:'Watch list to place',exact:true}).selectOption('z');await page.getByRole('combobox',{name:'Watch list insertion position',exact:true}).selectOption('m');
    await page.getByRole('button',{name:'Place watch list',exact:true}).click();
    await expect.poll(names).toEqual(['Entire Library','Inbox','a','z','m','Backlog']);
    expect((await request(page,{type:'list'})).organizationPreferences.overviewSort.key).toBe('importance');
  }finally{await app.context.close();}
});

test('filtered 1,5 arrangement restores all five saved anchors and ignores unrelated list changes',async()=>{
  const app=await launch();try {
    const page=await seed(app);await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].user.personalTitle='Edge one';library.records[4].user.personalTitle='Edge five';library.lists=[{id:'other',name:'Other',importance:0,manualOrder:[],publicationDirection:'asc'}];const side=structuredClone(library.records[1]);side.id='side';side.user.destination='other';library.records.push(side);await chrome.storage.local.set({library});});await page.reload();
    await page.getByRole('searchbox').fill('Edge');await expect.poll(()=>ids(page)).toEqual(['one','five']);
    await page.locator('[data-record-id=five]').getByRole('button',{name:'Place video',exact:true}).click();await page.getByRole('dialog',{name:'Place videos',exact:true}).getByRole('combobox').selectOption('one');await page.getByRole('button',{name:'Place here',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['five','one']);
    await request(page,{type:'arrangeVideos',destinationId:'other',displayedIds:['side'],movedIds:['side'],beforeId:null,expectedManualOrder:[]});
    await request(page,{type:'renameList',listId:'other',name:'Renamed other'});await expect.poll(()=>ids(page)).toEqual(['five','one']);
    await page.getByRole('searchbox').fill('');await page.getByRole('button',{name:'Manual',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['one','two','three','four','five']);
    const state=await page.evaluate(()=>chrome.storage.local.get('library'));expect(state.library.listSettings.Inbox.manualOrder).toEqual(['one','two','three','four','five']);expect(state.library.history.filter(item=>item.command==='arrangeVideos' && item.destinationId==='Inbox')).toHaveLength(0);
  }finally{await app.context.close();}
});

test('failed Place keeps dialog available and saved organization/history unchanged for retry',async()=>{
  const app=await launch(undefined,{failWrite:1});try {
    const page=await seed(app);const before=await page.evaluate(()=>chrome.storage.local.get('library'));
    await page.locator('[data-record-id=five]').getByRole('button',{name:'Place video',exact:true}).click();const place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('one');await place.getByRole('button',{name:'Place here',exact:true}).click();
    await expect(place.getByRole('status')).toContainText('not saved');expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);await expect.poll(()=>ids(page)).toEqual(['one','two','three','four','five']);
    await place.getByRole('button',{name:'Place here',exact:true}).click();await expect(place).not.toBeVisible();await expect.poll(()=>ids(page)).toEqual(['five','one','two','three','four']);
  }finally{await app.context.close();}
});

test('a second Library window changing saved order rejects stale Place without partial history',async()=>{
  const app=await launch();try {
    const page=await seed(app);await page.locator('[data-record-id=five]').getByRole('button',{name:'Place video',exact:true}).click();const place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('one');
    const second=await app.context.newPage();await second.goto(`${app.base}/library.html`);const changed=await request(second,{type:'arrangeVideos',destinationId:'Inbox',displayedIds:['one','two','three','four','five'],movedIds:['three'],beforeId:'one',expectedManualOrder:['one','two','three','four','five']});expect(changed.ok).toBe(true);
    const before=await second.evaluate(()=>chrome.storage.local.get('library'));await page.bringToFront();await place.getByRole('button',{name:'Place here',exact:true}).click();await expect(place.getByRole('status')).toContainText('changed');expect(await second.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
  }finally{await app.context.close();}
});

for(const fixture of [{name:'baseline',active:1000,total:1000,channels:100,lists:8},{name:'growth',active:1900,total:3000,channels:550,lists:24}]) test(`sort and Place responsiveness with ${fixture.name} workload`,async({},testInfo)=>{
  test.setTimeout(90000);const app=await launch();try {
    const page=await app.context.newPage();await page.setViewportSize({width:1440,height:1000});await page.goto(`${app.base}/library.html`);
    await page.evaluate(async fixture=>{
      const lists=Array.from({length:fixture.lists},(_,index)=>({id:`list-${index}`,name:`List ${index+1}`,importance:index,manualOrder:[],publicationDirection:'asc'}));
      const records=Array.from({length:fixture.total},(_,index)=>({id:`v${index}`,identity:`fixture:${index}`,url:`https://example.org/${index}`,user:{status:index<fixture.active?'active':'watched',destination:index<Math.floor(fixture.active*.7)?'Inbox':`list-${index%fixture.lists}`,firstSavedAt:'2026-01-01T12:00:00Z',firstInboxExitAt:null,latestListEntryAt:'2026-01-01T12:00:00Z',personalTitle:null,revision:1,watchEvents:[],pendingReview:null},metadata:{publicationDate:index%9?new Date(Date.UTC(2026,0,1+index%180)).toISOString():null,durationSeconds:index%7?60+index%3600:null,channelId:index%11?`channel-${index%fixture.channels}`:null,channelName:index%11?`Channel ${index%fixture.channels}`:null,observations:[{title:`Video ${String(index).padStart(5,'0')}`,source:'test-fixture',observedAt:'2026-01-01T12:00:00Z'}]}}));
      await chrome.storage.local.set({library:{version:1,lists,records,history:[]}});
    },fixture);
    const opening=performance.now();await page.reload();await expect(page.locator('#records article')).toHaveCount(Math.floor(fixture.active*.7));const renderMs=performance.now()-opening;
    // Resolve automation locators before timing: accessibility-tree traversal
    // is runner overhead, not application interaction latency.
    const sortButton=await page.getByRole('button',{name:'Sort by Title',exact:true}).elementHandle();await sortButton.evaluate(button=>{window.interactionStarted=performance.now();button.click();});await page.waitForFunction(()=>document.querySelector('[aria-label="Sort by Title"][aria-pressed=true]'));const sortMs=await page.evaluate(()=>performance.now()-window.interactionStarted);
    const last=`v${Math.floor(fixture.active*.7)-1}`;const placeButton=await page.locator(`[data-record-id=${last}]`).getByRole('button',{name:'Place video',exact:true}).elementHandle();await placeButton.evaluate(button=>{window.interactionStarted=performance.now();button.click();});await page.waitForFunction(()=>document.querySelector('dialog[data-place][open]'));const placePreviewMs=await page.evaluate(()=>performance.now()-window.interactionStarted);
    const dialog=page.getByRole('dialog',{name:'Place videos',exact:true});await dialog.getByRole('combobox').selectOption('v0');const confirm=await dialog.getByRole('button',{name:'Place here',exact:true}).elementHandle();await confirm.evaluate(button=>{window.interactionStarted=performance.now();button.click();});await page.waitForFunction(last=>document.querySelector('#records article')?.dataset.recordId===last,last);const placeMs=await page.evaluate(()=>performance.now()-window.interactionStarted);
    const measurements={...fixture,viewport:{width:1440,height:1000},zoom:1,activation:'in-page button activation; locator resolution excluded',renderMs,sortMs,placePreviewMs,placeMs};console.log('arrangement workload',JSON.stringify(measurements));await testInfo.attach('arrangement-workload.json',{body:JSON.stringify(measurements,null,2),contentType:'application/json'});
  }finally{await app.context.close();}
});
