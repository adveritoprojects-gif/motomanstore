import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
  size?: string;
  color?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, variantId?: string) => void;
  increaseQuantity: (id: string, variantId?: string) => void;
  decreaseQuantity: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

function findItemKey(item: { id: string; variantId?: string }) {
  return `${item.id}-${item.variantId ?? "default"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const key = findItemKey(item);
          const existing = state.items.find(
            (i) => findItemKey(i) === key
          );
          if (existing) {
            const newQty = Math.min(
              existing.quantity + quantity,
              existing.maxStock ?? 999
            );
            return {
              items: state.items.map((i) =>
                findItemKey(i) === key ? { ...i, quantity: newQty } : i
              ),
              isCartOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.maxStock ?? 999) },
            ],
            isCartOpen: true,
          };
        });
      },

      removeItem: (id, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => findItemKey(i) !== findItemKey({ id, variantId })
          ),
        }));
      },

      increaseQuantity: (id, variantId) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (findItemKey(i) !== findItemKey({ id, variantId })) return i;
            const max = i.maxStock ?? 999;
            return { ...i, quantity: Math.min(i.quantity + 1, max) };
          }),
        }));
      },

      decreaseQuantity: (id, variantId) => {
        set((state) => ({
          items: state.items
            .map((i) => {
              if (findItemKey(i) !== findItemKey({ id, variantId })) return i;
              return { ...i, quantity: i.quantity - 1 };
            })
            .filter((i) => i.quantity > 0),
        }));
      },

      updateQuantity: (id, quantity, variantId) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => findItemKey(i) !== findItemKey({ id, variantId })
                )
              : state.items.map((i) =>
                  findItemKey(i) === findItemKey({ id, variantId })
                    ? { ...i, quantity }
                    : i
                ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "motoman-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
