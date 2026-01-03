import { motion } from 'framer-motion';

export default function MenuSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden h-full flex flex-col">
            {/* Image Placeholder */}
            <div className="relative h-48 bg-gray-200 animate-pulse">
                <div className="absolute top-2 right-2 w-16 h-6 bg-gray-300 rounded-full animate-pulse" />
            </div>

            <div className="p-4 flex flex-col flex-grow space-y-3">
                {/* Title & Price Placeholder */}
                <div className="flex justify-between items-start">
                    <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Description Placeholder */}
                <div className="space-y-2 flex-grow">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Buttons Placeholder */}
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">
                    <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}
