'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types';
import api from '@/lib/api';
import { CheckCircle2, Clock, ChefHat, UtensilsCrossed } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: CheckCircle2, color: 'text-green-600' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-blue-600' },
    { key: 'served', label: 'Served', icon: UtensilsCrossed, color: 'text-purple-600' },
];

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!orderId) return;

        fetchOrder();

        // Setup Socket.io for real-time updates
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('orderStatusUpdate', ({ orderId: updatedOrderId, status }) => {
            if (updatedOrderId === orderId) {
                setOrder((prev) => prev ? { ...prev, status } : null);
            }
        });

        return () => {
            newSocket.close();
        };
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/api/orders/${orderId}`);
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (stepKey: string) => {
        if (!order) return 'upcoming';

        const currentIndex = statusSteps.findIndex(s => s.key === order.status);
        const stepIndex = statusSteps.findIndex(s => s.key === stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading order...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Order not found</p>
                    <p className="text-sm text-gray-400 mt-2">Please check your order ID</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Track Your Order</h1>
                    <p className="text-sm text-gray-600">Order ID: {order.id?.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">Table: {order.table_id?.substring(0, 8)}</p>
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-6">Order Status</h2>

                    <div className="relative">
                        {statusSteps.map((step, index) => {
                            const status = getStepStatus(step.key);
                            const Icon = step.icon;
                            const isLast = index === statusSteps.length - 1;

                            return (
                                <div key={step.key} className="relative">
                                    <div className="flex items-center mb-8">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${status === 'completed' ? 'bg-green-100' :
                                            status === 'current' ? 'bg-blue-100' :
                                                'bg-gray-100'
                                            }`}>
                                            <Icon
                                                size={24}
                                                className={
                                                    status === 'completed' ? 'text-green-600' :
                                                        status === 'current' ? 'text-blue-600' :
                                                            'text-gray-400'
                                                }
                                            />
                                        </div>

                                        {/* Label */}
                                        <div className="ml-4 flex-1">
                                            <p className={`font-semibold ${status === 'completed' ? 'text-green-600' :
                                                status === 'current' ? 'text-blue-600' :
                                                    'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </p>
                                            {status === 'current' && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                    <Clock size={14} />
                                                    In progress...
                                                </p>
                                            )}
                                            {status === 'completed' && (
                                                <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {!isLast && (
                                        <div className={`absolute left-6 top-12 w-0.5 h-8 -mt-4 ${status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Order Details</h2>

                    <div className="space-y-3 mb-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <span className="text-gray-700">
                                    {item.qty}x {item.name}
                                </span>
                                <span className="font-semibold">₹{item.price * item.qty}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>₹{order.total}</span>
                        </div>
                    </div>

                    {order.status === 'served' && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-green-800 font-semibold">🎉 Your order has been served!</p>
                            <p className="text-sm text-green-600 mt-1">Enjoy your meal!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
            <TrackOrderContent />
        </Suspense>
    );
}
