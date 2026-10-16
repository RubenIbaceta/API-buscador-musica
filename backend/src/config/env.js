import dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
const production = process.env.NODE_ENV === 'production';
const demo = process.env.DEMO_MODE === 'true' || (!production && !process.env.DATABASE_URL && process.env.DEMO_MODE !== 'false');
if (production && demo) throw new Error('DEMO_MODE no está permitido en producción.');
if (!demo && !process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en backend/.env.');
if (!demo && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');

export const config = {
  port: Number(process.env.PORT || 5000), production, demo,
  frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  market: process.env.SPOTIFY_MARKET || 'CL'
};
