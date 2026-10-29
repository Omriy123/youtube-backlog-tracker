import {test,expect} from '@playwright/test';
import {launch,capture} from './helpers.js';

export async function removalFixture(app,{pending=false}={}){
  const {popup}=await capture(app,'https://example.org/removal-base','Captured base');await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
  await app.worker.evaluate(async pending=>{
    const {library}=await chrome.storage.local.get('library');const base=library.records[0];
    library.lists=[{id:'alpha',name:'Alpha',importance:0,manualOrder:['a2','a0','a3','a1'],publicationDirection:'asc'},{id:'beta',name:'Beta',importance:1,manualOrder:['b0'],publicationDirection:'asc'},{id:'empty',name:'Empty',importance:2,manualOrder:[],publicationDirection:'desc'}];
    library.records=['i0','a0','a1','a2','a3','b0','retained'].map((id,index)=>({...structuredClone(base),id,identity:`fixture-${id}`,url:`https://example.org/${id}`,user:{...base.user,destination:id==='i0'?'Inbox':id==='b0'?'beta':'alpha',status:id==='retained'?'watched':'active',firstInboxExitAt:'2026-10-01T00:00:00Z',latestListEntryAt:'2026-10-02T00:00:00Z'},metadata:{channelId:index%2?'known':'other',channelName:index%2?'Known channel':'Other channel',publicationDate:`2026-10-${String(index+1).padStart(2,'0')}T00:00:00Z`,observations:[{title:`${id} ${id==='a0'||id==='a2'?'bridge':'lesson'}`,source:'synthetic-test-fixture',observedAt:'2026-10-02T00:00:00Z'}]}}));
    if(pending)library.records.find(record=>record.id==='a1').user.pendingReview={queuedAt:'2026-10-02T00:00:00Z',previous:{status:'watched',destination:'alpha',lastActivityAt:null,lastOpenedAt:null,dismissedAt:null,user:{},activity:[]}};
    await chrome.storage.local.set({library});
  },pending);
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);await expect(page.getByRole('article')).toHaveCount(1);return page;
}
const send=(page,message)=>page.evaluate(message=>chrome.runtime.sendMessage(message),message);
const durable=app=>app.worker.evaluate(async()=> (await chrome.storage.local.get('library')).library);

test('removal commands protect permanent lists, full scope and the Inbox exception',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);
    expect((await send(page,{type:'removalPreview',listId:'Inbox',scope:'whole'})).ok).toBe(false);
    const initial=await send(page,{type:'removalPreview',listId:'alpha',scope:'whole'});expect(initial.ok).toBe(true);expect(initial.preview.rows).toHaveLength(4);expect(initial.preview.effect).toBe(null);expect(initial.preview.to).toBe(null);
    expect((await send(page,{type:'removalCommit',preview:initial.preview})).ok).toBe(false);
    expect((await send(page,{type:'removalPreview',listId:'alpha',scope:'matches',recordIds:['a0'],effect:'move',to:'Inbox',allowInbox:true})).ok).toBe(false);
    const before=await durable(app);
    const preview=await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'move',to:'Inbox'});expect(preview.ok).toBe(true);
    const result=await send(page,{type:'removalCommit',preview:preview.preview});expect(result.ok).toBe(true);expect(result.processedIds.sort()).toEqual(['a0','a1','a2','a3']);expect(result.deletedListId).toBe('alpha');
    const after=await durable(app);expect(after.lists.some(list=>list.id==='alpha')).toBe(false);expect(after.records.filter(record=>record.user.status==='active'&&record.user.destination==='Inbox')).toHaveLength(5);expect(after.records.find(record=>record.id==='retained')).toEqual(before.records.find(record=>record.id==='retained'));expect(after.history.filter(item=>item.command==='removalCommit')).toHaveLength(1);
    expect((await send(page,{type:'organizationUndo',actionId:result.actionId})).ok).toBe(true);
    const restored=await durable(app);expect(restored.lists.find(list=>list.id==='alpha')).toEqual(before.lists.find(list=>list.id==='alpha'));for(const record of before.records)expect({...restored.records.find(item=>item.id===record.id).user,revision:record.user.revision}).toMatchObject(record.user);
  }finally{await app.context.close();}
});

