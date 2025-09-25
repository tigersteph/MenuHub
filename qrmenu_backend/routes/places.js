const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { authenticate } = require('../middlewares/auth');

// Tous les endpoints nécessitent une authentification
router.use(authenticate);

// Routes pour les établissements
router.post('/', placeController.createPlace);
router.get('/', placeController.getUserPlaces);
router.get('/:id', placeController.getPlace);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);

module.exports = router;