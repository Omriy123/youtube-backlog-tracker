import {test,expect} from '@playwright/test';
import {launch,capture,takeScreenshot} from './helpers.js';

const request=(page,message)=>page.evaluate(message=>chrome.runtime.sendMessage(message),message);
async function fixture(app) {
  const {popup}=await capture(app,'https://example.org/repair','Short title');await expect(popup.getByRole('status')).toContainText('Saved to Inbox');
  const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
  await page.evaluate(async()=>{
    const {library}=await chrome.storage.local.get('library');const base=library.records[0];
    library.lists=[{id:'z',name:'Zebra',importance:0,manualOrder:[],publicationDirection:'asc'},{id:'a',name:'Alpha',importance:1,manualOrder:[],publicationDirection:'asc'}];
    library.records=[['one','Inbox','Short title'],['two','Inbox','A very long title '.repeat(12)],['three','z','Elsewhere title']].map(([id,destination,title])=>({...structuredClone(base),id,identity:`fixture:${id}`,url:`https://example.org/${id}`,user:{...base.user,destination},metadata:{observations:[{title,source:'fixture',observedAt:'2026-01-01T00:00:00Z'}]}}));
    await chrome.storage.local.set({library});
  });await page.reload();return page;
}
const row=(page,id)=>page.locator(`article[data-record-id="${id}"]`);

test('Enter creates and renames once, keeps validation open, and cancels safely',async()=>{
  let app=await launch();try {
    let page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'Create watch list',exact:true}).click();
    let editor=page.getByRole('dialog');let input=editor.getByRole('textbox',{name:'List name',exact:true});
    await input.fill(' Inbox ');await input.press('Enter');await expect(editor.getByRole('status')).not.toBeEmpty();await expect(editor).toBeVisible();await expect(input).toBeFocused();
    await input.fill('Evening');await input.press('Enter');await expect(editor).not.toBeVisible();
    await page.getByRole('button',{name:'Rename list',exact:true}).click();editor=page.getByRole('dialog');input=editor.getByRole('textbox');
    await input.fill('Study');await input.press('Enter');await expect(editor).not.toBeVisible();
    expect((await request(page,{type:'list'})).lists.filter(list=>!list.permanent).map(list=>list.name)).toEqual(['Study']);
    await page.getByRole('button',{name:'Rename list',exact:true}).click();await page.getByRole('textbox',{name:'List name',exact:true}).fill('Cancelled');await page.keyboard.press('Escape');
    const profile=app.profile;await app.context.close();app=await launch(profile);page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    expect((await request(page,{type:'list'})).lists.filter(list=>!list.permanent).map(list=>list.name)).toEqual(['Study']);
  }finally{await app.context.close();}
});

test('dropped move target and later mixed overrides describe the actual included move',async()=>{
  const app=await launch();try {
    const page=await fixture(app);await page.setViewportSize({width:1440,height:1200});
    await row(page,'one').getByRole('checkbox').check();await row(page,'two').getByRole('checkbox').check();
    await page.evaluate(()=>window.scrollTo(0,0));
    // Native drag evidence covers visible endpoints; offscreen auto-scrolling
    // and physical-pointer comfort remain the separate human-test boundary.
    await expect(row(page,'one').locator('.title-target')).toBeInViewport();
    await expect(page.getByRole('navigation').getByRole('button',{name:'Zebra',exact:true})).toBeInViewport();
    await page.keyboard.down('Control');await row(page,'one').locator('.title-target').dragTo(page.getByRole('navigation').getByRole('button',{name:'Zebra',exact:true}));await page.keyboard.up('Control');
    const dialog=page.getByRole('dialog',{name:'Move videos',exact:true});const shared=dialog.getByRole('combobox',{name:'Shared destination',exact:true});
    await expect(shared).toHaveValue('z');
    await dialog.getByRole('combobox',{name:'Destination for Short title',exact:true}).selectOption('Backlog');
    await expect(shared.locator('option:checked')).toHaveText('Mixed destinations');
    await dialog.getByRole('checkbox',{name:'Exclude Short title from this move',exact:true}).check();await expect(shared).toHaveValue('z');
    await dialog.getByRole('checkbox',{name:'Exclude Short title from this move',exact:true}).uncheck();await expect(shared.locator('option:checked')).toHaveText('Mixed destinations');
    await dialog.getByRole('button',{name:'Confirm move',exact:true}).click();await expect(dialog).not.toBeVisible();
    const state=await request(page,{type:'list'});expect(state.records.find(r=>r.id==='one').user.destination).toBe('Backlog');expect(state.records.find(r=>r.id==='two').user.destination).toBe('z');
  }finally{await app.context.close();}
});

