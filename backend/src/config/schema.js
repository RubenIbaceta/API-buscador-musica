import { readFile } from 'node:fs/promises';

export async function applySchema(pool) {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
}
