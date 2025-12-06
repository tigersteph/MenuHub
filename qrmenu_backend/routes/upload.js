const express = require('express');
const router = express.Router();
const { uploadController, uploadMiddleware } = require('../controllers/uploadController');
const { authenticate } = require('../middlewares/auth');

// Route protégée pour l'upload d'images
router.post('/image', authenticate, uploadMiddleware, uploadController.uploadImage);

module.exports = router;
