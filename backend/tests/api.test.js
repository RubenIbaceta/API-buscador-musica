import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { newDb } from 'pg-mem';
import { postgresRepository } from '../src/models/postgres.js';
import { createApp } from '../src/app.js';
import { demoCatalog } from '../src/services/demo.js';

const config = { demo: true, production: false, jwtSecret: 'test-only-secret-with-more-than-32-characters', frontendUrl: 'http://127.0.0.1:5173' };
const person = { username: 'Ruben', email: 'ruben@example.test', password: 'secure-test-password' };
const song = { id: '7H0ya83CMmgFcOhw0UB6ow', title: 'Space Song', artist: 'Beach House', album: 'Depression Cherry', image: '/images/space-song.jpg', durationMs: 320466, url: 'https://open.spotify.com/track/7H0ya83CMmgFcOhw0UB6ow' };
let pool; let app; let repository;
beforeEach(async () => {
  const db = newDb();
  db.public.none(readFileSync(new URL('../src/config/schema.sql', import.meta.url), 'utf8'));
  const adapter = db.adapters.createPg(); pool = new adapter.Pool(); repository = postgresRepository(pool);
  app = createApp({ config, repository, catalog: { ...demoCatalog(), demo: true } });
});
afterEach(async () => { await pool.end(); });

test('register: stores bcrypt hash and returns only public data with HttpOnly cookie', async () => {
  const response = await request(app).post('/api/auth/register').send(person).expect(201);
  assert.deepEqual(Object.keys(response.body.user).sort(), ['email', 'id', 'username']);
  assert.equal(response.body.token, undefined);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/);
  assert.match(response.headers['set-cookie'][0], /SameSite=Lax/);
  const stored = await repository.findUserByEmail(person.email);
  assert.notEqual(stored.password, person.password);
  assert.equal(await bcrypt.compare(person.password, stored.password), true);
});
test('register: validates email, password length and username; duplicate is 409', async () => {
  const bad = await request(app).post('/api/auth/register').send({ username: 'x', email: 'bad', password: 'short' }).expect(400);
  assert.ok(bad.body.fields.email); assert.ok(bad.body.fields.password);
  await request(app).post('/api/auth/register').send(person).expect(201);
  await request(app).post('/api/auth/register').send(person).expect(409);
});
test('register: rejects bcrypt truncation from multibyte password', async () => {
  await request(app).post('/api/auth/register').send({ ...person, password: 'á'.repeat(40) }).expect(400);
});
test('session: registration, me, logout and login; email is case insensitive', async () => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ ...person, email: person.email.toUpperCase() }).expect(201);
  assert.equal((await agent.get('/api/auth/me').expect(200)).body.user.email, person.email);
  await agent.post('/api/auth/logout').expect(204);
  await agent.get('/api/auth/me').expect(401);
  await agent.post('/api/auth/login').send({ email: person.email, password: person.password }).expect(200);
  await agent.get('/api/auth/me').expect(200);
});
test('login: wrong password and unknown user have the same error', async () => {
  await request(app).post('/api/auth/register').send(person);
  const wrong = await request(app).post('/api/auth/login').send({ email: person.email, password: 'wrong' }).expect(401);
  const unknown = await request(app).post('/api/auth/login').send({ email: 'unknown@example.test', password: 'wrong' }).expect(401);
  assert.equal(wrong.body.error, unknown.body.error);
});
test('JWT: missing, expired and forged tokens cannot access favorites', async () => {
  await request(app).get('/api/favorites').expect(401);
  await request(app).get('/api/favorites').set('Authorization', 'Bearer forged').expect(401);
  const token = jwt.sign({}, config.jwtSecret, { subject: '1', expiresIn: -5, issuer: 'savia', audience: 'savia-web' });
  await request(app).get('/api/favorites').set('Authorization', `Bearer ${token}`).expect(401);
});
test('favorites: add, deduplicate, list, persist across repository instances, remove', async () => {
  const agent = request.agent(app);
  const registration = await agent.post('/api/auth/register').send(person);
  await agent.post('/api/favorites').send(song).expect(201);
  await agent.post('/api/favorites').send(song).expect(201);
  assert.deepEqual((await agent.get('/api/favorites').expect(200)).body.items, [song]);
  assert.deepEqual(await postgresRepository(pool).getFavorites(registration.body.user.id), [song]);
  await agent.delete(`/api/favorites/${song.id}`).expect(204);
  assert.deepEqual((await agent.get('/api/favorites')).body.items, []);
  await agent.delete(`/api/favorites/${song.id}`).expect(404);
});
test('favorites: one account cannot read or delete another account collection', async () => {
  const a = request.agent(app); const b = request.agent(app);
  await a.post('/api/auth/register').send(person);
  await b.post('/api/auth/register').send({ ...person, username: 'Otra persona', email: 'other@example.test' });
  await a.post('/api/favorites').send(song).expect(201);
  assert.deepEqual((await b.get('/api/favorites').expect(200)).body.items, []);
  await b.delete(`/api/favorites/${song.id}`).expect(404);
  assert.equal((await a.get('/api/favorites')).body.items.length, 1);
});
test('favorites: rejects unsafe artwork and offsite song links', async () => {
  const agent = request.agent(app); await agent.post('/api/auth/register').send(person);
  await agent.post('/api/favorites').send({ ...song, image: 'javascript:alert(1)' }).expect(400);
  await agent.post('/api/favorites').send({ ...song, url: 'https://malicious.test/track/x' }).expect(400);
});

