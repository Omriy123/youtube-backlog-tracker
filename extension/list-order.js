// Mutate inside the caller's existing record/history transaction; never write here.
export function saveManualOrder(state,destinationId,recordIds) {
  const manualOrder=[...recordIds];
  if(destinationId==='Inbox' || destinationId==='Backlog') {
    state.listSettings ??= {};
    state.listSettings[destinationId]={...state.listSettings[destinationId],manualOrder};
  } else {
    const list=state.lists.find(list=>list.id===destinationId);
    if(!list)throw new Error('The destination is no longer available.');
    list.manualOrder=manualOrder;
  }
}
