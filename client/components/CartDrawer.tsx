'use client';

import useCartStore from '@/store/useCartStore';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
    tableId: string;
}

export default function CartDrawer({ tableId }: CartDrawerProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const { items, updateQuantity, removeItem, clearCart, getTotal, customerId } = useCartStore();
    const router = useRouter();

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;

        setIsPlacingOrder(true);
        try {
            const orderData = {
                tableId: tableId,
                customerId: customerId,
                items: items.map((item: any) => ({
                    itemId: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                })),
                total: getTotal(),
            };

            const response = await api.post('/api/orders', orderData);

            if (response.data.success) {
                clearCart();
                setIsOpen(false);
                router.push(`/order-confirmation?orderId=${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition z-40"
            >
                <ShoppingCart size={24} />
                {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {items.reduce((sum, item) => sum + item.qty, 0)}
                    </span>
                )}
            </button>

            {/* Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold">Your Cart</h2>
                        <button onClick={() => setIsOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-gray-600">₹{item.price}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.qty - 1)}
                                                className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-semibold">{item.qty}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.qty + 1)}
                                                className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t p-4 space-y-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span>₹{getTotal()}</span>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                            >
                                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
