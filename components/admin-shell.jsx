"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, ExternalLink, LayoutDashboard, LogOut, Package, Search, Settings, ShoppingBag, Tags, User, Users, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { AdminPageSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: User },
];

export function AdminShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const ready = useAdminAuthStore((state) => state.hasHydrated);
  const logout = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    if (pathname !== "/admin/login" && ready && !admin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, admin, router, pathname]);

  if (pathname === "/admin/login") return children;

  const sidebar = <Sidebar admin={admin} onNavigate={() => setMobileOpen(false)} onLogout={() => { logout(); toast.info("Admin signed out"); router.push("/admin/login"); }} />;
  const loadingContent = !ready || !admin;

  return (
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_32rem)] dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_30rem)]">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <Link href="/admin" className="font-extrabold tracking-tight"><span className="text-blue-600">Zoe</span>Lit Admin</Link>
        <button className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" onClick={() => setMobileOpen(true)} aria-label="Open admin menu"><Menu className="size-5" /></button>
      </div>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/80 bg-white/95 p-5 backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-900/95">{sidebar}</aside>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-80 overflow-hidden bg-white p-5 shadow-2xl dark:bg-slate-900"><button className="mb-4 ml-auto grid size-10 place-items-center rounded-lg border border-slate-200 dark:border-slate-700" onClick={() => setMobileOpen(false)} aria-label="Close admin menu"><X className="size-5" /></button>{sidebar}</aside></div> : null}
      <main className="lg:pl-72">
        <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="container-page flex min-h-20 flex-col justify-center gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">Commerce control room</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage storefront content, orders, customers, and inventory.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-[560px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search admin..." aria-label="Search admin" className="h-12 rounded-lg pl-11 shadow-sm" />
              </div>
              <Button asChild href="/" variant="outline" className="h-12 shrink-0 rounded-lg border-blue-200 px-5 font-bold text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 dark:border-blue-500/30 dark:text-blue-300 dark:hover:bg-blue-500/10">
                View Store <ExternalLink className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="container-page py-8 lg:py-10">{loadingContent ? <AdminPageSkeleton variant="dashboard" /> : children}</div>
      </main>
    </div>
  );
}

function Sidebar({ admin, onNavigate, onLogout }) {
  const pathname = usePathname();
  const initials = (admin?.name || "ZoeLit Admin").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link href="/admin" className="mb-6 shrink-0 text-2xl font-extrabold tracking-tight"><span className="text-blue-600">Zoe</span>Lit Admin</Link>
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition", active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><item.icon className="size-4" />{item.label}</Link>;
        })}
      </nav>
      <div className="mt-4 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-600 font-extrabold text-white shadow-lg shadow-blue-600/20">{initials}</span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{admin?.name || "ZoeLit Admin"}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Static design mode</p>
          </div>
        </div>
        <Button variant="danger" className="w-full shadow-lg shadow-rose-600/15" onClick={onLogout}><LogOut className="size-4" />Sign out</Button>
      </div>
    </div>
  );
}
