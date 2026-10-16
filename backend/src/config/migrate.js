import { readFile } from 'node:fs/promises';
import { config } from './env.js';
import { createPool } from './db.js';

if (!config.databaseUrl) throw new Error('Configura DATABASE_URL antes de ejecutar la migración.');
const pool = createPool(config.databaseUrl);
try {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('Tablas users y favorites listas.');
} finally { await pool.end(); }
