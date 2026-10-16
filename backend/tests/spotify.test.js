import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spotifyService } from '../src/services/spotify.js';

const config = { spotifyClientId: 'test-client', spotifyClientSecret: 'test-secret', market: 'CL' };
const track = { id: 'track', name: 'A song', artists: [{ name: 'An artist' }], album: { name: 'An album', images: [{ url: 'https://i.scdn.co/image/art' }] }, duration_ms: 200000, external_urls: { spotify: 'https://open.spotify.com/track/track' } };
const result = { data: { tracks: { items: [track], total: 21, next: 'next' } } };
test('Spotify: uses Client Credentials server-side, caches token and normalizes results', async () => {
  let tokens = 0; const searches = [];
  const http = {
    async post(url, body, options) { tokens++; assert.equal(body, 'grant_type=client_credentials'); assert.match(options.headers.Authorization, /^Basic /); return { data: { access_token: 'token', expires_in: 3600 } }; },
    async get(url, options) { searches.push(options); return result; }
  };
  const service = spotifyService(config, http);
  const first = await service.search('music'); await service.search('more', 10);
  assert.equal(tokens, 1); assert.equal(searches[0].params.limit, 10); assert.equal(searches[0].params.market, 'CL');
  assert.equal(searches[1].params.offset, 10);
  assert.deepEqual(first.items[0], { id: 'track', title: 'A song', artist: 'An artist', album: 'An album', image: 'https://i.scdn.co/image/art', durationMs: 200000, url: 'https://open.spotify.com/track/track' });
});
test('Spotify: concurrent searches share token request', async () => {
  let count = 0;
  const service = spotifyService(config, { async post() { count++; await new Promise(resolve => setTimeout(resolve, 10)); return { data: { access_token: 'token', expires_in: 3600 } }; }, async get() { return result; } });
  await Promise.all([service.search('one'), service.search('two')]); assert.equal(count, 1);
});
test('Spotify: refreshes expired bearer token once on 401', async () => {
  let tokens = 0; let searches = 0;
  const service = spotifyService(config, { async post() { tokens++; return { data: { access_token: `token${tokens}`, expires_in: 3600 } }; }, async get() { searches++; if (searches === 1) throw { response: { status: 401 } }; return result; } });
  await service.search('music'); assert.equal(tokens, 2); assert.equal(searches, 2);
});
test('Spotify: missing configuration, upstream rate limit and timeout return useful errors', async () => {
  await assert.rejects(spotifyService({}).search('music'), error => error.status === 503);
  for (const upstream of [429, 500]) {
    const service = spotifyService(config, { async post() { return { data: { access_token: 'token', expires_in: 3600 } }; }, async get() { throw { response: { status: upstream } }; } });
    await assert.rejects(service.search('music'), error => error.status === (upstream === 429 ? 429 : 502));
  }
});
