import {test,expect} from '@playwright/test';
import {launch,capture} from './helpers.js';

async function fixture(app,count=5) {
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
  await page.evaluate(async count=>{
    const record=(id,destination)=>({id,identity:`url:https://example.org/${id}`,url:`https://example.org/${id}`,user:{status:'active',destination,firstSavedAt:'2026-01-01T00:00:00Z',firstInboxExitAt:destination==='Inbox'?null:'2026-01-02T00:00:00Z',latestListEntryAt:'2026-01-02T00:00:00Z',revision:1,personalTitle:null,watchEvents:[],pendingReview:null},metadata:{channelId:`channel-${Number(id.slice(1))%2}`,channelName:`Channel ${Number(id.slice(1))%2}`,publicationDate:`2026-01-${String(Number(id.slice(1))%28+1).padStart(2,'0')}`,observations:[{title:`Video ${id}`,source:'test-fixture',observedAt:'2026-01-01T00:00:00Z'}]}});
    await chrome.storage.local.set({library:{version:1,records:Array.from({length:count},(_,index)=>record(`r${index+1}`,index===count-1?'later':'Inbox')),history:[],lists:[{id:'later',name:'Later',importance:0,manualOrder:[],publicationDirection:'asc'}]}});
  },count);await page.reload();return page;
}
const row=(page,id)=>page.locator(`article[data-record-id="${id}"]`);
const request=(page,message)=>page.evaluate(message=>chrome.runtime.sendMessage(message),message);

test('selection collects across searches and destinations with stable pointer, scoped sets and reopen reset',async()=>{
  const app=await launch();try{
    const page=await fixture(app);const first=row(page,'r1');
    const box=first.getByRole('checkbox',{name:'Select Video r1',exact:true});
    await box.scrollIntoViewIfNeeded();const before=await first.boundingBox();await box.click();expect(await first.boundingBox()).toEqual(before);
    await box.click();await expect(box).not.toBeChecked();await box.focus();await page.keyboard.press('Space');await expect(box).toBeFocused();
    await expect(page.getByRole('checkbox',{name:'Select all current results',exact:true})).toHaveJSProperty('indeterminate',true);
    await page.getByRole('searchbox').fill('Video r2');await page.getByRole('checkbox',{name:'Select all current results',exact:true}).check();
    await expect(page.getByRole('region',{name:'Selected videos',exact:true})).toContainText('2 selected');
    await page.getByRole('navigation').getByRole('button',{name:'Later',exact:true}).click();await page.getByRole('searchbox').fill('');await row(page,'r5').getByRole('checkbox').check();
    const panel=page.getByRole('region',{name:'Selected videos',exact:true});await expect(panel).toContainText('3 selected');await expect(panel).toContainText('Elsewhere');
    await page.getByRole('searchbox').fill('no match');await expect(page.getByRole('article')).toHaveCount(0);await expect(panel).toContainText('3 selected');
    await panel.getByRole('radio',{name:'Matches current filters (0)',exact:true}).check();await expect(panel.getByRole('button',{name:'Move selected (0)',exact:true})).toBeDisabled();
    await panel.getByRole('radio',{name:'All selected (3)',exact:true}).check();await page.getByRole('checkbox',{name:'Show only selected',exact:true}).check();
    await page.getByRole('searchbox').fill('');await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('checkbox',{name:'Show only selected',exact:true}).uncheck();await expect(page.getByRole('searchbox')).toHaveValue('');
    await page.reload();await expect(page.getByRole('checkbox',{name:'Show only selected',exact:true})).not.toBeChecked();await expect(page.getByRole('region',{name:'Selected videos',exact:true})).toContainText('0 selected');
  }finally{await app.context.close();}
});

