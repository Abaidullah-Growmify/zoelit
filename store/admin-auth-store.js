"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminLogin as loginThunk, adminLogout as logoutThunk, forceLogout, setAdmin } from "@/store/slices/admin-auth-slice";

export function useAdminAuthStore(selector) {
  const adminAuth = useAppSelector((state) => state.adminAuth);
  const dispatch = useAppDispatch();

  const store = useMemo(
    () => ({
      ...adminAuth,
       login: (email, password, remember, otp) => dispatch(loginThunk({ email, password, remember, otp })).unwrap(),
      setAdmin: (admin) => dispatch(setAdmin(admin)),
      forceLogout: () => dispatch(forceLogout()),
      logout: () => dispatch(logoutThunk()).unwrap(),
    }),
    [adminAuth, dispatch]
  );

  return selector ? selector(store) : store;
}
