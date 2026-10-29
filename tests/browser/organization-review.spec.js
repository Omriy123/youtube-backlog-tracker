import {test,expect} from '@playwright/test';
import {launch,capture} from './helpers.js';

const send=(page,message)=>page.evaluate(message=>chrome.runtime.sendMessage(message),message);
const ids=page=>page.locator('#records article').evaluateAll(rows=>rows.map(row=>row.dataset.recordId));
async function fixture(app) {
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
  await page.evaluate(async()=>{
    const record=(id,destination,title,rank)=>({id,identity:`url:https://example.org/${id}`,url:`https://example.org/${id}`,user:{status:'active',destination,firstSavedAt:`2026-01-0${rank}T00:00:00Z`,firstInboxExitAt:null,latestListEntryAt:`2026-01-0${rank}T00:00:00Z`,revision:1,personalTitle:null,watchEvents:[],pendingReview:null},metadata:{publicationDate:`2026-01-0${rank}T00:00:00Z`,durationSeconds:rank*10,channelId:id==='backlog'?null:'known',channelName:'Recorded channel',observations:[{title,source:'test-fixture',observedAt:'2026-01-01T00:00:00Z'}]}});
    await chrome.storage.local.set({library:{version:1,history:[],lists:[{id:'zebra',name:'Zebra',importance:0,manualOrder:[],publicationDirection:'asc'},{id:'alpha',name:'Alpha',importance:1,manualOrder:[],publicationDirection:'asc'}],records:[record('inbox','Inbox','Delta',4),record('zebra','zebra','Alpha',1),record('alpha','alpha','Charlie',3),record('backlog','Backlog','Bravo',2)]}});
  });await page.reload();return page;
}

