import { ApiError } from '../lib/errors.js';

export const favoritesController = repository => ({
  list: async (req, res) => res.json({ items: await repository.getFavorites(req.user.id) }),
  add: async (req, res) => res.status(201).json({ song: await repository.addFavorite(req.user.id, req.validated) }),
  remove: async (req, res) => {
    if (!await repository.deleteFavorite(req.user.id, req.params.id)) throw new ApiError(404, 'Esta canción ya no está en tu colección.');
    res.status(204).end();
  }
});
