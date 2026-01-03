'use client';

import { MenuItem } from '@/types';
import useCartStore from '@/store/useCartStore';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuCardProps {
    item: MenuItem;
    onClick?: () => void;
}

export default function MenuCard({ item, onClick }: MenuCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const increaseQuantity = useCartStore((state) => state.increaseQuantity);
    const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
    const quantity = useCartStore((state) => state.getItemQuantity(item.id));

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem({ ...item, qty: 1 });
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        increaseQuantity(item.id);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        decreaseQuantity(item.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-xl shadow-sm border border-red-50 overflow-hidden cursor-pointer transition-shadow h-full flex flex-col"
            onClick={onClick}
        >
            <div className="relative h-48 w-full bg-gray-200">
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
                        <span className="text-white font-bold text-lg">Unavailable</span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{item.description}</p>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xl font-bold text-red-600">₹{item.price}</span>

                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            disabled={!item.is_available}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            Add
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDecrease}
                                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-3 py-1 bg-red-600 text-white rounded-lg font-semibold min-w-[30px] text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncrease}
                                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
