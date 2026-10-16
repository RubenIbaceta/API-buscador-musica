// Sólo para la muestra local. Las pruebas de persistencia usan el repositorio SQL.
export function memoryRepository() {
  const users = []; const favorites = new Map();
  return {
    async createUser(user) {
      if (users.some(item => item.email === user.email || item.username === user.username)) { const error = new Error('Duplicate'); error.code = '23505'; throw error; }
      const stored = { ...user, id: users.length + 1 }; users.push(stored); return stored;
    },
    async findUserByEmail(email) { return users.find(user => user.email === email); },
    async findUserById(id) { return users.find(user => String(user.id) === String(id)); },
    async getFavorites(userId) { return [...(favorites.get(String(userId)) || new Map()).values()].reverse(); },
    async addFavorite(userId, song) {
      const key = String(userId);
      if (!favorites.has(key)) favorites.set(key, new Map());
      favorites.get(key).set(song.id, song); return song;
    },
    async deleteFavorite(userId, id) { return favorites.get(String(userId))?.delete(id) || false; }
  };
}
