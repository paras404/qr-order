const supabase = require('../config/supabase');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
    try {
        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({ success: true, data: menuItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create menu item (Admin only)
exports.createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, image_url, is_available } = req.body;

        const { data: menuItem, error } = await supabase
            .from('menu_items')
            .insert([{
                name,
                description,
                price,
                category,
                image_url,
                is_available
            }])
            .select()
            .single();

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update menu item (Admin only)
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data: menuItem, error } = await supabase
            .from('menu_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ success: true, data: menuItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete menu item (Admin only)
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: menuItem, error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
