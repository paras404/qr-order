export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    is_available: boolean;
}

export interface CartItem extends MenuItem {
    qty: number;
}

export interface Order {
    id?: string;
    table_id: string;
    customer_id?: string;
    items: {
        itemId: string;
        name: string;
        qty: number;
        price: number;
    }[];
    subtotal?: number;
    service_charge?: number;
    tax?: number;
    total_amount?: number;
    total: number; // Keep for backward compatibility
    status: 'pending' | 'preparing' | 'served' | 'cancelled' | 'completed';
    createdAt?: string;
}

export interface Customer {
    id?: string;
    name?: string;
    phone: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Table {
    id: string;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    qr_code_url?: string;
    location?: string;
    created_at?: string;
    updated_at?: string;
}
