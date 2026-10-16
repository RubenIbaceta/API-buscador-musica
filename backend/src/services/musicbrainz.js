import axios from 'axios';
import { ApiError } from '../lib/errors.js';

const mbid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const text = value => typeof value === 'string' ? value.trim().slice(0, 255) : '';
export const defaultUserAgent = 'Savia/1.0.0 (https://github.com/RubenIbaceta/API-buscador-musica)';

export function recordingQuery(query) {
  return query.trim().split(/\s+/).map(word => {
    const literal = word.replace(/([+\-!(){}\[\]^"~*?:\\/|&])/g, '\\$1');
    return `(recording:"${literal}" OR artist:"${literal}" OR release:"${literal}")`;
  }).join(' AND ');
}

export function normalizeRecording(recording) {
  if (!recording || !mbid.test(recording.id) || !text(recording.title)) return null;
  const credits = Array.isArray(recording['artist-credit']) ? recording['artist-credit'].filter(credit => credit && typeof credit === 'object') : [];
  const artist = credits.map((credit, index) => `${text(credit.name) || text(credit.artist?.name)}${credit.joinphrase ?? (index < credits.length - 1 ? ', ' : '')}`).join('').trim();
  const releases = Array.isArray(recording.releases) ? recording.releases.filter(release => release && mbid.test(release.id)) : [];
  const rank = release => (release.status === 'Official' ? 4 : 0) + (release['release-group']?.['primary-type'] === 'Album' ? 2 : 0) - (release['release-group']?.['secondary-types']?.includes('Compilation') ? 3 : 0);
  const release = releases.reduce((best, candidate) => !best || rank(candidate) > rank(best) ? candidate : best, null);
  const groupId = release?.['release-group']?.id;
  const art = mbid.test(groupId) ? `release-group/${groupId}` : release ? `release/${release.id}` : null;
  return {
    id: `musicbrainz-${recording.id}`, title: text(recording.title), artist: text(artist) || 'Artista sin identificar',
    album: text(release?.title), image: art ? `https://coverartarchive.org/${art}/front-250` : null,
    durationMs: Number.isInteger(recording.length) && recording.length > 0 && recording.length <= 86400000 ? recording.length : 0,
    url: `https://musicbrainz.org/recording/${recording.id}`
  };
}

// One catalog instance per backend process. Multiple replicas need a shared limiter.
export function musicBrainzService(config = {}, http = axios, { now = Date.now, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const cache = new Map(); const pending = new Map();
  let tail = Promise.resolve(); let queued = 0; let nextStart = 0;
  async function searchUpstream(q, offset) {
    if (queued >= 3) throw new ApiError(429, 'Hay varias búsquedas en curso. Espera unos segundos y vuelve a intentar.');
    queued++;
    const enqueuedAt = now();
    const task = tail.then(async () => {
      const delay = Math.max(0, nextStart - now());
      if (now() - enqueuedAt + delay > 5000) throw new ApiError(503, 'MusicBrainz está ocupado. Vuelve a intentar en unos segundos.');
      if (delay) await sleep(delay);
      nextStart = now() + 1100;
      try {
        const { data } = await http.get('https://musicbrainz.org/ws/2/recording/', {
          headers: { 'User-Agent': config.musicBrainzUserAgent || defaultUserAgent, Accept: 'application/json' },
          params: { query: recordingQuery(q), fmt: 'json', limit: 10, offset }, timeout: 8000
        });
        if (!Array.isArray(data?.recordings) || !Number.isInteger(data.count) || data.count < 0) throw new Error('Invalid MusicBrainz response');
        return { items: data.recordings.map(normalizeRecording).filter(Boolean), total: data.count, hasMore: offset + 10 < data.count && offset < 990, offset, source: 'musicbrainz' };
      } catch (error) {
        if ([429, 503].includes(error.response?.status)) {
          const retryAfter = Number(error.response?.headers?.['retry-after']);
          nextStart = Math.max(nextStart, now() + (Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 60) * 1000 : 3000));
          throw new ApiError(503, 'MusicBrainz está ocupado. Espera unos segundos y vuelve a intentar.');
        }
        throw new ApiError(502, 'No pudimos conectar con MusicBrainz. Vuelve a intentar en un momento.');
      }
    });
    tail = task.catch(() => {});
    try { return await task; } finally { queued--; }
  }
  return {
    async search(q, offset = 0) {
      const key = JSON.stringify([q.trim().toLowerCase(), offset]);
      const cached = cache.get(key);
      if (cached && cached.expiresAt > now()) {
        cache.delete(key); cache.set(key, cached); return cached.result;
      }
      cache.delete(key);
      if (pending.has(key)) return pending.get(key);
      const request = searchUpstream(q, offset).then(result => {
        cache.set(key, { result, expiresAt: now() + 300000 });
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return result;
      }).finally(() => pending.delete(key));
      pending.set(key, request);
      return request;
    }
  };
}
