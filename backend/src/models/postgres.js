const userColumns = 'id, username, email, password';
const favoriteToSong = row => ({
  id: row.spotify_id, title: row.title, artist: row.artist, album: row.album,
  image: row.album_image, durationMs: row.duration_ms, url: row.spotify_url
});

export function postgresRepository(pool) {
  return {
    async createUser({ username, email, password }) {
      const { rows } = await pool.query(`INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING ${userColumns}`, [username, email, password]);
      return rows[0];
    },
    async findUserByEmail(email) {
      return (await pool.query(`SELECT ${userColumns} FROM users WHERE email=$1`, [email])).rows[0];
    },
    async findUserById(id) {
      return (await pool.query(`SELECT ${userColumns} FROM users WHERE id=$1`, [id])).rows[0];
    },
    async getFavorites(userId) {
      return (await pool.query('SELECT * FROM favorites WHERE user_id=$1 ORDER BY created_at DESC, id DESC', [userId])).rows.map(favoriteToSong);
    },
    async addFavorite(userId, song) {
      await pool.query('INSERT INTO favorites(user_id,spotify_id,title,artist,album,album_image,duration_ms,spotify_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(user_id,spotify_id) DO NOTHING', [userId, song.id, song.title, song.artist, song.album, song.image, song.durationMs, song.url]);
      return song;
    },
    async deleteFavorite(userId, spotifyId) {
      return (await pool.query('DELETE FROM favorites WHERE user_id=$1 AND spotify_id=$2', [userId, spotifyId])).rowCount > 0;
    }
  };
}
