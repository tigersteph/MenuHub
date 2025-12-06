const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { authenticate } = require('../middlewares/auth');

// Middleware d'authentification conditionnel (sauf pour les routes publiques)
const authenticateExceptPublic = (req, res, next) => {
  // Ignorer les routes qui ne sont pas des routes d'établissements
  // (pour éviter d'intercepter /api/auth, /api/orders, etc.)
  const path = req.path || req.originalUrl || '';
  const isPlaceRoute = path.startsWith('/') && !path.startsWith('/auth') && !path.startsWith('/orders') && !path.startsWith('/menu') && !path.startsWith('/categories') && !path.startsWith('/tables');
  
  if (!isPlaceRoute) {
    // Ce n'est pas une route d'établissement, passer au suivant (ne pas intercepter)
    return next();
  }
  
  // Si c'est une route publique d'établissement, passer au suivant sans authentification
  if (path.endsWith('/public') || (path.includes('/places/') && path.includes('/public'))) {
    return next();
  }
  
  // Sinon, appliquer l'authentification pour les routes d'établissements protégées
  return authenticate(req, res, next);
};

// Route publique (sans authentification)
router.get('/:id/public', placeController.getPlacePublic);

// Routes protégées (nécessitent une authentification)
router.use(authenticateExceptPublic);

// Routes pour les établissements
router.post('/', placeController.createPlace);
router.get('/', placeController.getUserPlaces);
router.get('/:id', placeController.getPlace);
router.get('/:id/stats', placeController.getPlaceStats);
router.post('/:id/duplicate', placeController.duplicatePlace);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);

module.exports = router;