"use client";

import { useEffect } from "react";
import * as api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forceLogout, hydrateAuth, setSessionChecked } from "@/store/slices/auth-slice";
import { hydrateAdminAuth } from "@/store/slices/admin-auth-slice";
import { hydrateCart } from "@/store/slices/cart-slice";
import { clearWishlist, fetchWishlist, hydrateWishlist } from "@/store/slices/wishlist-slice";

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
  const token = useAppSelector((state) => state.auth.token);
  const hasHydratedAuth = useAppSelector((state) => state.auth.hasHydrated);

  useEffect(() => {
    const auth = readStorage("zoelit-auth");
    const adminAuth = readStorage("zoelit-admin-auth");
    const cart = readStorage("zoelit-cart");

    dispatch(hydrateAuth(auth));
    dispatch(hydrateAdminAuth(adminAuth));
    dispatch(hydrateCart(cart?.items ? { items: cart.items } : cart));
  }, [dispatch]);

  useEffect(() => {
    if (!hasHydratedAuth) return;

    dispatch(clearWishlist());

    if (!token) {
      dispatch(hydrateWishlist({ items: [] }));
      dispatch(setSessionChecked(true));
      return;
    }

    dispatch(fetchWishlist(token))
      .catch(() => {
        dispatch(hydrateWishlist({ items: [] }));
      })
      .finally(() => {
        dispatch(setSessionChecked(true));
      });
  }, [dispatch, hasHydratedAuth, token]);

  useEffect(() => {
    if (!hasHydratedAuth || !token) return;

    api.getProfile(token).catch(() => {
      // 401 is handled globally via the API layer event.
    });
  }, [hasHydratedAuth, token]);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(forceLogout());
      dispatch(clearWishlist());
      dispatch(hydrateWishlist({ items: [] }));
      dispatch(setSessionChecked(true));

      if (typeof window !== "undefined") {
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.assign(`/login?next=${next}`);
      }
    };

    window.addEventListener("zoelit-auth-expired", handleAuthExpired);
    return () => window.removeEventListener("zoelit-auth-expired", handleAuthExpired);
  }, [dispatch]);

  return null;
}
