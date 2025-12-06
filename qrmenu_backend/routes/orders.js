const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/auth');
const { orderRateLimiter } = require('../middlewares/rateLimiter');

// Routes publiques pour les clients - SANS authentification
// Ces routes sont définies AVANT le middleware d'authentification
// Rate limiting appliqué pour protéger contre les abus
router.post('/places/:placeId/orders/public', orderRateLimiter, orderController.createOrderPublic);
router.patch('/places/:placeId/orders/:orderId/cancel/public', orderRateLimiter, orderController.cancelOrderPublic);

// Middleware d'authentification conditionnel (sauf pour les routes publiques)
// IMPORTANT: Ce middleware s'applique à toutes les routes suivantes
const authenticateExceptPublic = (req, res, next) => {
  // Ignorer les routes qui ne sont pas des routes de commandes
  // req.path dans un router monté sur /api contient le chemin relatif (sans /api)
  // Donc /api/auth/login devient /auth/login dans ce contexte
  const path = req.path || '';
  const originalUrl = req.originalUrl || '';
  
  // Vérifier si c'est une route de commandes (commence par /places/.../orders ou /orders)
  const isOrderRoute = path.startsWith('/places/') && path.includes('/orders') || 
                       path.startsWith('/orders') ||
                       originalUrl.includes('/orders');
  
  if (!isOrderRoute) {
    // Ce n'est pas une route de commandes, passer au suivant (ne pas intercepter)
    return next();
  }
  
  // Vérifier si c'est une route publique de commandes
  const isPublicRoute = path.endsWith('/public') || 
                        path.includes('/orders/public') || 
                        path.includes('/cancel/public') ||
                        originalUrl.includes('/public');
  
  if (isPublicRoute) {
    return next();
  }
  
  // Appliquer l'authentification pour les routes de commandes protégées
  return authenticate(req, res, next);
};

// Appliquer le middleware d'authentification conditionnel
router.use(authenticateExceptPublic);

// Routes pour les commandes
// Rate limiting appliqué pour protéger contre les abus
router.post('/places/:placeId/orders', orderRateLimiter, orderController.createOrder);
router.get('/places/:placeId/orders', orderController.getOrdersByPlace);
router.get('/orders/:orderId', orderController.getOrder);
router.patch('/orders/:orderId/status', orderController.updateOrderStatus);
router.post('/orders/:orderId/items', orderRateLimiter, orderController.addOrderItem);
router.delete('/orders/:orderId', orderController.deleteOrder);

module.exports = router;