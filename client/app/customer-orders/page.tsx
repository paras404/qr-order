'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import api from '@/lib/api';
import { Clock, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import OrderStatusProgress from '@/components/OrderStatusProgress';
import BillSummary from '@/components/BillSummary';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    preparing: 'bg-blue-100 text-blue-800 border-blue-300',
    served: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerId, setCustomerId] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Get customer ID from localStorage
        const storedCustomerId = localStorage.getItem('qr_customer_id');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
            fetchOrders(storedCustomerId);
        } else {
            setLoading(false);
        }

        // Setup Socket.io for real-time updates
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('orderStatusUpdate', ({ orderId, status }) => {
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const fetchOrders = async (custId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/orders/customer/${custId}`);

            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
                    <p className="text-gray-500">Loading orders...</p>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No orders yet</p>
                        <p className="text-sm text-gray-400 mt-2">Your orders will appear here</p>
                        <Link
                            href="/menu"
                            className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Order #{order.id?.substring(0, 8)}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Clock size={12} />
                                            {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Order Status Progress */}
                                <OrderStatusProgress status={order.status} />

                                <div className="space-y-1 mb-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {item.qty}x {item.name}
                                            </span>
                                            <span className="text-gray-600">₹{item.price * item.qty}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg">₹{order.total}</span>
                                        <span className="text-xs text-gray-500">Order #{order.id?.substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
