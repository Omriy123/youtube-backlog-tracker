(() => {
 const observations=[];
 const query=document.getElementById('history-query');
 query.value='Bridge loads explained';query.dispatchEvent(new Event('input',{bubbles:true}));
 observations.push({case:'Default all-version search',rows:document.querySelectorAll('.video').length,match:document.querySelector('.history-hit')?.textContent,scopes:{...versionScopes}});
 document.querySelector('.history-hit').click();
 observations.push({case:'Historical match opens archive',open:document.querySelector('dialog').open,versions:document.querySelectorAll('#modal-body .metadata-version').length,text:document.querySelector('#modal-body .archive-panel').innerText});
 document.getElementById('close').click();
 document.querySelector('[data-version-scope="intermediate"]').click();
 observations.push({case:'Intermediate off independently; Original and Latest stay on',rows:document.querySelectorAll('.video').length,scopes:{...versionScopes}});
 document.querySelector('[data-version-scope="intermediate"]').click();
 observations.push({case:'Intermediate on restores match',rows:document.querySelectorAll('.video').length});
 document.getElementById('reset').click();
 document.querySelector('[data-detail="bridge"]').click();
 document.querySelector('[data-metadata-tab="latest"]').click();
 observations.push({case:'Latest information inspectable',text:document.querySelector('#modal-body .archive-panel').innerText});
 document.getElementById('close').click();
 observations.push({case:'Default row preserves original and latest',text:document.querySelector('[data-open="bridge"]').closest('.video').innerText,overflow:document.documentElement.scrollWidth>innerWidth});
 return {observations,viewport:{width:innerWidth,height:innerHeight},source:'Fictional UI only; no provider/storage/backup validation'};
})()
