let selectedFormat = 'browser';
const listeners = new Set();

export function setDateFormat(value) {
  selectedFormat = value === 'israeli' ? 'israeli' : 'browser';
  for (const listener of listeners) listener();
}

export function onDateFormatChanged(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function formatDateTime(value, format = selectedFormat, locale = globalThis.navigator?.language, timeZone) {
  if (typeof value !== 'string' || !value.trim()) return 'Unknown';
  const iso = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!iso) return 'Unknown';
  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  if (calendarDate.getUTCFullYear() !== Number(iso[1]) || calendarDate.getUTCMonth() + 1 !== Number(iso[2]) || calendarDate.getUTCDate() !== Number(iso[3])) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  let browserLocaleAvailable = false;
  if (format !== 'israeli' && locale) {
    try { browserLocaleAvailable = Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0; }
    catch { /* An unavailable locale uses the Israeli fallback. */ }
  }
  const options = browserLocaleAvailable
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  if (timeZone) options.timeZone = timeZone;
  return new Intl.DateTimeFormat(browserLocaleAvailable ? locale : 'en-GB', options).format(date);
}
