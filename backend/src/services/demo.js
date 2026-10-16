import { readFileSync } from 'node:fs';

export function demoCatalog() {
  const songs = JSON.parse(readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8'));
  const normalize = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  return {
    async search(q = '', offset = 0) {
      const words = normalize(q).split(/\s+/).filter(Boolean);
      const matches = songs.filter(song => words.every(word => normalize(`${song.title} ${song.artist} ${song.album}`).includes(word)));
      return { items: matches.slice(offset, offset + 10), total: matches.length, hasMore: offset + 10 < matches.length, offset, source: 'demo' };
    }
  };
}
