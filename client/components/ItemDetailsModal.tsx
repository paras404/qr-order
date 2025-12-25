'use client';

import { MenuItem } from '@/types';
import useCartStore from '@/store/useCartStore';
import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ItemDetailsModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ItemDetailsModal({ item, isOpen, onClose }: ItemDetailsModalProps) {
    const [quantity, setQuantity] = useState(1);
    const { addItem, getItemQuantity } = useCartStore();

    useEffect(() => {
        if (item) {
            const existingQty = getItemQuantity(item.id);
            setQuantity(existingQty > 0 ? existingQty : 1);
        }
    }, [item, getItemQuantity]);

    if (!isOpen || !item) return null;

    const handleAddToCart = () => {
        addItem({ ...item, qty: quantity });
        toast.success(`${item.name} added to cart!`);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
                <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up md:animate-none shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Image */}
                    <div className="relative h-64 md:h-80 w-full bg-gray-200">
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No Image
                            </div>
                        )}
                        {!item.is_available && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Unavailable</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
                        <p className="text-3xl font-bold text-red-600 mb-4">₹{item.price}</p>
                        <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-700 font-semibold">Quantity:</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!item.is_available}
                            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            {item.is_available ? `Add to Cart - ₹${item.price * quantity}` : 'Not Available'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
