import { ArrowUpRight } from 'lucide-react';
import Cover from './Cover';
import FavoriteButton from './FavoriteButton';
import { songLinkLabel } from '../services/songLink';

export default function AlbumSheet({ songs, notify }) {
  return <div className="album-sheet">
    {songs.map((song, index) => <article className="album-item" key={song.id} data-reveal style={{ '--order': index }}>
      <a className="album-image-link" href={song.url} target="_blank" rel="noreferrer" aria-label={songLinkLabel(song)}><Cover song={song} eager={index < 4} /><span className="album-open" aria-hidden="true"><ArrowUpRight size={22} /></span></a>
      <div className="album-caption"><div><a className="album-title" href={song.url} target="_blank" rel="noreferrer">{song.title}</a><p>{song.artist}</p></div><FavoriteButton song={song} notify={notify} /></div>
    </article>)}
  </div>;
}
