import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Explore from './pages/Explore';
import Collection from './pages/Collection';
import Auth from './pages/Auth';
import Credits from './pages/Credits';
import EmptyState from './components/EmptyState';

export default function App() {
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const first = useRef(true);
  const notify = useCallback((message, undo = null) => { clearTimeout(timer.current); setToast({ message, undo }); if (!undo) timer.current = setTimeout(() => setToast(null), 5000); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const titles = { '/': 'Tu próxima buena canción', '/coleccion': 'Tu colección', '/ingresar': 'Inicia sesión', '/registro': 'Crea tu cuenta', '/creditos': 'Créditos' };
    document.title = `Savia — ${titles[location.pathname] || 'Página no encontrada'}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (first.current) { first.current = false; } else document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('has-entered'); observer.unobserve(entry.target); } }, { threshold: 0.04 });
    const watch = () => document.querySelectorAll('[data-reveal]:not(.has-entered)').forEach(element => observer.observe(element));
    watch(); const mutations = new MutationObserver(watch); mutations.observe(document.getElementById('main-content'), { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
  async function undo() {
    const action = toast?.undo; setToast(null);
    try { await action?.(); notify('La canción volvió a tu colección.'); } catch { notify('No pudimos deshacer el cambio. Vuelve a guardar la canción.'); }
  }
  return <>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <Header notify={notify} />
    <main id="main-content" tabIndex={-1}><Routes>
      <Route path="/" element={<Explore notify={notify} />} />
      <Route path="/coleccion" element={<Collection notify={notify} />} />
      <Route path="/ingresar" element={<Auth key="login" notify={notify} />} />
      <Route path="/registro" element={<Auth key="register" register notify={notify} />} />
      <Route path="/creditos" element={<Credits />} />
      <Route path="*" element={<div className="shell"><EmptyState title="Esta página no está aquí" action="Volver a explorar" to="/">Hay muchas canciones por descubrir. Volvamos al buscador.</EmptyState></div>} />
    </Routes></main>
    <Footer />
    <div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className="toast"><p>{toast.message}</p>{toast.undo && <button type="button" onClick={undo}>Deshacer</button>}<button type="button" className="icon-button" onClick={() => setToast(null)} aria-label="Cerrar aviso"><X size={18} aria-hidden="true" /></button></div>}</div>
  </>;
}
