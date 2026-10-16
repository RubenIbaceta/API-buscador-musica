export const songsController = catalog => ({
  search: async (req, res) => {
    const { q, offset } = req.validated;
    if (!q && !catalog.demo) return res.json({ items: [], total: 0, offset: 0, hasMore: false, source: 'spotify' });
    res.json(await catalog.search(q, offset));
  }
});
