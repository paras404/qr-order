'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Calendar, ShoppingCart } from 'lucide-react';

interface SalesData {
    total: number;
    orderCount: number;
    date?: string;
    month?: string;
    year?: string;
}

interface DailyBreakdown {
    date: string;
    total: number;
    orderCount: number;
}

export default function SalesPage() {
    const [todaySales, setTodaySales] = useState<SalesData | null>(null);
    const [monthSales, setMonthSales] = useState<SalesData | null>(null);
    const [yearSales, setYearSales] = useState<SalesData | null>(null);
    const [customSales, setCustomSales] = useState<{ total: number; orderCount: number; dailyBreakdown: DailyBreakdown[] } | null>(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const [todayRes, monthRes, yearRes] = await Promise.all([
                api.get('/api/admin/sales/today'),
                api.get('/api/admin/sales/month'),
                api.get('/api/admin/sales/year'),
            ]);

            if (todayRes.data.success) setTodaySales(todayRes.data.data);
            if (monthRes.data.success) setMonthSales(monthRes.data.data);
            if (yearRes.data.success) setYearSales(yearRes.data.data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomRange = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        try {
            const response = await api.get(`/api/admin/sales?start=${startDate}&end=${endDate}`);
            if (response.data.success) {
                setCustomSales(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching custom range:', error);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales Analytics</h1>

            {/* Stats Cards */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading sales data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Today's Sales */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Today's Sales</h3>
                            <DollarSign size={32} className="opacity-80" />
                        </div>
                        <p className="text-3xl font-bold mb-2">₹{todaySales?.total.toFixed(2) || '0.00'}</p>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <ShoppingCart size={16} />
                            <span>{todaySales?.orderCount || 0} orders</span>
                        </div>
                    </div>

                    {/* This Month's Sales */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">This Month</h3>
                            <TrendingUp size={32} className="opacity-80" />
                        </div>
                        <p className="text-3xl font-bold mb-2">₹{monthSales?.total.toFixed(2) || '0.00'}</p>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <ShoppingCart size={16} />
                            <span>{monthSales?.orderCount || 0} orders</span>
                        </div>
                    </div>

                    {/* This Year's Sales */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">This Year</h3>
                            <Calendar size={32} className="opacity-80" />
                        </div>
                        <p className="text-3xl font-bold mb-2">₹{yearSales?.total.toFixed(2) || '0.00'}</p>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <ShoppingCart size={16} />
                            <span>{yearSales?.orderCount || 0} orders</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Date Range */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Custom Date Range</h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchCustomRange}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Get Report
                        </button>
                    </div>
                </div>

                {customSales && (
                    <div className="mt-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">₹{customSales.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-800">{customSales.orderCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Daily Breakdown Table */}
                        {customSales.dailyBreakdown.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Daily Breakdown</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {customSales.dailyBreakdown.map((day) => (
                                                <tr key={day.date} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm">
                                                        {new Date(day.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{day.orderCount}</td>
                                                    <td className="px-6 py-4 font-semibold">₹{day.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
