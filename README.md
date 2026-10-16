# Savia

Repositorio: [RubenIbaceta/API-buscador-musica](https://github.com/RubenIbaceta/API-buscador-musica).

Buscador de canciones y colección personal de favoritos. React + Vite, Node.js + Express y PostgreSQL.
Busca en **MusicBrainz por defecto**, sin claves ni Spotify Premium. Spotify sigue disponible
como proveedor opcional. MusicBrainz ofrece información musical, sin reproducción de audio.
**El challenge original exige Spotify**: usa `MUSIC_PROVIDER=spotify` para cumplir ese requisito;
la variante MusicBrainz adapta ese punto y conserva autenticación y favoritos.
Interfaz editorial clara inspirada en la opción ElevenLabs del catálogo local: Cormorant Garamond,
DM Sans, blanco suave, tinta oscura, portadas reales y controles negros.

## Arranque rápido de la muestra

Requiere Node.js 22.12 o superior y npm.

```powershell
npm install
npm run dev
```

Abre **http://127.0.0.1:5173**. La API escucha en **http://127.0.0.1:5000**.
Si no existe `backend/.env` ni `DATABASE_URL`, el entorno de desarrollo usa cuentas locales
y búsquedas reales en MusicBrainz. La portada inicial presenta 8 canciones elegidas.
Puedes registrar cuentas de prueba, iniciar sesión, buscar,
guardar, quitar y deshacer favoritos. Las cuentas y los favoritos de la muestra están en
memoria y se borran al reiniciar el backend. No introduzcas contraseñas personales en esta muestra.
Para una muestra totalmente sin conexión, define `MUSIC_PROVIDER=demo` (sólo 8 canciones).

## PostgreSQL y búsqueda real

1. MusicBrainz no requiere una cuenta ni claves. Deja `MUSIC_PROVIDER=musicbrainz`.
   Las cuentas de Savia son propias y los favoritos se guardan en PostgreSQL.
2. Copia `backend/.env.example` a `backend/.env` y completa `DATABASE_URL` y `JWT_SECRET`.
   Deja `MUSIC_PROVIDER=musicbrainz` y `DEMO_MODE=false`.
   Genera un secreto aleatorio de al menos 32 caracteres; no lo publiques ni lo pongas en el frontend.
3. Usa tu PostgreSQL o inicia la base local con Docker Desktop abierto:

   ```powershell
   docker compose up -d db
   ```

   La configuración local de ejemplo crea `spotify_challenge` con el usuario `savia`.
   El puerto sólo se expone en localhost. Las credenciales de Compose son exclusivas para desarrollo.
4. Ejecuta las migraciones y arranca la aplicación:

   ```powershell
   npm run db:migrate
   npm run dev
   ```

5. Entra con una cuenta nueva, busca una canción y guárdala. Detén y vuelve a iniciar el servidor:
   el favorito debe continuar en la colección. Las cuentas de la muestra no se migran a PostgreSQL.

`FRONTEND_URL` debe coincidir exactamente con el origen de tu navegador; usa `127.0.0.1` en
ambas direcciones o configura el origen si prefieres `localhost`. `SPOTIFY_MARKET=CL` se puede
cambiar a otro código de mercado de dos letras cuando uses Spotify. La búsqueda muestra 10 resultados
por página, cancela peticiones obsoletas, retrasa 650ms las búsquedas al escribir y permite cargar más.

Para usar Spotify, crea una aplicación en [Spotify for Developers](https://developer.spotify.com/dashboard),
define `MUSIC_PROVIDER=spotify` y completa `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` sólo en el backend.
El flujo es **Client Credentials**, sin login OAuth de Spotify. Consulta los requisitos vigentes de su dashboard.

MusicBrainz se consulta desde Express con un User-Agent identificable, una cola de hasta 3 búsquedas,
al menos 1,1 segundos entre solicitudes y caché de 5 minutos (máximo 100 páginas). Las peticiones
simultáneas idénticas se agrupan. Los errores del proveedor se muestran sin sustituirlos por datos de muestra.
El control de solicitudes es por proceso: al desplegar, usa una sola instancia de backend; varias réplicas
requieren un limitador compartido. Su API es gratuita para uso no comercial.
Documentación: [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API),
[Cover Art Archive](https://musicbrainz.org/doc/Cover_Art_Archive/API).

Documentación oficial: [Client Credentials](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
y [Search](https://developer.spotify.com/documentation/web-api/reference/search).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Frontend y backend, con recarga automática |
| `npm test` | Pruebas de API, seguridad, repositorio SQL y proveedores musicales |
| `npm run build` | Compila el frontend en `frontend/dist` |
| `npm start` | Sirve API y frontend compilado desde el puerto 5000 |
| `npm run db:migrate` | Crea tablas e índice de forma idempotente |

Para producción define `NODE_ENV=production`, las variables reales y HTTPS en el proxy.
El proceso rechaza `DEMO_MODE=true` en producción y exige un secreto de JWT de al menos
32 caracteres. La cookie es `Secure` en producción. Para servir todo desde el mismo proceso,
configura `FRONTEND_URL` con el origen público HTTPS. En Render se obtiene automáticamente de
`RENDER_EXTERNAL_URL`. El servidor usa `0.0.0.0` en producción y loopback en desarrollo.

Para el despliegue gratuito está preparado `render.yaml` (Render Free + Neon):
[instrucciones](docs/deploy-render-neon.md). El servicio aún requiere conectar las cuentas,
confirmar la base de `api-musica` y completar `DATABASE_URL` en Render. El Blueprint genera
`JWT_SECRET`, configura el proxy y crea las tablas idempotentemente al iniciar (`AUTO_MIGRATE=true`).
No incluye credenciales ni crea recursos de pago. El control de salud no mantiene despierta la base.

## Estructura

```text
backend/
  src/
    config/         entorno, conexión y migración SQL
    controllers/    autenticación, canciones y favoritos
    middlewares/    validación Zod
    models/         repositorios PostgreSQL y muestra en memoria
    routes/         endpoints, protección JWT y límites de uso
    services/       bcrypt/JWT, MusicBrainz, Spotify y selección inicial
    data/           canciones de muestra
  tests/            API, SQL emulado y transportes musicales simulados
frontend/
  src/
    components/     buscador, portadas, lista, navegación y controles
    context/        autenticación y colección
    pages/          explorar, registro, login, colección y créditos
    services/       cliente Axios
  public/           portadas, fuentes locales y créditos
.taste-skill/       brief, dirección, referencias visuales, crítica y revisión
```

## API

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/health` | Estado, persistencia (`mode`) y proveedor (`provider`) |
| POST | `/api/auth/register` | `{ username, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | Elimina cookie de sesión |
| GET | `/api/auth/me` | Requiere sesión |
| GET | `/api/songs?q=…&offset=0` | Búsqueda pública; página de hasta 10 canciones |
| GET | `/api/favorites` | Colección del usuario autenticado |
| POST | `/api/favorites` | Guarda `{ id, title, artist, album, image, durationMs, url }` |
| DELETE | `/api/favorites/:id` | Quita una canción propia |

JWT de 2 horas en cookie HttpOnly con SameSite=Lax; la API también acepta Bearer para clientes
no navegador. React conserva sólo el usuario, nunca el JWT en localStorage. Logout elimina la
cookie; no existe revocación central de un bearer previamente copiado, que caduca a las 2 horas.
Contraseñas bcrypt con costo 12 y validación del límite de 72 bytes. Consultas SQL parametrizadas,
restricción única `(user_id, spotify_id)`, claves foráneas, comprobación del origen en escrituras,
cabeceras Helmet y límites de solicitudes. Secretos de Spotify sólo en backend; bearer del
proveedor cacheado hasta su vencimiento y reintentado una vez ante 401.
Los favoritos de MusicBrainz usan IDs `musicbrainz-<MBID>` y enlaces a grabaciones. Las columnas
históricas `spotify_id` y `spotify_url` almacenan ambos proveedores para conservar compatibilidad
con las cuentas y colecciones anteriores; no hace falta borrar ni recrear tablas.

## Verificación y límites

- Las pruebas usan Supertest, Node test runner y **pg-mem**. Ejecutan las consultas reales del
  repositorio contra un emulador SQL; no equivalen a probar una instancia PostgreSQL externa.
- Spotify se prueba con un transporte simulado (token, caché, concurrencia, 401, 429 y errores).
- Flujo comprobado manualmente en navegador: validar formulario, registrar cuenta, buscar,
  guardar, recargar sesión/colección, quitar, deshacer y cerrar/iniciar sesión.
- Revisión visual a 1440, 768 y 390px; revisión de las Web Interface Guidelines.
- MusicBrainz se prueba con transporte simulado para normalización, límites, caché y fallos.
- Consulta real de MusicBrainz y flujo de favoritos comprobados en navegador;
  resultados revisados a 1440, 390 y 320px. Detalle en `.taste-skill/musicbrainz-review.md`.
- PostgreSQL externo y Spotify requieren completar el entorno y verificar contra esos servicios.
- Código fuente en [GitHub](https://github.com/RubenIbaceta/API-buscador-musica). El despliegue público y la conexión a Neon se configurarán por separado.

## Imágenes y diseño

Las ocho portadas se verificaron mediante Spotify oEmbed y se sirven localmente en la muestra.
Son obras con copyright de sus respectivos titulares; no se declaran de licencia abierta.
El detalle de cada fuente está en `frontend/public/credits.json` y es accesible desde **Créditos**.
Las canciones de la selección inicial enlazan a Spotify. Los resultados de MusicBrainz enlazan
a su ficha de grabación y buscan la portada en Cover Art Archive; se muestra un disco neutro
si no hay imagen. Pueden aparecer distintas grabaciones de una misma canción. Una duración
desconocida se muestra como «—». Las duraciones del catálogo estático son valores de muestra;
las búsquedas reales usan los datos del proveedor seleccionado.

No se usan las fotografías inventadas de las referencias visuales como portadas de artistas.
Dos imágenes generadas sirvieron únicamente como guía de composición y se conservan en
`.taste-skill/references`. Las fuentes son locales, bajo SIL Open Font License; Lucide es ISC.
La documentación de diseño y revisión está en `.taste-skill/`.
