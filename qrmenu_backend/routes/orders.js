const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/auth');

// Tous les endpoints nécessitent une authentification
router.use(authenticate);

// Routes pour les commandes
router.post('/places/:placeId/orders', orderController.createOrder);
router.get('/places/:placeId/orders', orderController.getOrdersByPlace);
router.get('/orders/:orderId', orderController.getOrder);
router.patch('/orders/:orderId/status', orderController.updateOrderStatus);
router.post('/orders/:orderId/items', orderController.addOrderItem);

module.exports = router;