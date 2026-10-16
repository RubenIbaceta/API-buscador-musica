import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch('/credits.json', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(setCredits).catch(error => { if (error.name !== 'AbortError') setError(true); }); return () => controller.abort(); }, []);
  return <div className="shell credits-page"><Link to="/" className="back-link">Volver a explorar</Link><h1>La música es de sus artistas.</h1><p>Las búsquedas con <a href="https://musicbrainz.org/doc/About" target="_blank" rel="noreferrer">MusicBrainz</a> muestran metadatos de su comunidad y portadas de <a href="https://coverartarchive.org" target="_blank" rel="noreferrer">Cover Art Archive</a>, cuando existen. Sus enlaces abren fichas informativas, sin audio. Las portadas pertenecen a sus respectivos titulares.</p><p>La selección inicial de ocho canciones conserva sus portadas originales y enlaces a Spotify. Estas son sus fuentes:</p><ul className="credits-list">{credits.map(credit => <li key={credit.url}><a href={credit.url} target="_blank" rel="noreferrer">{credit.title}</a><span>{credit.artist}</span></li>)}</ul>{error && <p role="alert">No pudimos cargar los créditos. Vuelve a intentar recargando la página.</p>}<p>Tipografía: Cormorant Garamond y DM Sans, bajo SIL Open Font License. Iconos: Lucide, licencia ISC. Las imágenes generadas se usaron como referencia de diseño; las portadas que ves son las originales.</p></div>;
}
