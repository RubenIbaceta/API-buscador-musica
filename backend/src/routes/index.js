import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../lib/errors.js';
import { authController } from '../controllers/auth.js';
import { songsController } from '../controllers/songs.js';
import { favoritesController } from '../controllers/favorites.js';
import { validate, registrationSchema, loginSchema, searchSchema, songSchema } from '../middlewares/validation.js';

export function apiRoutes({ auth, repository, catalog, config }) {
  const router = Router();
  const requireAuth = async (req, res, next) => {
    const token = req.cookies.savia_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) throw new ApiError(401, 'Inicia sesión para guardar tus canciones.');
    req.user = await auth.authenticate(token); next();
  };
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Demasiados intentos. Espera 15 minutos antes de volver a intentar.' } });
  const searchLimit = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Espera un momento antes de volver a buscar.' } });
  const users = authController(auth, config.production);
  const songs = songsController(catalog);
  const favorites = favoritesController(repository);
  router.get('/health', (req, res) => res.json({ status: 'ok', mode: config.demo ? 'demo' : 'live' }));
  router.post('/auth/register', authLimit, validate(registrationSchema), users.register);
  router.post('/auth/login', authLimit, validate(loginSchema), users.login);
  router.post('/auth/logout', users.logout);
  router.get('/auth/me', requireAuth, users.me);
  router.get('/songs', searchLimit, validate(searchSchema, 'query'), songs.search);
  router.get('/favorites', requireAuth, favorites.list);
  router.post('/favorites', requireAuth, validate(songSchema), favorites.add);
  router.delete('/favorites/:id', requireAuth, favorites.remove);
  return router;
}
