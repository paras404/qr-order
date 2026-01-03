const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// POST /api/orders - Public (customer can place order)
router.post('/', orderController.createOrder);

// GET /api/orders - Admin only
router.get('/', authMiddleware, orderController.getAllOrders);

// GET /api/orders/:id - Public (for tracking)
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id - Admin only
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

// GET /api/orders/customer/:customerId - Public (for customer history)
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

// GET /api/orders/table/:tableId/active - Admin only (Get unpaid orders)
router.get('/table/:tableId/active', authMiddleware, orderController.getTableActiveOrders);

// POST /api/orders/table/:tableId/pay - Admin only (Settle bill)
router.post('/table/:tableId/pay', authMiddleware, orderController.settleTableBill);

module.exports = router;
