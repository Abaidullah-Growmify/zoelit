"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "@/lib/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: async (email, password, remember) => {
        const data = await api.authLogin({ email, password, remember });
        set({ user: data.user, token: data.token });
        return data;
      },
      register: async (values) => {
        const data = await api.authRegister(values);
        set({ user: data.user, token: data.token });
        return data;
      },
      setUser: (user) => set({ user }),
      logout: async () => {
        try {
          await api.authLogout(get().token);
        } catch {
          // Ignore network errors; always clear the local session.
        }
        set({ user: null, token: null });
      },
    }),
    { name: "zoelit-auth", skipHydration: true }
  )
);
