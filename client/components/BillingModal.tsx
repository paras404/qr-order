'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BillingModalProps {
    tableId: string | null;
    tableName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BillingModal({ tableId, tableName, isOpen, onClose, onSuccess }: BillingModalProps) {
    const [loading, setLoading] = useState(false);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && tableId) {
            fetchActiveOrders();
        }
    }, [isOpen, tableId]);

    const fetchActiveOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/orders/table/${tableId}/active`);
            if (response.data.success) {
                const orders = response.data.data;
                setActiveOrders(orders);

                // Calculate totals
                const total = orders.reduce((sum: number, order: Order) => sum + order.total, 0);
                setSubtotal(total);
            }
        } catch (error) {
            console.error('Error fetching table orders:', error);
            toast.error('Failed to load table orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async () => {
        if (!tableId) return;

        setProcessing(true);
        try {
            const response = await api.post(`/api/orders/table/${tableId}/pay`, {
                paymentMethod
            });

            if (response.data.success) {
                toast.success('Bill settled & Table cleared!');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error settling bill:', error);
            toast.error('Failed to settle bill');
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden bg-white"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Billing: Table {tableName}</h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading bill...</div>
                        ) : activeOrders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No active orders found.</div>
                        ) : (
                            <div className="space-y-4">
                                {/* Order Summary */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase">Items</h3>
                                    {activeOrders.map((order, idx) => (
                                        <div key={order.id} className="border-b pb-2">
                                            {order.items.map((item, itemIdx) => (
                                                <div key={`${order.id}-${itemIdx}`} className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-700">{item.qty}x {item.name}</span>
                                                    <span className="font-medium">₹{item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Service Charge (5%)</span>
                                        <span>₹{(subtotal * 0.05).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>GST (18%)</span>
                                        <span>₹{(subtotal * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total Payable</span>
                                        <span>₹{(subtotal * 1.23).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Payment Method</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${paymentMethod === 'cash' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Banknote size={24} className="mb-1" />
                                            <span className="text-xs font-medium">Cash</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('upi')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${paymentMethod === 'upi' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Smartphone size={24} className="mb-1" />
                                            <span className="text-xs font-medium">UPI</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${paymentMethod === 'card' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <CreditCard size={24} className="mb-1" />
                                            <span className="text-xs font-medium">Card</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSettle}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                            disabled={processing || loading || activeOrders.length === 0}
                        >
                            {processing ? 'Processing...' : 'Settle & Clear Table'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
