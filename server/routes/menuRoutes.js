const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

// GET /api/menu - Public
router.get('/', menuController.getAllMenuItems);

// POST /api/menu - Admin only
router.post('/', authMiddleware, menuController.createMenuItem);

// PUT /api/menu/:id - Admin only
router.put('/:id', authMiddleware, menuController.updateMenuItem);

// DELETE /api/menu/:id - Admin only
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;
