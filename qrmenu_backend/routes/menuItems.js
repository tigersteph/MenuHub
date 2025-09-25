const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { authenticate } = require('../middlewares/auth');

// Tous les endpoints nécessitent une authentification
router.use(authenticate);

// Routes pour les éléments de menu
router.post('/:placeId/items', menuItemController.createMenuItem);
router.get('/:placeId/items', menuItemController.getMenuItems);
router.put('/items/:itemId', menuItemController.updateMenuItem);
router.delete('/items/:itemId', menuItemController.deleteMenuItem);
router.patch('/items/:itemId/availability', menuItemController.updateAvailability);

module.exports = router;