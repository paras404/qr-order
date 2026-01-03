'use client';

import { useEffect, useState } from 'react';
import { Table } from '@/types';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, X, Download, QrCode } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import BillingModal from '@/components/BillingModal';
import toast from 'react-hot-toast';

const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-gray-100 text-gray-800',
};

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [selectedQR, setSelectedQR] = useState<{ url: string; tableName: string } | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<string | null>(null);

    // Billing Modal State
    const [billingModalOpen, setBillingModalOpen] = useState(false);
    const [billingTable, setBillingTable] = useState<{ id: string; name: string } | null>(null);

    const [formData, setFormData] = useState({
        table_number: '',
        capacity: '4',
        location: '',
        status: 'available' as Table['status'],
    });

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/tables');
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            toast.error('Failed to fetch tables');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTable) {
                const response = await api.put(`/api/tables/${editingTable.id}`, {
                    ...formData,
                    capacity: parseInt(formData.capacity),
                });
                if (response.data.success) {
                    setTables((prev) =>
                        prev.map((table) =>
                            table.id === editingTable.id ? response.data.data : table
                        )
                    );
                    toast.success('Table updated successfully');
                }
            } else {
                const response = await api.post('/api/tables', {
                    ...formData,
                    capacity: parseInt(formData.capacity),
                });
                if (response.data.success) {
                    setTables((prev) => [...prev, response.data.data]);
                    toast.success('Table created successfully');
                }
            }
            resetForm();
        } catch (error) {
            console.error('Error saving table:', error);
            toast.error('Failed to save table');
        }
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setFormData({
            table_number: table.table_number,
            capacity: table.capacity.toString(),
            location: table.location || '',
            status: table.status,
        });
        setShowForm(true);
    };

    const handleDeleteClick = (id: string) => {
        setTableToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!tableToDelete) return;

        try {
            await api.delete(`/api/tables/${tableToDelete}`);
            setTables((prev) => prev.filter((table) => table.id !== tableToDelete));
            toast.success('Table deleted successfully');
        } catch (error) {
            console.error('Error deleting table:', error);
            toast.error('Failed to delete table');
        }
    };

    const handleRegenerateQR = async (id: string) => {
        try {
            const response = await api.post(`/api/tables/${id}/qr`);
            if (response.data.success) {
                setTables((prev) =>
                    prev.map((table) =>
                        table.id === id ? response.data.data : table
                    )
                );
                toast.success('QR Code regenerated successfully');
            }
        } catch (error) {
            console.error('Error regenerating QR:', error);
            toast.error('Failed to regenerate QR code');
        }
    };

    const downloadQR = (qrCodeUrl: string, tableName: string) => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `table-${tableName}-qr.png`;
        link.click();
    };

    const resetForm = () => {
        setFormData({
            table_number: '',
            capacity: '4',
            location: '',
            status: 'available',
        });
        setEditingTable(null);
        setShowForm(false);
    };

    const handleSettleClick = (table: Table) => {
        setBillingTable({ id: table.id, name: table.table_number });
        setBillingModalOpen(true);
    };

    const handleBillSettled = () => {
        fetchTables(); // Refresh tables to show as available
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    <Plus size={20} />
                    Add Table
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingTable ? 'Edit Table' : 'Add Table'}
                            </h2>
                            <button onClick={resetForm}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Table Number</label>
                                <input
                                    type="text"
                                    value={formData.table_number}
                                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="T-01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Capacity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Main Hall, Window Side, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Table['status'] })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                                >
                                    {editingTable ? 'Update' : 'Create'}
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

            {/* QR Code Modal */}
            {selectedQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">QR Code - {selectedQR.tableName}</h2>
                            <button onClick={() => setSelectedQR(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <img src={selectedQR.url} alt="QR Code" className="w-64 h-64 border rounded-lg" />
                            <button
                                onClick={() => downloadQR(selectedQR.url, selectedQR.tableName)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                <Download size={20} />
                                Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tables Grid */}
            {loading ? (
                <p className="text-gray-500">Loading tables...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tables.map((table) => (
                        <div key={table.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{table.table_number}</h3>
                                        <p className="text-sm text-gray-600">{table.location || 'No location'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[table.status]}`}>
                                        {table.status?.toUpperCase()}
                                    </span>
                                </div>

                                {table.qr_code_url && (
                                    <div className="mb-4 flex justify-center">
                                        <img
                                            src={table.qr_code_url}
                                            alt="QR Code"
                                            className="w-32 h-32 border rounded cursor-pointer hover:opacity-80 transition"
                                            onClick={() => setSelectedQR({ url: table.qr_code_url!, tableName: table.table_number })}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    {table.qr_code_url && (
                                        <button
                                            onClick={() => setSelectedQR({ url: table.qr_code_url!, tableName: table.table_number })}
                                            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-200 transition"
                                        >
                                            <QrCode size={16} />
                                            View QR
                                        </button>
                                    )}
                                    {table.status === 'occupied' && (
                                        <button
                                            onClick={() => handleSettleClick(table)}
                                            className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm"
                                        >
                                            Settle Bill
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Capacity: {table.capacity}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(table)}
                                        className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-200 transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(table.id)}
                                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Table"
                message="Are you sure you want to delete this table? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />

            <BillingModal
                isOpen={billingModalOpen}
                onClose={() => setBillingModalOpen(false)}
                onSuccess={handleBillSettled}
                tableId={billingTable?.id || null}
                tableName={billingTable?.name || ''}
            />
        </div>
    );
}
