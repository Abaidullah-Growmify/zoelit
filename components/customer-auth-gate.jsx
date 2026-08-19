"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const PUBLIC_PATHS = ["/", "/order-success"];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function CustomerAuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);

  useEffect(() => {
    if (isPublicPath(pathname)) return;
    if (!hasHydrated || !sessionChecked) return;

    if (!user || !token) {
      const next = encodeURIComponent(`${pathname}${window.location.search}`);
      router.replace(`/login?next=${next}`);
    }
  }, [hasHydrated, pathname, router, sessionChecked, token, user]);

  if (isPublicPath(pathname)) return children;
  if (!hasHydrated || !sessionChecked) return null;
  if (!user || !token) return null;

  return children;
}
