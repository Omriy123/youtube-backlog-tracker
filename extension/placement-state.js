// A missing historical date is distinct from an initial Inbox decision still due.
function decisionEvidence(user) {
  return Boolean(user && (user.firstInboxExitAt != null || user.initialPlacementComplete===true ||
    user.status && user.status!=='active' || user.destination && user.destination!=='Inbox' ||
    user.pendingReview || user.lastDismissal || user.watchEvents?.length));
}
function initialPlacementComplete(state,record) {
  if(decisionEvidence(record.user))return true;
  if(record.user.initialPlacementComplete===false)return false;
  // Legacy Inbox records may have returned through deletion or rediscovery.
  // Reversed first decisions are not evidence that the decision remains complete.
  const recovered=new Set(state.history.filter(item=>item.type==='undoOrganization').map(item=>item.actionId));
  const undoneOpenings=new Set([...(state.openings ?? []).filter(item=>item.phase==='undone').map(item=>item.id),...state.history.filter(item=>item.type==='undoOpening').map(item=>item.openingId)]);
  return state.history.some(item=>{
    if(item.type==='organization' && !recovered.has(item.id))return item.changes.some(change=>change.kind==='records' && change.id===record.id && (decisionEvidence(change.before?.user) || decisionEvidence(change.after?.user)));
    if(item.recordId!==record.id)return false;
    return ['rediscovery','keepRediscovery','dismissRediscovery'].includes(item.type) || item.type==='opening' && !undoneOpenings.has(item.openingId);
  });
}
export function completeInitialPlacement(state,record,at) {
  const complete=initialPlacementComplete(state,record);
  if(!complete && record.user.firstInboxExitAt==null)record.user.firstInboxExitAt=at;
  record.user.initialPlacementComplete=true;
}
