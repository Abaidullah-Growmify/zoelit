"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import adminAuthReducer from "./slices/admin-auth-slice";
import cartReducer from "./slices/cart-slice";
import productReducer from "./slices/product-slice";

const STORAGE_KEYS = {
  auth: "zoelit-auth",
  adminAuth: "zoelit-admin-auth",
  cart: "zoelit-cart",
};

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
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat((store) => (next) => (action) => {
        const result = next(action);
        const state = store.getState();
        persistSlice(STORAGE_KEYS.auth, { user: state.auth.user, token: state.auth.token });
        persistSlice(STORAGE_KEYS.adminAuth, { admin: state.adminAuth.admin, token: state.adminAuth.token });
        persistSlice(STORAGE_KEYS.cart, { items: state.cart.items });
        return result;
      }),
  });
}

let singletonStore;

export function getStore() {
  if (!singletonStore) singletonStore = makeStore();
  return singletonStore;
}

export { STORAGE_KEYS };