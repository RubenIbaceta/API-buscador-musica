import { config } from './config/env.js';
import { createPool } from './config/db.js';
import { memoryRepository } from './models/memory.js';
import { postgresRepository } from './models/postgres.js';
import { demoCatalog } from './services/demo.js';
import { spotifyService } from './services/spotify.js';
import { createApp } from './app.js';

const pool = config.demo ? null : createPool(config.databaseUrl);
if (pool) await pool.query('SELECT id FROM users LIMIT 1');
const catalog = config.demo ? { ...demoCatalog(), demo: true } : spotifyService(config);
const app = createApp({ config, repository: pool ? postgresRepository(pool) : memoryRepository(), catalog });
const server = app.listen(config.port, '127.0.0.1', () => {
  console.log(`Savia API: http://127.0.0.1:${config.port}`);
  console.log(config.demo ? 'Muestra local: catálogo de ejemplo; cuentas y favoritos se borran al reiniciar.' : 'PostgreSQL conectado. Búsquedas mediante Spotify.');
});
async function shutdown() { server.close(async () => { if (pool) await pool.end(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