test('split moves show shared and per-row destinations in source order, exclude pending explicitly and recover as one batch',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await row(page,'r2').getByRole('checkbox').check();await row(page,'r1').getByRole('checkbox').check();
    await page.getByRole('navigation').getByRole('button',{name:'Later',exact:true}).click();await row(page,'r5').getByRole('checkbox').check();
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='r2').user.pendingReview={previous:{status:'watched'}};await chrome.storage.local.set({library});});
    const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Move selected (3)',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Move videos',exact:true});expect(await dialog.locator('tbody tr td:first-child').allTextContents()).toEqual(['Video r1','Video r2','Video r5']);
    await dialog.getByRole('combobox',{name:'Shared destination',exact:true}).selectOption('Backlog');await dialog.getByRole('button',{name:'Set the same destination for all',exact:true}).click();
    await dialog.getByRole('combobox',{name:'Destination for Video r1',exact:true}).selectOption('later');
    await dialog.getByRole('checkbox',{name:'Exclude Video r2 from this move',exact:true}).check();
    await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(panel).toContainText('1 selected');
    const state=await request(page,{type:'list'});expect(state.records.find(record=>record.id==='r1').user.destination).toBe('later');expect(state.records.find(record=>record.id==='r5').user.destination).toBe('Backlog');expect(state.records.find(record=>record.id==='r2').user.pendingReview).toBeTruthy();
    await page.getByRole('button',{name:'Undo organization change',exact:true}).click();const restored=await request(page,{type:'list'});expect(restored.records.find(record=>record.id==='r1').user.destination).toBe('Inbox');expect(restored.records.find(record=>record.id==='r5').user.destination).toBe('later');
  }finally{await app.context.close();}
});

test('selected manual watches are one recoverable no-tab batch and rediscovery retains their true previous destination',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await row(page,'r1').getByRole('checkbox').check();await row(page,'r2').getByRole('checkbox').check();
    const tabs=await app.worker.evaluate(()=>chrome.tabs.query({}));const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Mark selected watched (2)',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Mark watched',exact:true});await expect(dialog).toContainText('Video r1');await dialog.getByRole('button',{name:'Confirm Mark watched',exact:true}).click();
    await expect(panel).toContainText('0 selected');expect(await app.worker.evaluate(()=>chrome.tabs.query({}))).toHaveLength(tabs.length);
    const saved=await page.evaluate(()=>chrome.storage.local.get('library'));for(const id of ['r1','r2']){const record=saved.library.records.find(record=>record.id===id);expect(record.user.status).toBe('watched');expect(record.user.watchEvents[0]).toMatchObject({source:'manual',destination:'Inbox'});}
    await page.getByRole('button',{name:'Undo organization change',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(4);
    await page.getByRole('navigation').getByRole('button',{name:'Later',exact:true}).click();await row(page,'r5').getByRole('button',{name:'Mark watched',exact:true}).click();await page.getByRole('dialog',{name:'Mark watched',exact:true}).getByRole('button',{name:'Confirm Mark watched',exact:true}).click();
    const captureResult=await capture(app,'https://example.org/r5','Video r5');await expect(captureResult.popup.getByRole('status')).toContainText('review pending');
    const requeued=await request(page,{type:'list'});const review=requeued.records.find(record=>record.id==='r5').user.pendingReview;expect(review.previous.destination).toBe('later');expect(review.previous.lastOpenedAt).toBeNull();expect(review.previous.lastWatchedAt).toBeTruthy();
    await page.getByRole('navigation').getByRole('button',{name:'Inbox',exact:true}).click();await row(page,'r5').getByRole('button',{name:'Review prior activity',exact:true}).click();const rediscovery=page.getByRole('dialog',{name:'Review prior activity',exact:true});await expect(rediscovery).toContainText('Previous destination: Later');await rediscovery.getByRole('button',{name:'Keep in Inbox',exact:true}).click();await row(page,'r5').getByRole('button',{name:'Mark watched',exact:true}).click();await page.getByRole('dialog',{name:'Mark watched',exact:true}).getByRole('button',{name:'Confirm Mark watched',exact:true}).click();const repeated=await page.evaluate(()=>chrome.storage.local.get('library'));expect(repeated.library.records.find(record=>record.id==='r5').user.watchEvents.map(event=>event.destination)).toEqual(['later','Inbox']);
  }finally{await app.context.close();}
});

