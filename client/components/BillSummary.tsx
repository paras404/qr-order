'use client';

interface BillSummaryProps {
    subtotal: number;
    serviceChargePercent?: number;
    taxPercent?: number;
}

export default function BillSummary({
    subtotal,
    serviceChargePercent = 5,
    taxPercent = 18
}: BillSummaryProps) {
    const serviceCharge = (subtotal * serviceChargePercent) / 100;
    const taxableAmount = subtotal + serviceCharge;
    const tax = (taxableAmount * taxPercent) / 100;
    const grandTotal = subtotal + serviceCharge + tax;

    const formatCurrency = (amount: number) => {
        return `₹${amount.toFixed(2)}`;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Bill Summary</h3>

            <div className="space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>

                {/* Service Charge */}
                <div className="flex justify-between text-gray-700">
                    <span className="text-sm">Service Charge ({serviceChargePercent}%)</span>
                    <span className="text-sm">{formatCurrency(serviceCharge)}</span>
                </div>

                {/* GST/Tax */}
                <div className="flex justify-between text-gray-700">
                    <span className="text-sm">GST ({taxPercent}%)</span>
                    <span className="text-sm">{formatCurrency(tax)}</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 my-2"></div>

                {/* Grand Total */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-red-600">{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {/* Tax Info */}
            <p className="text-xs text-gray-500 mt-3 text-center">
                All prices are inclusive of applicable taxes
            </p>
        </div>
    );
}

// Export calculation functions for use in other components
export const calculateBilling = (
    subtotal: number,
    serviceChargePercent: number = 5,
    taxPercent: number = 18
) => {
    const serviceCharge = (subtotal * serviceChargePercent) / 100;
    const taxableAmount = subtotal + serviceCharge;
    const tax = (taxableAmount * taxPercent) / 100;
    const grandTotal = subtotal + serviceCharge + tax;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        serviceCharge: Number(serviceCharge.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        totalAmount: Number(grandTotal.toFixed(2)),
    };
};
