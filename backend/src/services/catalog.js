import { demoCatalog } from './demo.js';
import { musicBrainzService } from './musicbrainz.js';
import { spotifyService } from './spotify.js';

export function musicCatalog(config) {
  const selection = demoCatalog();
  const provider = config.musicProvider || 'musicbrainz';
  if (provider === 'demo') return { ...selection, provider };
  const catalog = provider === 'spotify' ? spotifyService(config) : musicBrainzService(config);
  return {
    provider,
    async search(q, offset = 0) {
      if (q) return catalog.search(q, offset);
      return { ...await selection.search('', offset), source: 'selection' };
    }
  };
}
