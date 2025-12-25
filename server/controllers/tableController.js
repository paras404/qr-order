const supabase = require('../config/supabase');
const QRCode = require('qrcode');

// Get all tables
exports.getAllTables = async (req, res) => {
    try {
        const { status } = req.query;

        let query = supabase
            .from('tables')
            .select('*')
            .order('table_number', { ascending: true });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: tables, error } = await query;

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({ success: true, data: tables });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get table by ID
exports.getTableById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: table, error } = await supabase
            .from('tables')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json({ success: true, data: table });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new table
exports.createTable = async (req, res) => {
    try {
        const { table_number, capacity, location } = req.body;

        if (!table_number) {
            return res.status(400).json({ message: 'Table number is required' });
        }

        // Create table first
        const { data: table, error: insertError } = await supabase
            .from('tables')
            .insert([{
                table_number,
                capacity: capacity || 4,
                location: location || '',
                status: 'available'
            }])
            .select()
            .single();

        if (insertError) {
            console.error(insertError);
            if (insertError.code === '23505') {
                return res.status(400).json({ message: 'Table number already exists' });
            }
            return res.status(500).json({ message: 'Server error' });
        }

        // Generate QR code
        const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.25.71:3000';
        const qrData = `${frontendUrl}/menu?table_id=${table.id}`;

        try {
            const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Update table with QR code
            const { data: updatedTable, error: updateError } = await supabase
                .from('tables')
                .update({ qr_code_url: qrCodeDataUrl })
                .eq('id', table.id)
                .select()
                .single();

            if (updateError) {
                console.error(updateError);
            }

            res.status(201).json({
                success: true,
                data: updatedTable || { ...table, qr_code_url: qrCodeDataUrl }
            });
        } catch (qrError) {
            console.error('QR Code generation error:', qrError);
            // Return table without QR code if generation fails
            res.status(201).json({ success: true, data: table });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update table
exports.updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { table_number, capacity, location, status } = req.body;

        const updateData = {};
        if (table_number !== undefined) updateData.table_number = table_number;
        if (capacity !== undefined) updateData.capacity = capacity;
        if (location !== undefined) updateData.location = location;
        if (status !== undefined) updateData.status = status;

        const { data: table, error } = await supabase
            .from('tables')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(error);
            if (error.code === '23505') {
                return res.status(400).json({ message: 'Table number already exists' });
            }
            return res.status(500).json({ message: 'Server error' });
        }

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.json({ success: true, data: table });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete table
exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({ success: true, message: 'Table deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Regenerate QR code
exports.regenerateQRCode = async (req, res) => {
    try {
        const { id } = req.params;

        // Get table
        const { data: table, error: fetchError } = await supabase
            .from('tables')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Generate new QR code
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrData = `${frontendUrl}/menu?table_id=${table.id}`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Update table
        const { data: updatedTable, error: updateError } = await supabase
            .from('tables')
            .update({ qr_code_url: qrCodeDataUrl })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error(updateError);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({ success: true, data: updatedTable });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
