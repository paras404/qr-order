const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const auth = require('../middleware/auth');

// All sales routes require authentication
router.get('/today', auth, salesController.getSalesToday);
router.get('/month', auth, salesController.getSalesMonth);
router.get('/year', auth, salesController.getSalesYear);
router.get('/', auth, salesController.getSalesByDateRange);

module.exports = router;
