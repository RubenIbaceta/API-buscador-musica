import { NavLink, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import Brand from './Brand';
import { errorMessage } from '../services/api';

export default function Header({ notify }) {
  const { user, ready, logout } = useAuth();
  const { songs } = useLibrary();
  const [leaving, setLeaving] = useState(false);
  async function signOut() {
    setLeaving(true);
    try { await logout(); notify('Cerraste sesión. Hasta la próxima canción.'); }
    catch (error) { notify(errorMessage(error)); }
    finally { setLeaving(false); }
  }
  return <header className="site-header shell">
    <Brand />
    <nav className="main-nav" aria-label="Navegación principal">
      <NavLink to="/" end>Explorar</NavLink>
      <NavLink to="/coleccion">Mi colección{user && songs.length > 0 && <span className="collection-count">{songs.length}</span>}</NavLink>
    </nav>
    <div className="account-nav">
      {user ? <><span className="user-name">Hola, {user.username}</span><button className="icon-button logout-button" aria-label="Cerrar sesión" disabled={leaving} onClick={signOut}><LogOut size={19} aria-hidden="true" /></button></> : ready && <><Link className="login-link" to="/ingresar">Iniciar sesión</Link><Link className="button button-small" to="/registro">Crear cuenta</Link></>}
    </div>
  </header>;
}
