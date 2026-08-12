"use client";

import { create } from "zustand";
import { getPublicProducts } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  loaded: false,
  fetchProducts: async (force = false) => {
    if (get().loaded && !force) return;

    set({ loading: true });

    try {
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

      const mapped = all.map(mapProduct).filter(Boolean);

      set({
        products: mapped,
        loaded: true,
        loading: false,
      });
    } catch {
      set({ products: [], loaded: true, loading: false });
    }
  },
  getById: (id) => get().products.find((product) => product.id === id) || null,
}));
