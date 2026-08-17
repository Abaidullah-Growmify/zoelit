"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/auth-slice";
import { hydrateAdminAuth } from "@/store/slices/admin-auth-slice";
import { hydrateCart } from "@/store/slices/cart-slice";

function readStorage(key) {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state ? parsed.state : parsed;
  } catch {
    return null;
  }
}

export function StoreHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = readStorage("zoelit-auth");
    const adminAuth = readStorage("zoelit-admin-auth");
    const cart = readStorage("zoelit-cart");

    dispatch(hydrateAuth(auth));
    dispatch(hydrateAdminAuth(adminAuth));
    dispatch(hydrateCart(cart?.items ? { items: cart.items } : cart));
  }, [dispatch]);

  return null;
}