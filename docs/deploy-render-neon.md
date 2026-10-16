# Publicar Savia con Render Free y Neon

Estado: publicado en https://api-buscador-musica.onrender.com, con el flujo principal verificado
el 16 de octubre de 2026. Proyecto de Neon indicado por el usuario: **api-musica**.
La base, rama y región no se inspeccionaron desde el panel de Neon; el registro y los favoritos
se comprobaron mediante la aplicación pública y su repositorio PostgreSQL.
Para otra instalación, confirma la base elegida antes de aplicar las tablas.

La web React compilada y la API Express se sirven juntas desde Render. No hace falta separar
el frontend en Vercel: todas las solicitudes usan `/api` y la sesión permanece en el mismo origen.

## Crear el servicio

1. Conecta las cuentas de Neon y Render para configurar el despliegue desde Codex, o sigue estos
   pasos en sus paneles. No pegues credenciales en el chat ni las guardes en GitHub.
2. En Neon, abre `api-musica`, confirma la rama y base que contendrán las tablas `users` y `favorites`,
   y obtén su conexión PostgreSQL con SSL. Se recomienda la conexión agrupada para la aplicación.
3. En Render, crea un **Blueprint** desde
   [API-buscador-musica](https://github.com/RubenIbaceta/API-buscador-musica), rama `main`.
   El archivo `render.yaml` fija explícitamente `plan: free` y no crea una base en Render.
   Revisa la región y el nombre del servicio antes de crearlo; el nombre puede estar ocupado.
4. Guarda la conexión de Neon en el secreto `DATABASE_URL` del servicio de Render.
   El Blueprint genera `JWT_SECRET` aleatoriamente. Mantén ambos valores sólo en el backend.
5. Crea el servicio. Render instala dependencias, compila React y arranca Express en el puerto
   que proporciona. `AUTO_MIGRATE=true` crea tablas e índice si faltan, sin borrar datos existentes.
   Esto se ejecuta al iniciar porque el comando pre-deploy requiere un servicio de pago.
6. Comprueba que el despliegue termine correctamente y abre la URL pública asignada por Render.

Si creas un Web Service manualmente, usa estos mismos valores:

| Campo | Valor |
| --- | --- |
| Repositorio | `RubenIbaceta/API-buscador-musica` |
| Rama | `main` |
| Root Directory | Vacío: raíz del repositorio |
| Runtime | Node |
| Plan | Free |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `DEMO_MODE` | `false` |
| `MUSIC_PROVIDER` | `musicbrainz` |
| `AUTO_MIGRATE` | `true` |
| `TRUST_PROXY_HOPS` | `1` |
| `DATABASE_URL` | Conexión SSL de Neon, guardada como secreto |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 caracteres |

`FRONTEND_URL` se obtiene automáticamente de `RENDER_EXTERNAL_URL`. Para usar un dominio propio,
define `FRONTEND_URL=https://tu-dominio.example`, sin ruta. No uses la dirección local en producción.
El servidor escucha en `0.0.0.0` en producción; en desarrollo mantiene `127.0.0.1`.
El proxy confiable se limita a un salto. No expongas ese mismo proceso por una ruta alternativa
que evite el proxy de Render ni aumentes el valor sin verificar la cadena real de proxies.

## Comprobar la publicación

- `/api/health` debe devolver `status: ok`, `mode: live`, `provider: musicbrainz`.
  Este control comprueba el proceso; no consulta PostgreSQL repetidamente para no impedir que Neon duerma.
- La portada, `/registro`, `/coleccion` y `/creditos` deben abrir directamente sin 404.
- Registra una cuenta de prueba, busca una canción fuera de la selección inicial y guárdala.
- Recarga, cierra y abre sesión. Después reinicia el servicio: el favorito debe seguir en Neon.
- Revisa que la cookie use HttpOnly, Secure y SameSite=Lax; confirma que las escrituras desde
  un origen ajeno se rechacen y que los logs no contengan secretos.

Las verificaciones públicas de registro, login, búsqueda, recarga y favoritos se completaron;
el detalle está en [production-verification.md](production-verification.md). No se reinició el
servicio ni se inspeccionaron sus ajustes privados o los logs internos de Render.

## Límites gratuitos

Render Free detiene el servicio tras 15 minutos sin tráfico y el siguiente acceso puede tardar
aproximadamente un minuto en iniciarlo. Las cuentas y favoritos permanecen en Neon.
El plan tiene límites mensuales; confirma que la cuenta conserve gasto máximo cero o suspensión
al agotar sus cuotas, sin aceptar ampliaciones de pago. MusicBrainz es gratuito para uso no comercial
y limita las consultas a una por segundo. Mantén un solo proceso de backend.

Referencias oficiales:
[Render Free](https://render.com/docs/free),
[Blueprints](https://render.com/docs/blueprint-spec),
[puerto y HTTPS](https://render.com/docs/web-services),
[variables de Render](https://render.com/docs/environment-variables),
[conexión Node.js a Neon](https://neon.com/docs/guides/node).
