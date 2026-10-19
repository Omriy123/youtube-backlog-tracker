export async function command(message) {
  try { return await chrome.runtime.sendMessage(message); }
  catch { return { ok: false, error: 'Cannot reach the Library. Please try again.' }; }
}
export function displayTitle(record) {
  return record.user.personalTitle || record.metadata.observations.find(item => item.title)?.title || record.metadata.observations.at(-1)?.title || record.url;
}
