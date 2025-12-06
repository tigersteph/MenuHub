const MenuItem = require('../models/menuItem');
const Place = require('../models/place');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const cacheService = require('../utils/cache');

const Validators = require('../utils/validators');

const menuItemController = {
  // Créer un nouvel élément de menu
  createMenuItem: async (req, res) => {
    try {
      logger.request(req, 'Create menu item');
      const { placeId } = req.params;
      const { name, description, price, categoryId, imageUrl } = req.body;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à ajouter des éléments au menu de cet établissement');
      }

      // Valider les données
      let payload;
      try {
        payload = Validators.validateMenuItem({
          placeId,
          categoryId,
          name,
          description,
          price,
          imageUrl
        });
      } catch (e) {
        throw new ValidationError(e.message);
      }

      const menuItem = await MenuItem.create(payload);

      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(placeId);
      await cacheService.delete(cacheKey);

      logger.info('Menu item created', { itemId: menuItem.id, placeId });
      return success(res, menuItem, 'Élément de menu créé avec succès', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Create menu item failed');
      return handleControllerError(res, err, 'Erreur lors de la création de l\'élément');
    }
  },

  // Lister les éléments d'un établissement
  getMenuItems: async (req, res) => {
    try {
      logger.request(req, 'Get menu items');
      const { placeId } = req.params;
      
      // Vérifier que l'utilisateur est propriétaire de l'établissement
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir le menu de cet établissement');
      }
      
      const items = await MenuItem.findByPlaceId(placeId);
      return success(res, items);
    } catch (err) {
      logger.errorRequest(req, err, 'Get menu items failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération du menu');
    }
  },

  // Mettre à jour un élément
  updateMenuItem: async (req, res) => {
    try {
      logger.request(req, 'Update menu item');
      const { itemId } = req.params;
      const updates = req.body;

      // Vérifier que l'élément appartient à un établissement de l'utilisateur
      const item = await MenuItem.findById(itemId);
      if (!item) {
        throw new NotFoundError('Élément de menu');
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cet élément');
      }

      // Validation basique des champs autorisés
      const allowed = ['categoryId', 'name', 'description', 'price', 'imageUrl', 'isAvailable'];
      const sanitized = Object.keys(updates)
        .filter(k => allowed.includes(k))
        .reduce((acc, k) => ({ ...acc, [k]: updates[k] }), {});

      const updatedItem = await MenuItem.update(itemId, sanitized);
      
      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(item.place_id);
      await cacheService.delete(cacheKey);

      logger.info('Menu item updated', { itemId });
      return success(res, updatedItem, 'Élément mis à jour avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Update menu item failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour de l\'élément');
    }
  },

  // Supprimer un élément
  deleteMenuItem: async (req, res) => {
    try {
      logger.request(req, 'Delete menu item');
      const { itemId } = req.params;

      // Vérifier que l'élément appartient à un établissement de l'utilisateur
      const item = await MenuItem.findById(itemId);
      if (!item) {
        throw new NotFoundError('Élément de menu');
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à supprimer cet élément');
      }

      await MenuItem.delete(itemId);
      
      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(item.place_id);
      await cacheService.delete(cacheKey);

      logger.info('Menu item deleted', { itemId });
      // Retourner une réponse JSON cohérente avec les autres suppressions
      return success(res, null, 'Élément supprimé avec succès', 200);
    } catch (err) {
      logger.errorRequest(req, err, 'Delete menu item failed');
      return handleControllerError(res, err, 'Erreur lors de la suppression de l\'élément');
    }
  },

  // Mettre à jour la disponibilité
  updateAvailability: async (req, res) => {
    try {
      logger.request(req, 'Update menu item availability');
      const { itemId } = req.params;
      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        throw new ValidationError('isAvailable doit être un booléen');
      }

      const item = await MenuItem.findById(itemId);
      if (!item) {
        throw new NotFoundError('Élément de menu');
      }

      const isOwner = await Place.isOwner(item.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cet élément');
      }

      const updatedItem = await MenuItem.updateAvailability(itemId, isAvailable);
      
      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(item.place_id);
      await cacheService.delete(cacheKey);

      logger.info('Menu item availability updated', { itemId, isAvailable });
      return success(res, updatedItem, 'Disponibilité mise à jour');
    } catch (err) {
      logger.errorRequest(req, err, 'Update availability failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour de la disponibilité');
    }
  }
};

module.exports = menuItemController;