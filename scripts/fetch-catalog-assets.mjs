import { readFile, writeFile, mkdir } from 'node:fs/promises';

const songs = JSON.parse(await readFile(new URL('../backend/src/data/catalog.json', import.meta.url), 'utf8'));
const folder = new URL('../frontend/public/images/', import.meta.url);
await mkdir(folder, { recursive: true });
const credits = [];
for (const song of songs) {
  const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(song.url)}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Spotify oEmbed: ${response.status} for ${song.title}`);
  const data = await response.json();
  const image = await fetch(data.thumbnail_url, { signal: AbortSignal.timeout(15000) });
  if (!image.ok) throw new Error(`Image: ${image.status}`);
  await writeFile(new URL(song.image.split('/').at(-1), folder), Buffer.from(await image.arrayBuffer()));
  credits.push({ title: song.album, artist: song.artist, track: data.title, url: song.url, imageSource: data.thumbnail_url, local: song.image, license: 'Copyright de sus respectivos titulares. Portada de álbum, no fotografía de licencia abierta.' });
  console.log(`Portada lista: ${data.title}`);
}
await writeFile(new URL('../frontend/public/credits.json', import.meta.url), JSON.stringify(credits, null, 2));
