const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// POST /api/orders - Public (customer can place order)
router.post('/', orderController.createOrder);

// GET /api/orders - Admin only
router.get('/', authMiddleware, orderController.getAllOrders);

// PUT /api/orders/:id - Admin only
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