test('favorites: persists MusicBrainz alongside Spotify and validates recording identity and cover host', async () => {
  const id = 'a1111111-1111-4111-8111-111111111111';
  const music = { ...song, id: `musicbrainz-${id}`, url: `https://musicbrainz.org/recording/${id}`, image: `https://coverartarchive.org/release/${id}/front-250` };
  const agent = request.agent(app); const registration = await agent.post('/api/auth/register').send(person);
  await agent.post('/api/favorites').send(song).expect(201);
  await agent.post('/api/favorites').send(music).expect(201);
  await agent.post('/api/favorites').send(music).expect(201);
  assert.deepEqual(await postgresRepository(pool).getFavorites(registration.body.user.id), [music, song]);
  await agent.post('/api/favorites').send({ ...music, id: song.id }).expect(400);
  await agent.post('/api/favorites').send({ ...music, url: song.url }).expect(400);
  await agent.post('/api/favorites').send({ ...music, image: `https://coverartarchive.org.evil.test/release/${id}/front-250` }).expect(400);
  await agent.delete(`/api/favorites/${music.id}`).expect(204);
  assert.deepEqual((await agent.get('/api/favorites')).body.items, [song]);
});
test('search: accent-insensitive sample search, empty and unknown queries', async () => {
  const response = await request(app).get('/api/songs?q=raiz').expect(200);
  assert.equal(response.body.items[0].title, 'Hasta la Raíz');
  assert.equal(response.body.source, 'demo');
  assert.equal((await request(app).get('/api/songs')).body.total, 8);
  assert.deepEqual((await request(app).get('/api/songs?q=does-not-exist')).body.items, []);
  await request(app).get('/api/songs?offset=-1').expect(400);
  await request(app).get(`/api/songs?q=${'x'.repeat(121)}`).expect(400);
});
test('security: rejects cross-origin writes, allows configured origin', async () => {
  await request(app).post('/api/auth/register').set('Origin', 'https://untrusted.test').send(person).expect(403);
  await request(app).post('/api/auth/register').set('Origin', config.frontendUrl).send(person).expect(201);
  await request(app).post('/api/auth/logout').set('Host', '127.0.0.1:5000').set('Origin', 'http://127.0.0.1:5000').expect(204);
});
test('routes: JSON 404 and API cache-control', async () => {
  const response = await request(app).get('/api/missing').expect(404);
  assert.match(response.headers['content-type'], /json/);
  assert.equal(response.headers['cache-control'], 'no-store');
});
test('authentication is rate-limited before expensive password checks', async () => {
  for (let i = 0; i < 30; i++) await request(app).post('/api/auth/login').send({}).expect(400);
  await request(app).post('/api/auth/login').send({}).expect(429);
});
