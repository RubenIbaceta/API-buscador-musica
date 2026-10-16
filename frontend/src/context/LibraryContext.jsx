import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const LibraryContext = createContext(null);
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const active = useRef(new Set());
  const owner = useRef(user?.id); owner.current = user?.id;
  useEffect(() => {
    const controller = new AbortController();
    setSongs([]); setError(null);
    if (!user) { setLoading(false); return; }
    setLoading(true);
    api.get('/favorites', { signal: controller.signal }).then(({ data }) => setSongs(data.items)).catch(error => { if (error.code !== 'ERR_CANCELED') setError(error); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user?.id, revision]);
  async function toggle(song) {
    if (!user || active.current.has(song.id)) return;
    const userId = user.id;
    active.current.add(song.id);
    const saved = songs.some(item => item.id === song.id);
    try {
      if (saved) await api.delete(`/favorites/${encodeURIComponent(song.id)}`);
      else await api.post('/favorites', song);
      if (owner.current === userId) setSongs(current => saved ? current.filter(item => item.id !== song.id) : [song, ...current]);
      return !saved;
    } finally { active.current.delete(song.id); }
  }
  async function restore(song) {
    if (!user) throw new Error('La sesión terminó.');
    const userId = user.id;
    await api.post('/favorites', song);
    if (owner.current === userId) setSongs(current => [song, ...current.filter(item => item.id !== song.id)]);
  }
  return <LibraryContext.Provider value={{ songs, loading, error, toggle, restore, retry: () => setRevision(value => value + 1) }}>{children}</LibraryContext.Provider>;
}
export const useLibrary = () => useContext(LibraryContext);
