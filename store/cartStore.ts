import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ICartItem } from '@/types';

interface CartStore {
  items: ICartItem[];
  isOpen: boolean;
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setItems: (items: ICartItem[]) => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(i => i.productId === item.productId);
        if (existing) {
          set({ items: items.map(i => i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.stock ?? 99) }
            : i
          )});
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.productId !== productId) })),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set(state => ({
          items: state.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i),
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name:    'shopverse-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
