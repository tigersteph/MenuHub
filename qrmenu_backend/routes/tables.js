// routes/tables.js
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate } = require('../middlewares/auth');

// Middleware d'authentification conditionnel (sauf pour les routes publiques)
const authenticateExceptPublic = (req, res, next) => {
  // Ignorer les routes qui ne sont pas des routes de tables
  // (pour éviter d'intercepter /api/auth, /api/orders, etc.)
  const path = req.path || req.originalUrl || '';
  const isTableRoute = path.startsWith('/') && (path.includes('/tables') || path.startsWith('/place/'));
  
  if (!isTableRoute) {
    // Ce n'est pas une route de tables, passer au suivant (ne pas intercepter)
    return next();
  }
  
  // Si c'est une route publique de tables, passer au suivant sans authentification
  if (path.endsWith('/public') || (path.includes('/tables/') && path.includes('/public'))) {
    return next();
  }
  
  // Sinon, appliquer l'authentification pour les routes de tables protégées
  return authenticate(req, res, next);
};

// Route publique (sans authentification)
router.get('/:id/public', tableController.getTablePublic);

// Routes protégées (nécessitent une authentification)
// Utiliser directement authenticate pour les routes DELETE, POST, PUT, GET (sauf public)
router.post('/', authenticate, tableController.createTable);
router.get('/place/:placeId', authenticate, tableController.getTablesByPlace);
router.get('/:id', authenticate, tableController.getTable);
router.put('/:id', authenticate, tableController.updateTable);
router.delete('/:id', authenticate, tableController.deleteTable);

module.exports = router;
