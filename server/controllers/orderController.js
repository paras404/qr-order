const supabase = require('../config/supabase');
const { sendInvoiceEmail } = require('../services/emailService');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { tableId, customerId, customerInfo, items, subtotal, serviceCharge, tax, totalAmount, total } = req.body;
        console.log("Creating order for table:", tableId);

        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        // if (!customerInfo || !customerInfo.phone) {
        //     return res.status(400).json({ message: 'Customer phone number is required' });
        // }

        // Find or create customer
        let customer;
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', customerInfo.phone)
            .single();

        if (existingCustomer) {
            // Update existing customer if info changed
            const { data: updatedCustomer, error: updateError } = await supabase
                .from('customers')
                .update({
                    name: customerInfo.name || existingCustomer.name,
                    email: customerInfo.email || existingCustomer.email,
                })
                .eq('id', existingCustomer.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating customer:', updateError);
            }
            customer = updatedCustomer || existingCustomer;
        } else {
            // Create new customer
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert([{
                    name: customerInfo.name,
                    phone: customerInfo.phone,
                    email: customerInfo.email,
                }])
                .select()
                .single();

            if (createError) {
                console.error('Error creating customer:', createError);
                return res.status(500).json({ message: 'Error creating customer' });
            }
            customer = newCustomer;
        }

        // Create order with customer_id and billing info
        const { data: order, error } = await supabase
            .from('orders')
            .insert([{
                table_id: tableId,
                customer_id: customer.id,
                items: items,
                subtotal: subtotal,
                service_charge: serviceCharge,
                tax: tax,
                total_amount: totalAmount,
                total: totalAmount, // For backward compatibility
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.emit('newOrder', order);

        res.status(201).json({
            success: true,
            data: order,
            customerId: customer.id // Return customer ID for localStorage update
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders with filtering and pagination
exports.getAllOrders = async (req, res) => {
    try {
        const { table_id, status, start_date, end_date, page = 1, limit = 10 } = req.query;

        // Build query
        let query = supabase
            .from('orders')
            .select('*', { count: 'exact' });

        // Apply filters
        if (table_id) {
            query = query.eq('table_id', table_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (start_date) {
            query = query.gte('created_at', start_date);
        }

        if (end_date) {
            // Add one day to include the end date
            const endDateTime = new Date(end_date);
            endDateTime.setDate(endDateTime.getDate() + 1);
            query = query.lt('created_at', endDateTime.toISOString().split('T')[0]);
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Apply pagination and sorting
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        const { data: orders, error, count } = await query;

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limitNum);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: count,
                totalPages: totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("Updating order", id, "to status:", status);

        if (!['pending', 'preparing', 'served', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.emit('orderStatusUpdate', { orderId: id, status });

        // Send invoice email when order is served
        // if (status === 'served') {
        //     console.log('Order served, sending invoice email...');
        //     sendInvoiceEmail(id).catch(err => {
        //         console.error('Failed to send invoice email:', err);
        //         // Don't fail the request if email fails
        //     });
        // }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
