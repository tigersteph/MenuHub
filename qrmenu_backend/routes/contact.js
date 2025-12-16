const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { generalRateLimiter } = require('../middlewares/rateLimiter');

// Route publique pour envoyer un message de contact
// Rate limiting pour éviter le spam
router.post('/', generalRateLimiter, contactController.sendContact);

module.exports = router;

