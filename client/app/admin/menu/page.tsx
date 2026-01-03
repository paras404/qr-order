'use client';

import { useEffect, useState } from 'react';
import { MenuItem } from '@/types';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Image Upload State
    const [imageEntryMode, setImageEntryMode] = useState<'url' | 'upload'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Indian',
        image_url: '',
        is_available: true,
    });

    const categories = ['All', 'Indian', 'Chinese', 'Italian', 'Beverages', 'Desserts'];

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        filterMenuItems();
    }, [searchQuery, selectedCategory, menuItems]);

    const filterMenuItems = () => {
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

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.url;
        } else {
            throw new Error('Upload failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let finalImageUrl = formData.image_url;

            if (imageEntryMode === 'upload' && selectedFile) {
                setUploading(true);
                try {
                    finalImageUrl = await uploadImage(selectedFile);
                } catch (error) {
                    console.error('Image upload failed:', error);
                    alert('Image upload failed. Please try again.');
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            const payload = {
                ...formData,
                image_url: finalImageUrl,
                price: parseFloat(formData.price),
            };

            if (editingItem) {
                // Update
                const response = await api.put(`/api/menu/${editingItem.id}`, payload);
                if (response.data.success) {
                    setMenuItems((prev) =>
                        prev.map((item) =>
                            item.id === editingItem.id ? response.data.data : item
                        )
                    );
                }
            } else {
                // Create
                const response = await api.post('/api/menu', payload);
                if (response.data.success) {
                    setMenuItems((prev) => [...prev, response.data.data]);
                }
            }

            resetForm();
            toast.success(editingItem ? 'Menu item updated successfully' : 'Menu item created successfully');
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error('Failed to save menu item');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            image_url: item.image_url,
            is_available: item.is_available,
        });
        setImageEntryMode('url');
        setShowForm(true);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await api.delete(`/api/menu/${itemToDelete}`);
            setMenuItems((prev) => prev.filter((item) => item.id !== itemToDelete));
            toast.success('Menu item deleted successfully');
        } catch (error) {
            console.error('Error deleting menu item:', error);
            toast.error('Failed to delete menu item');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Indian',
            image_url: '',
            is_available: true,
        });
        setEditingItem(null);
        setSelectedFile(null);
        setImageEntryMode('url');
        setShowForm(false);
    };

    return (
        <div className="p-8">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredItems.length} of {menuItems.length} items
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                            </h2>
                            <button onClick={resetForm}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="Indian">Indian</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Desserts">Desserts</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Image Source</label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={imageEntryMode === 'url'}
                                            onChange={() => setImageEntryMode('url')}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm">Paste URL</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={imageEntryMode === 'upload'}
                                            onChange={() => setImageEntryMode('upload')}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm">Upload Image</span>
                                    </label>
                                </div>

                                {imageEntryMode === 'url' ? (
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="https://..."
                                    />
                                ) : (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_available" className="text-sm font-semibold">
                                    Available
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
                                >
                                    {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Menu Items Table */}
            {loading ? (
                <p className="text-gray-500">Loading menu...</p>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-500">No items found matching your criteria</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{item.category}</td>
                                    <td className="px-6 py-4 font-semibold">₹{item.price}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_available
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Menu Item"
                message="Are you sure you want to delete this menu item? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />
        </div>
    );
}
