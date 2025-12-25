'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail } from 'lucide-react';

interface CustomerInfo {
    name: string;
    phone: string;
    email: string;
}

interface CustomerInfoFormProps {
    onSubmit: (info: CustomerInfo) => void;
    isSubmitting?: boolean;
}

export default function CustomerInfoForm({ onSubmit, isSubmitting }: CustomerInfoFormProps) {
    const [formData, setFormData] = useState<CustomerInfo>({
        name: '',
        phone: '',
        email: '',
    });

    const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof CustomerInfo, boolean>>>({});

    useEffect(() => {
        // Load from localStorage
        const savedInfo = localStorage.getItem('qr_customer_info');
        if (savedInfo) {
            try {
                const parsed = JSON.parse(savedInfo);
                setFormData(parsed);
            } catch (e) {
                console.error('Error parsing saved customer info:', e);
            }
        }
    }, []);

    const validatePhone = (phone: string): boolean => {
        // India phone format: 10 digits or +91 followed by 10 digits
        const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validate = (): boolean => {
        const newErrors: Partial<CustomerInfo> = {};

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Invalid phone number (10 digits required)';
        }

        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof CustomerInfo, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleBlur = (field: keyof CustomerInfo) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        // Validate on blur
        if (field === 'phone' && formData.phone && !validatePhone(formData.phone)) {
            setErrors(prev => ({ ...prev, phone: 'Invalid phone number (10 digits required)' }));
        }
        if (field === 'email' && formData.email && !validateEmail(formData.email)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({ name: true, phone: true, email: true });

        if (validate()) {
            // Save to localStorage
            localStorage.setItem('qr_customer_info', JSON.stringify(formData));
            onSubmit(formData);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User size={20} />
                Your Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            placeholder="Your name"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            placeholder="10-digit mobile number"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone && touched.phone
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-red-500'
                                }`}
                        />
                    </div>
                    {errors.phone && touched.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-gray-400 text-xs">(Optional, for invoice)</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder="your@email.com"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email && touched.email
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-red-500'
                                }`}
                        />
                    </div>
                    {errors.email && touched.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                <p className="text-xs text-gray-500">
                    💡 Your information will be saved for future orders
                </p>

                {/* Proceed Button */}
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Saving...' : 'Proceed to Menu'}
                </button>
            </form>
        </div>
    );
}
