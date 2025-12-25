import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-center space-y-8 p-8">
                <h1 className="text-6xl font-bold text-gray-800">
                    QR Order System
                </h1>
                <p className="text-xl text-gray-600">
                    Restaurant Self-Ordering Made Easy
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link
                        href="/customer-info?table_id=1"
                        className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        View Menu (Customer)
                    </Link>
                    <Link
                        href="/admin/login"
                        className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
                    >
                        Admin Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
