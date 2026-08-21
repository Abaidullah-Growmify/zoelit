"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  clearCart,
  closeCart,
  hydrateCart,
  openCart,
  removeItem,
  updateQuantity,
} from "@/store/slices/cart-slice";

export function useCartStore(selector) {
  const cart = useAppSelector((state) => state.cart);
  const products = useAppSelector((state) => state.products.products);
  const dispatch = useAppDispatch();

  const store = useMemo(() => {
    const getProduct = (id) => products.find((product) => product.id === id) || null;
    const subtotal = () =>
      cart.items.reduce((sum, item) => {
        const price = Number(item.price ?? getProduct(item.productId)?.price ?? 0) || 0;
        return sum + price * (Math.floor(Number(item.quantity)) || 1);
      }, 0);

    return {
      ...cart,
      openCart: () => dispatch(openCart()),
      closeCart: () => dispatch(closeCart()),
      addItem: (productId, quantity = 1, product = null) => dispatch(addItem({ productId, quantity, product })),
      updateQuantity: (productId, quantity) => dispatch(updateQuantity({ productId, quantity })),
      removeItem: (productId) => dispatch(removeItem(productId)),
      clearCart: () => dispatch(clearCart()),
      restoreCart: (items) => dispatch(hydrateCart({ items })),
      count: () => cart.items.reduce((sum, item) => sum + (Math.floor(Number(item.quantity)) || 0), 0),
      getItemQuantity: (productId) => Math.floor(Number(cart.items.find((item) => item.productId === productId)?.quantity) || 0),
      subtotal,
    };
  }, [cart, products, dispatch]);

  return selector ? selector(store) : store;
}
