const Order = require('../models/order');
const Place = require('../models/place');

const orderController = {
  // Créer une nouvelle commande
  createOrder: async (req, res) => {
    try {
      const { placeId } = req.params;
      const { tableNumber, items, customerNotes } = req.body;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const order = await Order.create({
        placeId,
        tableNumber,
        items,
        customerNotes
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Erreur création commande:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la commande' });
    }
  },

  // Obtenir les détails d'une commande
  getOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Order.belongsToPlace(orderId, req.user.placeId);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      res.json(order);
    } catch (error) {
      console.error('Erreur récupération commande:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      // Vérifier que la commande appartient à un établissement de l'utilisateur
      const isOwner = await Order.belongsToPlace(orderId, req.user.placeId);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const updatedOrder = await Order.updateStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }

      // Ici, tu pourrais ajouter une notification en temps réel
      // via WebSocket ou un service de file d'attente

      res.json(updatedOrder);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      res.status(500).json({ 
        message: error.message || 'Erreur lors de la mise à jour du statut' 
      });
    }
  },

  // Lister les commandes d'un établissement
  getOrdersByPlace: async (req, res) => {
    try {
      const { placeId } = req.params;
      const { status } = req.query;

      // Vérifier que l'utilisateur est propriétaire
      const isOwner = await Place.isOwner(placeId, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const orders = await Order.findByPlaceId(placeId, status);
      res.json(orders);
    } catch (error) {
      console.error('Erreur liste commandes:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  // Ajouter un élément à une commande
  addOrderItem: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { menuItemId, quantity, unitPrice, specialRequests } = req.body;

      // Vérifier que la commande appartient à un établissement de l'utilisateur
      const isOwner = await Order.belongsToPlace(orderId, req.user.placeId);
      if (!isOwner) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const orderItem = await Order.addOrderItem(orderId, {
        menuItemId,
        quantity,
        unitPrice,
        specialRequests
      });

      res.status(201).json(orderItem);
    } catch (error) {
      console.error('Erreur ajout élément commande:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = orderController;