'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import api from '@/lib/api';
import { Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    preparing: 'bg-blue-100 text-blue-800 border-blue-300',
    served: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchOrders();

        // Setup Socket.io
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('newOrder', (order: Order) => {
            setOrders((prev) => [order, ...prev]);
            // Optional: Play notification sound
        });

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

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        console.log("orderId", orderId);
        console.log("status", status);

        try {
            await api.put(`/api/orders/${orderId}`, { status });
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: status as any } : order
                )
            );
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const activeOrders = orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled');

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Dashboard</h1>

            {loading ? (
                <p className="text-gray-500">Loading orders...</p>
            ) : activeOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No active orders</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Table {order.table_id}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(order.createdAt!).toLocaleTimeString()}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]
                                        }`}
                                >
                                    {order.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span>
                                            {item.qty}x {item.name}
                                        </span>
                                        <span className="font-semibold">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 mb-4">
                                <div className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id!, 'preparing')}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                                    >
                                        Start Preparing
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button
                                        onClick={() => updateOrderStatus(order.id!, 'served')}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                                    >
                                        Mark Served
                                    </button>
                                )}
                                {/* {console.log("order", order)} */}
                                <button
                                    onClick={() => updateOrderStatus(order.id!, 'cancelled')}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
