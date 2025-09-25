const MenuItem = require('../models/menuItem');
const Place = require('../models/place');

const menuItemController = {
  // Créer un nouvel élément de menu
  createMenuItem: async (req, res) => {
    try {
      const { placeId } = req.params;
      const { name, description, price, categoryId, imageUrl } = req.body;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const menuItem = await MenuItem.create({
        placeId,
        categoryId,
        name,
        description,
        price,
        imageUrl
      });

      res.status(201).json(menuItem);
    } catch (error) {
      console.error('Erreur création élément menu:', error);
      res.status(500).json({ message: 'Erreur lors de la création' });
    }
  },

  // Lister les éléments d'un établissement
  getMenuItems: async (req, res) => {
    try {
      const { placeId } = req.params;
      const items = await MenuItem.findByPlaceId(placeId);
      res.json(items);
    } catch (error) {
      console.error('Erreur récupération menu:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour un élément
  updateMenuItem: async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;

      // Vérifier que l'élément appartient à un établissement de l'utilisateur
      const item = await MenuItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Élément non trouvé' });
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const updatedItem = await MenuItem.update(itemId, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error('Erreur mise à jour élément:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  },

  // Supprimer un élément
  deleteMenuItem: async (req, res) => {
    try {
      const { itemId } = req.params;

      // Vérifier que l'élément appartient à un établissement de l'utilisateur
      const item = await MenuItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Élément non trouvé' });
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      await MenuItem.delete(itemId);
      res.status(204).send();
    } catch (error) {
      console.error('Erreur suppression élément:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
  },

  // Mettre à jour la disponibilité
  updateAvailability: async (req, res) => {
    try {
      const { itemId } = req.params;
      const { isAvailable } = req.body;

      const item = await MenuItem.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'Élément non trouvé' });
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const updatedItem = await MenuItem.updateAvailability(itemId, isAvailable);
      res.json(updatedItem);
    } catch (error) {
      console.error('Erreur mise à jour disponibilité:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = menuItemController;