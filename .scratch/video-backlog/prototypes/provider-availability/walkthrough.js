(() => {
 const click=s=>document.querySelector(s).click();
 const observations=[];
 const capture=label=>observations.push({label,variant,visibleRows:document.querySelectorAll('.video').length,dialogOpen:document.querySelector('dialog').open,overflow:document.documentElement.scrollWidth>innerWidth});
 capture('A loaded');
 click('[data-detail="bridge"]');
 observations.push({label:'A missing-result explanation',text:document.querySelector('#modal-body').innerText});
 document.querySelector('#sim-outcome').value='network';
 document.querySelector('#sim-outcome').dispatchEvent(new Event('change',{bubbles:true}));
 click('#modal-body [data-retry="bridge"]');
 observations.push({label:'Retry failure keeps saved record',state:find('bridge').state,recordCount:records.length,dialogText:document.querySelector('#modal-body').innerText});
 click('#close');click('#next');capture('B loaded');
 click('[data-pick="walk"]');
 observations.push({label:'B shows setup error separately',text:document.querySelector('.detailpane').innerText});
 click('#next');capture('C loaded');
 observations.push({label:'C inline explanations',inlineCount:document.querySelectorAll('.notice').length});
 click('[data-open="bridge"]');
 observations.push({label:'Open simulated honestly',text:document.querySelector('#message').innerText});
 click('#reset');capture('Reset restores records');
 switchVariant(1); // C -> A
 return {observations,title:document.title,viewport:{width:innerWidth,height:innerHeight},finalVariant:variant};
})()
