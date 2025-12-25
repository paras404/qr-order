'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import api from '@/lib/api';
import { Clock, ChefHat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { io, Socket } from 'socket.io-client';

const statusColors = {
    pending: 'bg-yellow-100 border-yellow-300',
    preparing: 'bg-blue-100 border-blue-300',
};

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        fetchOrders();

        // Setup Socket.io
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('newOrder', (order: Order) => {
            setOrders((prev) => [...prev, order]);
            playNotification();
        });

        newSocket.on('orderStatusUpdate', ({ orderId, status }) => {
            if (status === 'served' || status === 'cancelled') {
                setOrders((prev) => prev.filter((order) => order.id !== orderId));
            } else {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId ? { ...order, status } : order
                    )
                );
            }
        });

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrders, 30000);

        return () => {
            newSocket.close();
            clearInterval(interval);
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/kitchen/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/api/orders/${orderId}`, { status });
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: status as any } : order
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const playNotification = () => {
        // Simple beep using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                    <ChefHat size={40} />
                    Kitchen Display
                </h1>
                <p className="text-gray-400 mt-2">Active Orders: {orders.length}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Orders */}
                <div>
                    <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                        Pending ({pendingOrders.length})
                    </h2>
                    <div className="space-y-4">
                        {pendingOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-lg p-6 border-4 ${statusColors.pending}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            Table {order.table_id?.substring(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock size={14} />
                                            {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    <span className="text-3xl font-bold text-yellow-600">
                                        #{order.id?.substring(0, 6)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-lg">
                                            <span className="font-semibold">
                                                {item.qty}x {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => updateStatus(order.id!, 'preparing')}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
                                >
                                    Start Preparing
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No pending orders
                            </div>
                        )}
                    </div>
                </div>

                {/* Preparing Orders */}
                <div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-4">
                        Preparing ({preparingOrders.length})
                    </h2>
                    <div className="space-y-4">
                        {preparingOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`bg-white rounded-lg p-6 border-4 ${statusColors.preparing}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            Table {order.table_id?.substring(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock size={14} />
                                            {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    <span className="text-3xl font-bold text-blue-600">
                                        #{order.id?.substring(0, 6)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-lg">
                                            <span className="font-semibold">
                                                {item.qty}x {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => updateStatus(order.id!, 'served')}
                                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition"
                                >
                                    Mark as Served
                                </button>
                            </div>
                        ))}
                        {preparingOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No orders in preparation
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
