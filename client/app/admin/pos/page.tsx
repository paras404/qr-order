'use client';

import { useState, useEffect } from 'react';
import { MenuItem, Table, CartItem } from '@/types';
import api from '@/lib/api';
import { Search, ShoppingCart, User, Plus, Minus, Trash2, CreditCard, Banknote, QrCode } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Inline simplified Menu Card for POS
const POSMenuCard = ({ item, quantity, onAdd, onRemove }: {
    item: MenuItem;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
}) => (
    <div
        onClick={onAdd}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
    >
        <div className="relative h-32 w-full bg-gray-100">
            {item.image_url ? (
                <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
            )}
            {quantity > 0 && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {quantity}
                </div>
            )}
        </div>
        <div className="p-3 flex flex-col flex-grow">
            <h4 className="font-bold text-sm text-gray-800 line-clamp-1" title={item.name}>{item.name}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 flex-grow opacity-0 hover:opacity-100 transition-opacity absolute bg-white p-1 rounded border shadow-lg z-10 w-48 pointer-events-none group-hover:pointer-events-auto top-10">
                {item.description}
            </p>
            <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-red-600">₹{item.price}</span>
                {quantity > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-6 h-6 bg-red-50 text-red-600 rounded flex items-center justify-center hover:bg-red-100"
                    >
                        <Minus size={14} />
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default function POSPage() {
    // Data State
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Order State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
    const [submitting, setSubmitting] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuRes, tablesRes] = await Promise.all([
                    api.get('/api/menu'),
                    api.get('/api/tables')
                ]);

                if (menuRes.data.success) {
                    setMenuItems(menuRes.data.data);
                    // Extract categories
                    const cats = ['All', ...Array.from(new Set(menuRes.data.data.map((i: MenuItem) => i.category)))];
                    setCategories(cats as string[]);
                }

                if (tablesRes.data.success) {
                    setTables(tablesRes.data.data.filter((t: Table) => t.status === 'available' || t.status === 'occupied'));
                }
            } catch (error) {
                console.error("Failed to load POS data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Cart Logic
    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.qty > 1) {
                return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(cartTotal * 0.05); // 5% Tax example
    const finalTotal = cartTotal + tax;

    // Filter Logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.is_available;
    });

    // Submit Order
    const handlePlaceOrder = async () => {
        if (cart.length === 0) return alert("Cart is empty!");
        if (orderType === 'dine_in' && !selectedTable) return alert("Please select a table for Dine-in orders.");

        setSubmitting(true);
        try {
            const orderPayload = {
                items: cart.map(item => ({
                    itemId: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price
                })),
                subtotal: cartTotal,
                tax,
                totalAmount: finalTotal,
                total: finalTotal, // backward compat
                orderType,
                tableId: orderType === 'dine_in' ? selectedTable : null,
                paymentStatus,
                paymentMethod: paymentStatus === 'paid' ? paymentMethod : null,
                customerInfo: customerInfo.phone ? customerInfo : undefined
            };

            await api.post('/api/orders', orderPayload);

            // Reset
            setCart([]);
            setCustomerInfo({ name: '', phone: '' });
            setSelectedTable('');
            setPaymentStatus('pending');
            alert("Order placed successfully!");

        } catch (error) {
            console.error(error);
            alert("Failed to place order.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left Column: Menu */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading ? <p>Loading menu...</p> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredItems.map(item => (
                                <POSMenuCard
                                    key={item.id}
                                    item={item}
                                    quantity={cart.find(c => c.id === item.id)?.qty || 0}
                                    onAdd={() => addToCart(item)}
                                    onRemove={() => removeFromCart(item.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-[400px] bg-white flex flex-col shadow-xl z-10">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <ShoppingCart size={20} />
                        Current Order
                    </h2>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCart size={48} className="mb-2 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-500">₹{item.price} x {item.qty}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-white rounded"><Minus size={14} /></button>
                                    <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                                    <button onClick={() => addToCart(item)} className="p-1 hover:bg-white rounded"><Plus size={14} /></button>
                                </div>
                                <div className="ml-3 font-bold text-gray-700 w-16 text-right">
                                    ₹{item.price * item.qty}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Order Settings */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Order Type Toggle */}
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${orderType === 'dine_in' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setOrderType('dine_in')}
                        >
                            Dine In
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${orderType === 'takeaway' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            onClick={() => { setOrderType('takeaway'); setSelectedTable(''); }}
                        >
                            Takeaway
                        </button>
                    </div>

                    {/* Table Selection */}
                    {orderType === 'dine_in' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Table</label>
                            <select
                                className="w-full p-2 border rounded text-sm bg-white"
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                            >
                                <option value="">-- Choose Table --</option>
                                {tables.map(t => (
                                    <option key={t.id} value={t.id} disabled={t.status === 'occupied'}>
                                        Table {t.table_number} {t.status === 'occupied' ? '(Occupied)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Phone (Optional)"
                            className="p-2 border rounded text-sm w-full"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Name (Optional)"
                            className="p-2 border rounded text-sm w-full"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        />
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-3 space-y-1">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (5%)</span>
                            <span>₹{tax}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-1">
                            <span>Total</span>
                            <span>₹{finalTotal}</span>
                        </div>
                    </div>

                    {/* Payment Status & Method */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Status</label>
                            <div className="flex border rounded overflow-hidden">
                                <button
                                    className={`flex-1 py-1 text-xs font-medium ${paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 hover:bg-gray-100'}`}
                                    onClick={() => setPaymentStatus('pending')}
                                >
                                    Pay Later
                                </button>
                                <button
                                    className={`flex-1 py-1 text-xs font-medium ${paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-50 hover:bg-gray-100'}`}
                                    onClick={() => setPaymentStatus('paid')}
                                >
                                    Pay Now
                                </button>
                            </div>
                        </div>

                        {paymentStatus === 'paid' && (
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Method</label>
                                <div className="flex gap-1">
                                    {[
                                        { id: 'cash', icon: Banknote },
                                        { id: 'card', icon: CreditCard },
                                        { id: 'upi', icon: QrCode },
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setPaymentMethod(m.id as any)}
                                            className={`p-1.5 rounded border ${paymentMethod === m.id ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                            title={m.id.toUpperCase()}
                                        >
                                            <m.icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handlePlaceOrder}
                        disabled={submitting || cart.length === 0}
                        className="w-full py-3 bg-red-600 text-white rounded-lg font-bold shadow hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Processing...' : `Place Order • ₹${finalTotal}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
