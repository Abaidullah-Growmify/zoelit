"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts as fetchProductsThunk } from "@/store/slices/product-slice";

export function useProductStore(selector) {
  const productsState = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();

  const store = useMemo(
    () => ({
      ...productsState,
      fetchProducts: (force = false) => {
        if (productsState.loaded && !force) return Promise.resolve(productsState.products);
        if (productsState.loading) return Promise.resolve();
        return dispatch(fetchProductsThunk()).unwrap();
      },
      getById: (id) => productsState.products.find((product) => product.id === id) || null,
    }),
    [productsState, dispatch]
  );

  return selector ? selector(store) : store;
}