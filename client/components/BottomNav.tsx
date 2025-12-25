'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ShoppingCart, ClipboardList } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import { useEffect, useState } from 'react';

export default function BottomNav() {
    const pathname = usePathname();
    const { items } = useCartStore();
    const [tableId, setTableId] = useState('');

    useEffect(() => {
        // Get table_id from localStorage
        const storedTableId = localStorage.getItem('qr_table_id') || '';
        setTableId(storedTableId);
    }, []);

    // Calculate total items in cart
    const itemCount = items.reduce((sum: number, item: any) => sum + item.qty, 0);

    const navItems = [
        { href: `/menu${tableId ? `?table_id=${tableId}` : ''}`, label: 'Menu', icon: Home },
        { href: `/cart${tableId ? `?table_id=${tableId}` : ''}`, label: 'Cart', icon: ShoppingCart, badge: itemCount },
        { href: `/customer-orders${tableId ? `?table_id=${tableId}` : ''}`, label: 'Orders', icon: ClipboardList },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname?.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full relative ${isActive ? 'text-red-600' : 'text-gray-600'
                                }`}
                        >
                            <div className="relative">
                                <Icon size={24} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
