const db = require('../config/db');

const categoryController = {
  // Créer une nouvelle catégorie
  createCategory: async (req, res) => {
    try {
      const { name, placeId } = req.body;
      if (!name || !placeId) {
        return res.status(400).json({ message: 'Nom et placeId requis' });
      }
      const query = `
        INSERT INTO categories (name, place_id)
        VALUES ($1, $2)
        RETURNING *`;
      const values = [name, placeId];
      const { rows } = await db.query(query, values);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
    }
  },

  // Lister les catégories d'un établissement
  getCategoriesByPlace: async (req, res) => {
    try {
      const { placeId } = req.params;
      const query = 'SELECT * FROM categories WHERE place_id = $1 ORDER BY name';
      const { rows } = await db.query(query, [placeId]);
      res.json(rows);
    } catch (error) {
      console.error('Erreur récupération catégories:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
  }
};

module.exports = categoryController;
