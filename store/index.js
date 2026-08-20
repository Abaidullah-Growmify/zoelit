"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import adminAuthReducer from "./slices/admin-auth-slice";
import cartReducer from "./slices/cart-slice";
import productReducer from "./slices/product-slice";
import wishlistReducer from "./slices/wishlist-slice";

const STORAGE_KEYS = {
  auth: "zoelit-auth",
  adminAuth: "zoelit-admin-auth",
  cart: "zoelit-cart-guest",
  cartLegacy: "zoelit-cart",
};

function getCartStorageKey(userId) {
  const safeUserId = String(userId || "").trim();
  return safeUserId ? `zoelit-cart-user:${safeUserId}` : STORAGE_KEYS.cart;
}

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

function persistSlice(key, payload) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable (private mode / quota). Ignore.
  }
}

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      adminAuth: adminAuthReducer,
      cart: cartReducer,
      products: productReducer,
      wishlist: wishlistReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat((store) => (next) => (action) => {
        const result = next(action);
        const state = store.getState();
        persistSlice(STORAGE_KEYS.auth, { user: state.auth.user, token: state.auth.token });
        persistSlice(STORAGE_KEYS.adminAuth, { admin: state.adminAuth.admin, token: state.adminAuth.token });

        if (String(action.type || "").startsWith("cart/")) {
          const userId = state.auth.user?.id || state.auth.user?._id || "";
          const cartKey = getCartStorageKey(userId);
          const cartPayload = { items: state.cart.items };

          persistSlice(cartKey, cartPayload);

          if (!userId) {
            persistSlice(STORAGE_KEYS.cartLegacy, cartPayload);
          }
        }

        return result;
      }),
  });
}

let singletonStore;

export function getStore() {
  if (!singletonStore) singletonStore = makeStore();
  return singletonStore;
}

export { STORAGE_KEYS, getCartStorageKey, readStorage };
