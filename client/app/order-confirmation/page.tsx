'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!orderId) {
            router.push('/menu');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/menu');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [orderId, router]);

    if (!orderId) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle size={80} className="text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Order Placed Successfully!
                </h1>

                <p className="text-gray-600 mb-6">
                    Your order has been sent to the kitchen. We'll prepare it shortly!
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-semibold text-gray-800">{orderId}</p>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Redirecting to menu in {countdown} seconds...
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/customer-orders"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/menu"
                        className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        Order More Items
                    </Link>
                </div>
            </div>
        </div>
    );
}
