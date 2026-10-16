import axios from 'axios';
import { ApiError } from '../lib/errors.js';

export const normalizeTrack = track => ({
  id: track.id, title: track.name, artist: track.artists.map(artist => artist.name).join(', '),
  album: track.album.name, image: track.album.images?.[0]?.url || null,
  durationMs: track.duration_ms || 0, url: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`
});

export function spotifyService(config, http = axios) {
  let cached; let expiresAt = 0; let pending;
  async function accessToken() {
    if (cached && Date.now() < expiresAt) return cached;
    if (!pending) pending = (async () => {
      const { data } = await http.post('https://accounts.spotify.com/api/token', new URLSearchParams({ grant_type: 'client_credentials' }).toString(), {
        headers: { Authorization: `Basic ${Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000
      });
      cached = data.access_token; expiresAt = Date.now() + Math.max(0, data.expires_in - 60) * 1000;
      return cached;
    })().finally(() => { pending = null; });
    return pending;
  }
  return {
    async search(q, offset = 0) {
      if (!config.spotifyClientId || !config.spotifyClientSecret) throw new ApiError(503, 'La búsqueda de Spotify aún no está configurada. Inténtalo más tarde.');
      try {
        let response;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            response = await http.get('https://api.spotify.com/v1/search', {
              headers: { Authorization: `Bearer ${await accessToken()}` },
              params: { q, type: 'track', market: config.market, limit: 10, offset }, timeout: 10000
            }); break;
          } catch (error) {
            if (error.response?.status !== 401 || attempt) throw error;
            cached = null; expiresAt = 0;
          }
        }
        const tracks = response.data.tracks;
        return { items: tracks.items.filter(Boolean).map(normalizeTrack), total: tracks.total, hasMore: Boolean(tracks.next) && offset < 990, offset, source: 'spotify' };
      } catch (error) {
        if (error.response?.status === 429) throw new ApiError(429, 'Spotify está recibiendo muchas búsquedas. Espera un momento y vuelve a intentar.');
        throw new ApiError(502, 'No pudimos conectar con Spotify. Vuelve a intentar en un momento.');
      }
    }
  };
}
