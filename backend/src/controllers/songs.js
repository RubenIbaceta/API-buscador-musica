export const songsController = catalog => ({
  search: async (req, res) => {
    const { q, offset } = req.validated;
    res.json(await catalog.search(q, offset));
  }
});
