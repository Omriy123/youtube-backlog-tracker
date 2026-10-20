// Syntax identity only: no availability or similarity inference.
export function identify(raw) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a public HTTP(S) link.');
  if (url.port) return `url:${url.href}`;
  const host = url.hostname;
  const youtube = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host);
  if (youtube && url.pathname === '/watch') {
    const ids = url.searchParams.getAll('v');
    if (ids.length === 1 && /^[A-Za-z0-9_-]{11}$/.test(ids[0])) return `youtube:${ids[0]}`;
  }
  const pathId = youtube ? url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})\/?$/) : host === 'youtu.be' ? url.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/) : null;
  if (pathId && !url.searchParams.has('v')) return `youtube:${pathId[1]}`;
  if (['twitch.tv', 'www.twitch.tv'].includes(host) && /^\/videos\/[1-9][0-9]*\/?$/.test(url.pathname) && !['video', 'channel', 'clip'].some(key => url.searchParams.has(key))) return `twitch:${url.pathname.split('/')[2]}`;
  if (host === 'player.twitch.tv' && url.pathname === '/' && !url.searchParams.has('channel') && !url.searchParams.has('clip')) {
    const ids = url.searchParams.getAll('video');
    if (ids.length === 1 && /^v?[1-9][0-9]*$/.test(ids[0])) return `twitch:${ids[0].replace(/^v/, '')}`;
  }
  return `url:${url.href}`;
}