test('recovery rejects newer relevant decisions even after values cycle, and sequential reversal remains possible',async()=>{
  const app=await launch();try{
    const page=await fixture(app);const first=await request(page,{type:'renameList',listId:'later',name:'B'});
    const second=await request(page,{type:'renameList',listId:'later',name:'C'});const third=await request(page,{type:'renameList',listId:'later',name:'B'});
    expect((await request(page,{type:'organizationUndo',actionId:first.actionId})).ok).toBe(false);
    expect((await request(page,{type:'organizationUndo',actionId:third.actionId})).ok).toBe(true);expect((await request(page,{type:'organizationUndo',actionId:second.actionId})).ok).toBe(true);expect((await request(page,{type:'organizationUndo',actionId:first.actionId})).ok).toBe(true);
    expect((await request(page,{type:'list'})).lists.find(list=>list.id==='later').name).toBe('Later');
  }finally{await app.context.close();}
});

test('selected group Place preserves selection and filtered lifetime; Ctrl drag carries current matches only',async()=>{
  const app=await launch();try{
    const page=await fixture(app,6);await row(page,'r2').getByRole('checkbox').check();await row(page,'r4').getByRole('checkbox').check();
    const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Place selected (2)',exact:true}).click();const place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('');await place.getByRole('button',{name:'Place here',exact:true}).click();
    expect(await page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r1','r3','r5','r2','r4']);await expect(panel).toContainText('2 selected');
    await page.getByRole('navigation').getByRole('button',{name:'Later',exact:true}).click();await row(page,'r6').getByRole('checkbox').check();await page.getByRole('navigation').getByRole('button',{name:'Inbox',exact:true}).click();
    await panel.getByRole('button',{name:'Place selected (3)',exact:true}).click();await expect(page.getByRole('dialog',{name:'Place selection scope',exact:true})).toContainText('outside current results');await page.getByRole('dialog',{name:'Place selection scope',exact:true}).getByRole('button',{name:'Cancel',exact:true}).click();
    await page.getByRole('searchbox').fill('Video r');
    await expect(page.getByRole('region',{name:'Saved videos',exact:true})).toHaveAttribute('aria-busy','false');
    await page.evaluate(()=>{const source=document.querySelector('article[data-record-id="r2"]');const target=document.querySelector('article[data-record-id="r1"]');const dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer,ctrlKey:true}));const rect=target.getBoundingClientRect();target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.top}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.top}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));});
    await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r2','r4','r1','r3','r5']);
    await page.getByRole('searchbox').fill('');await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r1','r3','r5','r2','r4']);await expect(panel).toContainText('3 selected');
  }finally{await app.context.close();}
});

test('failed selected status keeps the exact batch retryable and explicit Dismiss resolves pending without another prompt',async()=>{
  const app=await launch(undefined,{failWrite:1});try{
    const page=await fixture(app);await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].user.pendingReview={previous:{status:'watched'}};await chrome.storage.local.set({library});});await page.reload();
    await row(page,'r1').getByRole('checkbox').check();await row(page,'r2').getByRole('checkbox').check();const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Dismiss selected (2)',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Dismiss',exact:true});
    const before=await page.evaluate(()=>chrome.storage.local.get('library'));await dialog.getByRole('button',{name:'Confirm Dismiss',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('not saved');expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);await expect(panel).toContainText('2 selected');
    await dialog.getByRole('button',{name:'Confirm Dismiss',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(panel).toContainText('0 selected');const stored=await page.evaluate(()=>chrome.storage.local.get('library'));expect(stored.library.records.find(record=>record.id==='r1').user.pendingReview).toBeNull();expect(stored.library.records.find(record=>record.id==='r2').user.watchEvents).toHaveLength(0);
  }finally{await app.context.close();}
});

