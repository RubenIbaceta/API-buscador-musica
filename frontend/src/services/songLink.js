export function songLinkLabel(song) {
  return song.url.startsWith('https://musicbrainz.org/recording/')
    ? `Ver ficha de ${song.title}, ${song.artist}, en MusicBrainz (otra pestaña)`
    : `Escuchar ${song.title}, ${song.artist}, en Spotify (otra pestaña)`;
}
