const db = require('../config/db');
const Place = require('../models/place');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const cacheService = require('../utils/cache');

const categoryController = {
  // Créer une nouvelle catégorie
  createCategory: async (req, res) => {
    try {
      logger.request(req, 'Create category');
      const { name, place_id, placeId } = req.body;
      // Accepter place_id ou placeId pour compatibilité
      const finalPlaceId = place_id || placeId;
      
      if (!name || !name.trim()) {
        throw new ValidationError('Le nom de la catégorie est requis');
      }
      
      if (!finalPlaceId) {
        throw new ValidationError('place_id est requis');
      }

      // Vérifier que l'utilisateur est propriétaire de l'établissement
      const isOwner = await Place.isOwner(finalPlaceId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à ajouter des catégories à cet établissement');
      }

      const query = `
        INSERT INTO categories (name, place_id)
        VALUES ($1, $2)
        RETURNING *`;
      const values = [name.trim(), finalPlaceId];
      const { rows } = await db.query(query, values);
      
      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(finalPlaceId);
      await cacheService.delete(cacheKey);

      logger.info('Category created', { categoryId: rows[0].id, placeId: finalPlaceId });
      return success(res, rows[0], 'Catégorie créée avec succès', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Create category failed');
      return handleControllerError(res, err, 'Erreur lors de la création de la catégorie');
    }
  },

  // Mettre à jour une catégorie
  updateCategory: async (req, res) => {
    try {
      logger.request(req, 'Update category');
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim().length < 2) {
        throw new ValidationError('Le nom doit contenir au moins 2 caractères');
      }

      // Vérifier que la catégorie existe et que l'utilisateur est propriétaire
      const categoryResult = await db.query('SELECT place_id FROM categories WHERE id = $1', [id]);
      if (categoryResult.rows.length === 0) {
        throw new NotFoundError('Catégorie');
      }

      const placeId = categoryResult.rows[0].place_id;
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cette catégorie');
      }

      const query = `
        UPDATE categories 
        SET name = $1
        WHERE id = $2
        RETURNING *`;
      const { rows } = await db.query(query, [name.trim(), id]);
      
      if (rows.length === 0) {
        throw new NotFoundError('Catégorie');
      }

      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(placeId);
      await cacheService.delete(cacheKey);

      logger.info('Category updated', { categoryId: id });
      return success(res, rows[0], 'Catégorie mise à jour avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Update category failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour de la catégorie');
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (req, res) => {
    try {
      logger.request(req, 'Delete category');
      const { id } = req.params;

      // Vérifier que la catégorie existe et que l'utilisateur est propriétaire
      const categoryResult = await db.query('SELECT place_id FROM categories WHERE id = $1', [id]);
      if (categoryResult.rows.length === 0) {
        throw new NotFoundError('Catégorie');
      }

      const placeId = categoryResult.rows[0].place_id;
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à supprimer cette catégorie');
      }

      // Vérifier s'il y a des items dans cette catégorie (pour information seulement)
      const itemsResult = await db.query('SELECT COUNT(*) as count FROM menu_items WHERE category_id = $1', [id]);
      const itemsCount = parseInt(itemsResult.rows[0].count);

      // Supprimer d'abord les items de la catégorie si ON DELETE CASCADE n'est pas configuré
      // Cela garantit la suppression même si la contrainte CASCADE n'est pas active
      if (itemsCount > 0) {
        await db.query('DELETE FROM menu_items WHERE category_id = $1', [id]);
      }
      
      // Supprimer la catégorie (les items seront supprimés automatiquement grâce à ON DELETE CASCADE)
      // Le schéma de la base de données prévoit ON DELETE CASCADE pour menu_items.category_id
      await db.query('DELETE FROM categories WHERE id = $1', [id]);
      
      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(placeId);
      await cacheService.delete(cacheKey);

      logger.info('Category deleted', { categoryId: id, deletedItemsCount: itemsCount });
      return success(res, { 
        deletedItemsCount: itemsCount
      }, 'Catégorie supprimée avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Delete category failed');
      return handleControllerError(res, err, 'Erreur lors de la suppression de la catégorie');
    }
  },

  // Lister les catégories d'un établissement
  getCategoriesByPlace: async (req, res) => {
    try {
      logger.request(req, 'Get categories by place');
      const { placeId } = req.params;
      
      // Vérifier que l'utilisateur est propriétaire de l'établissement
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir les catégories de cet établissement');
      }
      
      const query = 'SELECT * FROM categories WHERE place_id = $1 ORDER BY name';
      const { rows } = await db.query(query, [placeId]);
      return success(res, rows);
    } catch (err) {
      logger.errorRequest(req, err, 'Get categories failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération des catégories');
    }
  }
};

module.exports = categoryController;
