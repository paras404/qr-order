'use client';

import useCartStore from '@/store/useCartStore';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import BillSummary, { calculateBilling } from '@/components/BillSummary';
import toast from 'react-hot-toast';

export default function CartPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [tableId, setTableId] = useState('');
    const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string; email: string } | null>(null);
    const { items, updateQuantity, removeItem, clearCart, getTotal, customerId } = useCartStore();

    useEffect(() => {
        // Get table_id from URL or localStorage
        const urlTableId = searchParams.get('table_id') || searchParams.get('table');
        const storedTableId = localStorage.getItem('qr_table_id');

        if (urlTableId) {
            setTableId(urlTableId);
            localStorage.setItem('qr_table_id', urlTableId);
        } else if (storedTableId) {
            setTableId(storedTableId);
        }

        // Load customer info from localStorage
        const savedInfo = localStorage.getItem('qr_customer_info');
        if (savedInfo) {
            try {
                setCustomerInfo(JSON.parse(savedInfo));
            } catch (e) {
                console.error('Error parsing customer info:', e);
            }
        }
    }, [searchParams]);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        if (!tableId) {
            toast.error('Table ID is missing. Please scan QR code again.');
            return;
        }

        // Validate customer info
        if (!customerInfo || !customerInfo.phone) {
            toast.error('Please provide your contact information first');
            router.push('/customer-info?table_id=' + tableId);
            return;
        }

        setIsPlacingOrder(true);
        try {
            const subtotal = getTotal();
            const billing = calculateBilling(subtotal);

            const orderData = {
                tableId: tableId,
                customerId: customerId,
                customerInfo: customerInfo,
                items: items.map((item: any) => ({
                    itemId: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                })),
                subtotal: billing.subtotal,
                serviceCharge: billing.serviceCharge,
                tax: billing.tax,
                totalAmount: billing.totalAmount,
                total: billing.totalAmount, // For backward compatibility
            };

            const response = await api.post('/api/orders', orderData);

            if (response.data.success) {
                // Update localStorage with the real customer ID from database
                if (response.data.customerId) {
                    localStorage.setItem('qr_customer_id', response.data.customerId);
                }

                clearCart();
                toast.success('Order placed successfully!');
                router.push(`/order-confirmation?orderId=${response.data.data.id}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 text-lg">Your cart is empty</p>
                        <p className="text-sm text-gray-400 mt-2">Add items from the menu</p>
                        <button
                            onClick={() => router.push(`/menu?table_id=${tableId}`)}
                            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {items.map((item: any) => (
                                <div key={item.id} className="bg-white rounded-lg shadow p-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">₹{item.price}</p>

                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-semibold w-8 text-center">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-auto text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">₹{item.price * item.qty}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bill Summary */}
                        <BillSummary subtotal={getTotal()} />

                        <div className="bg-white rounded-lg shadow p-4 mb-4 mt-4">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400"
                            >
                                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <button
                                onClick={clearCart}
                                className="w-full mt-2 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
