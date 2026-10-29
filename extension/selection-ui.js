import {displayTitle} from './shared.js';
import {organizationButton} from './organization-ui.js';

export function createSelectionController({onChanged,onMove,onPlace,onStatus}) {
  const selectedIds=new Set();let selectedOnly=false;let panelScope='all';
  let snapshot={records:[],lists:[]};let currentResults=[];let context={};
  const controls=document.createElement('section');controls.id='selection-controls';controls.setAttribute('aria-label','Selection controls');
  const panel=document.createElement('section');panel.id='selection-panel';panel.setAttribute('aria-label','Selected videos');
  const allLabel=document.createElement('label');const all=document.createElement('input');all.type='checkbox';all.setAttribute('aria-label','Select all current results');allLabel.append(all,document.createTextNode('Select all'));
  const onlyLabel=document.createElement('label');const only=document.createElement('input');only.type='checkbox';only.setAttribute('aria-label','Show only selected');onlyLabel.append(only,document.createTextNode('Show only selected'));
  const counts=document.createElement('span');counts.setAttribute('aria-live','polite');controls.append(allLabel,onlyLabel,counts);
  function changed() {paint();if(selectedOnly)onChanged();}
  all.addEventListener('change',()=>{for(const record of currentResults)all.checked?selectedIds.add(record.id):selectedIds.delete(record.id);changed();});
  only.addEventListener('change',()=>{selectedOnly=only.checked;onChanged();});
  function affected() {return panelScope==='all' ? snapshot.records.filter(record=>selectedIds.has(record.id)) : currentResults.filter(record=>selectedIds.has(record.id));}
  function paint() {
    const matching=currentResults.filter(record=>selectedIds.has(record.id));
    all.checked=currentResults.length>0 && matching.length===currentResults.length;all.indeterminate=matching.length>0 && matching.length<currentResults.length;all.disabled=!currentResults.length;
    only.checked=selectedOnly;counts.textContent=`${selectedIds.size} selected · ${matching.length} matching of ${currentResults.length} ${currentResults.length===1?'result':'results'}`;
    for(const checkbox of document.querySelectorAll('input[data-select-record]'))checkbox.checked=selectedIds.has(checkbox.dataset.selectRecord);
    panel.replaceChildren();const heading=document.createElement('h2');heading.textContent=`${selectedIds.size} selected`;panel.append(heading);
    const scopes=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent='Selection action scope';scopes.append(legend);
    for(const [value,label] of [['all',`All selected (${selectedIds.size})`],['matches',`Matches current filters (${matching.length})`]]) {
      const wrapper=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name='selection-action-scope';radio.value=value;radio.checked=panelScope===value;radio.setAttribute('aria-label',label);radio.addEventListener('change',()=>{panelScope=value;paint();});wrapper.append(radio,document.createTextNode(label));scopes.append(wrapper);
    }
    const actions=document.createElement('div');actions.className='title-tools';const records=affected();
    for(const [label,action] of [
      [`Move selected (${records.length})`,()=>onMove(records)],
      [`Place selected (${records.length})`,()=>onPlace(records,currentResults,context)],
      [`Mark selected watched (${records.length})`,()=>onStatus(records,'watched')],
      [`Dismiss selected (${records.length})`,()=>onStatus(records,'dismissed')],
      [`Deselect (${records.length})`,()=>{for(const record of records)selectedIds.delete(record.id);changed();}],
    ]) {const button=organizationButton(label,action);button.disabled=!records.length;actions.append(button);}
    const clear=organizationButton('Clear selection',()=>{selectedIds.clear();changed();});clear.disabled=!selectedIds.size;actions.append(clear);panel.append(scopes,actions);
    for(const [label,members] of [['In here',matching],['Elsewhere',snapshot.records.filter(record=>selectedIds.has(record.id) && !currentResults.some(item=>item.id===record.id))]]) {
      if(!members.length)continue;
      const title=document.createElement('h3');title.textContent=`${label} (${members.length})`;panel.append(title);
      const table=document.createElement('table');const head=document.createElement('tr');for(const text of ['Video','From','']){const th=document.createElement('th');th.textContent=text;head.append(th);}const thead=document.createElement('thead');thead.append(head);table.append(thead);
      const body=document.createElement('tbody');for(const record of members){const row=document.createElement('tr');const title=document.createElement('td');title.textContent=displayTitle(record);const from=document.createElement('td');from.textContent=snapshot.lists.find(list=>list.id===record.user.destination)?.name ?? 'Destination unavailable';const action=document.createElement('td');action.append(organizationButton(`Deselect ${displayTitle(record)}`,()=>{selectedIds.delete(record.id);changed();}));row.append(title,from,action);body.append(row);}table.append(body);panel.append(table);
    }
  }
  function update(next,results,nextContext) {
    snapshot=next;currentResults=results;context=nextContext;
    const active=new Set(next.records.map(record=>record.id));for(const id of selectedIds)if(!active.has(id))selectedIds.delete(id);
    paint();
  }
  function enhanceRow(row,record) {
    const label=document.createElement('label');label.className='record-selection';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.selectRecord=record.id;checkbox.setAttribute('aria-label',`Select ${displayTitle(record)}`);checkbox.checked=selectedIds.has(record.id);
    checkbox.addEventListener('click',event=>event.stopPropagation());checkbox.addEventListener('change',()=>{checkbox.checked?selectedIds.add(record.id):selectedIds.delete(record.id);changed();});label.append(checkbox);row.prepend(label);
    row.addEventListener('click',event=>{if(event.defaultPrevented || event.target.closest('button,input,select,a,summary,[role=button],label'))return;checkbox.checked=!selectedIds.has(record.id);checkbox.dispatchEvent(new Event('change'));});
  }
  function processed(ids) {for(const id of ids ?? [])selectedIds.delete(id);paint();}
  return {selectedIds,get selectedOnly(){return selectedOnly;},get currentResults(){return currentResults;},get context(){return context;},controls,panel,update,enhanceRow,affected,processed};
}
