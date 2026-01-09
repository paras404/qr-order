const supabase = require('../config/supabase');

// Get today's sales
exports.getSalesToday = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const { data: orders, error } = await supabase
            .from('orders')
            .select('total')
            .in('status', ['served', 'completed'])
            .gte('created_at', today)
            .lt('created_at', tomorrowStr);

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        const total = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        res.json({
            success: true,
            data: {
                total: total,
                orderCount: orders.length,
                date: today
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get this month's sales
exports.getSalesMonth = async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startOfMonth = `${year}-${month}-01`;

        // Get first day of next month
        const nextMonth = new Date(year, now.getMonth() + 1, 1);
        const startOfNextMonth = nextMonth.toISOString().split('T')[0];

        const { data: orders, error } = await supabase
            .from('orders')
            .select('total')
            .in('status', ['served', 'completed'])
            .gte('created_at', startOfMonth)
            .lt('created_at', startOfNextMonth);

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        const total = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        res.json({
            success: true,
            data: {
                total: total,
                orderCount: orders.length,
                month: `${year}-${month}`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get this year's sales
exports.getSalesYear = async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const startOfYear = `${year}-01-01`;
        const startOfNextYear = `${year + 1}-01-01`;

        const { data: orders, error } = await supabase
            .from('orders')
            .select('total')
            .in('status', ['served', 'completed'])
            .gte('created_at', startOfYear)
            .lt('created_at', startOfNextYear);

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        const total = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        res.json({
            success: true,
            data: {
                total: total,
                orderCount: orders.length,
                year: year.toString()
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }

        // Add one day to end date to include it
        const endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];

        const { data: orders, error } = await supabase
            .from('orders')
            .select('total, created_at')
            .in('status', ['served', 'completed'])
            .gte('created_at', start)
            .lt('created_at', endDateStr)
            .order('created_at', { ascending: true });

        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }

        const total = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        // Group by date for daily breakdown
        const dailyBreakdown = {};
        orders.forEach(order => {
            const date = order.created_at.split('T')[0];
            if (!dailyBreakdown[date]) {
                dailyBreakdown[date] = { total: 0, orderCount: 0 };
            }
            dailyBreakdown[date].total += parseFloat(order.total);
            dailyBreakdown[date].orderCount += 1;
        });

        const dailyArray = Object.keys(dailyBreakdown).map(date => ({
            date,
            total: dailyBreakdown[date].total,
            orderCount: dailyBreakdown[date].orderCount
        }));

        res.json({
            success: true,
            data: {
                total: total,
                orderCount: orders.length,
                dailyBreakdown: dailyArray
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
