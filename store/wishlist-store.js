"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchWishlist,
  clearWishlist,
  toggleWishlistItem,
} from "@/store/slices/wishlist-slice";

export function useWishlistStore(selector) {
  const wishlist = useAppSelector((state) => state.wishlist);
  const dispatch = useAppDispatch();

  const store = useMemo(
    () => ({
      ...wishlist,
      fetchWishlist: (token) => dispatch(fetchWishlist(token)).unwrap(),
      toggleItem: (product, token) => dispatch(toggleWishlistItem({ product, token })).unwrap(),
      clearWishlist: () => dispatch(clearWishlist()),
      hasItem: (productId) => wishlist.items.some((item) => item.productId === String(productId)),
      count: () => wishlist.items.length,
    }),
    [wishlist, dispatch]
  );

  return selector ? selector(store) : store;
}
