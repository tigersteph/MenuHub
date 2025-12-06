// controllers/tableController.js
const Table = require('../models/table');
const Place = require('../models/place');
const Validators = require('../utils/validators');
const { ValidationError, NotFoundError, UnauthorizedError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');
const { success, handleControllerError } = require('../utils/response');

const tableController = {
  async createTable(req, res) {
    try {
      // Validation des données
      const validated = Validators.validateTable(req.body);
      
      // Vérifier que l'établissement existe et que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(validated.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à ajouter des tables à cet établissement');
      }

      // Vérifier la duplication
      const existing = await Table.findByPlace(validated.place_id);
      if (existing.some(t => t.name.trim().toLowerCase() === validated.name.trim().toLowerCase())) {
        throw new ConflictError('Ce nom de table existe déjà pour cet établissement');
      }

      const table = await Table.create({ 
        name: validated.name, 
        status: validated.status || 'active', 
        place_id: validated.place_id 
      });
      
      // Garder une réponse simple pour compatibilité frontend
      res.status(201).json(table);
    } catch (error) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      console.error('Erreur création table:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la création de la table'
        }
      });
    }
  },

  async getTablesByPlace(req, res) {
    try {
      const { placeId } = req.params;
      
      if (!Validators.isValidUUID(placeId)) {
        throw new ValidationError('ID d\'établissement invalide');
      }

      // Vérifier que l'établissement existe et que l'utilisateur est propriétaire
      const place = await Place.findById(placeId);
      if (!place) {
        throw new NotFoundError('Établissement');
      }

      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir les tables de cet établissement');
      }

      const tables = await Table.findByPlace(placeId);
      // Répondre avec un tableau simple
      res.json(tables);
    } catch (error) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      console.error('Erreur getTablesByPlace:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des tables'
        }
      });
    }
  },

  // Route publique pour récupérer une table (sans authentification)
  async getTablePublic(req, res) {
    try {
      const { id } = req.params;
      
      if (!Validators.isValidUUID(id)) {
        throw new ValidationError('ID de table invalide');
      }

      const table = await Table.findById(id);
      if (!table) {
        throw new NotFoundError('Table');
      }

      // Retourner uniquement les informations publiques (sans vérification de propriétaire)
      res.json({
        id: table.id,
        name: table.name,
        status: table.status,
        place_id: table.place_id
      });
    } catch (error) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      console.error('Erreur getTablePublic:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération de la table'
        }
      });
    }
  },

  async getTable(req, res) {
    try {
      const { id } = req.params;
      
      if (!Validators.isValidUUID(id)) {
        throw new ValidationError('ID de table invalide');
      }

      const table = await Table.findById(id);
      if (!table) {
        throw new NotFoundError('Table');
      }

      // Vérifier que l'utilisateur est propriétaire de l'établissement
      const isOwner = await Place.isOwner(table.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir cette table');
      }

      res.json(table);
    } catch (error) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      console.error('Erreur getTable:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération de la table'
        }
      });
    }
  },

  async updateTable(req, res) {
    try {
      const { id } = req.params;
      
      if (!Validators.isValidUUID(id)) {
        throw new ValidationError('ID de table invalide');
      }

      // Vérifier que la table existe et que l'utilisateur est propriétaire
      const table = await Table.findById(id);
      if (!table) {
        throw new NotFoundError('Table');
      }

      const isOwner = await Place.isOwner(table.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cette table');
      }

      // Validation des données
      const validated = Validators.validateTable(req.body);
      
      // Vérifier la duplication si le nom change
      if (validated.name && validated.name.toLowerCase() !== table.name.toLowerCase()) {
        const existing = await Table.findByPlace(table.place_id);
        if (existing.some(t => t.id !== id && t.name.trim().toLowerCase() === validated.name.trim().toLowerCase())) {
          throw new ConflictError('Ce nom de table existe déjà pour cet établissement');
        }
      }

      const updatedTable = await Table.update(id, validated);
      res.json(updatedTable);
    } catch (error) {
      if (error.isOperational) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }
      console.error('Erreur updateTable:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour de la table'
        }
      });
    }
  },

  async deleteTable(req, res) {
    try {
      logger.request(req, 'Delete table');
      const { id } = req.params;
      
      if (!Validators.isValidUUID(id)) {
        throw new ValidationError('ID de table invalide');
      }

      // Vérifier que la table existe et que l'utilisateur est propriétaire
      const table = await Table.findById(id);
      if (!table) {
        throw new NotFoundError('Table');
      }

      // Vérifier que req.user existe (doit être défini par le middleware auth)
      if (!req.user || !req.user.id) {
        logger.error('User not authenticated in deleteTable', { 
          hasUser: !!req.user, 
          userId: req.user?.id,
          tableId: id,
          path: req.path,
          method: req.method
        });
        throw new UnauthorizedError('Utilisateur non authentifié');
      }

      const isOwner = await Place.isOwner(table.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à supprimer cette table');
      }

      // Appeler la méthode de suppression
      const deleteResult = await Table.delete(id);
      
      // Vérifier que le résultat indique un succès
      if (!deleteResult || !deleteResult.deleted) {
        throw new Error('La suppression de la table a échoué');
      }
      
      logger.info('Table deleted successfully', { tableId: id, ordersAffected: deleteResult.ordersAffected || 0 });
      
      // Retourner une réponse JSON cohérente avec les autres suppressions
      return success(res, {
          ordersAffected: deleteResult.ordersAffected || 0
      }, 'Table supprimée avec succès');
    } catch (error) {
      logger.errorRequest(req, error, 'Delete table failed');
      return handleControllerError(res, error, 'Erreur lors de la suppression de la table');
    }
  }
};

module.exports = tableController;