test('Entire Library visibly applies global value sorts while channel results retain destination grouping and actions',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.getByRole('navigation').getByRole('button',{name:'Entire Library',exact:true}).click();
    for(const [label,ascending] of [['Destination',['alpha','backlog','inbox','zebra']],['Title',['zebra','backlog','alpha','inbox']],['Duration',['zebra','backlog','alpha','inbox']]]) {
      const header=page.getByRole('button',{name:`Sort by ${label}`,exact:true});await header.click();await expect.poll(()=>ids(page)).toEqual(ascending);await header.click();await expect.poll(()=>ids(page)).toEqual([...ascending].reverse());
    }
    await page.locator('#arrangement-controls summary').click();const dates=page.getByRole('button',{name:'Sort by First saved',exact:true});await dates.click();await expect.poll(()=>ids(page)).toEqual(['zebra','backlog','alpha','inbox']);await dates.click();await expect.poll(()=>ids(page)).toEqual(['inbox','alpha','backlog','zebra']);
    await page.getByRole('button',{name:'Compact',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['inbox','alpha','backlog','zebra']);await page.locator('article[data-record-id=alpha]').getByRole('checkbox').check();await expect(page.getByRole('region',{name:'Selected videos',exact:true})).toContainText('1 selected');
    await page.getByRole('button',{name:'Remove matching from Alpha',exact:true}).click();await expect(page.getByRole('dialog',{name:'Remove matching videos',exact:true})).toContainText('Charlie');await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();
    await page.getByRole('button',{name:'Recorded channel · 3',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['inbox','zebra','alpha']);await expect(page.getByRole('button',{name:'Open Zebra',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Channel unknown · 1',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['backlog']);await expect(page.getByRole('button',{name:'Open Backlog',exact:true})).toBeVisible();
  }finally{await app.context.close();}
});

async function move(page,recordId,to) {
  const prepared=await send(page,{type:'organizationPreview',rows:[{recordId,to}]});expect(prepared.ok).toBe(true);const result=await send(page,{type:'organizationCommit',preview:prepared.preview});expect(result.ok).toBe(true);return result;
}
async function status(page,recordId,effect) {
  const prepared=await send(page,{type:'statusPreview',recordIds:[recordId],effect});expect(prepared.ok).toBe(true);const result=await send(page,{type:'statusCommit',preview:prepared.preview});expect(result.ok).toBe(true);return result;
}
async function saved(page,id) {return page.evaluate(async id=>(await chrome.storage.local.get('library')).library.records.find(record=>record.id===id),id);}

for(const action of ['move','watched','dismissed','open'])test(`unknown historical First Inbox-exit survives ${action} from a custom list and later Inbox decisions`,async()=>{
  const app=await launch();try{
    const page=await fixture(app);
    if(action==='move') {
      await move(page,'alpha','zebra');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
      const deletion=await send(page,{type:'removalPreview',listId:'zebra',scope:'whole',effect:'move',to:'Inbox'});expect((await send(page,{type:'removalCommit',preview:deletion.preview})).ok).toBe(true);
      expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();const moved=await move(page,'alpha','Backlog');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();expect((await send(page,{type:'organizationUndo',actionId:moved.actionId})).ok).toBe(true);
      const watched=await status(page,'alpha','watched');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();expect((await send(page,{type:'organizationUndo',actionId:watched.actionId})).ok).toBe(true);
      const record=await saved(page,'alpha');expect((await send(page,{type:'open',recordId:'alpha',expectedRevision:record.user.revision,attemptId:crypto.randomUUID()})).ok).toBe(true);expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
    } else {
      if(action==='open'){await page.getByRole('navigation').getByRole('button',{name:'Alpha',exact:true}).click();await page.getByRole('button',{name:'Open video',exact:true}).click();await expect(page.getByRole('article')).toHaveCount(0);}
      else await status(page,'alpha',action);
      expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
      const captured=await capture(app,'https://example.org/alpha','Charlie again');await expect(captured.popup.getByRole('status')).toContainText('review pending');await captured.popup.getByRole('button',{name:'Review prior activity',exact:true}).click();await captured.popup.getByRole('dialog',{name:'Review prior activity',exact:true}).getByRole('button',{name:'Keep in Inbox',exact:true}).click();
      if(action==='watched')await move(page,'alpha','Backlog');else if(action==='dismissed')await status(page,'alpha','watched');else {const record=await saved(page,'alpha');expect((await send(page,{type:'open',recordId:'alpha',expectedRevision:record.user.revision,attemptId:crypto.randomUUID()})).ok).toBe(true);}
      expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
    }
  }finally{await app.context.close();}
});

test('flat filtered Place uses actual insertion without regrouping unrelated destinations or saving a global order',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.evaluate(async()=>{
      const {library}=await chrome.storage.local.get('library');const base=library.records[0];library.lists.push({id:'third',name:'Third',importance:2,manualOrder:[],publicationDirection:'asc'});
      library.records=[['A1','alpha'],['B2','zebra'],['A3','alpha'],['C4','third'],['B5','zebra'],['C6','third']].map(([id,destination],index)=>({...structuredClone(base),id,identity:`fixture:${id}`,user:{...base.user,destination},metadata:{observations:[{title:`Fixture ${index+1} ${id}`,source:'test-fixture'}]}}));await chrome.storage.local.set({library});
    });await page.reload();await page.getByRole('navigation').getByRole('button',{name:'Entire Library',exact:true}).click();await page.getByRole('button',{name:'Sort by Title',exact:true}).click();await page.getByRole('searchbox').fill('Fixture');await expect.poll(()=>ids(page)).toEqual(['A1','B2','A3','C4','B5','C6']);await expect(page.locator('#records')).toHaveAttribute('aria-busy','false');
    const before=await page.evaluate(()=>chrome.storage.local.get('library'));await page.locator('article[data-record-id=A3]').getByRole('button',{name:'Place video',exact:true}).click();const place=page.getByRole('dialog',{name:'Place videos',exact:true});await place.getByRole('combobox').selectOption('A1');await place.getByRole('button',{name:'Place here',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['A3','A1','B2','C4','B5','C6']);expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    await page.locator('article[data-record-id=A1]').getByRole('checkbox').check();await page.getByRole('button',{name:'Compact',exact:true}).click();await page.getByRole('button',{name:'Rows',exact:true}).click();await expect.poll(()=>ids(page)).toEqual(['A3','A1','B2','C4','B5','C6']);
    await page.evaluate(()=>{const source=document.querySelector('article[data-record-id=A3]');const target=document.querySelector('article[data-record-id=A1]');const dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));const rect=target.getBoundingClientRect();target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.bottom-1}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.bottom-1}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));});await expect.poll(()=>ids(page)).toEqual(['A1','A3','B2','C4','B5','C6']);
    await page.getByRole('searchbox').fill('');await expect.poll(()=>ids(page)).toEqual(['A1','B2','A3','C4','B5','C6']);expect((await page.evaluate(()=>chrome.storage.local.get('library'))).library.history).toHaveLength(0);
  }finally{await app.context.close();}
});

