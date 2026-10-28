import { organizationButton as button } from './organization-ui.js';
import { UNKNOWN_CHANNEL } from './browse-model.js';
export function renderBrowseControls(state,derived,{onScope,onChannel,onExpand,onPreference,onClear}) {
  const controls=document.querySelector('#browse-controls');
  const active=document.activeElement;
  const focusKey=controls.contains(active) ? active.dataset.channelId ?? active.textContent : null;
  controls.replaceChildren();
  const searchScope=button('Search entire Library',onScope);searchScope.setAttribute('aria-pressed',String(state.scopeId===null));searchScope.className+=' scope-toggle';
  const channelScope=button('Across Library',onScope);channelScope.setAttribute('aria-pressed',String(state.scopeId===null));channelScope.className+=' scope-toggle';
  const scope=document.createElement('div');scope.className='scope-controls';scope.append(searchScope,channelScope,button('Clear filters',onClear));
  const channels=document.createElement('div');channels.className='channel-controls';channels.setAttribute('aria-label','Channels');
  const all=button('All channels',()=>onChannel(null));all.setAttribute('aria-pressed',String(state.channelId===null));channels.append(all);
  for(const item of [...derived.visibleChannels,{id:UNKNOWN_CHANNEL,name:'Channel unknown'}]) {
    const channel=button(`${item.name} · ${derived.channelCounts.get(item.id) ?? 0}`,()=>onChannel(state.channelId===item.id?null:item.id));
        const count=document.createElement('span');count.className='channel-count';count.textContent=String(derived.channelCounts.get(item.id) ?? 0);
    channel.replaceChildren(document.createTextNode(`${item.name} · `),count);
        if(item.id!==UNKNOWN_CHANNEL) {
      channel.title=`Recorded channel identity: ${item.id}`;channel.setAttribute('aria-description',channel.title);
      if((state.anchor ?? []).filter(known=>known.name===item.name).length>1) {const identity=document.createElement('small');identity.className='channel-identity';identity.setAttribute('aria-hidden','true');identity.textContent=item.id;channel.append(identity);}
    }
    channel.setAttribute('aria-pressed',String(state.channelId===item.id));channel.dataset.channelId=item.id;channels.append(channel);
  }
  if(derived.channelTotal>5) channels.append(button(state.expandedChannels?'Show fewer channels':`Show all ${derived.channelTotal} channels`,onExpand));
  const presentation=document.createElement('div');presentation.className='presentation-controls';
  for(const [key,values] of [['density',['thumbnails','compact']],['orientation',['columns','rows']]]) for(const value of values) {
    const control=button(value[0].toUpperCase()+value.slice(1),()=>onPreference(key,value));control.setAttribute('aria-pressed',String(state[key]===value));presentation.append(control);
  }
    controls.append(scope,channels,presentation);
  if(focusKey!==null) {
    const replacement=[...controls.querySelectorAll('button')].find(control=>(control.dataset.channelId ?? control.textContent)===focusKey || (/^Show (all|fewer)/.test(focusKey) && /^Show (all|fewer)/.test(control.textContent)));
    replacement?.focus({preventScroll:true});
  }
}
