import pg from 'pg';

export function createPool(connectionString) {
  const pool = new pg.Pool({ connectionString, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 });
  pool.on('error', () => console.error('[database] Una conexión inactiva se cerró; se abrirá otra cuando sea necesario.'));
  return pool;
}
