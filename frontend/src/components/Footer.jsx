import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

export default function Footer() {
  const { mode } = useAuth();
  return <footer className="site-footer"><div className="shell">
    <div className="footer-main"><Brand large /><p>Una canción lleva a otra.</p></div>
    <div className="footer-bottom"><p>{mode === 'demo' ? 'Muestra local. Cuentas y colección se borran al reiniciar.' : 'Tu colección personal. Música y portadas de Spotify.'}</p><div><Link to="/creditos">Créditos</Link><a href="https://open.spotify.com" target="_blank" rel="noreferrer">Escucha en Spotify</a></div></div>
  </div></footer>;
}
