import { test, expect } from '@playwright/test';
import { launch, capture } from './helpers.js';

test('create rename rank and recover lists durably through the Library UI', async () => {
  let app = await launch();
  try {
    const page = await app.context.newPage(); await page.goto(`${app.base}/library.html`);
    await page.setViewportSize({width:390,height:780});
    await page.getByRole('button', { name: 'Create watch list', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Create watch list', exact: true });
    await editor.getByRole('textbox', { name: 'List name', exact: true }).fill('Evening');
    await editor.getByRole('button', { name: 'Save list', exact: true }).click();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Evening', exact: true })).toBeVisible();
    const before = await page.evaluate(() => chrome.runtime.sendMessage({type:'list'}));
    expect(before.lists.find(list => list.name === 'Evening')).toBeTruthy();
    await page.getByRole('button', {name:'Rename list',exact:true}).click();
    await page.getByRole('textbox', {name:'List name',exact:true}).fill(' evening study ');
    await page.getByRole('button', {name:'Save list',exact:true}).click();
    const after = await page.evaluate(() => chrome.runtime.sendMessage({type:'list'}));
    expect(after.lists.find(list => list.name === 'evening study').id).toBe(before.lists.find(list => list.name === 'Evening').id);
    await page.getByRole('button',{name:'Undo organization change',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Evening',exact:true})).toBeVisible();
    const profile=app.profile; await app.context.close(); app=await launch(profile);
    const reopened=await app.context.newPage(); await reopened.goto(`${app.base}/library.html`);
    await expect(reopened.getByRole('navigation').getByRole('button',{name:'Evening',exact:true})).toBeVisible();
  } finally { await app.context.close(); }
});

test('move preview excludes Inbox and no-op preserves dates/history; Undo preserves a later personal title', async () => {
  const app=await launch();
  try {
    const {popup}=await capture(app,'https://example.org/placement','Placement lecture'); await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    const initial=await page.evaluate(()=>chrome.storage.local.get('library'));
    await page.getByRole('button',{name:'Move video',exact:true}).click();
    let dialog=page.getByRole('dialog',{name:'Move videos',exact:true});
    expect(await dialog.locator('option').allTextContents()).toEqual(['Keep in the current list','Backlog']);
    await dialog.getByRole('combobox').selectOption('Backlog'); await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();
    await expect(page.getByRole('article')).toHaveCount(0);
    await page.getByRole('navigation').getByRole('button',{name:'Backlog',exact:true}).click();
    await expect(page.getByRole('article')).toContainText('Placement lecture');
    const moved=await page.evaluate(()=>chrome.storage.local.get('library'));
    expect(moved.library.records[0].user.firstSavedAt).toBe(initial.library.records[0].user.firstSavedAt);
    expect(moved.library.records[0].user.firstInboxExitAt).toBeTruthy();
    await page.getByRole('button',{name:'Move video',exact:true}).click();
    dialog=page.getByRole('dialog',{name:'Move videos',exact:true}); await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();
    expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(moved);
    await page.getByRole('button',{name:'Edit Personal title',exact:true}).click();
    const editor=page.getByRole('dialog',{name:'Edit Personal title',exact:true});await editor.getByRole('textbox',{name:'Personal title',exact:true}).fill('New personal title');await editor.getByRole('button',{name:'Save title',exact:true}).click();
    await page.getByRole('button',{name:'Undo organization change',exact:true}).click();
    await page.getByRole('navigation').getByRole('button',{name:'Inbox',exact:true}).click();await expect(page.getByRole('article')).toContainText('New personal title');
    const restored=await page.evaluate(()=>chrome.storage.local.get('library'));expect(restored.library.records[0].user.firstInboxExitAt).toBeNull();
  } finally {await app.context.close();}
});



async function request(page,message) { return page.evaluate(message=>chrome.runtime.sendMessage(message),message); }
async function seed(app, {existing=[],incoming=[],direction='asc',manual=true}={}) {
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
  await page.evaluate(({existing,incoming,direction,manual})=> {
    const record=(name,date,destination)=>({id:name,identity:`fixture:${name}`,url:`https://example.org/${name}`,user:{status:'active',destination,firstSavedAt:'2026-01-01T00:00:00Z',firstInboxExitAt:destination==='Inbox'?null:'2026-01-02T00:00:00Z',latestListEntryAt:'2026-01-02T00:00:00Z',revision:1,personalTitle:null,watchEvents:[],pendingReview:null},metadata:{publicationDate:date,observations:[{title:`Fixture ${name}`,source:'test-fixture',observedAt:'2026-01-01T00:00:00Z'}]}});
    const records=[...existing.map(([name,date])=>record(name,date,'target')),...incoming.map(([name,date])=>record(name,date,'Inbox'))];
    return chrome.storage.local.set({library:{version:1,records,history:[],lists:[{id:'target',name:'Target',importance:0,manualOrder:manual?existing.map(([name])=>name):[],publicationDirection:direction}]}});
  },{existing,incoming,direction,manual});
  await page.reload();return page;
}
for(const fixture of [
  {label:'out-of-order Manual anchors',existing:[['one','2026-01-01'],['ten','2026-01-10'],['five','2026-01-05'],['twenty','2026-01-20']],incoming:[['seven','2026-01-07']],expected:['one','ten','five','seven','twenty']},
  {label:'equal and unknown dates',existing:[['one','2026-01-01'],['unknown',null],['ten','2026-01-10']],incoming:[['equal','2026-01-01'],['missing',null]],expected:['one','unknown','equal','ten','missing']},
  {label:'reverse direction',direction:'desc',existing:[['twenty','2026-01-20'],['five','2026-01-05'],['ten','2026-01-10'],['one','2026-01-01']],incoming:[['seven','2026-01-07'],['missing',null]],expected:['twenty','five','ten','seven','one','missing']},
  {label:'initial publication order',manual:false,existing:[['ten','2026-01-10'],['one','2026-01-01']],incoming:[['five','2026-01-05']],expected:['one','five','ten']},
]) test(`move arrivals preserve ${fixture.label} through installed persistence`,async()=>{
  const app=await launch();try {
    const page=await seed(app,fixture);const prepared=await request(page,{type:'organizationPreview',rows:fixture.incoming.map(([recordId])=>({recordId,to:'target'}))});
    expect((await request(page,{type:'organizationCommit',preview:prepared.preview})).ok).toBe(true);
    const state=await page.evaluate(()=>chrome.storage.local.get('library'));
    expect(state.library.lists[0].manualOrder).toEqual(fixture.expected);
    expect(state.library.records.filter(record=>record.user.destination==='target')).toHaveLength(fixture.expected.length);
  }finally{await app.context.close();}
});

test('names importance and recovery reject conflicts without discarding unrelated decisions',async()=>{
  const app=await launch();try {
    const page=await seed(app);
    for(const name of ['', '   ', ' inbox ', 'BACKLOG', ' target ']) expect((await request(page,{type:'createList',name})).ok).toBe(false);
    const created=await request(page,{type:'createList',name:'Evening'});expect(created.ok).toBe(true);
    await page.reload();await page.getByRole('navigation').getByRole('button',{name:'Evening',exact:true}).click();
    await page.getByRole('button',{name:'More important',exact:true}).focus();await page.getByRole('button',{name:'More important',exact:true}).press('Enter');
    await expect.poll(async()=>(await request(page,{type:'list'})).lists.filter(list=>!list.permanent).map(list=>list.name)).toEqual(['Evening','Target']);
    const rename=await request(page,{type:'renameList',listId:created.list.id,name:'Later'});
    await request(page,{type:'renameList',listId:created.list.id,name:'Newest'});
    expect((await request(page,{type:'organizationUndo',actionId:rename.actionId})).ok).toBe(false);
    expect((await request(page,{type:'renameList',listId:'Inbox',name:'Gone'})).ok).toBe(false);
  }finally{await app.context.close();}
});

test('affected changes refresh previews while metadata and unrelated decisions leave them usable',async()=>{
  const app=await launch();try {
    const page=await seed(app,{existing:[['one','2026-01-01']],incoming:[['five','2026-01-05']]});
    let prepared=await request(page,{type:'organizationPreview',rows:[{recordId:'five',to:'target'}]});
    await request(page,{type:'createList',name:'Unrelated'});
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[1].metadata.observations.push({title:'Later automatic observation',source:'test-fixture',observedAt:'2026-02-01T00:00:00Z'});await chrome.storage.local.set({library});});
    expect((await request(page,{type:'organizationCommit',preview:prepared.preview})).ok).toBe(true);
    prepared=await request(page,{type:'organizationPreview',rows:[{recordId:'five',to:'Backlog'}]});
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[1].user.destination='Inbox';library.records[1].user.revision++;await chrome.storage.local.set({library});});
    const before=await page.evaluate(()=>chrome.storage.local.get('library'));
    const stale=await request(page,{type:'organizationCommit',preview:prepared.preview});expect(stale.outcome).toBe('stale');expect(stale.preview.rows[0].from).toBe('Inbox');
    expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    expect((await request(page,{type:'organizationCommit',preview:stale.preview})).ok).toBe(true);
  }finally{await app.context.close();}
});

