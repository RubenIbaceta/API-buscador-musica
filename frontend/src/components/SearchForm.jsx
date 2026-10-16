import { Search, X, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SearchForm({ busy = false, suggestions = true, label = 'Canción, artista o álbum…' }) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [value, setValue] = useState(query);
  const input = useRef(null);
  useEffect(() => { setValue(query); }, [query]);
  useEffect(() => {
    if (value.trim() === query) return;
    const timeout = setTimeout(() => setParams(value.trim() ? { q: value.trim() } : {}, { replace: true, preventScrollReset: true }), 650);
    return () => clearTimeout(timeout);
  }, [value, query, setParams]);
  function search(event) { event.preventDefault(); setParams(value.trim() ? { q: value.trim() } : {}, { preventScrollReset: true }); }
  return <div className="search-area">
    <form className="search-form" role="search" onSubmit={search}>
      <label className="sr-only" htmlFor="music-search">Buscar canciones, artistas o álbumes</label>
      <Search className="search-symbol" size={23} strokeWidth={1.6} aria-hidden="true" />
      <input ref={input} id="music-search" name="q" type="search" autoComplete="off" spellCheck={false} maxLength={120} placeholder={label} value={value} onChange={event => setValue(event.target.value)} />
      {value && <button type="button" className="icon-button clear-search" aria-label="Limpiar búsqueda" onClick={() => { setValue(''); setParams({}, { preventScrollReset: true }); input.current.focus(); }}><X size={18} aria-hidden="true" /></button>}
      <button className="button search-submit" type="submit">{busy ? <LoaderCircle className="spinner" size={18} aria-hidden="true" /> : null}<span>Buscar</span></button>
    </form>
    {suggestions && <div className="search-suggestions" role="group" aria-label="Sugerencias de búsqueda">{['Beach House', 'Natalia Lafourcade', 'Tame Impala', 'Daft Punk'].map(artist => <button key={artist} type="button" onClick={() => { setValue(artist); setParams({ q: artist }, { preventScrollReset: true }); }}>{artist}</button>)}</div>}
  </div>;
}
