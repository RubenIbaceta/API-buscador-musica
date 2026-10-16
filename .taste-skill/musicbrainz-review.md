# Integración de MusicBrainz — 16 de octubre de 2026

Repositorio: https://github.com/RubenIbaceta/API-buscador-musica

Proveedor predeterminado: MusicBrainz. Spotify permanece seleccionable con MUSIC_PROVIDER=spotify;
esa opción conserva el requisito específico de Spotify del challenge original. DEMO_MODE controla
la persistencia de cuentas, independientemente del proveedor musical.

## Verificación funcional

- 27 pruebas pasan: autenticación, aislamiento por usuario, SQL emulado, favoritos mixtos,
  validación de enlaces y portadas, normalización, cola, separación de solicitudes, caché,
  agrupación de búsquedas simultáneas y fallos de proveedores.
- Compilación de producción completada.
- Consulta pública real desde Express: Beach House, 3.618 grabaciones en el momento de la prueba;
  10 resultados por página. Un primer 503 del proveedor se comunicó como error recuperable.
- Navegador: registro con datos ficticios, búsqueda, guardado de House on the Hill,
  colección al recargar, eliminación, Deshacer y cierre de sesión comprobados.
- Resultados reales a 1440, 390 y 320px: 10 enlaces a grabaciones, sin desbordamientos,
  imágenes rotas, controles sin nombre ni excepciones de JavaScript. Movimiento reducido respetado.
- Portadas pendientes de descarga muestran un disco neutro; una descarga fallida conserva ese recurso.
  No se sustituye una portada ausente por una imagen de otro álbum.

## Revisión con web-design-guidelines

Reglas consultadas de nuevo en:
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

frontend/src/pages/Explore.jsx:48 — ✓ pass: búsqueda por URL, cancelación, estados y atribución de fuente; sin promesa de audio.
frontend/src/components/SearchForm.jsx:13 — ✓ pass: debounce de 650ms, etiqueta, teclado y foco al limpiar.
frontend/src/components/SongList.jsx:13 — ✓ pass: enlaces nombrados según su proveedor; duración desconocida identificada.
frontend/src/components/AlbumSheet.jsx:10 — ✓ pass: favoritos separados del enlace y nombres accesibles contextuales.
frontend/src/components/Cover.jsx:8 — ✓ pass: dimensiones, alt, prioridad, carga diferida y respaldo visible durante la descarga.
frontend/src/components/Footer.jsx:9 — ✓ pass: proveedor activo y persistencia local comunicados por separado.
frontend/src/pages/Credits.jsx:8 — ✓ pass: fuentes de selección inicial y resultados diferenciadas, enlaces subrayados.
frontend/src/context/AuthContext.jsx:20 — ✓ pass: consulta de estado cancelable, sin credenciales del proveedor en el cliente.
frontend/src/styles.css:100 — ✓ pass: espacio de portada estable; enlaces nuevos identificables y foco visible heredado.
frontend/index.html:13 — ✓ pass: preconnect para las portadas de Cover Art Archive.

Sin hallazgos pendientes en el alcance modificado. Revisión de código y navegador; no es una certificación WCAG.
También se revisaron los componentes modificados con react-best-practices: efectos cancelables,
claves estables, sin medidas de layout en render ni nuevas dependencias de interfaz.

## Revisión visual

Dirección, tipografía y composición de la opción 3 conservadas. Lint: 0 FAIL, 0 WARN.
Inspector de la portada a 1440, 768 y 390px: 0 FAIL, 1 WARN (sin vídeo).
Se mantiene la justificación: una app de información musical no necesita vídeo decorativo ajeno.

ROUND 1 — cambio de proveedor
Seen in one second: buscador editorial y resultados musicales reales.
Idea (one sentence): la colección personal se ordena como una hoja de contacto de discos.
Live thing: búsqueda real en MusicBrainz y favoritos de ambos proveedores.
Layout words by section: hero=texto enfrentado / selección=portadas / resultados=lista / footer=marca.
Scores: design 7.8 · usability 8.1 · creativity 7.0 · content 7.7 → overall 7.7 para la portada.
Caps applied: creatividad máxima 7 por metáfora compartida; los resultados pueden tener menos de cuatro
fotografías por falta de portadas del proveedor, por lo que esa vista de aplicación no aspira al mismo
puntaje editorial. No se inventan imágenes para alcanzar la cuota de una landing.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. musicbrainz-1440.jpg: las portadas remotas lentas dejaban huecos; respaldo de disco visible durante la carga.
2. musicbrainz-390.jpg: nombres de varios artistas son largos; saltos de línea conservados, sin solapamiento a 320px.
3. Contenido: MusicBrainz no incluye audio y puede devolver distintas grabaciones; se explica junto a los resultados.

Límites pendientes: conexión externa a PostgreSQL/Neon y despliegue público, en espera del usuario.
La caché y el limitador son por proceso; usar una instancia de backend o implementar coordinación
compartida antes de escalar réplicas. API gratuita para uso no comercial según MusicBrainz.

Fuentes: https://musicbrainz.org/doc/MusicBrainz_API y https://musicbrainz.org/doc/Cover_Art_Archive/API