for(const action of ['move','watched','dismissed','open'])test(`a legacy initial Inbox ${action} records its factual date and Undo restores first-decision eligibility`,async()=>{
  const app=await launch();try{
    const captured=await capture(app,`https://example.org/initial-${action}`,'Initial decision fixture');await expect(captured.popup.getByRole('status')).toContainText('Saved to Inbox');const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.evaluate(async()=>{const {library}=await chrome.storage.local.get('library');delete library.records[0].user.initialPlacementComplete;await chrome.storage.local.set({library});});
    const before=await page.evaluate(()=>chrome.storage.local.get('library'));await send(page,{type:'list'});expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);const id=before.library.records[0].id;
    let result;if(action==='move')result=await move(page,id,'Backlog');else if(action==='open'){const current=await saved(page,id);result=await send(page,{type:'open',recordId:id,expectedRevision:current.user.revision,attemptId:crypto.randomUUID()});expect(result.ok).toBe(true);}else result=await status(page,id,action);
    const decided=await saved(page,id);expect(Date.parse(decided.user.firstInboxExitAt)).toBeGreaterThanOrEqual(Date.parse(before.library.records[0].user.firstSavedAt));expect(decided.user.firstSavedAt).toBe(before.library.records[0].user.firstSavedAt);
    const undo=action==='open'?await send(page,{type:'undoOpening',attemptId:(await send(page,{type:'list'})).latestOpening.attemptId}):await send(page,{type:'organizationUndo',actionId:result.actionId});expect(undo.ok).toBe(true);expect((await saved(page,id)).user.firstInboxExitAt).toBeNull();
    await move(page,id,'Backlog');const next=await saved(page,id);expect(next.user.firstInboxExitAt).not.toBeNull();expect(Date.parse(next.user.firstInboxExitAt)).toBeGreaterThanOrEqual(Date.parse(decided.user.firstInboxExitAt));expect(next.user.firstSavedAt).toBe(before.library.records[0].user.firstSavedAt);
  }finally{await app.context.close();}
});

test('legacy deletion-to-Inbox history preserves an unknown date without read migration or treating reversed decisions as current',async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.evaluate(async()=>{
      const {library}=await chrome.storage.local.get('library');const record=library.records.find(record=>record.id==='alpha');const before=structuredClone(record.user);record.user.destination='Inbox';record.user.latestListEntryAt='2026-02-01T00:00:00Z';library.lists=library.lists.filter(list=>list.id!=='alpha');library.history.push({id:'legacy-deletion',type:'organization',command:'removalCommit',at:'2026-02-01T00:00:00Z',changes:[{kind:'records',id:'alpha',before:{id:'alpha',user:before},after:{id:'alpha',user:structuredClone(record.user)}}]});await chrome.storage.local.set({library});
    });const before=await page.evaluate(()=>chrome.storage.local.get('library'));await send(page,{type:'list'});expect(await page.evaluate(()=>chrome.storage.local.get('library'))).toEqual(before);
    const moved=await move(page,'alpha','Backlog');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();expect((await send(page,{type:'organizationUndo',actionId:moved.actionId})).ok).toBe(true);await status(page,'alpha','watched');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
  }finally{await app.context.close();}
});

for(const priorStatus of ['watched','dismissed'])test(`legacy ${priorStatus} rediscovery cannot turn an unknown initial date into the review or later move time`,async()=>{
  const app=await launch();try{
    const page=await fixture(app);await page.evaluate(async status=>{const {library}=await chrome.storage.local.get('library');const record=library.records.find(record=>record.id==='alpha');record.user.status=status;record.user.destination=null;delete record.user.initialPlacementComplete;await chrome.storage.local.set({library});},priorStatus);
    const captured=await capture(app,'https://example.org/alpha','Legacy rediscovery');await expect(captured.popup.getByRole('status')).toContainText('review pending');await captured.popup.getByRole('button',{name:'Review prior activity',exact:true}).click();await captured.popup.getByRole('dialog',{name:'Review prior activity',exact:true}).getByRole('button',{name:'Keep in Inbox',exact:true}).click();await move(page,'alpha','Backlog');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBeNull();
  }finally{await app.context.close();}
});

test('known factual Inbox-exit dates survive later custom moves, status and opening unchanged',async()=>{
  const app=await launch();try{
    const page=await fixture(app);const factual='2025-12-01T12:30:00Z';await page.evaluate(async value=>{const {library}=await chrome.storage.local.get('library');library.records.find(record=>record.id==='alpha').user.firstInboxExitAt=value;await chrome.storage.local.set({library});},factual);
    await move(page,'alpha','zebra');const watched=await status(page,'alpha','watched');expect((await saved(page,'alpha')).user.firstInboxExitAt).toBe(factual);expect((await send(page,{type:'organizationUndo',actionId:watched.actionId})).ok).toBe(true);const current=await saved(page,'alpha');expect((await send(page,{type:'open',recordId:'alpha',expectedRevision:current.user.revision,attemptId:crypto.randomUUID()})).ok).toBe(true);expect((await saved(page,'alpha')).user.firstInboxExitAt).toBe(factual);
  }finally{await app.context.close();}
});
