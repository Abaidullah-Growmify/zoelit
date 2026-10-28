"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { applyFontTheme } from "@/lib/fonts";

const FALLBACK = {
  name: "ZoeLit",
  email: "",
  phone: "",
  address: "",
  theme: "light",
  headingFont: "poppins",
  bodyFont: "inter",
};

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  localStorage.setItem("theme", nextTheme);
}

const StoreConfigContext = createContext(FALLBACK);

export function StoreConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") applyTheme(savedTheme);
    const handleAppearanceChange = (event) => {
      const appearance = event.detail || {};
      if (appearance.theme) applyTheme(appearance.theme);
      if (appearance.headingFont || appearance.bodyFont) applyFontTheme(appearance.headingFont, appearance.bodyFont);
    };
    const handleStorageChange = (event) => {
      if (event.key === "theme") applyTheme(event.newValue);
      if (event.key === "zoelit-appearance" && event.newValue) {
        try {
          window.dispatchEvent(new CustomEvent("zoelit-appearance-change", { detail: JSON.parse(event.newValue) }));
        } catch {
          // Ignore malformed cross-tab appearance data.
        }
      }
    };
    window.addEventListener("zoelit-appearance-change", handleAppearanceChange);
    window.addEventListener("storage", handleStorageChange);
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
            theme: data.appearance?.theme === "dark" ? "dark" : "light",
            headingFont: data.appearance?.headingFont || "poppins",
            bodyFont: data.appearance?.bodyFont || "inter",
          };
          setConfig(next);
          applyTheme(next.theme);
          applyFontTheme(next.headingFont, next.bodyFont);
        })
        .catch(() => {});
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("zoelit-appearance-change", handleAppearanceChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <StoreConfigContext.Provider value={config}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}
