import { createBrowserAdapter } from './browser.js';
import { createLibrary } from './library-service.js';
const browser = createBrowserAdapter();
const library = createLibrary(browser);
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL('')) || !message || typeof message !== 'object') return false;
  const task = message.type === 'openLibrary' ? browser.openLibrary().then(() => ({ ok: true })) : library.command(message);
  task.then(respond, () => respond({ ok: false, error: 'Library change not saved. Please try again.' }));
  return true;
});