test('whole deletion includes hidden titles and requires explicit effect and destination',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('searchbox').fill('bridge');await expect(page.getByRole('article')).toHaveCount(2);
    await page.getByRole('button',{name:'Delete entire list',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Delete entire list',exact:true});
    await expect(dialog).toContainText('4 active videos');for(const id of ['a0','a1','a2','a3'])await expect(dialog).toContainText(id);
    await expect(dialog.getByRole('combobox',{name:'Removal effect',exact:true})).toHaveValue('');await expect(dialog.getByRole('button',{name:'Confirm deletion',exact:true})).toBeDisabled();
    await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('move');await expect(dialog.getByRole('combobox',{name:'Removal destination',exact:true})).toHaveValue('');
    await dialog.getByRole('combobox',{name:'Removal destination',exact:true}).selectOption('Inbox');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Inbox',exact:true})).toBeVisible();await expect(page.getByRole('searchbox')).toHaveValue('bridge');await expect(page.getByRole('article')).toHaveCount(2);await expect(page.getByRole('button',{name:'Alpha',exact:true})).toHaveCount(0);
  }finally{await app.context.close();}
});

test('matching selected-only removal preserves hidden members, the list and unrelated selection',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await page.getByRole('button',{name:'Beta',exact:true}).click();await page.getByRole('checkbox',{name:'Select b0 lesson',exact:true}).check();await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('checkbox',{name:'Select a0 bridge',exact:true}).check();await page.getByRole('searchbox').fill('bridge');await page.getByRole('checkbox',{name:'Show only selected',exact:true}).check();await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('button',{name:'Remove matching videos',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Remove matching videos',exact:true});await expect(dialog).toContainText('1 active video');await expect(dialog).toContainText('a0 bridge');await expect(dialog).not.toContainText('a2 bridge');
    await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('move');await expect(dialog.getByRole('combobox',{name:'Removal destination',exact:true}).getByRole('option',{name:'Inbox',exact:true})).toHaveCount(0);
    await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');await dialog.getByRole('button',{name:'Confirm matching removal',exact:true}).click();await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('heading',{name:'Alpha',exact:true})).toBeVisible();await expect(page.getByRole('article')).toHaveCount(0);await expect(page.getByRole('checkbox',{name:'Show only selected',exact:true})).toBeChecked();await expect(page.getByRole('searchbox')).toHaveValue('bridge');await expect(page.getByRole('heading',{name:'1 selected',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Selected videos'})).toContainText('b0 lesson');
    const state=await durable(app);expect(state.lists.some(list=>list.id==='alpha')).toBe(true);expect(state.records.filter(record=>record.user.destination==='alpha'&&record.user.status==='active')).toHaveLength(3);expect(state.records.find(record=>record.id==='a0').user.status).toBe('dismissed');
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();await page.getByRole('checkbox',{name:'Show only selected',exact:true}).uncheck();await expect(page.getByRole('article')).toHaveCount(3);
  }finally{await app.context.close();}
});

test('delete return-origin, unrelated sidebar list and empty list keep the correct browse scope',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('searchbox').fill('bridge');await page.getByRole('button',{name:'Search entire Library',exact:true}).click();
    await page.getByText('Delete a watch list',{exact:true}).click();await page.getByRole('button',{name:'Delete Beta list',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Entire Library',exact:true})).toBeVisible();await page.getByRole('button',{name:'Across Library',exact:true}).click();await expect(page.getByRole('heading',{name:'Alpha',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Across Library',exact:true}).click();await page.getByRole('button',{name:'Delete entire Alpha list',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Entire Library',exact:true})).toBeVisible();await expect(page.getByRole('searchbox')).toHaveValue('bridge');await expect(page.getByRole('article')).toHaveCount(0);await page.getByRole('button',{name:'Across Library',exact:true}).click();await expect(page.getByRole('heading',{name:'Inbox',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Empty',exact:true}).click();await page.getByRole('button',{name:'Delete entire list',exact:true}).click();dialog=page.getByRole('dialog');await expect(dialog).toContainText('This list is empty');await expect(dialog.getByRole('combobox')).toHaveCount(0);await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('button',{name:'Empty',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Delete entire list',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(page.getByRole('heading',{name:'Entire Library',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Empty',exact:true})).toHaveCount(0);
  }finally{await app.context.close();}
});

