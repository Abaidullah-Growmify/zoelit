"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminUser } from "@/lib/admin-data";

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: (email) => set({ admin: { ...adminUser, email } }),
      logout: () => set({ admin: null }),
    }),
    { name: "zoelit-admin-auth", skipHydration: true }
  )
);
