import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

export default function Footer() {
  const { mode, provider } = useAuth();
  return <footer className="site-footer"><div className="shell">
    <div className="footer-main"><Brand large /><p>Una canción lleva a otra.</p></div>
    <div className="footer-bottom"><p>{mode === 'demo' ? 'Cuentas locales. Tu colección se borra al reiniciar.' : 'Tu colección personal, canción a canción.'}</p><div><Link to="/creditos">Créditos</Link>{provider === 'musicbrainz' ? <a href="https://musicbrainz.org" target="_blank" rel="noreferrer">Explora MusicBrainz</a> : provider ? <a href="https://open.spotify.com" target="_blank" rel="noreferrer">Escucha en Spotify</a> : null}</div></div>
  </div></footer>;
}
