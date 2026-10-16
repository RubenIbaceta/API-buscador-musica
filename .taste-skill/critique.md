ROUND 1
Seen in one second: un título serif monumental y cuatro portadas reales.
Idea (one sentence): la colección de Savia se convierte en una hoja de contacto de discos.
Live thing: búsqueda de canciones, favoritos y colección privada.
Layout words by section: hero=texto enfrentado / selección=hoja de portadas / canciones=lista / footer=marca y cierre.
Scores: design 7.8 · usability 7.7 · creativity 7.0 · content 7.7 → overall 6.0 (cap).
Caps applied: 2 FAIL del inspector: detector de etiqueta y cuerpo dominante a 13px.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. mobile-fold.jpg: placeholder demasiado largo; acortarlo a “Canción, artista o álbum…”.
2. desktop-page-01.jpg / mobile-page-01.jpg: nota de muestra y pie pequeños; subir a 16px y tinta completa.
3. desktop-fold.jpg: “Prueba con” añade un rótulo innecesario; quitarlo y nombrar semánticamente el grupo.

La advertencia de no-footage se defiende: esta app muestra canciones, no reproduce audio ni
necesita un vídeo decorativo ajeno; las portadas tienen una entrada de 2,5s y no un bucle.
Nunca se oculta contenido esperando JavaScript de animación. El movimiento reducido deja todo visible.

ROUND 2
Seen in one second: título editorial y portadas, con el buscador visible en todos los anchos.
Idea (one sentence): la colección de Savia se convierte en una hoja de contacto de discos.
Live thing: búsqueda compartible por URL, favoritos y colección con Deshacer.
Layout words by section: hero=texto enfrentado / selección=hoja de portadas / canciones=lista / footer=cierre tipográfico.
Scores: design 7.8 · usability 8.1 · creativity 7.0 · content 7.7 → overall 7.7.
Caps applied: creatividad limitada a 7, porque la metáfora de colección musical también aplica a competidores.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. inspect-auth/mobile-fold.jpg: “Tu música.Tu lugar.” queda sin espacio al esconder br; conservar dos líneas explícitas.
2. inspect-auth/mobile-page-01.jpg: aviso de muestra pequeño; subirlo a tamaño de lectura y tinta completa.
3. No se detecta un tercer problema visual que justifique una modificación de composición.

ROUND 3
Seen in one second: la misma identidad editorial clara de la referencia elegida.
Idea (one sentence): la colección personal de Savia se ordena como una hoja de contacto de discos.
Live thing: buscar, guardar, quitar y restaurar canciones; formularios reales con sesión.
Layout words by section: hero=texto enfrentado / selección=hoja de portadas / canciones=lista / footer=cierre tipográfico.
Scores: design 7.8 · usability 8.1 · creativity 7.0 · content 7.7 → overall 7.7.
Caps applied: creatividad máxima 7 por metáfora compartida con otros productos de música.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. No hay un nuevo problema visual que justifique seguir cambiando la composición.
2. Limitación de contenido: el catálogo completo requiere credenciales reales de Spotify.
3. Limitación de verificación: PostgreSQL real no disponible; el repositorio se comprobó con pg-mem.

Todos los folds y hojas de escritorio, tablet y móvil fueron vistos. Gate principal: 0 FAIL,
1 WARN (sin vídeo, justificado por el producto). Registro: 0 FAIL con few-pictures permitido
porque es un formulario de aplicación, fuera del uso principal de la skill, y no se añaden
imágenes de relleno para alcanzar cuatro. Quedan avisos de vídeo y movimiento moderado:
9 elementos móviles / 12 escritorio, suficientes para feedback de formulario; no se agregan
16 movimientos a una pantalla de acceso. El título cabe en dos líneas en ambos formularios.
