"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const ALLOWED_PREFIXES = ["/login", "/register", "/admin"];

function isAllowedPath(pathname) {
  if (pathname === "/") return true;
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function AuthGate({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);

  useEffect(() => {
    if (!hasHydrated || !sessionChecked) return;
    if (isAllowedPath(pathname)) return;

    if (!user || !token) {
      const next = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
      router.replace(`/login?next=${next}`);
    }
  }, [hasHydrated, pathname, router, searchParams, sessionChecked, token, user]);

  if (!hasHydrated || !sessionChecked) return null;
  if (isAllowedPath(pathname)) return children;
  if (!user || !token) return null;

  return children;
}