test('selected opened-but-unsaved stays selected until durable repair and failed tab creation also retains selection',async()=>{
  for(const options of [{failWrite:4},{failCreate:true}]) {
    const app=await launch(undefined,options);try{
      const captured=await capture(app,'https://example.org/selection-opening','Selected opening');await expect(captured.popup.getByRole('status')).toContainText('Saved to Inbox');const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);await page.getByRole('article').getByRole('checkbox').check();const panel=page.getByRole('region',{name:'Selected videos',exact:true});await page.getByRole('button',{name:'Open video',exact:true}).click();
      await expect(panel).toContainText('1 selected');await expect(page.getByRole('article')).toHaveCount(1);
      if(options.failWrite){await expect(page.getByRole('button',{name:'Repair Library update',exact:true})).toBeVisible();await page.getByRole('button',{name:'Repair Library update',exact:true}).click();await expect(panel).toContainText('0 selected');await expect(page.getByRole('article')).toHaveCount(0);}
      else await expect(page.locator('main > [role=status]')).toContainText('Could not create a browser tab');
    }finally{await app.context.close();}
  }
});

test('a stale split preview keeps row choices and requires another confirmation before any move',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await row(page,'r1').getByRole('checkbox').check();await row(page,'r2').getByRole('checkbox').check();const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Move selected (2)',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Move videos',exact:true});
    await dialog.getByRole('combobox',{name:'Destination for Video r1',exact:true}).selectOption('later');await dialog.getByRole('combobox',{name:'Destination for Video r2',exact:true}).selectOption('Backlog');
    await request(page,{type:'renameList',listId:'later',name:'Later renamed'});const before=await page.evaluate(()=>chrome.storage.local.get('library'));await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('changed');expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    await expect(dialog.getByRole('combobox',{name:'Destination for Video r1',exact:true})).toHaveValue('later');await expect(dialog.getByRole('combobox',{name:'Destination for Video r2',exact:true})).toHaveValue('Backlog');await expect(panel).toContainText('2 selected');await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(panel).toContainText('0 selected');
  }finally{await app.context.close();}
});

test('split swaps remove outgoing rows first, preserve no-op dates and recover atomically',async()=>{
  const app=await launch();try{
    const page=await fixture(app);const before=await page.evaluate(()=>chrome.storage.local.get('library'));
    const preview=await request(page,{type:'organizationPreview',rows:[{recordId:'r1',to:'later'},{recordId:'r5',to:'Backlog'},{recordId:'r2',to:'Backlog'},{recordId:'r3',to:'keep'}]});const moved=await request(page,{type:'organizationCommit',preview:preview.preview});expect(moved.ok).toBe(true);
    const stored=await page.evaluate(()=>chrome.storage.local.get('library'));expect(stored.library.records.find(record=>record.id==='r3').user).toEqual(before.library.records.find(record=>record.id==='r3').user);expect(stored.library.lists.find(list=>list.id==='later').manualOrder).toEqual(['r1']);expect(stored.library.listSettings.Backlog.manualOrder).toEqual(['r2','r5']);
    expect((await request(page,{type:'organizationUndo',actionId:moved.actionId})).ok).toBe(true);const restored=await request(page,{type:'list'});expect(restored.records.find(record=>record.id==='r1').user.destination).toBe('Inbox');expect(restored.records.find(record=>record.id==='r5').user.destination).toBe('later');
  }finally{await app.context.close();}
});

test('selected-only checkbox edits preserve surviving temporary order and review decisions reset it',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.getByRole('checkbox',{name:'Select all current results',exact:true}).check();await page.getByRole('checkbox',{name:'Show only selected',exact:true}).check();
    await row(page,'r4').getByRole('button',{name:'Place video',exact:true}).click();let place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('r1');await place.getByRole('button',{name:'Place here',exact:true}).click();
    await row(page,'r2').getByRole('checkbox').click();await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r4','r1','r3']);
    await page.getByRole('checkbox',{name:'Show only selected',exact:true}).uncheck();await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r1','r2','r3','r4']);
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='r1').user.pendingReview={previous:{status:'watched'}};await chrome.storage.local.set({library});});await page.getByRole('searchbox').fill('Video r');
    await row(page,'r4').getByRole('button',{name:'Place video',exact:true}).click();place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('r1');await place.getByRole('button',{name:'Place here',exact:true}).click();await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r4','r1','r2','r3']);
    await row(page,'r1').getByRole('button',{name:'Review prior activity',exact:true}).click();await page.getByRole('dialog',{name:'Review prior activity',exact:true}).getByRole('button',{name:'Keep in Inbox',exact:true}).click();await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r1','r2','r3','r4']);
  }finally{await app.context.close();}
});

