import { useState } from 'react';
import { Disc3 } from 'lucide-react';

export default function Cover({ song, eager = false, className = '' }) {
  const [broken, setBroken] = useState(false);
  return song.image && !broken ? <img className={`cover ${className}`} src={song.image} alt={`Portada de ${song.album || song.title}, ${song.artist}`} width="400" height="400" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setBroken(true)} /> : <div className={`cover cover-fallback ${className}`} role="img" aria-label={`Sin portada: ${song.album || song.title}`}><Disc3 size={42} strokeWidth={1} aria-hidden="true" /></div>;
}
