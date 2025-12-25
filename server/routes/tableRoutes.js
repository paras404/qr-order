const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middleware/auth');

// Public route - get all tables (for status display)
router.get('/', tableController.getAllTables);

// Public route - get table by ID
router.get('/:id', tableController.getTableById);

// Protected routes - require authentication
router.post('/', auth, tableController.createTable);
router.put('/:id', auth, tableController.updateTable);
router.delete('/:id', auth, tableController.deleteTable);
router.post('/:id/qr', auth, tableController.regenerateQRCode);

module.exports = router;