test('offscreen selected matches participate in Ctrl drag, ordinary drag stays single and destination drops require preview',async()=>{
  const app=await launch();try{
    const page=await fixture(app,10);await row(page,'r2').getByRole('checkbox').check();await row(page,'r8').getByRole('checkbox').check();await page.getByRole('navigation').getByRole('button',{name:'Later',exact:true}).click();await row(page,'r10').getByRole('checkbox').check();await page.getByRole('navigation').getByRole('button',{name:'Inbox',exact:true}).click();
    async function drag(sourceId,targetId,ctrlKey=false) {
      await page.evaluate(({sourceId,targetId,ctrlKey})=>{const source=document.querySelector(`article[data-record-id="${sourceId}"]`);const target=document.querySelector(`article[data-record-id="${targetId}"]`);const dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer,ctrlKey}));const rect=target.getBoundingClientRect();target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.top}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.top}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));},{sourceId,targetId,ctrlKey});
    }
    await row(page,'r2').scrollIntoViewIfNeeded();expect((await row(page,'r8').boundingBox()).y).toBeGreaterThan((await page.viewportSize()).height);
    await drag('r2','r1',true);await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r2','r8','r1','r3','r4','r5','r6','r7','r9']);
    await drag('r2','r4');await expect.poll(async()=>page.getByRole('article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId))).toEqual(['r8','r1','r3','r2','r4','r5','r6','r7','r9']);const before=await page.evaluate(()=>chrome.storage.local.get('library'));await drag('r2','r2',true);expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    await page.evaluate(()=>{const source=document.querySelector('article[data-record-id="r2"]');const target=document.querySelector('nav [data-view="Backlog"]');const dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer,ctrlKey:true}));target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}));});
    const dialog=page.getByRole('dialog',{name:'Move videos',exact:true});await expect(dialog).toBeVisible();expect(await dialog.locator('tbody tr td:first-child').allTextContents()).toEqual(['Video r8','Video r2']);await expect(dialog.getByRole('combobox',{name:'Destination for Video r2',exact:true})).toHaveValue('Backlog');expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('region',{name:'Selected videos',exact:true})).toContainText('3 selected');
  }finally{await app.context.close();}
});

test('batch arrival fitting uses current publication metadata and respects an explicitly missing current date',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].metadata.current={publicationDate:'2026-01-20'};library.records[1].metadata.current={publicationDate:null};await chrome.storage.local.set({library});});
    const prepared=await request(page,{type:'organizationPreview',rows:[{recordId:'r1',to:'later'},{recordId:'r2',to:'later'}]});expect((await request(page,{type:'organizationCommit',preview:prepared.preview})).ok).toBe(true);
    const stored=await page.evaluate(()=>chrome.storage.local.get('library'));expect(stored.library.lists[0].manualOrder).toEqual(['r5','r1','r2']);
  }finally{await app.context.close();}
});

