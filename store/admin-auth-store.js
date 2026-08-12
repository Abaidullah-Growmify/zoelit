"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as api from "@/lib/api";

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: async (email, password, remember) => {
        const data = await api.adminLogin({ email, password, remember });
        set({ admin: data.admin, token: data.token });
        return data;
      },
      setAdmin: (admin) => set({ admin }),
      logout: async () => {
        try {
          await api.adminLogout(get().token);
        } catch {
          // Ignore network errors; always clear the local session.
        }
        set({ admin: null, token: null });
      },
    }),
    { name: "zoelit-admin-auth", skipHydration: true }
  )
);
