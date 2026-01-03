'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { MenuItem } from '@/types';
import MenuCard from '@/components/MenuCard';
import BottomNav from '@/components/BottomNav';
import FloatingCart from '@/components/FloatingCart';
import ItemDetailsModal from '@/components/ItemDetailsModal';
import useCartStore from '@/store/useCartStore';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuSkeleton from '@/components/MenuSkeleton';

const categories = ['All', 'Indian', 'Chinese', 'Italian', 'Beverages', 'Desserts'];

function MenuContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table_id') || searchParams.get('table') || '1';
    const { initializeCustomerId } = useCartStore();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Initialize customer ID on first load
        initializeCustomerId();

        // Store table_id in localStorage for persistence
        if (tableId) {
            localStorage.setItem('qr_table_id', tableId);
        }

        fetchMenu();
    }, [tableId]);

    useEffect(() => {
        let filtered = menuItems;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [selectedCategory, searchQuery, menuItems]);

    const handleItemClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const fetchMenu = async () => {
        try {
            const response = await api.get('/api/menu');
            if (response.data.success) {
                setMenuItems(response.data.data);
                setFilteredItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 shadow-md">
                <h1 className="text-3xl font-bold">Menu</h1>
                <p className="text-red-100">Table {tableId}</p>

                {/* Search Bar */}
                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="sticky top-0 bg-white shadow-sm z-30 overflow-x-auto">
                <div className="flex gap-2 p-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${selectedCategory === category
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="container mx-auto p-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <MenuSkeleton key={n} />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No items available in this category</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <MenuCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* No Search Results */}
                {searchQuery && filteredItems.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No items found for "{searchQuery}"</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-red-600 hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Floating Cart */}
            <FloatingCart />

            {/* Item Details Modal */}
            <ItemDetailsModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 w-full max-w-7xl">
                    {[1, 2, 3].map((n) => (
                        <MenuSkeleton key={n} />
                    ))}
                </div>
            </div>
        }>
            <MenuContent />
        </Suspense>
    );
}