test('pending reviews gate whole move without exclusions, while explicit dismissal resolves review',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app,{pending:true});await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('button',{name:'Delete entire list',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Delete entire list',exact:true});await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('move');await dialog.getByRole('combobox',{name:'Removal destination',exact:true}).selectOption('beta');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('pending reviews');await expect(dialog.getByRole('checkbox')).toHaveCount(0);expect((await durable(app)).lists.some(list=>list.id==='alpha')).toBe(true);
    await dialog.getByRole('button',{name:'Review a1 lesson',exact:true}).click();const review=page.getByRole('dialog',{name:/Review prior activity/});await review.getByRole('button',{name:'Leave here',exact:true}).click();
    await expect(dialog.getByRole('status')).toContainText('confirm separately');expect((await durable(app)).lists.some(list=>list.id==='alpha')).toBe(true);await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(page.getByRole('heading',{name:'Beta',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Undo organization change',exact:true}).click();const preview=await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'dismiss'});const result=await send(page,{type:'removalCommit',preview:preview.preview});expect(result.ok).toBe(true);expect((await durable(app)).records.find(record=>record.id==='a1').user.pendingReview).toBe(null);
  }finally{await app.context.close();}
});

test('changed affected contents or targets refresh confirmation while unrelated metadata does not',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);
    let preview=(await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'move',to:'beta'})).preview;
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');const record=structuredClone(library.records.find(record=>record.id==='a0'));record.id='arrival';record.identity='arrival';record.metadata.observations[0].title='New arrival';library.records.push(record);await chrome.storage.local.set({library});});
    const unchanged=await durable(app);let result=await send(page,{type:'removalCommit',preview});expect(result.ok).toBe(false);expect(result.outcome).toBe('stale');expect(result.preview.rows).toHaveLength(5);expect(await durable(app)).toEqual(unchanged);
    preview=result.preview;expect((await send(page,{type:'renameList',listId:'beta',name:'Renamed target'})).ok).toBe(true);result=await send(page,{type:'removalCommit',preview});expect(result.outcome).toBe('stale');expect(result.preview.lists.find(list=>list.id==='beta').name).toBe('Renamed target');
    preview=result.preview;await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='a0').metadata.observations.push({title:'A newer source title',source:'fixture',observedAt:'2026-10-29T00:00:00Z'});await chrome.storage.local.set({library});});
    expect((await send(page,{type:'removalCommit',preview})).ok).toBe(true);
    expect((await durable(app)).records.find(record=>record.id==='arrival').user.destination).toBe('beta');
  }finally{await app.context.close();}
});

test('stale UI preview refreshes titles and requires another click after affected arrival',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('button',{name:'Delete entire list',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');const record=structuredClone(library.records.find(record=>record.id==='a0'));record.id='arrival';record.identity='arrival';record.metadata.observations[0].title='Arrived while confirming';library.records.push(record);await chrome.storage.local.set({library});});
    await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toContainText('5 active videos');await expect(dialog).toContainText('Arrived while confirming');await expect(dialog.getByRole('status')).toContainText('confirm again');expect((await durable(app)).lists.some(list=>list.id==='alpha')).toBe(true);
    await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toHaveCount(0);expect((await durable(app)).lists.some(list=>list.id==='alpha')).toBe(false);
  }finally{await app.context.close();}
});

