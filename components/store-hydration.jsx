"use client";

import { useEffect, useRef } from "react";
import * as api from "@/lib/api";
import { STORAGE_KEYS, getCartStorageKey, readStorage } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { forceLogout, hydrateAuth, setSessionChecked } from "@/store/slices/auth-slice";
import { forceLogout as forceAdminLogout, hydrateAdminAuth } from "@/store/slices/admin-auth-slice";
import { hydrateCart } from "@/store/slices/cart-slice";
import { clearWishlist, fetchWishlist, hydrateWishlist } from "@/store/slices/wishlist-slice";

function getTokenExpiryMs(token) {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return 0;
    const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Number(parsed?.exp || 0) * 1000;
  } catch {
    return 0;
  }
}

function isProtectedPath(pathname) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

function getAuthRedirectTarget(pathname, search = "") {
  const next = encodeURIComponent(`${pathname}${search}`);
  if (pathname.startsWith("/admin")) return `/admin/login?next=${next}`;
  return `/login?next=${next}`;
}

export function StoreHydration() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.user?.id || state.auth.user?._id || "");
  const adminToken = useAppSelector((state) => state.adminAuth.token);
  const hasHydratedAuth = useAppSelector((state) => state.auth.hasHydrated);
  const hasHydratedAdmin = useAppSelector((state) => state.adminAuth.hasHydrated);
  const customerTimerRef = useRef(null);
  const adminTimerRef = useRef(null);
  const hydratedCartScopeRef = useRef(null);

  useEffect(() => {
    const auth = readStorage("zoelit-auth");
    const adminAuth = readStorage("zoelit-admin-auth");

    dispatch(hydrateAuth(auth));
    dispatch(hydrateAdminAuth(adminAuth));
  }, [dispatch]);

  useEffect(() => {
    if (!hasHydratedAuth) return;

    const scope = userId || "guest";
    if (hydratedCartScopeRef.current === scope) return;
    hydratedCartScopeRef.current = scope;

    const cart = userId
      ? readStorage(getCartStorageKey(userId))
      : readStorage(STORAGE_KEYS.cart) || readStorage(STORAGE_KEYS.cartLegacy);

    dispatch(hydrateCart(cart?.items ? { items: cart.items } : cart));
  }, [dispatch, hasHydratedAuth, userId]);

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
    if (customerTimerRef.current) window.clearTimeout(customerTimerRef.current);

    if (!hasHydratedAuth || !token) return;

    const expiresAt = getTokenExpiryMs(token);
    const delay = Math.max(expiresAt - Date.now() - 5000, 0);

    customerTimerRef.current = window.setTimeout(async () => {
      try {
        await api.authLogout(token);
      } catch {
        // If the token already expired, still clear local state.
      }

      dispatch(forceLogout());
      dispatch(clearWishlist());
      dispatch(hydrateWishlist({ items: [] }));
      dispatch(setSessionChecked(true));

      if (isProtectedPath(window.location.pathname)) {
        window.location.assign(getAuthRedirectTarget(window.location.pathname, window.location.search));
      }
    }, delay);

    return () => {
      if (customerTimerRef.current) window.clearTimeout(customerTimerRef.current);
    };
  }, [dispatch, hasHydratedAuth, token]);

  useEffect(() => {
    if (!hasHydratedAuth || !token) return;

    api.getProfile(token).catch(() => {
      // 401 is handled globally via the API layer event.
    });
  }, [hasHydratedAuth, token]);

  useEffect(() => {
    if (adminTimerRef.current) window.clearTimeout(adminTimerRef.current);

    if (!hasHydratedAdmin || !adminToken) return;

    const expiresAt = getTokenExpiryMs(adminToken);
    const delay = Math.max(expiresAt - Date.now() - 5000, 0);

    adminTimerRef.current = window.setTimeout(async () => {
      try {
        await api.adminLogout(adminToken);
      } catch {
        // Clear local state even if the token is already stale.
      }

      dispatch(forceAdminLogout());

      if (window.location.pathname.startsWith("/admin")) {
        window.location.assign(`/admin/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
      }
    }, delay);

    return () => {
      if (adminTimerRef.current) window.clearTimeout(adminTimerRef.current);
    };
  }, [adminToken, dispatch, hasHydratedAdmin]);

  useEffect(() => {
    const handleAuthExpired = (event) => {
      const apiPath = String(event?.detail?.path || "");
      const pathname = String(window.location.pathname || "");

      if (apiPath.startsWith("/api/admin")) {
        dispatch(forceAdminLogout());
      } else {
        dispatch(forceLogout());
      }

      dispatch(clearWishlist());
      dispatch(hydrateWishlist({ items: [] }));
      dispatch(setSessionChecked(true));

      if (typeof window !== "undefined" && isProtectedPath(pathname)) {
        window.location.assign(getAuthRedirectTarget(pathname, window.location.search));
      }
    };

    window.addEventListener("zoelit-auth-expired", handleAuthExpired);
    return () => window.removeEventListener("zoelit-auth-expired", handleAuthExpired);
  }, [dispatch]);

  return null;
}
