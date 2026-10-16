import { Link } from 'react-router-dom';

export default function Brand({ large = false }) {
  return <Link className={`brand${large ? ' brand-large' : ''}`} to="/" aria-label="Savia, ir a explorar" translate="no">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="17" /><circle cx="20" cy="20" r="12.5" /><circle cx="20" cy="20" r="8" /><circle cx="20" cy="20" r="3" /></svg>
    <span>savia</span>
  </Link>;
}
