"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicProducts } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";

const initialState = {
  products: [],
  loading: false,
  loaded: false,
};

async function loadAllProducts() {
  const limit = 200;
  let page = 1;
  let all = [];
  let total = Infinity;

  while (all.length < total && all.length < 2000) {
    const data = await getPublicProducts({ page, limit });
    const items = data.products || [];
    all = all.concat(items);
    total = data.pagination?.total ?? all.length;
    if (items.length < limit) break;
    page += 1;
  }

  return all.map(mapProduct).filter(Boolean);
}

export const fetchProducts = createAsyncThunk("products/fetch", async () => loadAllProducts());

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