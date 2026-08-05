"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct } from "@/lib/data";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      openCart: () => set({ drawerOpen: true }),
      closeCart: () => set({ drawerOpen: false }),
      addItem: (productId, quantity = 1) => set((state) => {
        const existing = state.items.find((item) => item.productId === productId);
        if (existing) return { items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item) };
        return { items: [...state.items, { productId, quantity }] };
      }),
      updateQuantity: (productId, quantity) => set((state) => ({ items: quantity <= 0 ? state.items.filter((item) => item.productId !== productId) : state.items.map((item) => item.productId === productId ? { ...item, quantity } : item) })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clearCart: () => set({ items: [] }),
      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () => get().items.reduce((sum, item) => sum + (getProduct(item.productId)?.price || 0) * item.quantity, 0),
    }),
    { name: "zoelit-cart", skipHydration: true }
  )
);
