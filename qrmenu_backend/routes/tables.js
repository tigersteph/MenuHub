// routes/tables.js
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// CRUD tables
router.post('/', tableController.createTable);
router.get('/place/:placeId', tableController.getTablesByPlace);
router.get('/:id', tableController.getTable);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

module.exports = router;
