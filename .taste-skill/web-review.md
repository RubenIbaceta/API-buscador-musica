# Web Interface Guidelines

Fuente actualizada: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
Revisión: 16 de octubre de 2026. Alcance: frontend/src y frontend/index.html.
Revisión de código, árbol accesible y flujos en navegador. No es una certificación WCAG ni una auditoría con lectores de pantalla.

## frontend/src/App.jsx

✓ pass — enlace para saltar al contenido, foco al navegar, títulos por ruta, avisos aria-live y Deshacer.

## frontend/src/pages/Auth.jsx

✓ pass — etiquetas, nombres y autocomplete; campos de email y contraseña; validación con foco al primer error; mensaje global alert; pegado permitido; mostrar contraseña con nombre y estado; aviso antes de cerrar con cambios.

## frontend/src/pages/Explore.jsx

✓ pass — búsqueda reflejada en URL; cancelación de solicitudes obsoletas; estado anunciado; carga, vacío, error y reintento; controles semánticos.

## frontend/src/pages/Collection.jsx

✓ pass — sesión, vacío, filtrado, error y reintento; títulos jerárquicos y colección identificada.

## frontend/src/pages/Credits.jsx

✓ pass — fuentes de imágenes enlazadas; error anunciado; navegación real.

## frontend/src/components/SearchForm.jsx

✓ pass — label, name, autocomplete, límite de texto, botón de limpiar con nombre y foco devuelto al campo; controles accesibles por teclado.

## frontend/src/components/FavoriteButton.jsx

✓ pass — nombre accesible contextual, aria-pressed, operación en curso, feedback y restauración explícita.

## frontend/src/components/SongList.jsx

✓ pass — lista semántica; enlaces reales a Spotify o MusicBrainz, texto resistente a títulos largos, números tabulares, nombres accesibles según proveedor; duración ausente identificada.

## frontend/src/components/AlbumSheet.jsx

✓ pass — portadas enlazadas, controles de favoritos separados de los enlaces, iconos decorativos ocultos.

## frontend/src/components/Cover.jsx

✓ pass — alt, dimensiones explícitas, carga diferida, prioridad en imágenes críticas, respaldo visible al cargar o fallar.

## frontend/src/components/Header.jsx

✓ pass — nav nombrada, enlaces activos, nombre contextual para salir, error de cierre de sesión comunicado.

## frontend/src/components/Footer.jsx

✓ pass — enlaces reales a créditos y proveedor activo; persistencia local identificada.

## frontend/src/components/Brand.jsx

✓ pass — enlace nombrado, SVG decorativo oculto, marca con translate=no.

## frontend/src/components/EmptyState.jsx

✓ pass — título, explicación y acciones semánticas.

## frontend/src/context/AuthContext.jsx

✓ pass — sesión en cookie HttpOnly, solicitudes cancelables, limpia usuario tras 401 de sesión vencida.

## frontend/src/context/LibraryContext.jsx

✓ pass — solicitudes cancelables, controles contra acciones concurrentes y estado aislado por usuario.

## frontend/src/styles.css

✓ pass — foco visible (el buscador usa focus-within); estados hover/press; reduced-motion; sólo transform/opacity en animaciones; sin transition:all; min-width:0; safe areas; content-visibility para listas; texto con saltos y contraste; sin zoom bloqueado.

## frontend/index.html

✓ pass — lang=es, viewport sin restringir zoom, theme-color, precarga de fuentes locales y preconnect a portadas remotas.

## Ajustes hechos durante la revisión

- Se acortó el placeholder móvil para que no cortara la instrucción.
- Se aumentó el tamaño y contraste de las notas explicativas.
- Se corrigió Deshacer para restaurar explícitamente y evitar una segunda eliminación.
- Se agregaron precargas de fuentes locales, safe areas y tratamiento de listas largas.
- Se simplificó el título de acceso para mantener dos líneas en móvil.

La capitalización se adapta al español y al sentence case solicitado por design-taste-frontend;
no se aplica el Title Case inglés a todos los títulos.

La revisión adicional del proveedor MusicBrainz está en musicbrainz-review.md.
