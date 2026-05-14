import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  syncWithDb: () => Promise<void>;
  fetchCartFromDb: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);
        let newItems;

        if (existingItem) {
          newItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
              : item
          );
        } else {
          newItems = [
            ...currentItems,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images ? JSON.parse(product.images)[0] : product.image,
              quantity: Math.min(quantity, product.stock),
              stock: product.stock,
            },
          ];
        }
        set({ items: newItems });
        get().syncWithDb();
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
        get().syncWithDb();
      },
      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
        get().syncWithDb();
      },
      clearCart: () => {
        set({ items: [] });
        get().syncWithDb();
      },
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      syncWithDb: async () => {
        try {
          await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: get().items }),
          });
        } catch (error) {
          console.error("Failed to sync cart with DB:", error);
        }
      },
      fetchCartFromDb: async () => {
        try {
          const res = await fetch("/api/cart/sync");
          if (res.ok) {
            const items = await res.json();
            if (items && items.length > 0) {
              set({
                items: items.map((item: any) => ({
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                  image: JSON.parse(item.product.images)[0],
                  quantity: item.quantity,
                  stock: item.product.stock,
                })),
              });
            }
          }
        } catch (error) {
          console.error("Failed to fetch cart from DB:", error);
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

