"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, Mail, Maximize2, Minimize2, Package, PanelLeftClose, PanelLeftOpen, Settings, ShoppingBag, Tags, Users, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { AuthGateSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/email-templates", label: "Email templates", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);
  const profileRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const ready = useAdminAuthStore((state) => state.hasHydrated);
  const logout = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setHydrationTimedOut(true), 2500);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (pathname !== "/admin/login" && (ready || hydrationTimedOut) && !admin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, hydrationTimedOut, admin, router, pathname]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [profileOpen]);

  if (pathname === "/admin/login") return children;

  const handleLogout = async () => {
    await logout();
    toast.info("Admin signed out");
    router.push("/admin/login");
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    document.documentElement.requestFullscreen();
  };
  const initials = getInitials(admin?.name);
  const sidebar = <Sidebar collapsed={sidebarCollapsed} onNavigate={() => setMobileOpen(false)} />;
  const mobileSidebar = <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />;

  if (!ready && !hydrationTimedOut) {
    return <AuthGateSkeleton title="Checking admin access..." description="Redirecting to admin login if your session is missing or expired." />;
  }

  if (!admin && pathname !== "/admin/login") {
    return <AuthGateSkeleton title="Checking admin access..." description="Redirecting to admin login if your session is missing or expired." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant/70 bg-surface/90 px-4 backdrop-blur lg:hidden print:hidden">
        <Link href="/admin" className="flex items-center"><BrandLogo className="h-7 w-auto" /></Link>
        <button className="icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open admin menu"><Menu className="size-4" /></button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-outline-variant/70 bg-surface lg:block print:hidden", sidebarCollapsed ? "w-20 p-3" : "w-64 p-4")}>{sidebar}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-surface p-4 shadow-2xl">
            <button className="icon-btn mb-4 ml-auto" onClick={() => setMobileOpen(false)} aria-label="Close admin menu"><X className="size-4" /></button>
            {mobileSidebar}
          </aside>
        </div>
      ) : null}
      <main className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <div className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface/85 backdrop-blur-xl print:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button className="icon-btn hidden lg:grid" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"} title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
                {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">Welcome back</p>
                <p className="truncate text-xs text-on-surface-variant">{admin?.name || "Admin"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="icon-btn shadow-none ring-0" />
              <button type="button" onClick={toggleFullscreen} className="icon-btn" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
              <button type="button" className="icon-btn relative" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
              </button>
              <div className="relative" ref={profileRef}>
                <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-2 text-left transition hover:bg-surface-container-low" aria-expanded={profileOpen} aria-haspopup="menu">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
                  <span className="hidden max-w-28 truncate text-sm font-medium text-on-surface lg:block">{admin?.name || "ZoeLit Admin"}</span>
                  <ChevronDown className="size-4 text-on-surface-variant" />
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-outline-variant bg-surface p-1.5 shadow-xl" role="menu">
                    <div className="border-b border-outline-variant px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-on-surface">{admin?.name || "ZoeLit Admin"}</p>
                      <p className="mt-0.5 text-xs text-on-surface-variant">Admin account</p>
                    </div>
                    <div className="mt-1">
                      <Link href="/admin/profile" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface" role="menuitem">Profile</Link>
                      <button type="button" onClick={handleLogout} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-error transition hover:bg-error-container" role="menuitem">Sign out</button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

function Sidebar({ collapsed, onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link href="/admin" className={cn("mb-6 flex shrink-0 items-center gap-2.5", collapsed ? "justify-center" : "")} aria-label="Admin">
        <BrandLogo className={cn("h-9 w-auto", collapsed && "h-9 w-9 object-contain")} />
      </Link>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              data-active={active}
              className={cn("nav-item", collapsed && "justify-center px-0")}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
            >
              <item.icon className="size-4 shrink-0" />
              {collapsed ? null : item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getInitials(name = "ZoeLit Admin") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
