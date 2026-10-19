import { command } from './shared.js';
const save = document.querySelector('#save');
const status = document.querySelector('[role=status]');
save.addEventListener('click', async () => {
  save.disabled = true;
  status.textContent = 'Saving…';
  const result = await command({ type: 'save' });
  status.textContent = result.ok ? (result.outcome === 'alreadySaved' ? 'Already saved' : 'Saved to Inbox') : result.error;
  save.disabled = false;
});
document.querySelector('#library').addEventListener('click', async () => {
  const result = await command({ type: 'openLibrary' });
  if (!result.ok) status.textContent = result.error;
});
