import { config } from './config/env.js';
import { createPool } from './config/db.js';
import { applySchema } from './config/schema.js';
import { memoryRepository } from './models/memory.js';
import { postgresRepository } from './models/postgres.js';
import { musicCatalog } from './services/catalog.js';
import { createApp } from './app.js';

const pool = config.demo ? null : createPool(config.databaseUrl);
if (pool) {
  if (config.autoMigrate) await applySchema(pool);
  await pool.query('SELECT id FROM users LIMIT 1');
}
const catalog = musicCatalog(config);
const app = createApp({ config, repository: pool ? postgresRepository(pool) : memoryRepository(), catalog });
const server = app.listen(config.port, config.host, () => {
  console.log(`Savia API: http://${config.host}:${config.port}`);
  console.log(config.demo ? 'Cuentas y favoritos locales: se borran al reiniciar.' : 'PostgreSQL conectado.');
  console.log(`Proveedor de búsqueda: ${catalog.provider}.`);
});
async function shutdown() { server.close(async () => { if (pool) await pool.end(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
