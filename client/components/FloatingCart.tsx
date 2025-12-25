'use client';

import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/useCartStore';
import { useEffect, useState } from 'react';

export default function FloatingCart() {
    const router = useRouter();
    const { items, getTotal } = useCartStore();
    const [isVisible, setIsVisible] = useState(false);
    const [animate, setAnimate] = useState(false);

    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    useEffect(() => {
        setIsVisible(itemCount > 0);
        if (itemCount > 0) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timer);
        }
    }, [itemCount]);

    if (!isVisible) return null;

    return (
        <button
            onClick={() => {
                const tableId = localStorage.getItem('qr_table_id') || '';
                router.push(`/cart${tableId ? `?table_id=${tableId}` : ''}`);
            }}
            className={`fixed bottom-20 right-4 bg-red-600 text-white rounded-full shadow-lg p-4 z-40 hover:bg-red-700 transition-all ${animate ? 'scale-110' : 'scale-100'
                }`}
        >
            <div className="relative">
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                )}
            </div>
            <div className="mt-1 text-xs font-semibold whitespace-nowrap">
                ₹{getTotal()}
            </div>
        </button>
    );
}
