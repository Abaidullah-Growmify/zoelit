"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
  loaded: false,
};

// Product pages and wishlist use server-rendered or targeted product requests.
// Never load the entire catalogue into the browser.
export const fetchProducts = createAsyncThunk("products/fetch", async () => []);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loaded = true;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.products = [];
        state.loaded = true;
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
