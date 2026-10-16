import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { api, errorMessage } from '../services/api';
import SearchForm from '../components/SearchForm';
import AlbumSheet from '../components/AlbumSheet';
import SongList from '../components/SongList';
import EmptyState from '../components/EmptyState';

export default function Explore({ notify }) {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [result, setResult] = useState({ items: [], hasMore: false, source: null, total: 0 });
  const [busy, setBusy] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const currentQuery = useRef(query); currentQuery.current = query;
  const loadController = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    loadController.current?.abort(); setMore(false); setBusy(true); setError('');
    api.get('/songs', { params: { q: query }, signal: controller.signal }).then(({ data }) => setResult(data)).catch(error => { if (error.code !== 'ERR_CANCELED') setError(errorMessage(error)); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => { controller.abort(); loadController.current?.abort(); };
  }, [query, revision]);
  async function loadMore() {
    if (more) return;
    const controller = new AbortController(); loadController.current = controller;
    const requestedQuery = query; setMore(true);
    try {
      const { data } = await api.get('/songs', { params: { q: query, offset: result.offset + 10 }, signal: controller.signal });
      if (currentQuery.current === requestedQuery) setResult(current => ({ ...data, items: [...current.items, ...data.items.filter(song => !current.items.some(item => item.id === song.id))] }));
    } catch (error) { if (error.code !== 'ERR_CANCELED') notify(errorMessage(error)); }
    finally { if (!controller.signal.aborted) setMore(false); }
  }
  const initial = !query;
  return <>
    <section className="hero shell" aria-labelledby="explore-title">
      <div className="hero-intro"><h1 id="explore-title"><span>Tu próxima</span><span>buena canción.</span></h1><p>Encuentra esa canción que se queda contigo.<br className="desktop-break" /> Búscala por su nombre y hazle un lugar en tu colección.</p></div>
      <SearchForm busy={busy} />
    </section>
    <div className="shell explore-content" aria-busy={busy}>
      <p className="sr-only" role="status">{busy ? 'Buscando canciones…' : error || (query ? `${result.total} ${result.total === 1 ? 'resultado' : 'resultados'} para ${query}` : 'Selección de canciones lista.')}</p>
      {busy ? <div className="loading-state"><LoaderCircle className="spinner" aria-hidden="true" /><p>Buscando buenas canciones…</p></div> : error ? <EmptyState title="La búsqueda tendrá que esperar" action="Volver a intentar" onAction={() => setRevision(value => value + 1)}>{error}</EmptyState> : result.items.length === 0 ? <EmptyState title={query ? 'Ninguna coincidencia' : 'Empieza por una canción'} action={query ? 'Limpiar búsqueda' : undefined} to="/">{query ? `No encontramos “${query}”. Prueba con otro nombre de canción, artista o álbum.${result.source === 'demo' ? ' La muestra incluye 8 canciones.' : ''}` : 'Escribe el nombre de una canción, un artista o un álbum para explorar el catálogo.'}</EmptyState> : <>
        {initial && <section className="featured-section" aria-labelledby="featured-title"><div className="section-heading" data-reveal><h2 id="featured-title">Para volver a escuchar</h2><p>Una selección para empezar</p></div><AlbumSheet songs={result.items.slice(0, 4)} notify={notify} /></section>}
        <section className={`tracks-section${initial ? '' : ' search-results'}`} aria-labelledby="tracks-title">
          <div className="section-heading" data-reveal><div><h2 id="tracks-title">{initial ? 'Un punto de partida' : 'Lo que encontramos'}</h2>{!initial && <p className="search-query">Para “{query}”</p>}</div><p>{initial ? 'Canciones para estrenar tu colección' : `${new Intl.NumberFormat('es-CL').format(result.total)} ${result.total === 1 ? 'canción' : 'canciones'}`}</p></div>
          <SongList songs={initial ? [...result.items.slice(4), ...result.items.slice(0, 4)] : result.items} notify={notify} />
          {result.hasMore && <div className="load-more"><button className="button" onClick={loadMore} disabled={more}>{more ? 'Cargando…' : 'Ver más canciones'}</button></div>}
        </section>
      </>}
      {result.source === 'demo' && !busy && !error && <p className="demo-note">Estás explorando un catálogo de muestra de 8 canciones. Abre cualquier canción para escucharla en Spotify.</p>}
      {result.source === 'selection' && !busy && !error && <p className="demo-note">Ocho canciones elegidas para empezar. Usa el buscador para descubrir más.</p>}
      {result.source === 'musicbrainz' && !busy && !error && <p className="demo-note">Datos de <a href="https://musicbrainz.org" target="_blank" rel="noreferrer">MusicBrainz</a> y portadas de <a href="https://coverartarchive.org" target="_blank" rel="noreferrer">Cover Art Archive</a>, cuando están disponibles. Cada canción abre su ficha; no incluye reproducción de audio.</p>}
    </div>
  </>;
}
