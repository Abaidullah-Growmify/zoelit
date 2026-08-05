"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { customer } from "@/lib/data";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: (email) => set({ user: { ...customer, email } }),
      register: (name, email) => set({ user: { ...customer, name, email } }),
      logout: () => set({ user: null }),
    }),
    { name: "zoelit-auth", skipHydration: true }
  )
);