test('matching no-op preserves dates/history and explicit pending exclusions retain selected rows',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app,{pending:true});const before=await durable(app);
    const preview=(await send(page,{type:'removalPreview',listId:'alpha',scope:'matches',recordIds:['a0'],effect:'move',to:'alpha'})).preview;
    const result=await send(page,{type:'removalCommit',preview});expect(result.ok).toBe(true);expect(result.processedIds).toEqual(['a0']);expect(await durable(app)).toEqual(before);
    await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('checkbox',{name:'Select all current results',exact:true}).check();await page.getByRole('button',{name:'Remove matching videos',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('move');await dialog.getByRole('combobox',{name:'Removal destination',exact:true}).selectOption('beta');await dialog.getByRole('checkbox',{name:'Exclude a1 lesson',exact:true}).check();await dialog.getByRole('button',{name:'Confirm matching removal',exact:true}).click();
    await expect(page.getByRole('heading',{name:'1 selected',exact:true})).toBeVisible();await expect(page.getByRole('article')).toHaveCount(1);await expect(page.getByRole('article')).toContainText('a1 lesson');expect((await durable(app)).records.find(record=>record.id==='a1').user.pendingReview).not.toBe(null);
    const dismissal=(await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'dismiss'})).preview;expect((await send(page,{type:'removalCommit',preview:dismissal})).ok).toBe(true);const after=await durable(app);expect(after.records.find(record=>record.id==='a1').user.pendingReview).toBe(null);expect(after.records.find(record=>record.id==='a1').user.status).toBe('dismissed');
  }finally{await app.context.close();}
});

test('failed persistence retains preview and selection, retry then restart recovers original identity and order',async()=>{
  let app=await launch(undefined,{failWrite:2});try{
    let page=await removalFixture(app);const before=await durable(app);await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('checkbox',{name:'Select a0 bridge',exact:true}).check();await page.getByRole('button',{name:'Delete entire list',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('not saved');expect(await durable(app)).toEqual(before);await expect(page.getByRole('heading',{name:'1 selected',exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toHaveCount(0);const action=(await durable(app)).history.findLast(item=>item.command==='removalCommit');const profile=app.profile;const extensionPath=app.extensionPath;await app.context.close();app=await launch(profile,{extensionPath});page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('combobox',{name:'Organization change to recover',exact:true}).selectOption(action.id);await page.getByRole('button',{name:'Undo organization change',exact:true}).click();await expect(page.getByRole('button',{name:'Alpha',exact:true})).toBeVisible();const restored=await durable(app);expect(restored.lists.find(list=>list.id==='alpha')).toEqual(before.lists.find(list=>list.id==='alpha'));for(const id of ['a0','a1','a2','a3'])expect({...restored.records.find(record=>record.id===id).user,revision:before.records.find(record=>record.id===id).user.revision}).toMatchObject(before.records.find(record=>record.id===id).user);
  }finally{await app.context.close();}
});

test('recovery protects conflicting names and newer decisions while preserving unrelated title and metadata',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);const before=await durable(app);const preview=(await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'move',to:'beta'})).preview;const moved=await send(page,{type:'removalCommit',preview});
    let record=(await durable(app)).records.find(record=>record.id==='a0');expect((await send(page,{type:'editTitle',recordId:record.id,expectedRevision:record.user.revision,personalTitle:'New authored title'})).ok).toBe(true);
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='a0').metadata.observations.push({title:'Newest retained automatic title',source:'fixture',observedAt:'2026-10-29T00:00:00Z'});await chrome.storage.local.set({library});});
    const conflict=await send(page,{type:'createList',name:' aLpHa '});expect(conflict.ok).toBe(true);let result=await send(page,{type:'organizationUndo',actionId:moved.actionId});expect(result.ok).toBe(false);expect(result.error).toContain('name');expect((await durable(app)).records.find(record=>record.id==='a0').user.destination).toBe('beta');
    await send(page,{type:'renameList',listId:conflict.list.id,name:'Gamma'});
    const status=(await send(page,{type:'statusPreview',effect:'watched',recordIds:['a0']})).preview;const marked=await send(page,{type:'statusCommit',preview:status});expect(marked.ok).toBe(true);result=await send(page,{type:'organizationUndo',actionId:moved.actionId});expect(result.ok).toBe(false);expect(result.error).toContain('newer');
    expect((await send(page,{type:'organizationUndo',actionId:marked.actionId})).ok).toBe(true);result=await send(page,{type:'organizationUndo',actionId:moved.actionId});expect(result.ok,result.error).toBe(true);
    const restored=await durable(app);record=restored.records.find(record=>record.id==='a0');expect(record.user.personalTitle).toBe('New authored title');expect(record.metadata.observations.at(-1).title).toBe('Newest retained automatic title');expect(restored.lists.find(list=>list.id==='alpha')).toEqual(before.lists.find(list=>list.id==='alpha'));expect(restored.lists.find(list=>list.id===conflict.list.id).name).toBe('Gamma');
  }finally{await app.context.close();}
});