test('pending review requires a separate refreshed confirmation before movement',async()=>{
  const app=await launch();try {
    const page=await seed(app,{incoming:[['pending',null]]});
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].user.pendingReview={previous:{status:'watched'}};await chrome.storage.local.set({library});});await page.reload();
    await page.getByRole('button',{name:'Move video',exact:true}).click();const move=page.getByRole('dialog',{name:'Move videos',exact:true});await move.getByRole('combobox').selectOption('target');await move.getByRole('button',{name:'Confirm move',exact:true}).click();
    const review=page.getByRole('dialog',{name:'Review prior activity',exact:true});await review.getByRole('button',{name:'Keep in Inbox',exact:true}).click();
    await expect(move.getByRole('status')).toContainText('Review resolved');
    expect((await request(page,{type:'list'})).records[0].user.destination).toBe('Inbox');
    await move.getByRole('button',{name:'Confirm move',exact:true}).click();
    expect((await request(page,{type:'list'})).records[0].user.destination).toBe('target');
  }finally{await app.context.close();}
});

test('a failed organization write preserves durable placement/history and permits explicit retry',async()=>{
  const app=await launch(undefined,{failWrite:1});try {
    const page=await seed(app,{incoming:[['retry',null]]});
    await page.getByRole('button',{name:'Move video',exact:true}).click();const move=page.getByRole('dialog',{name:'Move videos',exact:true});await move.getByRole('combobox').selectOption('target');
    const before=await page.evaluate(()=>chrome.storage.local.get('library'));
    await move.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(move.getByRole('status')).toContainText('not saved');
    expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    await move.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(move).not.toBeVisible();
    expect((await request(page,{type:'list'})).records[0].user.destination).toBe('target');
  }finally{await app.context.close();}
});

