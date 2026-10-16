import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { readConfig } from './settings.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
export const config = readConfig(process.env);