test('newer importance decisions block deleted-list recovery until explicitly reversed',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);const preview=(await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'dismiss'})).preview;const deletion=await send(page,{type:'removalCommit',preview});
    const ranking=await send(page,{type:'setListImportance',listIds:['empty','beta']});expect(ranking.ok).toBe(true);const current=await durable(app);
    const blocked=await send(page,{type:'organizationUndo',actionId:deletion.actionId});expect(blocked.ok).toBe(false);expect(blocked.error).toContain('importance');expect(await durable(app)).toEqual(current);
    expect((await send(page,{type:'organizationUndo',actionId:ranking.actionId})).ok).toBe(true);expect((await send(page,{type:'organizationUndo',actionId:deletion.actionId})).ok).toBe(true);expect((await durable(app)).lists.find(list=>list.id==='alpha').importance).toBe(0);
  }finally{await app.context.close();}
});

test('an emptied source drops obsolete move choices, remains confirmable and new arrivals require choices again',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await page.getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('button',{name:'Delete entire list',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('move');await dialog.getByRole('combobox',{name:'Removal destination',exact:true}).selectOption('beta');
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');for(const record of library.records.filter(record=>record.user.destination==='alpha')){record.user.status='dismissed';record.user.destination=null;}library.lists=library.lists.filter(list=>list.id!=='beta');await chrome.storage.local.set({library});});
    await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toContainText('0 active videos');await expect(dialog.getByRole('combobox')).toHaveCount(0);await expect(dialog.getByRole('button',{name:'Confirm deletion',exact:true})).toBeEnabled();
    await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');const record=library.records.find(record=>record.id==='a0');record.user.status='active';record.user.destination='alpha';await chrome.storage.local.set({library});});
    await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toContainText('1 active video');await expect(dialog.getByRole('combobox',{name:'Removal effect',exact:true})).toHaveValue('');await expect(dialog.getByRole('button',{name:'Confirm deletion',exact:true})).toBeDisabled();
    await dialog.getByRole('combobox',{name:'Removal effect',exact:true}).selectOption('dismiss');await dialog.getByRole('button',{name:'Confirm deletion',exact:true}).click();await expect(dialog).toHaveCount(0);
  }finally{await app.context.close();}
});

test('whole moves preserve an unknown historical first Inbox-exit date',async()=>{
  const app=await launch();try{
    const page=await removalFixture(app);await app.worker.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='a0').user.firstInboxExitAt=null;await chrome.storage.local.set({library});});
    const preview=(await send(page,{type:'removalPreview',listId:'alpha',scope:'whole',effect:'move',to:'Inbox'})).preview;expect((await send(page,{type:'removalCommit',preview})).ok).toBe(true);expect((await durable(app)).records.find(record=>record.id==='a0').user.firstInboxExitAt).toBe(null);
  }finally{await app.context.close();}
});
