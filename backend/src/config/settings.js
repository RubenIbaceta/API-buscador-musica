import { randomBytes } from 'node:crypto';

export function readConfig(values) {
  const production = values.NODE_ENV === 'production';
  const musicProvider = values.MUSIC_PROVIDER || 'musicbrainz';
  if (!['musicbrainz', 'spotify', 'demo'].includes(musicProvider)) throw new Error('MUSIC_PROVIDER debe ser musicbrainz, spotify o demo.');
  const demo = values.DEMO_MODE === 'true' || (!production && !values.DATABASE_URL && values.DEMO_MODE !== 'false');
  if (production && demo) throw new Error('DEMO_MODE no está permitido en producción.');
  if (!demo && !values.DATABASE_URL) throw new Error('Configura DATABASE_URL en el entorno del backend.');
  if (!demo && (!values.JWT_SECRET || values.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  const port = Number(values.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
  const trustProxyHops = Number(values.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 5) throw new Error('TRUST_PROXY_HOPS debe ser un número entre 0 y 5.');
  const frontendUrl = (values.FRONTEND_URL || values.RENDER_EXTERNAL_URL || (!production ? 'http://127.0.0.1:5173' : '')).replace(/\/$/, '');
  let origin;
  try { origin = new URL(frontendUrl); } catch { throw new Error('Configura FRONTEND_URL con el origen público de la web.'); }
  if (origin.origin !== frontendUrl || !['https:', 'http:'].includes(origin.protocol) || (production && origin.protocol !== 'https:')) throw new Error('FRONTEND_URL debe ser un origen válido; en producción debe usar HTTPS.');
  return {
    port, host: values.HOST || (production ? '0.0.0.0' : '127.0.0.1'), production, demo, musicProvider,
    trustProxyHops, autoMigrate: values.AUTO_MIGRATE === 'true', frontendUrl,
    databaseUrl: values.DATABASE_URL, jwtSecret: values.JWT_SECRET || randomBytes(48).toString('hex'),
    musicBrainzUserAgent: values.MUSICBRAINZ_USER_AGENT,
    spotifyClientId: values.SPOTIFY_CLIENT_ID, spotifyClientSecret: values.SPOTIFY_CLIENT_SECRET,
    market: values.SPOTIFY_MARKET || 'CL'
  };
}
