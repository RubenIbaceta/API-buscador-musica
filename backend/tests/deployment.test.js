import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDb } from 'pg-mem';
import request from 'supertest';
import { readConfig } from '../src/config/settings.js';
import { applySchema } from '../src/config/schema.js';
import { createApp } from '../src/app.js';
import { memoryRepository } from '../src/models/memory.js';
import { demoCatalog } from '../src/services/demo.js';

const production = { NODE_ENV: 'production', DATABASE_URL: 'postgresql://example.invalid/test', JWT_SECRET: 'test-only-secret-with-more-than-32-characters', RENDER_EXTERNAL_URL: 'https://savia-test.onrender.com', TRUST_PROXY_HOPS: '1', AUTO_MIGRATE: 'true' };

test('deployment: Render origin, port, public binding and migrations work without Spotify credentials', () => {
  const config = readConfig({ ...production, PORT: '10000' });
  assert.equal(config.demo, false); assert.equal(config.musicProvider, 'musicbrainz');
  assert.equal(config.frontendUrl, production.RENDER_EXTERNAL_URL); assert.equal(config.host, '0.0.0.0');
  assert.equal(config.port, 10000); assert.equal(config.trustProxyHops, 1); assert.equal(config.autoMigrate, true);
  assert.equal(config.spotifyClientId, undefined);
  assert.equal(readConfig({ ...production, FRONTEND_URL: 'https://musica.example.com/' }).frontendUrl, 'https://musica.example.com');
});

test('deployment: rejects incomplete production configuration, insecure origins and invalid proxy settings', () => {
  for (const change of [{ DEMO_MODE: 'true' }, { DATABASE_URL: '' }, { JWT_SECRET: 'short' }, { FRONTEND_URL: 'http://example.com' }, { FRONTEND_URL: 'https://example.com/path' }, { PORT: 'NaN' }, { TRUST_PROXY_HOPS: 'true' }, { TRUST_PROXY_HOPS: '-1' }]) {
    assert.throws(() => readConfig({ ...production, ...change }));
  }
  assert.throws(() => readConfig({ ...production, RENDER_EXTERNAL_URL: '' }));
  const local = readConfig({});
  assert.equal(local.host, '127.0.0.1'); assert.equal(local.demo, true); assert.equal(local.autoMigrate, false); assert.equal(local.trustProxyHops, 0);
});

test('deployment: repeated schema initialization preserves accounts and favorites', async () => {
  // pg-mem's coverage checker flags skipped constraints when IF NOT EXISTS is a no-op.
  const adapter = newDb({ noAstCoverageCheck: true }).adapters.createPg(); const pool = new adapter.Pool();
  try {
    await applySchema(pool);
    await pool.query("INSERT INTO users(username,email,password) VALUES('Prueba','prueba@example.test','hash')");
    await pool.query("INSERT INTO favorites(user_id,spotify_id,title,artist) VALUES(1,'musicbrainz-test','Song','Artist')");
    await applySchema(pool);
    assert.equal((await pool.query('SELECT * FROM users')).rows.length, 1);
    assert.equal((await pool.query('SELECT * FROM favorites')).rows.length, 1);
    await assert.rejects(pool.query("INSERT INTO users(username,email,password) VALUES('Otra','prueba@example.test','hash')"), error => error.code === '23505');
  } finally { await pool.end(); }
});

test('deployment: HTTPS behind Render accepts same-origin writes, sends Secure cookies and blocks other origins', async () => {
  const config = readConfig(production);
  const app = createApp({ config, repository: memoryRepository(), catalog: demoCatalog() });
  assert.equal(app.get('trust proxy'), 1);
  const response = await request(app).post('/api/auth/register').set('Origin', config.frontendUrl).set('X-Forwarded-Proto', 'https').send({ username: 'Prueba', email: 'render@example.test', password: 'test-only-password' }).expect(201);
  assert.match(response.headers['set-cookie'][0], /Secure/);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/);
  await request(app).post('/api/auth/logout').set('Origin', 'https://other.example.com').set('X-Forwarded-Proto', 'https').expect(403);
});
