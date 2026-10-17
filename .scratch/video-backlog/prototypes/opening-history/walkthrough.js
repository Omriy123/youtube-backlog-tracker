(() => {
 const notes=[];
 const click=selector=>document.querySelector(selector).click();
 const scene=key=>click(`[data-scene="${key}"]`);
 const next=()=>click('[data-step]:not(:disabled)');
 const close=()=>{if(document.querySelector('#popup').open)click('#close-popup');};
 const name=text=>{const input=document.querySelector('#group-name');input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));};
 const observe=label=>notes.push({label,focus:state.focus,tabs:state.tabs.map(t=>t.title),groups:state.groups.map(g=>({name:g.name,tabs:g.tabs.map(id=>state.tabs.find(t=>t.id===id).record)})),activeRows:[...document.querySelectorAll('#records .title')].map(e=>e.textContent),videos:state.records.map(v=>({id:v.id,status:v.status,list:v.list,pending:v.pending,watches:v.events.length})),tracking:[...state.tracking],results:[...state.results],draft:state.draft,message:state.message});
 scene('groups');next();observe('Naming prompt: no viewing tabs yet; default Selected videos');name('Tonight learning');click('[data-action="confirm-open"]');observe('Custom group name, Library focus, completed rows disappear');next();observe('Explicit focus goes to viewing tab');
 scene('failures');next();name('Watch these');click('[data-action="confirm-open"]');observe('One named group; three distinct opening outcomes');next();observe('Retry inserts Bridge between Camera and Rust in the same group');next();observe('Saving watched update leaves tab count unchanged and removes Rust active row');
 scene('reviews');next();observe('Review gate before any tabs; final open disabled');click('#bulk-body [data-action="review"]');notes.push({label:'Contextual group review',text:document.querySelector('#popup .notice').textContent,hasImmediateSingleOpen:!!document.querySelector('#popup [data-action="keep-open"]')});click('#popup [data-action="keep"]');observe('Leave here resolves review with no tab or new watch event');name('Tonight in order');click('[data-action="confirm-open"]');observe('Reviewed three videos open together in original order');
 scene('reviews');next();click('[data-exclude="bridge"]');name('Only the ready videos');click('[data-action="confirm-open"]');observe('Explicitly left review: group has Camera and Rust; Bridge remains pending');
 scene('reviews');next();click('#bulk-body [data-action="review"]');click('#popup [data-action="keep"]');click('[data-action="cancel-open"]');observe('Cancel creates no tabs; already-confirmed review stays resolved');
 scene('status');next();observe('Mark watched removes Camera from active view without a tab');next();observe('Dismiss removes Rust without adding a watch event');next();observe('Explicit retained history view');next();notes.push({label:'Full information popup',text:document.querySelector('#popup').innerText});close();next();observe('Another watch increments Forest without opening');next();observe('Open again adds one tab and one event');
 scene('failures');next();name('Watch these');click('[data-action="confirm-open"]');
 return {notes,viewport:{width:innerWidth,documentWidth:document.documentElement.scrollWidth},title:document.title};
})()
