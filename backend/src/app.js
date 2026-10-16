import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { apiRoutes } from './routes/index.js';
import { authService } from './services/auth.js';
import { ApiError } from './lib/errors.js';

export function createApp({ repository, catalog, config }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxyHops) app.set('trust proxy', config.trustProxyHops);
  app.use(helmet({ contentSecurityPolicy: { directives: { imgSrc: ["'self'", 'https://i.scdn.co', 'https://mosaic.scdn.co', 'https://*.mzstatic.com', 'https://coverartarchive.org', 'https://archive.org', 'https://*.archive.org'], connectSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"] } } }));
  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '16kb' }), cookieParser());
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const origin = req.headers.origin;
    const sameOrigin = `${req.protocol}://${req.get('host')}`;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && origin && origin !== config.frontendUrl && origin !== sameOrigin) return next(new ApiError(403, 'No se permite esta solicitud desde ese sitio.'));
    next();
  });
  app.use('/api', apiRoutes({ repository, catalog, config, auth: authService(repository, config.jwtSecret) }));
  app.use('/api', (req, res, next) => next(new ApiError(404, 'La ruta solicitada no existe.')));
  const dist = fileURLToPath(new URL('../../frontend/dist', import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*path}', (req, res) => res.sendFile(`${dist}/index.html`));
  }
  app.use((error, req, res, next) => {
    const status = error.status || 500;
    if (status >= 500) console.error(`[api] ${req.method} ${req.path}: ${error.message}`);
    res.status(status).json({ error: status >= 500 && !(error instanceof ApiError) ? 'No pudimos completar la solicitud. Inténtalo de nuevo.' : error.message, ...(error.fields ? { fields: error.fields } : {}) });
  });
  return app;
}
