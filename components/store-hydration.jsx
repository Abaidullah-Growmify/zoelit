"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function StoreHydration() {
  useEffect(() => {
    let active = true;

    async function hydrateStores() {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useCartStore.persist.rehydrate(),
      ]);

      if (!active) return;
      useAuthStore.getState().setHasHydrated(true);
      useCartStore.getState().setHasHydrated(true);
    }

    hydrateStores();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
