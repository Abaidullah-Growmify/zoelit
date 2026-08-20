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
      const requestedStock = Math.floor(Number(product?.stock) || 0);
      const snapshot = product
        ? {
            productId,
            name: product.name || productId,
            quantity: qty,
            price: Number(product.price) || 0,
            image: product.image || "",
            stock: requestedStock,
          }
        : null;
      const existing = state.items.find((item) => item.productId === productId);
      const currentQuantity = Math.floor(Number(existing?.quantity) || 0);
      const stock = Number.isFinite(requestedStock) && requestedStock > 0
        ? requestedStock
        : Math.floor(Number(existing?.stock) || 0);

      if (Number.isFinite(stock) && stock > 0) {
        const remaining = Math.max(stock - currentQuantity, 0);
        if (remaining <= 0) return;
        const appliedQty = Math.min(qty, remaining);

        if (existing) {
          state.items = state.items.map((item) =>
            item.productId === productId
              ? { ...item, ...(snapshot || {}), quantity: currentQuantity + appliedQty, stock }
              : item
          );
        } else {
          state.items = [...state.items, { ...(snapshot || { productId }), quantity: appliedQty, stock }];
        }

        return;
      }

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
        const existing = state.items.find((item) => item.productId === productId);
        const stock = Math.floor(Number(existing?.stock) || 0);
        const nextQty = stock > 0 ? Math.min(Math.floor(qty) || 1, stock) : Math.floor(qty) || 1;
        state.items = state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: nextQty } : item
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