test('move recovery preserves later list rename and metadata, and importance recovery preserves names',async()=>{
  const app=await launch();try {
    const page=await seed(app,{incoming:[['recover',null]]});
    const prepared=await request(page,{type:'organizationPreview',rows:[{recordId:'recover',to:'target'}]});
    const moved=await request(page,{type:'organizationCommit',preview:prepared.preview});
    await request(page,{type:'renameList',listId:'target',name:'New name'});
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');library.records[0].metadata.observations.push({title:'Latest metadata',source:'test-fixture',observedAt:'2026-02-02T00:00:00Z'});await chrome.storage.local.set({library});});
    expect((await request(page,{type:'organizationUndo',actionId:moved.actionId})).ok).toBe(true);
    let state=await request(page,{type:'list'});expect(state.lists.find(list=>list.id==='target').name).toBe('New name');expect(state.records[0].metadata.observations.at(-1).title).toBe('Latest metadata');expect(state.records[0].user.destination).toBe('Inbox');
    const created=await request(page,{type:'createList',name:'Other'});
    const importance=await request(page,{type:'setListImportance',listIds:[created.list.id,'target']});
    await request(page,{type:'renameList',listId:'target',name:'Newest name'});
    expect((await request(page,{type:'organizationUndo',actionId:importance.actionId})).ok).toBe(true);
    state=await request(page,{type:'list'});expect(state.lists.filter(list=>!list.permanent).map(list=>list.name)).toEqual(['Newest name','Other']);
  }finally{await app.context.close();}
});
