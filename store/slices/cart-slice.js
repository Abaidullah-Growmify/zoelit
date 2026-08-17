"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  drawerOpen: false,
  hasHydrated: false,
};

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const qty = Math.floor(Number(item.quantity));
      return {
        productId: item.productId,
        name: item.name,
        quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : undefined,
        image: item.image,
        stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : undefined,
      };
    })
    .filter((item) => item.productId);
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action) => {
      state.items = sanitizeItems(action.payload?.items);
      state.hasHydrated = true;
    },
    openCart: (state) => {
      state.drawerOpen = true;
    },
    closeCart: (state) => {
      state.drawerOpen = false;
    },
    addItem: (state, action) => {
      const { productId, quantity = 1, product = null } = action.payload;
      const qty = Math.floor(Number(quantity)) || 1;
      const snapshot = product
        ? {
            productId,
            name: product.name || productId,
            quantity: qty,
            price: Number(product.price) || 0,
            image: product.image || "",
            stock: Number(product.stock) || 0,
          }
        : null;
      const existing = state.items.find((item) => item.productId === productId);
      if (existing) {
        state.items = state.items.map((item) =>
          item.productId === productId
            ? { ...item, ...(snapshot || {}), quantity: (Math.floor(Number(item.quantity)) || 1) + qty }
            : item
        );
      } else {
        state.items = [...state.items, snapshot || { productId, quantity: qty }];
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        state.items = state.items.filter((item) => item.productId !== productId);
      } else {
        state.items = state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.floor(qty) || 1 } : item
        );
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { hydrateCart, openCart, closeCart, addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;