test('Mark watched requires separate review or explicit exclusion and failed split moves retain selection',async()=>{
  const app=await launch(undefined,{failWrite:2});try{
    const page=await fixture(app);await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].user.pendingReview={previous:{status:'watched'}};await chrome.storage.local.set({library});});await page.reload();await row(page,'r1').getByRole('checkbox').check();await row(page,'r2').getByRole('checkbox').check();const panel=page.getByRole('region',{name:'Selected videos',exact:true});
    await panel.getByRole('button',{name:'Mark selected watched (2)',exact:true}).click();const status=page.getByRole('dialog',{name:'Mark watched',exact:true});await status.getByRole('button',{name:'Confirm Mark watched',exact:true}).click();const review=page.getByRole('dialog',{name:'Review prior activity',exact:true});await review.getByRole('button',{name:'Keep in Inbox',exact:true}).click();await expect(status.getByRole('status')).toContainText('Review resolved');expect((await request(page,{type:'list'})).records.find(record=>record.id==='r1').user.status).toBe('active');await status.getByRole('button',{name:'Cancel',exact:true}).click();
    await panel.getByRole('button',{name:'Move selected (2)',exact:true}).click();const move=page.getByRole('dialog',{name:'Move videos',exact:true});await move.getByRole('combobox',{name:'Shared destination',exact:true}).selectOption('Backlog');await move.getByRole('button',{name:'Set the same destination for all',exact:true}).click();const before=await page.evaluate(()=>chrome.storage.local.get('library'));await move.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(move.getByRole('status')).toContainText('not saved');await expect(panel).toContainText('2 selected');expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);await move.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(panel).toContainText('0 selected');
  }finally{await app.context.close();}
});

test('Manual and importance recovery protect newer cyclic decisions while unrelated renames remain independent',async()=>{
  const app=await launch();try{
    const page=await fixture(app);const added=await request(page,{type:'createList',name:'Other'});
    const importance=await request(page,{type:'setListImportance',listIds:[added.list.id,'later']});await request(page,{type:'setListImportance',listIds:['later',added.list.id]});await request(page,{type:'setListImportance',listIds:[added.list.id,'later']});expect((await request(page,{type:'organizationUndo',actionId:importance.actionId})).ok).toBe(false);
    async function arrange(beforeId){const state=await request(page,{type:'list'});const saved=state.lists.find(list=>list.id==='Inbox').manualOrder;return request(page,{type:'arrangeVideos',destinationId:'Inbox',displayedIds:saved.length?saved:['r1','r2','r3','r4'],movedIds:['r4'],beforeId,expectedManualOrder:saved});}
    const manual=await arrange('r1');await arrange(null);await arrange('r1');expect((await request(page,{type:'organizationUndo',actionId:manual.actionId})).ok).toBe(false);
  }finally{await app.context.close();}
});

test('batch recovery survives restart and selected-only channel counts substitute each channel without reanchoring',async()=>{
  let app=await launch();try{
    let page=await fixture(app);await row(page,'r1').getByRole('checkbox').check();await row(page,'r2').getByRole('checkbox').check();const anchor=await page.locator('#browse-controls [data-channel-id]').evaluateAll(buttons=>buttons.map(button=>button.dataset.channelId));await page.getByRole('checkbox',{name:'Show only selected',exact:true}).check();
    await page.getByRole('button',{name:'Channel 1 · 1',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(1);await expect(page.getByRole('button',{name:'Channel 0 · 1',exact:true})).toBeVisible();expect(await page.locator('#browse-controls [data-channel-id]').evaluateAll(buttons=>buttons.map(button=>button.dataset.channelId))).toEqual(anchor);await page.getByRole('button',{name:'All channels',exact:true}).click();
    const panel=page.getByRole('region',{name:'Selected videos',exact:true});await panel.getByRole('button',{name:'Move selected (2)',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Move videos',exact:true});await dialog.getByRole('combobox',{name:'Shared destination',exact:true}).selectOption('Backlog');await dialog.getByRole('button',{name:'Set the same destination for all',exact:true}).click();await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(panel).toContainText('0 selected');const profile=app.profile;await app.context.close();app=await launch(profile);page=await app.context.newPage();await page.goto(`${app.base}/library.html`);await page.getByRole('button',{name:'Undo organization change',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(4);expect((await request(page,{type:'list'})).records.filter(record=>['r1','r2'].includes(record.id)).every(record=>record.user.destination==='Inbox')).toBe(true);
  }finally{await app.context.close();}
});
