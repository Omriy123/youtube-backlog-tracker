const STORAGE_KEY = 'library';
const DATE_FORMAT_KEY = 'libraryDateFormat';

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
    async readDateFormat() { return (await api.storage.local.get(DATE_FORMAT_KEY))[DATE_FORMAT_KEY] ?? 'browser'; },
    async writeDateFormat(value) { await api.storage.local.set({ [DATE_FORMAT_KEY]: value }); },
    watchDateFormatChanges(listener) {
      const changed = (changes, area) => { if (area === 'local' && changes[DATE_FORMAT_KEY]) listener(changes[DATE_FORMAT_KEY].newValue); };
      api.storage.onChanged.addListener(changed);
      return () => api.storage.onChanged.removeListener(changed);
    },
    watchLibraryChanges(listener) {
      const changed = (changes, area) => { if (area === 'local' && changes[STORAGE_KEY]) listener(); };
      api.storage.onChanged.addListener(changed);
      return () => api.storage.onChanged.removeListener(changed);
    },
    async openLibrary() { return api.tabs.create({ url: api.runtime.getURL('library.html'), active: true }); },
    async createTab(url) { return api.tabs.create({ url, active: true }); },
    async listTabs() { return api.tabs.query({}); },
    async focusTab(tabId) {
      const tab = await api.tabs.update(tabId, { active: true });
      await api.windows.update(tab.windowId, { focused: true });
    },
    now() { return new Date().toISOString(); },
    id() { return crypto.randomUUID(); },
  };
}
