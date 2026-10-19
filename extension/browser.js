const STORAGE_KEY = 'library';

// All browser-specific access lives here; Library commands depend on this boundary.
export function createBrowserAdapter(api = chrome) {
  return {
    async capture() {
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) throw new Error('No usable current tab.');
      return { url: tab.url, title: tab.title ?? null, source: 'browser-tab', observedAt: new Date().toISOString() };
    },
    async read() { return (await api.storage.local.get(STORAGE_KEY))[STORAGE_KEY] ?? null; },
    async write(state) { await api.storage.local.set({ [STORAGE_KEY]: state }); },
    async openLibrary() { return api.tabs.create({ url: api.runtime.getURL('library.html'), active: true }); },
    async createTab(url) { return api.tabs.create({ url, active: true }); },
    now() { return new Date().toISOString(); },
    id() { return crypto.randomUUID(); },
  };
}
