"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AuthGateSkeleton } from "@/components/skeletons";
import { useAuthStore } from "@/store/auth-store";

export function DashboardShell({ children }) {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated);
  const [timedOut, setTimedOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready) return undefined;
    const timer = window.setTimeout(() => setTimedOut(true), 2500);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if ((ready || timedOut) && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, timedOut, user, router, pathname]);

  if (!ready && !timedOut) return <AuthGateSkeleton title="Checking customer access..." description="Preparing your account." />;
  if (!user) return <AuthGateSkeleton title="Checking customer access..." description="Redirecting to sign in." />;

  const hideBackButton = ["/dashboard/orders", "/dashboard/wishlist", "/dashboard/profile"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return <div className="flex min-h-screen flex-col bg-[#f8fafc] dark:bg-slate-950"><SiteHeader /><main className="flex-1">{pathname !== "/dashboard" && !hideBackButton ? <div className="container-page pt-6 lg:pt-8"><AccountBackButton /></div> : null}<div className="container-page py-8 lg:py-10">{children}</div></main><CartDrawer /><SiteFooter /></div>;
}

export function AccountBackButton() {
  const router = useRouter();
  return <button type="button" onClick={() => { if (window.history.length > 1) router.back(); else router.push("/"); }} className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#111827] hover:text-[#111827]"><ArrowLeft className="size-3.5" />Back</button>;
}
