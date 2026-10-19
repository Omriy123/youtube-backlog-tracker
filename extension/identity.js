// Syntax identity only: no availability or similarity inference.
export function identify(raw) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a public HTTP(S) link.');
  if (url.port) return `url:${url.href}`;
  const host = url.hostname;
  if (['youtube.com', 'www.youtube.com'].includes(host) && url.pathname === '/watch') {
    const ids = url.searchParams.getAll('v');
    if (ids.length === 1 && /^[A-Za-z0-9_-]{11}$/.test(ids[0])) return `youtube:${ids[0]}`;
  }
  if (host === 'youtu.be' && /^\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) return `youtube:${url.pathname.slice(1)}`;
  if (['twitch.tv', 'www.twitch.tv'].includes(host) && /^\/videos\/[1-9][0-9]*\/?$/.test(url.pathname)) return `twitch:${url.pathname.split('/')[2]}`;
  return `url:${url.href}`;
}
