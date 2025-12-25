'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, TrendingUp, Grid3x3, ChefHat, LogOut } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    const navItems = [
        { href: '/admin/dashboard', label: 'Orders', icon: LayoutDashboard },
        { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
        { href: '/admin/tables', label: 'Tables', icon: Grid3x3 },
        { href: '/kitchen', label: 'Kitchen', icon: ChefHat },
        { href: '/admin/order-history', label: 'Order History', icon: ClipboardList },
        { href: '/admin/sales', label: 'Sales', icon: TrendingUp },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold">QR Order</h1>
                <p className="text-gray-400 text-sm">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 rounded-lg transition"
                >
                    <LogOut size={20} />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </div>
    );
}
