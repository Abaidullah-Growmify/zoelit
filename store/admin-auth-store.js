"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminLogin as loginThunk, adminLogout as logoutThunk, setAdmin } from "@/store/slices/admin-auth-slice";

export function useAdminAuthStore(selector) {
  const adminAuth = useAppSelector((state) => state.adminAuth);
  const dispatch = useAppDispatch();

  const store = useMemo(
    () => ({
      ...adminAuth,
      login: (email, password, remember) => dispatch(loginThunk({ email, password, remember })).unwrap(),
      setAdmin: (admin) => dispatch(setAdmin(admin)),
      logout: () => dispatch(logoutThunk()).unwrap(),
    }),
    [adminAuth, dispatch]
  );

  return selector ? selector(store) : store;
}