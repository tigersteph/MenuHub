/**
 * Service WebSocket pour notifications temps réel
 * Remplace le polling HTTP par des notifications push
 */

const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map(); // placeId -> Set of socketIds
  }

  initialize(server) {
    const { Server } = require('socket.io');
    const cors = require('cors');
    
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      logger.info('WebSocket client connected', { socketId: socket.id });

      // Rejoindre une room pour un établissement spécifique
      socket.on('join-place', (placeId) => {
        if (!placeId) {
          socket.emit('error', { message: 'Place ID requis' });
          return;
        }

        socket.join(`place:${placeId}`);
        
        // Garder une trace des clients connectés
        if (!this.connectedClients.has(placeId)) {
          this.connectedClients.set(placeId, new Set());
        }
        this.connectedClients.get(placeId).add(socket.id);
        
        logger.info('Client joined place room', { socketId: socket.id, placeId });
        socket.emit('joined', { placeId });
      });

      // Quitter une room
      socket.on('leave-place', (placeId) => {
        socket.leave(`place:${placeId}`);
        if (this.connectedClients.has(placeId)) {
          this.connectedClients.get(placeId).delete(socket.id);
          if (this.connectedClients.get(placeId).size === 0) {
            this.connectedClients.delete(placeId);
          }
        }
        logger.info('Client left place room', { socketId: socket.id, placeId });
      });

      socket.on('disconnect', () => {
        logger.info('WebSocket client disconnected', { socketId: socket.id });
        // Nettoyer les références
        for (const [placeId, clients] of this.connectedClients.entries()) {
          clients.delete(socket.id);
          if (clients.size === 0) {
            this.connectedClients.delete(placeId);
          }
        }
      });
    });

    logger.info('WebSocket service initialized');
    return this.io;
  }

  /**
   * Notifier tous les clients d'un établissement d'une nouvelle commande
   */
  notifyNewOrder(placeId, order) {
    if (!this.io) {
      logger.warn('WebSocket not initialized, cannot notify new order');
      return;
    }

    this.io.to(`place:${placeId}`).emit('new-order', {
      type: 'new-order',
      order: {
        id: order.id,
        place_id: order.place_id,
        table: order.table_name || order.table_id || order.table_number,
        table_id: order.table_id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items: order.items || []
      }
    });

    logger.orderCreated(order.id, placeId, order.table_id, order.total_amount);
    logger.info('New order notification sent', { placeId, orderId: order.id });
  }

  /**
   * Notifier tous les clients d'un établissement d'un changement de statut
   */
  notifyOrderStatusChange(placeId, orderId, oldStatus, newStatus) {
    if (!this.io) {
      logger.warn('WebSocket not initialized, cannot notify status change');
      return;
    }

    this.io.to(`place:${placeId}`).emit('order-status-changed', {
      type: 'order-status-changed',
      orderId,
      oldStatus,
      newStatus
    });

    logger.orderStatusChanged(orderId, oldStatus, newStatus);
    logger.info('Order status change notification sent', { placeId, orderId, newStatus });
  }

  /**
   * Obtenir le nombre de clients connectés pour un établissement
   */
  getConnectedClientsCount(placeId) {
    return this.connectedClients.has(placeId) 
      ? this.connectedClients.get(placeId).size 
      : 0;
  }
}

// Singleton
const webSocketService = new WebSocketService();

module.exports = webSocketService;

