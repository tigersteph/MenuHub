const Order = require('../models/order');
const Place = require('../models/place');
const MenuItem = require('../models/menuItem');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { success, error, handleControllerError } = require('../utils/response');
const logger = require('../utils/logger');
const webSocketService = require('../services/websocket');

const orderController = {
  // Créer une nouvelle commande (publique - pour les clients)
  createOrderPublic: async (req, res) => {
    try {
      logger.request(req, 'Public order creation');
      const { placeId } = req.params;
      const { tableId, tableNumber, items, customerNotes = '' } = req.body;

      // Vérifier que l'établissement existe
      const place = await Place.findById(placeId);
      if (!place) {
        throw new NotFoundError('Établissement');
      }

      // Utiliser tableId si fourni, sinon tableNumber (pour compatibilité)
      const finalTableId = tableId || tableNumber;

      // Valider les données
      if (!finalTableId || !items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Données de commande invalides');
      }

      // Valider les items et vérifier les prix (sécurité)
      const validatedItems = [];
      for (const item of items) {
        try {
          if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
            throw new ValidationError(`Item invalide: menuItemId et quantity > 0 requis`);
          }

          // Vérifier que l'item existe et appartient à cet établissement
          const menuItem = await MenuItem.findById(item.menuItemId);
          if (!menuItem) {
            throw new NotFoundError(`Élément de menu avec l'ID ${item.menuItemId}`);
          }

          if (menuItem.place_id !== placeId) {
            throw new ValidationError(`L'élément de menu ${item.menuItemId} n'appartient pas à cet établissement`);
          }

          // Vérifier la disponibilité (is_available doit être true ou null/undefined pour être disponible)
          if (menuItem.is_available === false) {
            throw new ValidationError(`L'élément "${menuItem.name}" n'est plus disponible`);
          }

          // Utiliser le prix de la base de données (sécurité) au lieu du prix envoyé
          const dbPrice = parseFloat(menuItem.price) || 0;
          if (dbPrice <= 0) {
            throw new ValidationError(`Le prix de l'élément "${menuItem.name}" est invalide`);
          }
          
          const sentPrice = parseFloat(item.unitPrice || item.price || 0);
          
          // Avertir si les prix diffèrent (mais utiliser le prix de la DB)
          if (Math.abs(dbPrice - sentPrice) > 0.01) {
            logger.warn('Price mismatch detected', {
              menuItemId: item.menuItemId,
              dbPrice,
              sentPrice,
              using: dbPrice
            });
          }

          validatedItems.push({
            menuItemId: item.menuItemId,
            quantity: parseInt(item.quantity, 10),
            unitPrice: dbPrice // Utiliser le prix de la base de données
          });
        } catch (itemError) {
          // Logger l'erreur pour chaque item et propager
          logger.error('Error validating order item', {
            item,
            error: itemError.message,
            stack: itemError.stack
          });
          throw itemError;
        }
      }

      const order = await Order.create({
        placeId,
        tableId: finalTableId,
        items: validatedItems,
        customerNotes
      });

      // Notifier via WebSocket
      webSocketService.notifyNewOrder(placeId, order);

      return success(res, {
        id: order.id,
        place_id: order.place_id,
        table: order.table_id || order.table_number,
        table_id: order.table_id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items || []
      }, 'Commande créée avec succès', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Public order creation failed');
      return handleControllerError(res, err, 'Erreur lors de la création de la commande');
    }
  },

  // Créer une nouvelle commande (authentifiée - pour les restaurateurs)
  createOrder: async (req, res) => {
    try {
      logger.request(req, 'Order creation (authenticated)');
      const { placeId } = req.params;
      const { tableId, tableNumber, items, customerNotes } = req.body;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à créer une commande pour cet établissement');
      }

      // Utiliser tableId si fourni, sinon tableNumber (pour compatibilité)
      const finalTableId = tableId || tableNumber;

      if (!finalTableId || !items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Données de commande invalides');
      }

      // Valider les items et vérifier les prix (sécurité)
      const validatedItems = [];
      for (const item of items) {
        if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
          throw new ValidationError(`Item invalide: menuItemId et quantity > 0 requis`);
        }

        // Vérifier que l'item existe et appartient à cet établissement
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          throw new NotFoundError(`Élément de menu avec l'ID ${item.menuItemId}`);
        }

        if (menuItem.place_id !== placeId) {
          throw new ValidationError(`L'élément de menu ${item.menuItemId} n'appartient pas à cet établissement`);
        }

        // Utiliser le prix de la base de données (sécurité)
        const dbPrice = parseFloat(menuItem.price) || 0;
        const sentPrice = parseFloat(item.unitPrice || item.price || 0);
        
        // Avertir si les prix diffèrent
        if (Math.abs(dbPrice - sentPrice) > 0.01) {
          logger.warn('Price mismatch detected', {
            menuItemId: item.menuItemId,
            dbPrice,
            sentPrice,
            using: dbPrice
          });
        }

        validatedItems.push({
          menuItemId: item.menuItemId,
          quantity: parseInt(item.quantity, 10),
          unitPrice: dbPrice // Utiliser le prix de la base de données
        });
      }

      const order = await Order.create({
        placeId,
        tableId: finalTableId,
        items: validatedItems,
        customerNotes
      });

      // Notifier via WebSocket
      webSocketService.notifyNewOrder(placeId, order);

      return success(res, order, 'Commande créée avec succès', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Order creation failed');
      return handleControllerError(res, err, 'Erreur lors de la création de la commande');
    }
  },

  // Obtenir les détails d'une commande
  getOrder: async (req, res) => {
    try {
      logger.request(req, 'Get order details');
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        throw new NotFoundError('Commande');
      }

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(order.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir cette commande');
      }

      return success(res, order);
    } catch (err) {
      logger.errorRequest(req, err, 'Get order failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération de la commande');
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (req, res) => {
    try {
      logger.request(req, 'Update order status');
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError('Le statut est requis');
      }

      // Vérifier que la commande appartient à un établissement de l'utilisateur
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Commande');
      }
      
      const isOwner = await Place.isOwner(order.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cette commande');
      }

      const updatedOrder = await Order.updateStatus(orderId, status);
      if (!updatedOrder) {
        throw new NotFoundError('Commande');
      }

      // Notifier via WebSocket
      webSocketService.notifyOrderStatusChange(
        order.place_id,
        orderId,
        order.status,
        status
      );

      logger.orderStatusChanged(orderId, order.status, status);
      return success(res, updatedOrder, 'Statut de la commande mis à jour');
    } catch (err) {
      logger.errorRequest(req, err, 'Update order status failed');
      return handleControllerError(res, err, 'Erreur lors de la mise à jour du statut');
    }
  },

  // Lister les commandes d'un établissement
  getOrdersByPlace: async (req, res) => {
    try {
      logger.request(req, 'Get orders by place');
      const { placeId } = req.params;
      const { status } = req.query;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à voir les commandes de cet établissement');
      }

      const orders = await Order.findByPlaceId(placeId, status);
      return success(res, orders);
    } catch (err) {
      logger.errorRequest(req, err, 'Get orders by place failed');
      return handleControllerError(res, err, 'Erreur lors de la récupération des commandes');
    }
  },

  // Ajouter un élément à une commande
  addOrderItem: async (req, res) => {
    try {
      logger.request(req, 'Add order item');
      const { orderId } = req.params;
      const { menuItemId, quantity, unitPrice, specialRequests } = req.body;

      if (!menuItemId || !quantity || !unitPrice) {
        throw new ValidationError('menuItemId, quantity et unitPrice sont requis');
      }

      // Vérifier que la commande appartient à un établissement de l'utilisateur
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Commande');
      }
      
      const isOwner = await Place.isOwner(order.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à modifier cette commande');
      }

      const orderItem = await Order.addOrderItem(orderId, {
        menuItemId,
        quantity,
        unitPrice
      });

      return success(res, orderItem, 'Élément ajouté à la commande', 201);
    } catch (err) {
      logger.errorRequest(req, err, 'Add order item failed');
      return handleControllerError(res, err, 'Erreur lors de l\'ajout de l\'élément');
    }
  },

  // Annuler une commande (publique - pour les clients)
  cancelOrderPublic: async (req, res) => {
    try {
      logger.request(req, 'Public order cancellation');
      const { placeId, orderId } = req.params;

      // Vérifier que l'établissement existe
      const place = await Place.findById(placeId);
      if (!place) {
        throw new NotFoundError('Établissement');
      }

      // Vérifier que la commande existe et appartient à cet établissement
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Commande');
      }

      if (order.place_id !== placeId) {
        throw new ValidationError('Commande ne correspond pas à cet établissement');
      }

      // Vérifier que la commande peut être annulée (seulement si status est 'pending' ou 'new')
      if (order.status !== 'pending' && order.status !== 'new') {
        throw new ValidationError('Cette commande ne peut plus être annulée. Elle est déjà en cours de préparation.');
      }

      // Annuler la commande
      const updatedOrder = await Order.updateStatus(orderId, 'cancelled');
      if (!updatedOrder) {
        throw new NotFoundError('Commande');
      }

      // Notifier via WebSocket
      webSocketService.notifyOrderStatusChange(
        placeId,
        orderId,
        order.status,
        'cancelled'
      );

      logger.orderStatusChanged(orderId, order.status, 'cancelled');
      
      // Supprimer la commande annulée de la base de données
      await Order.delete(orderId);
      logger.info('Cancelled order deleted from database', { orderId, placeId });
      
      return success(res, { id: orderId, deleted: true }, 'Commande annulée et supprimée avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Public order cancellation failed');
      return handleControllerError(res, err, 'Erreur lors de l\'annulation de la commande');
    }
  },

  // Supprimer une commande (pour les restaurateurs)
  deleteOrder: async (req, res) => {
    try {
      logger.request(req, 'Delete order');
      const { orderId } = req.params;

      // Vérifier que la commande existe et appartient à un établissement de l'utilisateur
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Commande');
      }
      
      const isOwner = await Place.isOwner(order.place_id, req.user.id);
      if (!isOwner) {
        throw new UnauthorizedError('Vous n\'êtes pas autorisé à supprimer cette commande');
      }

      // Supprimer la commande (les order_items seront supprimés via CASCADE)
      const deleted = await Order.delete(orderId);
      if (!deleted) {
        throw new NotFoundError('Commande');
      }

      // Notifier via WebSocket
      webSocketService.notifyOrderStatusChange(
        order.place_id,
        orderId,
        order.status,
        'deleted'
      );

      logger.info('Order deleted', { orderId, placeId: order.place_id });
      return success(res, { id: orderId, deleted: true }, 'Commande supprimée avec succès');
    } catch (err) {
      logger.errorRequest(req, err, 'Delete order failed');
      return handleControllerError(res, err, 'Erreur lors de la suppression de la commande');
    }
  }
};

module.exports = orderController;