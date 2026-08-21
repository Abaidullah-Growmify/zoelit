"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, Maximize2, Minimize2, Package, PanelLeftClose, PanelLeftOpen, Settings, ShoppingBag, Tags, Users, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthGateSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
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
    <div className="min-h-screen bg-background bg-[radial-gradient(circle_at_top_right,rgb(0_63_177_/_0.10),transparent_32rem)]">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/80 bg-surface-container-lowest/90 px-4 backdrop-blur lg:hidden print:hidden">
        <Link href="/admin" className="font-extrabold tracking-tight text-on-surface"><span className="text-primary">Zoe</span>Lit Admin</Link>
        <button className="grid size-10 place-items-center rounded-sm border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary" onClick={() => setMobileOpen(true)} aria-label="Open admin menu"><Menu className="size-5" /></button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-outline-variant bg-surface-container-lowest shadow-[12px_0_50px_rgb(15_23_42_/_0.04)] backdrop-blur transition-[width] duration-200 lg:block print:hidden", sidebarCollapsed ? "w-32 p-3" : "w-72 p-5")}>{sidebar}</aside>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden print:hidden"><div className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-80 overflow-hidden bg-surface-container-lowest p-5 shadow-2xl"><button className="mb-4 ml-auto grid size-10 place-items-center rounded-sm border border-outline-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary" onClick={() => setMobileOpen(false)} aria-label="Close admin menu"><X className="size-5" /></button>{mobileSidebar}</aside></div> : null}
      <main className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-32" : "lg:pl-72")}>
        <div className="sticky top-0 z-40 overflow-visible border-b border-outline-variant/80 bg-surface-container-lowest/90 shadow-[0_1px_0_rgb(15_23_42_/_0.03)] backdrop-blur-xl print:hidden">
        <div className="container-page flex min-h-20 flex-col justify-center gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
<div className="min-w-0 flex items-center">
            <button className="grid size-10 place-items-center rounded-sm border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary mr-2" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"} title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}>
              {sidebarCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            </button>
            <h2 className="truncate font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">Welcome back, Admin</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle className="shrink-0 rounded-sm shadow-sm ring-1 ring-outline-variant" />
                <button type="button" onClick={toggleFullscreen} className="grid size-11 shrink-0 place-items-center rounded-sm bg-surface-container-lowest text-on-surface-variant shadow-sm ring-1 ring-outline-variant transition hover:bg-surface-container-low hover:text-primary" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                  {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                </button>
                <button type="button" className="relative grid size-11 shrink-0 place-items-center rounded-sm bg-surface-container-lowest text-on-surface-variant shadow-sm ring-1 ring-outline-variant transition hover:bg-surface-container-low hover:text-primary" aria-label="Notifications">
                  <Bell className="size-5" />
                  <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-semibold leading-none text-white ring-2 ring-surface-container-lowest">3</span>
                </button>
                <div className="relative" ref={profileRef}>
                  <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-11 items-center gap-2 rounded-sm bg-surface-container-lowest px-2 text-left shadow-sm ring-1 ring-outline-variant transition hover:bg-surface-container-low" aria-expanded={profileOpen} aria-haspopup="menu">
                    <span className="grid size-8 place-items-center rounded-full bg-primary-container/10 font-heading text-label-sm font-semibold text-primary ring-1 ring-primary/10">{initials}</span>
                    <span className="hidden max-w-32 truncate text-body-md font-semibold text-on-surface lg:block">{admin?.name || "ZoeLit Admin"}</span>
                    <ChevronDown className="size-4 text-on-surface-variant" />
                  </button>
                  {profileOpen ? <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-2xl shadow-primary/10 ring-1 ring-outline-variant/40" role="menu">
                    <div className="border-b border-outline-variant px-3 pb-3 pt-2">
                      <p className="truncate text-body-md font-semibold text-on-surface">{admin?.name || "ZoeLit Admin"}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">Admin account</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Link href="/admin/profile" onClick={() => setProfileOpen(false)} className="block rounded-sm px-3 py-2 text-body-md font-normal leading-5 text-on-surface-variant transition hover:bg-surface-container-low" role="menuitem">Profile</Link>
                      <button type="button" onClick={handleLogout} className="block w-full rounded-sm px-3 py-2 text-left text-body-md font-normal leading-5 text-error transition hover:bg-error-container" role="menuitem">Sign out</button>
                    </div>
                  </div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-page py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function Sidebar({ collapsed, onNavigate }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("mb-6 flex shrink-0 items-center gap-2", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/admin" className={cn("font-extrabold tracking-tight text-on-surface", collapsed ? "grid size-12 place-items-center rounded-full bg-primary-container/10 text-headline-md text-primary ring-1 ring-primary/10" : "text-headline-md")} aria-label="ZoeLit Admin"><span className="text-primary">{collapsed ? "Z" : "Zoe"}</span>{collapsed ? null : "Lit Admin"}</Link>
      </div>
      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center rounded-sm py-3 text-body-md font-semibold transition duration-200", collapsed ? "justify-center px-3" : "gap-3 px-4", active ? "bg-primary text-white shadow-primary-elevated" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary")} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}><item.icon className="size-4" />{collapsed ? null : item.label}</Link>;
        })}
      </nav>
    </div>
  );
}

function getInitials(name = "ZoeLit Admin") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
