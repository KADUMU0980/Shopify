import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistStore {
  ids: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setIds: (ids: string[]) => void;
  syncWithServer: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        const ids = get().ids;
        set({ ids: ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId] });
      },

      isWishlisted: (productId) => get().ids.includes(productId),

      setIds: (ids) => set({ ids }),

      syncWithServer: async (productId) => {
        try {
          await fetch(`/api/wishlist/${productId}`, { method: 'POST' });
        } catch (err) {
          console.error('Wishlist sync error:', err);
        }
      },
    }),
    {
      name:    'shopverse-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
