'use client';

import { Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react';

interface OrderStatusProgressProps {
    status: 'pending' | 'preparing' | 'served' | 'cancelled';
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'served', label: 'Served', icon: CheckCircle },
];

export default function OrderStatusProgress({ status }: OrderStatusProgressProps) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-lg">
                <XCircle className="text-red-600" size={24} />
                <span className="text-red-600 font-semibold">Order Cancelled</span>
            </div>
        );
    }

    const currentStepIndex = statusSteps.findIndex(step => step.key === status);

    return (
        <div className="py-4">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />
                </div>

                {/* Steps */}
                {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}`}
                            >
                                <Icon size={20} />
                            </div>
                            <span
                                className={`text-xs mt-2 text-center font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
