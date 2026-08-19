"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "@/lib/api";

const initialState = {
  items: [],
  hasHydrated: false,
  loading: false,
  error: null,
};

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item?.productId) return null;

      return {
        productId: String(item.productId),
        name: String(item.name || item.productId),
        image: String(item.image || ""),
        price: Number(item.price) || 0,
        category: String(item.category || "General"),
        stock: Number(item.stock) || 0,
        description: String(item.description || ""),
      };
    })
    .filter(Boolean);
}

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (token) => {
  const res = await api.getWishlist(token);
  return sanitizeItems(res.items || []);
});

export const toggleWishlistItem = createAsyncThunk("wishlist/toggle", async ({ product, token }) => {
  const res = await api.toggleWishlistItem(product, token);
  return sanitizeItems(res.items || []);
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist: (state, action) => {
      state.items = sanitizeItems(action.payload?.items);
      state.hasHydrated = true;
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.hasHydrated = true;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.loading = false;
        state.hasHydrated = true;
        state.items = [];
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { hydrateWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
