import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartLineKey, changeQuantity, quantityCap } from "@/lib/cart/quantity";

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
  removeItem: (id: string, variantId?: string) => boolean;
  increaseQuantity: (id: string, variantId?: string) => string | null;
  decreaseQuantity: (id: string, variantId?: string) => string | null;
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
  return cartLineKey(item.id, item.variantId);
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
            const cap = quantityCap(existing.maxStock ?? item.maxStock);
            const newQty = Math.min(existing.quantity + quantity, Math.max(cap, 1));
            return {
              items: state.items.map((i) =>
                findItemKey(i) === key
                  ? { ...i, ...item, quantity: Math.max(1, newQty) }
                  : i
              ),
              isCartOpen: true,
            };
          }
          const cap = quantityCap(item.maxStock);
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(Math.max(quantity, 1), Math.max(cap, 1)) },
            ],
            isCartOpen: true,
          };
        });
      },

      removeItem: (id, variantId) => {
        const key = findItemKey({ id, variantId });
        const hadItem = get().items.some((item) => findItemKey(item) === key);
        if (!hadItem) return false;
        set((state) => ({
          items: state.items.filter((item) => findItemKey(item) !== key),
        }));
        return !get().items.some((item) => findItemKey(item) === key);
      },

      increaseQuantity: (id, variantId) => {
        const key = findItemKey({ id, variantId });
        const current = get().items.find((item) => findItemKey(item) === key);
        if (!current) return "This item is no longer in your cart.";
        const next = changeQuantity(current.quantity, "increase", current.maxStock);
        if (!next.ok) return next.message;
        set((state) => ({
          items: state.items.map((item) =>
            findItemKey(item) === key ? { ...item, quantity: next.quantity } : item
          ),
        }));
        return null;
      },

      decreaseQuantity: (id, variantId) => {
        const key = findItemKey({ id, variantId });
        const current = get().items.find((item) => findItemKey(item) === key);
        if (!current) return "This item is no longer in your cart.";
        const next = changeQuantity(current.quantity, "decrease", current.maxStock);
        if (!next.ok) return next.message;
        set((state) => ({
          items: state.items.map((item) =>
            findItemKey(item) === key ? { ...item, quantity: next.quantity } : item
          ),
        }));
        return null;
      },

      updateQuantity: (id, quantity, variantId) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => findItemKey(i) !== findItemKey({ id, variantId })
                )
              : state.items.map((i) => {
                  if (findItemKey(i) !== findItemKey({ id, variantId })) return i;
                  const cap = Math.max(quantityCap(i.maxStock), 1);
                  return { ...i, quantity: Math.min(Math.max(1, quantity), cap) };
                }),
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
