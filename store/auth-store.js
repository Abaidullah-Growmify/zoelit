"use client";

import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { authLogin as loginThunk, authRegister as registerThunk, authLogout as logoutThunk, forceLogout, setUser } from "@/store/slices/auth-slice";

export function useAuthStore(selector) {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const store = useMemo(
    () => ({
      ...auth,
      login: (email, password, remember) => dispatch(loginThunk({ email, password, remember })).unwrap(),
      register: (values) => dispatch(registerThunk(values)).unwrap(),
      setUser: (user) => dispatch(setUser(user)),
      logout: () => dispatch(logoutThunk()).unwrap(),
      clearSession: () => dispatch(forceLogout()),
    }),
    [auth, dispatch]
  );

  return selector ? selector(store) : store;
}
