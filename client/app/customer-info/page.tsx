'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomerInfoForm from '@/components/CustomerInfoForm';

function CustomerInfoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tableId, setTableId] = useState('');

    useEffect(() => {
        // Get table_id from URL
        const urlTableId = searchParams.get('table_id') || searchParams.get('table');

        if (!urlTableId) {
            // No table ID, redirect to home
            router.push('/');
            return;
        }

        setTableId(urlTableId);

        // Store table_id in localStorage
        localStorage.setItem('qr_table_id', urlTableId);

        // Check if customer info already exists
        const savedInfo = localStorage.getItem('qr_customer_info');
        if (savedInfo) {
            // Customer info exists, redirect to menu
            router.push(`/menu?table_id=${urlTableId}`);
        }
    }, [searchParams, router]);

    const handleCustomerInfoSubmit = (info: { name: string; phone: string; email: string }) => {
        // Info is already saved to localStorage by the form component
        // Redirect to menu page
        router.push(`/menu?table_id=${tableId}`);
    };

    if (!tableId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
                    <p className="text-gray-600">Table {tableId}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Please provide your contact information to get started
                    </p>
                </div>

                {/* Customer Info Form */}
                <CustomerInfoForm
                    onSubmit={handleCustomerInfoSubmit}
                />

                {/* Skip Option */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => router.push(`/menu?table_id=${tableId}`)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CustomerInfoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
            <CustomerInfoContent />
        </Suspense>
    );
}
