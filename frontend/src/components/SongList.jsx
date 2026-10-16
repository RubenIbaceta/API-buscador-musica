import { ArrowUpRight } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import Cover from './Cover';

const number = new Intl.NumberFormat('es-CL', { minimumIntegerDigits: 2, useGrouping: false });
export function duration(ms) { return `${Math.floor(ms / 60000)}:${number.format(Math.floor(ms / 1000) % 60)}`; }

export default function SongList({ songs, notify }) {
  return <ul className="song-list" aria-label="Canciones">
    {songs.map((song, index) => <li key={song.id} className="song-row" style={{ '--order': Math.min(index, 7) }} data-reveal>
      <a className="song-main" href={song.url} target="_blank" rel="noreferrer" aria-label={`Escuchar ${song.title}, ${song.artist}, en Spotify (abre otra pestaña)`}>
        <Cover song={song} /><span className="song-copy"><span className="song-title">{song.title}</span><span className="song-artist">{song.artist}</span></span>
      </a>
      <span className="song-album">{song.album}</span><span className="song-duration" aria-label={`Duración ${duration(song.durationMs)}`}>{duration(song.durationMs)}</span>
      <FavoriteButton song={song} notify={notify} />
      <a className="icon-button song-external" href={song.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${song.title} en Spotify (otra pestaña)`}><ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" /></a>
    </li>)}
  </ul>;
}
