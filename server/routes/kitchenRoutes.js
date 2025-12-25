const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get kitchen orders (pending and preparing)
router.get('/orders', async (req, res) => {
    try {
        const { data: orders, error } = await require('../config/supabase')
            .from('orders')
            .select('*')
            .in('status', ['pending', 'preparing'])
            .order('created_at', { ascending: true });

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
