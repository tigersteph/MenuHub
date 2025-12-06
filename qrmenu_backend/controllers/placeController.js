const Place = require('../models/place');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const cacheService = require('../utils/cache');

const placeController = {
  // Créer un nouvel établissement
  createPlace: async (req, res) => {
    try {
      logger.request(req, 'Place creation');
      const { name, description, address, phone, logo_url, tables } = req.body;
      const userId = req.user.id;

      if (!name || !name.trim()) {
        throw new ValidationError('Le nom de l\'établissement est requis');
      }

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

      logger.info('Place created', { placeId: place.id, userId });
      return success(res, place, 'Établissement créé avec succès', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Place creation failed');
      return handleControllerError(res, err, 'Erreur lors de la création de l\'établissement');
    }
  },

  // Route publique pour récupérer un établissement avec menu (sans authentification)
  getPlacePublic: async (req, res) => {
    try {
      const placeId = req.params.id;
      const cacheKey = cacheService.constructor.menuPublicKey(placeId);
      
      // Vérifier le cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('Menu public served from cache', { placeId });
        return success(res, cached, null, 200);
      }

      logger.request(req, 'Public place menu request');
      const place = await Place.findById(placeId);
      if (!place) {
        throw new NotFoundError('Établissement');
      }

      // Récupérer les catégories
      const db = require('../config/db');
      const categoriesResult = await db.query(
        'SELECT * FROM categories WHERE place_id = $1 ORDER BY name',
        [place.id]
      );
      const categories = categoriesResult.rows;
      
      // Pour chaque catégorie, récupérer les plats disponibles uniquement
      for (const cat of categories) {
        const itemsResult = await db.query(
          'SELECT * FROM menu_items WHERE category_id = $1 AND is_available = true ORDER BY name',
          [cat.id]
        );
        cat.menu_items = itemsResult.rows;
      }
      
      place.categories = categories;
      
      // Mettre en cache pour 1 heure (3600 secondes)
      await cacheService.set(cacheKey, place, 3600);
      
      logger.info('Menu public served from database', { placeId, categoriesCount: categories.length });
      return success(res, place);
    } catch (err) {
      logger.errorRequest(req, err, 'Public place menu request failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération du menu');
    }
  },

  // Obtenir les détails d'un établissement avec catégories et plats
  getPlace: async (req, res) => {
    try {
      logger.request(req, 'Get place details');
      const place = await Place.findById(req.params.id);
      if (!place) {
        throw new NotFoundError('Établissement');
      }
      
      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(place.id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir cet établissement');
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
      return success(res, place);
    } catch (err) {
      logger.errorRequest(req, err, 'Get place failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération de l\'établissement');
    }
  },

  // Mettre à jour un établissement
  updatePlace: async (req, res) => {
    try {
      logger.request(req, 'Update place');
      const isOwner = await Place.isOwner(req.params.id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cet établissement');
      }

      // Valider les données d'entrée
      const Validators = require('../utils/validators');
      let validatedBody = {};
      try {
        validatedBody = Validators.validatePlace(req.body);
      } catch (e) {
        throw new ValidationError(e.message);
      }

      const updatedPlace = await Place.update(req.params.id, validatedBody);
      if (!updatedPlace) {
        throw new NotFoundError('Établissement');
      }

      // Invalider le cache du menu public
      const cacheKey = cacheService.constructor.menuPublicKey(req.params.id);
      await cacheService.delete(cacheKey);

      logger.info('Place updated', { placeId: req.params.id });
      return success(res, updatedPlace, 'Établissement mis à jour avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Update place failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour de l\'établissement');
    }
  },

  // Supprimer un établissement
  deletePlace: async (req, res) => {
    try {
      logger.request(req, 'Delete place');
      const placeId = req.params.id;
      
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à supprimer cet établissement');
      }

      // Récupérer les statistiques avant suppression pour information
      const place = await Place.findById(placeId);
      if (!place) {
        throw new NotFoundError('Établissement');
      }

      // Compter les éléments qui seront supprimés en cascade
      const stats = await Place.getDeletionStats(placeId);

      const deleted = await Place.delete(placeId);
      if (!deleted) {
        throw new NotFoundError('Établissement');
      }

      // Invalider le cache
      const cacheKey = cacheService.constructor.menuPublicKey(placeId);
      await cacheService.delete(cacheKey);

      logger.info('Place deleted', { placeId, stats });
      
      // Retourner une réponse JSON cohérente avec les autres suppressions
      return res.status(200).json({
        success: true,
        message: 'Établissement supprimé avec succès',
        data: {
          placeId: placeId,
          placeName: place.name,
          deletedStats: stats
        }
      });
    } catch (err) {
      logger.errorRequest(req, err, 'Delete place failed');
      return handleControllerError(res, err, 'Erreur lors de la suppression de l\'établissement');
    }
  },

  // Lister les établissements d'un utilisateur
  getUserPlaces: async (req, res) => {
    try {
      logger.request(req, 'Get user places');
      const places = await Place.findByUserId(req.user.id);
      return success(res, places);
    } catch (err) {
      logger.errorRequest(req, err, 'Get user places failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération des établissements');
    }
  },

  // Obtenir les statistiques d'un établissement
  getPlaceStats: async (req, res) => {
    try {
      logger.request(req, 'Get place stats');
      const placeId = req.params.id;
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir les statistiques de cet établissement');
      }

      // Vérifier si on doit forcer le rafraîchissement (bypasser le cache)
      const forceRefresh = req.query.refresh === 'true' || req.query.refresh === true;
      
      // Vérifier le cache seulement si on ne force pas le rafraîchissement
      if (!forceRefresh) {
        const cacheKey = cacheService.constructor.placeStatsKey(placeId);
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return success(res, cached);
        }
      }

      const db = require('../config/db');
      
      // Compter les tables
      const tablesResult = await db.query(
        'SELECT COUNT(*) as count FROM tables WHERE place_id = $1',
        [placeId]
      );
      const tables_count = parseInt(tablesResult.rows[0].count);

      // Compter les commandes du jour (optimisé avec index)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersTodayResult = await db.query(
        'SELECT COUNT(*) as count FROM orders WHERE place_id = $1 AND created_at >= $2',
        [placeId, today.toISOString()]
      );
      const orders_today = parseInt(ordersTodayResult.rows[0].count);

      // Compter les commandes de la semaine (optimisé avec index)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const ordersWeekResult = await db.query(
        'SELECT COUNT(*) as count FROM orders WHERE place_id = $1 AND created_at >= $2',
        [placeId, weekAgo.toISOString()]
      );
      const orders_week = parseInt(ordersWeekResult.rows[0].count);

      const stats = {
        tables_count,
        orders_today,
        orders_week
      };

      // Mettre en cache pour 5 minutes (300 secondes)
      const cacheKey = cacheService.constructor.placeStatsKey(placeId);
      await cacheService.set(cacheKey, stats, 300);

      return success(res, stats);
    } catch (err) {
      logger.errorRequest(req, err, 'Get place stats failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération des statistiques');
    }
  },

  // Dupliquer un établissement
  duplicatePlace: async (req, res) => {
    try {
      const placeId = req.params.id;
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      // Récupérer l'établissement original
      const originalPlace = await Place.findById(placeId);
      if (!originalPlace) {
        return res.status(404).json({ message: 'Établissement non trouvé' });
      }

      // Créer le nouvel établissement avec " - Copie" dans le nom
      const newPlace = await Place.create({
        name: `${originalPlace.name} - Copie`,
        description: originalPlace.description,
        address: originalPlace.address,
        phone: originalPlace.phone,
        userId: req.user.id,
        logo_url: originalPlace.logo_url
      });

      // Dupliquer les tables
      const db = require('../config/db');
      const tablesResult = await db.query(
        'SELECT * FROM tables WHERE place_id = $1',
        [placeId]
      );
      const Table = require('../models/table');
      for (const table of tablesResult.rows) {
        await Table.create({
          name: table.name,
          status: table.status || 'active',
          place_id: newPlace.id
        });
      }

      res.status(201).json(newPlace);
    } catch (error) {
      console.error('Erreur duplication établissement:', error);
      res.status(500).json({ message: 'Erreur lors de la duplication' });
    }
  }
};

module.exports = placeController;