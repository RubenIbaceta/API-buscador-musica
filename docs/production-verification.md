# Verificación pública de Savia

Fecha: 16 de octubre de 2026, America/Santiago.
URL: https://api-buscador-musica.onrender.com
Referencia del código en el repositorio al comprobar la web: 139e577. El identificador
exacto del despliegue no se consultó en el panel privado de Render.

Historia comprobada: abrir Savia → buscar en MusicBrainz → registrar una cuenta propia →
guardar una canción en PostgreSQL → recuperarla al recargar y al volver a iniciar sesión.

| Límite del flujo | Resultado | Evidencia |
| --- | --- | --- |
| Web pública | Correcto | Página y fuentes cargan por HTTPS |
| Estado de la API | Correcto | `/api/health`: `status=ok`, `mode=live`, `provider=musicbrainz` |
| Búsqueda externa | Correcto | Beach House: 3.618 resultados en la prueba; fichas reales y portada de House on the Hill |
| Registro | Correcto | Cuenta ficticia creada; sesión abierta y nombre mostrado |
| Guardado | Correcto | House on the Hill aparece en Mi colección |
| Lectura persistente | Correcto | El favorito reaparece tras recargar `/coleccion` y cerrar/abrir sesión |
| Eliminación | Correcto | Favorito de prueba retirado; colección vacía y acción Deshacer disponible |
| Acceso sin sesión | Correcto | `GET /api/favorites` responde 401 y `Cache-Control: no-store` |
| Escritorio y móvil | Correcto | 1440 y 390px: 8 canciones iniciales, sin desbordamientos, imágenes rotas ni controles sin nombre |
| Errores del navegador | Correcto | Sin excepciones de JavaScript en las comprobaciones de carga |

Se creó una cuenta ficticia de QA y se retiró su favorito al terminar. La cuenta permanece en
la base; no se añadieron datos personales reales ni se publicaron credenciales.

La persistencia se comprobó mediante solicitudes de la aplicación: en modo live el servidor usa
el repositorio PostgreSQL y rechaza arrancar sin la base configurada. No se accedió al panel de
Neon, no se verificó su rama/región ni se reinició Render. El endpoint health no consulta la base
en cada llamada; la evidencia de escritura/lectura procede del flujo de cuenta y favoritos.

Las 31 pruebas automatizadas del código del repositorio habían pasado antes del despliegue.
Esta revisión no modifica código de aplicación ni demuestra disponibilidad continua.
