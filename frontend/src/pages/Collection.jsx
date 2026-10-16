import { Link, useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import SearchForm from '../components/SearchForm';
import SongList from '../components/SongList';
import EmptyState from '../components/EmptyState';
import Cover from '../components/Cover';
import { errorMessage } from '../services/api';

export default function Collection({ notify }) {
  const { user, ready } = useAuth();
  const { songs, loading, error, retry } = useLibrary();
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const normalize = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const filtered = songs.filter(song => normalize(`${song.title} ${song.artist} ${song.album}`).includes(normalize(query)));
  return <div className="shell collection-page">
    <div className="collection-intro"><div><h1>Tu colección.</h1><p>Las canciones que decidiste quedarte.</p></div>{songs.length > 0 && <div className="collection-stack" aria-hidden="true">{songs.slice(0, 3).map(song => <Cover song={song} key={song.id} eager />)}</div>}</div>
    {!ready || loading ? <div className="loading-state" role="status"><LoaderCircle className="spinner" aria-hidden="true" />Preparando tu colección…</div> : !user ? <EmptyState title="Hazle lugar a tu música" action="Crear cuenta" to="/registro?next=%2Fcoleccion">Guarda tus favoritas y vuelve a ellas cuando quieras. ¿Ya tienes cuenta? <Link to="/ingresar?next=%2Fcoleccion">Inicia sesión.</Link></EmptyState> : error ? <EmptyState title="No pudimos abrir tu colección" action="Volver a intentar" onAction={retry}>{errorMessage(error)}</EmptyState> : songs.length === 0 ? <EmptyState title="La primera está por llegar" action="Explorar canciones" to="/">Toca el corazón de una canción para guardarla aquí. Tu colección empieza con una que te guste.</EmptyState> : <>
      <SearchForm suggestions={false} label="Busca dentro de tu colección…" />
      <div className="collection-summary" role="status">{new Intl.NumberFormat('es-CL').format(filtered.length)} {filtered.length === 1 ? 'canción guardada' : 'canciones guardadas'}</div>
      {filtered.length ? <SongList songs={filtered} notify={notify} /> : <EmptyState title="No está en tu colección" action="Ver todas" to="/coleccion">Prueba con otro nombre o descubre más canciones en Explorar.</EmptyState>}
    </>}
  </div>;
}
