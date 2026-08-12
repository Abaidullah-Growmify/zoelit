"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProductStore } from "@/store/product-store";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      openCart: () => set({ drawerOpen: true }),
      closeCart: () => set({ drawerOpen: false }),
      addItem: (productId, quantity = 1, product = null) => set((state) => {
        const qty = Math.floor(Number(quantity)) || 1;
        const snapshot = product ? {
          productId,
          name: product.name || productId,
          price: Number(product.price) || 0,
          image: product.image || "",
          stock: Number(product.stock) || 0,
        } : null;
        const existing = state.items.find((item) => item.productId === productId);
        if (existing) {
          return { items: state.items.map((item) => item.productId === productId ? { ...item, ...(snapshot || {}), quantity: (Math.floor(Number(item.quantity)) || 1) + qty } : item) };
        }
        return { items: [...state.items, snapshot || { productId, quantity: qty }] };
      }),
      updateQuantity: (productId, quantity) => set((state) => {
        const qty = Number(quantity);
        if (!Number.isFinite(qty) || qty <= 0) return { items: state.items.filter((item) => item.productId !== productId) };
        return { items: state.items.map((item) => item.productId === productId ? { ...item, quantity: Math.floor(qty) || 1 } : item) };
      }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clearCart: () => set({ items: [] }),
      count: () => get().items.reduce((sum, item) => sum + (Math.floor(Number(item.quantity)) || 0), 0),
      subtotal: () => get().items.reduce((sum, item) => sum + (Number(item.price ?? useProductStore.getState().getById(item.productId)?.price ?? 0) || 0) * (Math.floor(Number(item.quantity)) || 1), 0),
    }),
    { name: "zoelit-cart", skipHydration: true,
      merge: (persisted, current) => {
        const rawItems = persisted?.items;
        if (!Array.isArray(rawItems)) return { ...current, ...persisted, items: current.items };
        const items = rawItems.map((item) => {
          const qty = Math.floor(Number(item.quantity));
          return {
            ...item,
            quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
            price: Number.isFinite(Number(item.price)) ? Number(item.price) : undefined,
            stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : undefined,
          };
        });
        return { ...current, ...persisted, items };
      }
    }
  )
);
