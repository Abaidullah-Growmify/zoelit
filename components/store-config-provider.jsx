"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { setDisplayCurrency } from "@/lib/utils";

const FALLBACK = {
  name: "ZoeLit",
  email: "",
  phone: "",
  address: "",
  currency: "USD",
};

const StoreConfigContext = createContext(FALLBACK);

export function StoreConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(`${API_URL}/api/public/config`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (cancelled || !data?.store) return;
          const next = {
            name: data.store.name || FALLBACK.name,
            email: data.store.email || "",
            phone: data.store.phone || "",
            address: data.store.address || "",
            currency: data.store.currency || "USD",
          };
          setConfig(next);
          setDisplayCurrency(next.currency);
        })
        .catch(() => {});
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return <StoreConfigContext.Provider value={config}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}