test('pending Enter submission is single-flight and failed save permits explicit retry',async()=>{
  const app=await launch(undefined,{writeDelay:800,failWrite:1});try {
    const page=await app.context.newPage();await page.goto(`${app.base}/library.html`);
    await page.getByRole('button',{name:'Create watch list',exact:true}).click();const editor=page.getByRole('dialog');const input=editor.getByRole('textbox');
    await input.fill('Pending');await input.press('Enter');await expect(editor.getByRole('button',{name:'Save list',exact:true})).toBeDisabled();
    await editor.locator('form').evaluate(form=>{form.requestSubmit();form.requestSubmit();});await page.keyboard.press('Escape');await expect(editor).toBeVisible();
    await expect(editor.getByRole('status')).toContainText('not saved');expect((await request(page,{type:'list'})).lists.filter(l=>!l.permanent)).toHaveLength(0);await expect(input).toBeFocused();
    await page.keyboard.press('Enter');await expect(editor).not.toBeVisible();
    const state=await request(page,{type:'list'});expect(state.lists.filter(l=>!l.permanent).map(l=>l.name)).toEqual(['Pending']);expect(state.organizationActions).toHaveLength(1);
  }finally{await app.context.close();}
});

test('overview exposes both directions without changing saved importance or permanent endpoints',async()=>{
  const app=await launch();try {
    const page=await fixture(app);const controls=page.locator('#overview-controls');
    const importance=controls.getByRole('button',{name:'Sort lists by Importance',exact:true});
    await expect(importance).toContainText('Most important first');await expect(importance).toHaveAttribute('aria-description',/Most important first/);
    await importance.click();await expect(importance).toContainText('Least important first');
    const nav=page.getByRole('navigation');expect(await nav.locator('[data-view]').evaluateAll(nodes=>nodes.map(n=>n.dataset.view))).toEqual(['Entire Library','Inbox','a','z','Backlog']);
    const name=controls.getByRole('button',{name:'Sort lists by Name',exact:true});await name.click();await expect(name).toContainText('A to Z');await name.click();await expect(name).toContainText('Z to A');
    expect(await nav.locator('[data-view]').evaluateAll(nodes=>nodes.map(n=>n.dataset.view))).toEqual(['Entire Library','Inbox','z','a','Backlog']);
    expect((await request(page,{type:'list'})).lists.filter(l=>!l.permanent).map(l=>[l.id,l.importance])).toEqual([['z',0],['a',1]]);
    await expect(controls).toContainText('does not change saved importance');
  }finally{await app.context.close();}
});

for(const width of [390,1440])test(`selection columns align and compact deselection preserves result pointer at ${width}px`,async()=>{
  const app=await launch();try {
    const page=await fixture(app);await page.setViewportSize({width,height:1000});
    await row(page,'one').getByRole('checkbox').check();await row(page,'two').getByRole('checkbox').check();
    await page.getByRole('navigation').getByRole('button',{name:'Zebra',exact:true}).click();
    const checkbox=row(page,'three').getByRole('checkbox');await checkbox.scrollIntoViewIfNeeded();const before=await checkbox.boundingBox();await checkbox.click();expect(await checkbox.boundingBox()).toEqual(before);await checkbox.click();await expect(checkbox).not.toBeChecked();await checkbox.check();
    const panel=page.getByRole('region',{name:'Selected videos',exact:true});await expect(panel.getByRole('heading',{name:'In Here (1)',exact:true})).toBeVisible();
    const tables=panel.getByRole('table');await expect(tables).toHaveCount(2);
    const positions=await tables.evaluateAll(tables=>tables.map(t=>[...t.querySelectorAll('thead th')].map(th=>th.getBoundingClientRect().x)));
    expect(positions[0]).toEqual(positions[1]);expect(positions[0]).toHaveLength(2);
    const deselect=panel.getByRole('button',{name:'Deselect Short title',exact:true});await expect(deselect).toHaveText('×');
    expect(await deselect.evaluate(b=>b.closest('td').cellIndex)).toBe(0);await deselect.scrollIntoViewIfNeeded();const bounds=await deselect.boundingBox();expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);
    await takeScreenshot(page,{path:`.scratch/repair-selection-${width}.png`,fullPage:true});
    await takeScreenshot(panel,{path:`.scratch/repair-selection-panel-${width}.png`});
    await page.getByRole('button',{name:'Compact',exact:true}).click();
    await expect.poll(()=>tables.evaluateAll(tables=>tables.map(t=>[...t.querySelectorAll('thead th')].map(th=>th.getBoundingClientRect().x)))).toEqual(positions);
    await takeScreenshot(panel,{path:`.scratch/repair-selection-compact-${width}.png`});
    await deselect.click();await expect(panel).toContainText('2 selected');await expect(row(page,'three').getByRole('checkbox')).toBeChecked();
    await panel.getByRole('radio',{name:'Matches current filters (1)',exact:true}).check();await panel.getByRole('button',{name:'Deselect (1)',exact:true}).click();await expect(panel).toContainText('1 selected');
    await panel.getByRole('button',{name:'Clear selection',exact:true}).click();await expect(panel).toContainText('0 selected');
  }finally{await app.context.close();}
});
