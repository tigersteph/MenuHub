const Place = require('../models/place');

const placeController = {
  // Créer un nouvel établissement
  createPlace: async (req, res) => {
    try {
      const { name, description, address, phone, logo_url } = req.body;
      const userId = req.user.id;

      const place = await Place.create({
        name,
        description,
        address,
        phone,
        userId,
        logo_url
      });

      // Enregistrement des tables si fournies
      if (tables && Array.isArray(tables)) {
        const Table = require('../models/table');
        for (const t of tables) {
          await Table.create({
            name: t.name,
            status: t.status || 'active',
            place_id: place.id
          });
        }
      }

      res.status(201).json(place);
    } catch (error) {
      console.error('Erreur création établissement:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'établissement' });
    }
  },

  // Obtenir les détails d'un établissement avec catégories et plats
  getPlace: async (req, res) => {
    try {
      const place = await Place.findById(req.params.id);
      if (!place) {
        return res.status(404).json({ message: 'Établissement non trouvé' });
      }
      // Récupérer les catégories
      const db = require('../config/db');
      const categoriesResult = await db.query(
        'SELECT * FROM categories WHERE place_id = $1 ORDER BY name',
        [place.id]
      );
      const categories = categoriesResult.rows;
      // Pour chaque catégorie, récupérer les plats
      for (const cat of categories) {
        const itemsResult = await db.query(
          'SELECT * FROM menu_items WHERE category_id = $1 ORDER BY name',
          [cat.id]
        );
        cat.menu_items = itemsResult.rows;
      }
      place.categories = categories;
      res.json(place);
    } catch (error) {
      console.error('Erreur récupération établissement:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour un établissement
  updatePlace: async (req, res) => {
    try {
      const isOwner = await Place.isOwner(req.params.id, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

  const updatedPlace = await Place.update(req.params.id, req.body);
      if (!updatedPlace) {
        return res.status(404).json({ message: 'Établissement non trouvé' });
      }

      res.json(updatedPlace);
    } catch (error) {
      console.error('Erreur mise à jour établissement:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  },

  // Supprimer un établissement
  deletePlace: async (req, res) => {
    try {
      const isOwner = await Place.isOwner(req.params.id, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const deleted = await Place.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Établissement non trouvé' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erreur suppression établissement:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  },

  // Lister les établissements d'un utilisateur
  getUserPlaces: async (req, res) => {
    try {
      const places = await Place.findByUserId(req.user.id);
      res.json(places);
    } catch (error) {
      console.error('Erreur liste établissements:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = placeController;