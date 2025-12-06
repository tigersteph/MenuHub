const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Créer une catégorie
router.post('/', categoryController.createCategory);
// Mettre à jour une catégorie
router.put('/:id', categoryController.updateCategory);
// Supprimer une catégorie
router.delete('/:id', categoryController.deleteCategory);
// Lister les catégories d'un établissement
router.get('/place/:placeId', categoryController.getCategoriesByPlace);

module.exports = router;
