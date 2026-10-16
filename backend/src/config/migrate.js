import { config } from './env.js';
import { createPool } from './db.js';
import { applySchema } from './schema.js';

if (!config.databaseUrl) throw new Error('Configura DATABASE_URL antes de ejecutar la migración.');
const pool = createPool(config.databaseUrl);
try {
  await applySchema(pool);
  console.log('Tablas users y favorites listas.');
} finally { await pool.end(); }
