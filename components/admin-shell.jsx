"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Boxes, ChevronDown, LayoutDashboard, Package, Settings, ShoppingBag, Tags, Users, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
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
];

export function AdminShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const ready = useAdminAuthStore((state) => state.hasHydrated);
  const logout = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    if (pathname !== "/admin/login" && ready && !admin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, admin, router, pathname]);

  if (pathname === "/admin/login") return children;

  const handleLogout = () => {
    logout();
    toast.info("Admin signed out");
    router.push("/admin/login");
  };
  const activeItem = items.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))) || items[0];
  const initials = getInitials(admin?.name);
  const sidebar = <Sidebar onNavigate={() => setMobileOpen(false)} />;
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
        <div className="relative z-40 overflow-visible border-b border-slate-200/80 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
          <div className="container-page flex min-h-20 flex-col justify-center gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Admin / {activeItem.label}</p>
              <h2 className="mt-1 truncate font-heading text-xl font-extrabold tracking-[-0.02em] text-slate-950 dark:text-white">{activeItem.label}</h2>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle className="shrink-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-800" />
                <button type="button" className="relative grid size-12 shrink-0 place-items-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-700 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-blue-300" aria-label="Notifications">
                  <Bell className="size-5" />
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-slate-950">3</span>
                </button>
                <div className="relative">
                  <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-12 items-center gap-2 rounded-lg bg-white px-2.5 text-left shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-800" aria-expanded={profileOpen} aria-haspopup="menu">
                    <span className="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-extrabold text-white shadow-md shadow-blue-600/20">{initials}</span>
                    <span className="hidden max-w-32 truncate text-sm font-bold text-slate-900 lg:block dark:text-white">{admin?.name || "ZoeLit Admin"}</span>
                    <ChevronDown className="size-4 text-slate-400" />
                  </button>
                  {profileOpen ? <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15 ring-1 ring-slate-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 dark:ring-white/10" role="menu">
                    <div className="border-b border-slate-100 px-3 pb-3 pt-2 dark:border-slate-800">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{admin?.name || "ZoeLit Admin"}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Admin account</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Link href="/admin/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold leading-5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" role="menuitem">Profile</Link>
                      <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold leading-5 text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10" role="menuitem">Sign out</button>
                    </div>
                  </div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-page py-8 lg:py-10">{loadingContent ? <AdminPageSkeleton variant="dashboard" /> : children}</div>
      </main>
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link href="/admin" className="mb-6 shrink-0 text-2xl font-extrabold tracking-tight"><span className="text-blue-600">Zoe</span>Lit Admin</Link>
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition", active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><item.icon className="size-4" />{item.label}</Link>;
        })}
      </nav>
    </div>
  );
}

function getInitials(name = "ZoeLit Admin") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
