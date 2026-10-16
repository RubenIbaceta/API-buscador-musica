# Savia — informe final

Opción 3 del usuario: editorial claro inspirado en ElevenLabs.
Dirección de composición: **The contact sheet**, seed **1631**. Sin redraws.
Se conservaron paleta y tipografía de la referencia elegida, usando fuentes abiertas:
Cormorant Garamond y DM Sans, en lugar de fuentes propietarias. Sin orbes ni gradientes.
Se adaptó la cantidad de imágenes al contenido real: una selección de cuatro discos y
ocho canciones de muestra, en lugar de 24 proyectos de portfolio que esta aplicación no tiene.

**Idea:** en Savia, las canciones que cada persona decide guardar se convierten en una
hoja de contacto de discos. **Interacción:** buscar, guardar y recuperar favoritos propios.
No se reclama exclusividad de esta metáfora; la valoración de creatividad se limita a 7.

Valoración interna final de la página principal, sobre capturas: diseño 7.8, usabilidad 8.1,
creatividad 7.0, contenido 7.7; ponderación 40/30/20/10: **7.7/10**. Es una autoevaluación,
no una calificación externa. Se conservaron los límites documentados en critique.md.

## Verificación

- Compilación de producción correcta.
- 17 pruebas de backend correctas: API, bcrypt, JWT, cookies, aislamiento, validación,
  SQL parametrizado, favoritos, límites de uso, y transporte de Spotify con token/cache/reintento.
- SQL probado con pg-mem, sin instancia PostgreSQL externa.
- Navegador: registro, validación, buscar, guardar, recargar sesión, colección, quitar,
  Deshacer corregido y comprobado, salir y volver a entrar con la colección conservada.
- 9 casos de render en movimiento reducido: 0 desbordamientos, imágenes rotas, controles
  sin nombre, animaciones activas ni excepciones JavaScript. Incluye móvil de 320 y 390px.
- Inspección principal a 1440, 768 y 390px: 0 FAIL y 1 WARN por ausencia de vídeo. No se
  coloca un vídeo decorativo en una app de búsqueda que no ofrece reproducción propia.
- Registro: 0 FAIL con excepción de cantidad de fotos por tratarse de un formulario.
  Movimiento moderado documentado. Informe de Web Interface Guidelines en web-review.md.

## Imágenes y créditos

No se usaron fotografías del paquete, imágenes de archivo ni clips externos. Las referencias
generadas son guías de composición; sus fotos ficticias no se presentan como portadas reales.
No se generan imágenes de artistas, reseñas, datos de uso o testimonios.
El único dibujo propio es la marca SVG inspirada en un disco.

Portadas: obras con copyright, no licencia abierta. Autores visuales individuales no
identificados por la fuente; cada artista musical se indica como intérprete y los derechos
corresponden a sus respectivos titulares. Fuentes verificadas con Spotify oEmbed, enlace
a cada canción y URL exacta de imagen en frontend/public/credits.json.
Créditos visibles desde **Créditos**, en el pie de todas las pantallas.

| Obra / álbum | Intérprete | Fuente |
| --- | --- | --- |
| Depression Cherry / Space Song | Beach House | https://open.spotify.com/track/7H0ya83CMmgFcOhw0UB6ow |
| Being Funny in a Foreign Language / About You | The 1975 | https://open.spotify.com/track/1fDFHXcykq4iw8Gg7s5hG9 |
| Hasta la Raíz | Natalia Lafourcade | https://open.spotify.com/track/3lGMtkONrZdJ8kTCg6KIFf |
| Bon Iver / Holocene | Bon Iver | https://open.spotify.com/track/4fbvXwMTXPWaFyaMWUm9CR |
| Currents / The Less I Know The Better | Tame Impala | https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ |
| Rumours / Dreams | Fleetwood Mac | https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz |
| Discovery / Something About Us | Daft Punk | https://open.spotify.com/track/1NeLwFETswx8Fzxl2AFl91 |
| Show Me How | Men I Trust | https://open.spotify.com/track/01TyFEZu6mHbffsVfxgrFn |

## Pendiente de configurar antes del uso real

Completar backend/.env con PostgreSQL, secreto JWT y Client ID/Secret de Spotify; ejecutar
la migración; verificar búsquedas y persistencia contra esos servicios. Las duraciones del
catálogo estático son datos de muestra; el modo real usa los datos de Spotify.
Las cuentas y favoritos de la muestra se borran al reiniciar. El despliegue público se configurará por separado.

## Referencias generadas

Herramienta integrada image_gen, modo ui-mockup, fondo opaco.
Salidas copiadas a `.taste-skill/references/savia-explore.png` y `savia-song-list.png`.
Prompt 1: captura de escritorio 1440×1000 de Savia, editorial ElevenLabs claro,
fondo #f5f5f3, tinta #292524, logo de disco, navegación Explorar/Mi colección,
título “Tu próxima buena canción.” en dos líneas serif, apoyo enfrentado,
buscador blanco con botón negro y hoja de cuatro portadas cuadradas. Sin gradientes,
orbes, líneas, sombras, badges, playback ni chrome de navegador.
Prompt 2: captura independiente 1440×900 de la lista “Un punto de partida”,
DM Sans para datos, serif para título, seis filas con portada, canción, artista,
álbum, duración, corazón y enlace a Spotify; hover blanco; cierre savia / “Una canción
lleva a otra.”. Sin tarjetas anidadas, divisores ni reproducción ficticia.

La imagen final del producto real está en `.taste-skill/preview.jpg`.
