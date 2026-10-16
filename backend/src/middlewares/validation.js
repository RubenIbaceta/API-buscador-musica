import { z } from 'zod';
import { ApiError } from '../lib/errors.js';

const email = z.email('Escribe un correo válido.').max(100).transform(value => value.toLowerCase());
const password = z.string().min(8, 'Usa al menos 8 caracteres.').refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Usa una contraseña de hasta 72 bytes.');
export const registrationSchema = z.object({ username: z.string().trim().min(2, 'Usa al menos 2 caracteres.').max(50, 'Usa hasta 50 caracteres.').regex(/^[\p{L}\p{N} _.-]+$/u, 'Usa letras, números, espacios, puntos o guiones.'), email, password });
export const loginSchema = z.object({ email, password: z.string().min(1, 'Escribe tu contraseña.').max(200) });
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const recordingUrl = new RegExp(`^https://musicbrainz\\.org/recording/(${uuid})$`);
const coverUrl = new RegExp(`^https://coverartarchive\\.org/(release|release-group)/${uuid}/front-(250|500|1200)$`);
const spotifyUrl = /^https:\/\/open\.spotify\.com\/(track\/[A-Za-z0-9]+|search\/[^\s]+)$/;
const image = z.string().max(2048).refine(value => /^https:\/\/(i\.scdn\.co|mosaic\.scdn\.co|[a-z0-9-]+\.mzstatic\.com)\//.test(value) || coverUrl.test(value) || /^\/images\/[a-z0-9-]+\.(jpg|webp|png)$/.test(value), 'La portada no es válida.').nullable().default(null);
export const songSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/), title: z.string().trim().min(1).max(255),
  artist: z.string().trim().min(1).max(255), album: z.string().max(255).default(''), image,
  durationMs: z.number().int().min(0).max(86400000).default(0),
  url: z.url().max(2048).refine(value => spotifyUrl.test(value) || recordingUrl.test(value), 'El enlace debe abrir Spotify o MusicBrainz.')
}).superRefine((song, context) => {
  const recording = song.url.match(recordingUrl);
  if ((recording && song.id !== `musicbrainz-${recording[1]}`) || (!recording && song.id.startsWith('musicbrainz-'))) context.addIssue({ code: 'custom', path: ['id'], message: 'La canción y su enlace no coinciden.' });
});
export const searchSchema = z.object({ q: z.string().trim().max(120, 'Busca con un máximo de 120 caracteres.').default(''), offset: z.coerce.number().int().min(0).max(990).default(0) });

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const fields = Object.fromEntries(result.error.issues.map(issue => [issue.path[0], issue.message]));
    return next(new ApiError(400, 'Revisa los datos e inténtalo de nuevo.', fields));
  }
  req.validated = result.data; next();
};
