import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate or retrieve customer ID
const getOrCreateCustomerId = () => {
    if (typeof window === 'undefined') return '';

    let customerId = localStorage.getItem('qr_customer_id');
    if (!customerId) {
        customerId = uuidv4();
        localStorage.setItem('qr_customer_id', customerId);
    }
    return customerId;
};

interface CartStore {
    items: CartItem[];
    customerId: string;
    addItem: (item: CartItem) => void;
    updateQuantity: (itemId: string, qty: number) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    increaseQuantity: (itemId: string) => void;
    decreaseQuantity: (itemId: string) => void;
    getItemQuantity: (itemId: string) => number;
    initializeCustomerId: () => void;
}

const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            customerId: '',

            initializeCustomerId: () => {
                const customerId = getOrCreateCustomerId();
                set({ customerId });
            },

            addItem: (item) => {
                const items = get().items;
                const existingItem = items.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
                        ),
                    });
                } else {
                    set({ items: [...items, item] });
                }
            },

            updateQuantity: (itemId, qty) => {
                if (qty <= 0) {
                    get().removeItem(itemId);
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === itemId ? { ...item, qty } : item
                        ),
                    });
                }
            },

            removeItem: (itemId) => {
                set({ items: get().items.filter((item) => item.id !== itemId) });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.qty, 0);
            },

            increaseQuantity: (itemId) => {
                const item = get().items.find((i) => i.id === itemId);
                if (item) {
                    get().updateQuantity(itemId, item.qty + 1);
                }
            },

            decreaseQuantity: (itemId) => {
                const item = get().items.find((i) => i.id === itemId);
                if (item) {
                    get().updateQuantity(itemId, item.qty - 1);
                }
            },

            getItemQuantity: (itemId) => {
                const item = get().items.find((i) => i.id === itemId);
                return item ? item.qty : 0;
            },
        }),
        {
            name: 'qr-order-cart', // localStorage key
        }
    )
);

export default useCartStore;
