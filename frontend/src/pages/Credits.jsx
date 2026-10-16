import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch('/credits.json', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(setCredits).catch(error => { if (error.name !== 'AbortError') setError(true); }); return () => controller.abort(); }, []);
  return <div className="shell credits-page"><Link to="/" className="back-link">Volver a explorar</Link><h1>La música es de sus artistas.</h1><p>Las portadas y los metadatos del catálogo de muestra pertenecen a sus respectivos titulares. Cada canción enlaza a Spotify.</p><ul className="credits-list">{credits.map(credit => <li key={credit.url}><a href={credit.url} target="_blank" rel="noreferrer">{credit.title}</a><span>{credit.artist}</span></li>)}</ul>{error && <p role="alert">No pudimos cargar los créditos. Vuelve a intentar recargando la página.</p>}<p>Tipografía: Cormorant Garamond y DM Sans, bajo SIL Open Font License. Iconos: Lucide, licencia ISC. Las imágenes generadas se usaron como referencia de diseño; las portadas que ves son las originales.</p></div>;
}
