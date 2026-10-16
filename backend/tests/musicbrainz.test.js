import { test } from 'node:test';
import assert from 'node:assert/strict';
import { musicBrainzService, normalizeRecording, recordingQuery, defaultUserAgent } from '../src/services/musicbrainz.js';
import { musicCatalog } from '../src/services/catalog.js';
import { songSchema } from '../src/middlewares/validation.js';

const id = 'a1111111-1111-4111-8111-111111111111';
const releaseId = 'b2222222-2222-4222-8222-222222222222';
const groupId = 'c3333333-3333-4333-8333-333333333333';
const recording = { id, title: 'Una canción', length: 200000, 'artist-credit': [{ name: 'Uno', joinphrase: ' & ' }, { artist: { name: 'Dos' }, joinphrase: '' }], releases: [{ id: releaseId, title: 'Un álbum', status: 'Official', 'release-group': { id: groupId, 'primary-type': 'Album' } }] };
const response = { data: { count: 21, recordings: [recording] } };
function clock() {
  let time = 0;
  return { now: () => time, sleep: async ms => { time += ms; }, advance: ms => { time += ms; } };
}

test('MusicBrainz: normalizes credits, official album, cover and namespaced recording ID', () => {
  const song = normalizeRecording({ ...recording, releases: [{ id, title: 'A compilation', status: 'Official', 'release-group': { 'primary-type': 'Album', 'secondary-types': ['Compilation'] } }, ...recording.releases] });
  assert.deepEqual(song, { id: `musicbrainz-${id}`, title: 'Una canción', artist: 'Uno & Dos', album: 'Un álbum', image: `https://coverartarchive.org/release-group/${groupId}/front-250`, durationMs: 200000, url: `https://musicbrainz.org/recording/${id}` });
  assert.equal(songSchema.safeParse(song).success, true);
});

test('MusicBrainz: sparse recordings stay saveable without invented art or duration', () => {
  const song = normalizeRecording({ id, title: 'Sparse' });
  assert.equal(song.artist, 'Artista sin identificar'); assert.equal(song.image, null); assert.equal(song.durationMs, 0);
  assert.equal(songSchema.safeParse(song).success, true);
  assert.equal(normalizeRecording(null), null); assert.equal(normalizeRecording({ id: 'invalid', title: 'x' }), null);
  assert.equal(normalizeRecording({ ...recording, releases: [{ id: releaseId, title: 'Single' }] }).image, `https://coverartarchive.org/release/${releaseId}/front-250`);
});

test('MusicBrainz: searches literal words across song, artist and album, without Lucene injection', async () => {
  assert.equal(recordingQuery('Beach House'), '(recording:"Beach" OR artist:"Beach" OR release:"Beach") AND (recording:"House" OR artist:"House" OR release:"House")');
  assert.ok(recordingQuery('artist:* "x"').includes('artist\\:\\*'));
  const calls = [];
  const service = musicBrainzService({}, { async get(url, options) { calls.push({ url, options }); return response; } }, clock());
  const result = await service.search('Beach House', 10);
  assert.equal(calls[0].url, 'https://musicbrainz.org/ws/2/recording/');
  assert.equal(calls[0].options.headers['User-Agent'], defaultUserAgent);
  assert.deepEqual(calls[0].options.params, { query: recordingQuery('Beach House'), fmt: 'json', limit: 10, offset: 10 });
  assert.equal(result.source, 'musicbrainz'); assert.equal(result.hasMore, true);
  assert.equal((await service.search('Beach House', 990)).hasMore, false);
});

test('MusicBrainz: groups identical in-flight requests and caches successful pages for five minutes', async () => {
  const timer = clock(); let calls = 0;
  const service = musicBrainzService({}, { async get() { calls++; return response; } }, timer);
  await Promise.all([service.search('Song'), service.search('song')]); assert.equal(calls, 1);
  await service.search('song'); assert.equal(calls, 1);
  timer.advance(300001); await service.search('song'); assert.equal(calls, 2);
  await service.search('song', 10); assert.equal(calls, 3);
});

test('MusicBrainz: cache is bounded and evicts least recently used pages', async () => {
  let calls = 0;
  const service = musicBrainzService({}, { async get() { calls++; return response; } }, clock());
  for (let i = 0; i < 100; i++) await service.search(`query${i}`);
  await service.search('query0'); await service.search('new'); await service.search('query0');
  assert.equal(calls, 101);
  await service.search('query1'); assert.equal(calls, 102);
});

test('MusicBrainz: concurrent distinct searches start at least 1100ms apart; queue is bounded', async () => {
  const timer = clock(); const starts = [];
  const service = musicBrainzService({}, { async get() { starts.push(timer.now()); return response; } }, timer);
  const results = await Promise.allSettled(['one', 'two', 'three', 'four'].map(q => service.search(q)));
  assert.deepEqual(starts, [0, 1100, 2200]);
  assert.equal(results.filter(result => result.status === 'rejected' && result.reason.status === 429).length, 1);
});

test('MusicBrainz: overload honors Retry-After, returns friendly errors and recovers without caching failures', async () => {
  const timer = clock(); let calls = 0;
  const service = musicBrainzService({}, { async get() { calls++; if (calls === 1) throw { response: { status: 503, headers: { 'retry-after': '60' } } }; return response; } }, timer);
  await assert.rejects(service.search('song'), error => error.status === 503);
  await assert.rejects(service.search('song'), error => error.status === 503);
  assert.equal(calls, 1);
  timer.advance(60000); assert.equal((await service.search('song')).items.length, 1); assert.equal(calls, 2);
});

test('MusicBrainz: invalid responses and network failures cannot masquerade as empty successful results', async () => {
  for (const http of [{ async get() { return { data: {} }; } }, { async get() { throw new Error('timeout'); } }]) {
    await assert.rejects(musicBrainzService({}, http, clock()).search('song'), error => error.status === 502);
  }
});

test('catalog: initial selection needs no external credentials; offline provider remains explicit', async () => {
  const initial = await musicCatalog({ musicProvider: 'musicbrainz' }).search('');
  assert.equal(initial.source, 'selection'); assert.equal(initial.items.length, 8);
  const offline = await musicCatalog({ musicProvider: 'demo' }).search('raiz');
  assert.equal(offline.source, 'demo'); assert.equal(offline.items[0].title, 'Hasta la Raíz');
});
