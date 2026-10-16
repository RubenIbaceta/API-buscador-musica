import { Heart, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { errorMessage } from '../services/api';

export default function FavoriteButton({ song, notify }) {
  const { user } = useAuth();
  const { songs, toggle, restore } = useLibrary();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const saved = songs.some(item => item.id === song.id);
  async function save() {
    if (!user) { navigate(`/ingresar?next=${encodeURIComponent(location.pathname + location.search)}`); notify('Inicia sesión para guardar tus canciones.'); return; }
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const added = await toggle(song);
      if (added === undefined) return;
      notify(added ? `Guardaste “${song.title}”.` : `Quitaste “${song.title}”.`, !added ? () => restore(song) : null);
    } catch (error) { notify(errorMessage(error)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <button className={`icon-button favorite-button${saved ? ' is-saved' : ''}`} type="button" aria-label={`${saved ? 'Quitar' : 'Guardar'} ${song.title}${saved ? ' de tu colección' : ' en tu colección'}`} aria-pressed={saved} disabled={busy} onClick={save}>
    {busy ? <LoaderCircle size={20} className="spinner" aria-hidden="true" /> : <Heart size={22} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />}
  </button>;
}
