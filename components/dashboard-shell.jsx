"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Heart, Home, MapPin, Maximize2, Menu, Minimize2, PanelLeftClose, PanelLeftOpen, ShoppingBag, User, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/products", label: "Wishlist", icon: Heart },
];

const sidebarItems = items.filter((item) => item.href !== "/dashboard/profile");

export function DashboardShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const profileRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); }, [ready, user, router]);
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
  const handleLogout = async () => {
    await logout();
    toast.info("Signed out");
    router.push("/login");
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    document.documentElement.requestFullscreen();
  };
  const activeItem = items.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))) || items[0];
  const initials = getInitials(user?.name);
  const sidebar = <Sidebar collapsed={sidebarCollapsed} onNavigate={() => setMobileOpen(false)} onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)} />;
  const mobileSidebar = <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />;
  const loadingContent = !ready || !user;

  return (
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_32rem)] dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.14),transparent_30rem)]">
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <Link href="/dashboard" className="font-extrabold tracking-tight"><span className="text-blue-600">Zoe</span>Lit</Link>
        <button className="grid size-10 place-items-center rounded-sm border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" onClick={() => setMobileOpen(true)} aria-label="Open dashboard menu"><Menu className="size-5" /></button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200/80 bg-white/95 shadow-[12px_0_50px_rgba(15,23,42,0.04)] backdrop-blur transition-[width] duration-200 lg:block dark:border-slate-800 dark:bg-slate-900/95", sidebarCollapsed ? "w-32 p-3" : "w-72 p-5")}>{sidebar}</aside>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-80 overflow-hidden bg-white p-5 shadow-2xl dark:bg-slate-900"><button className="mb-4 ml-auto grid size-10 place-items-center rounded-sm border border-slate-200 dark:border-slate-700" onClick={() => setMobileOpen(false)} aria-label="Close dashboard menu"><X className="size-5" /></button>{mobileSidebar}</aside></div> : null}
      <main className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-32" : "lg:pl-72")}>
        <div className="relative z-40 overflow-visible border-b border-slate-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
          <div className="container-page flex min-h-20 flex-col justify-center gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-meta font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Account / {activeItem.label}</p>
              <h2 className="mt-1 truncate font-heading text-h2 font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">{activeItem.label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="shrink-0 rounded-sm bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-800" />
              <button type="button" onClick={toggleFullscreen} className="grid size-11 shrink-0 place-items-center rounded-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-700 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-blue-300" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
                {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
              </button>
              <button type="button" className="relative grid size-11 shrink-0 place-items-center rounded-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-blue-700 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-blue-300" aria-label="Notifications">
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-blue-600 text-[9px] font-semibold leading-none text-white ring-2 ring-white dark:ring-slate-950">2</span>
              </button>
              <div className="relative" ref={profileRef}>
                <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-11 items-center gap-2 rounded-sm bg-white px-2 text-left shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-950 dark:ring-slate-700 dark:hover:bg-slate-800" aria-expanded={profileOpen} aria-haspopup="menu">
                  <span className="grid size-8 place-items-center rounded-full bg-blue-50 font-heading text-meta font-semibold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{initials}</span>
                  <span className="hidden max-w-32 truncate text-body font-semibold text-slate-900 lg:block dark:text-white">{user?.name || "ZoeLit Customer"}</span>
                  <ChevronDown className="size-4 text-slate-400" />
                </button>
                {profileOpen ? <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-md border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15 ring-1 ring-slate-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 dark:ring-white/10" role="menu">
                  <div className="border-b border-slate-100 px-3 pb-3 pt-2 dark:border-slate-800">
                    <p className="truncate text-body font-semibold text-slate-900 dark:text-white">{user?.name || "ZoeLit Customer"}</p>
                    <p className="mt-1 text-meta text-slate-500 dark:text-slate-400">Customer account</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="block rounded-sm px-3 py-2 text-body font-regular leading-5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" role="menuitem">Profile</Link>
                    <button type="button" onClick={handleLogout} className="block w-full rounded-sm px-3 py-2 text-left text-body font-regular leading-5 text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10" role="menuitem">Sign out</button>
                  </div>
                </div> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="container-page py-8 lg:py-10">{loadingContent ? null : children}</div>
      </main>
    </div>
  );
}

function Sidebar({ collapsed, onNavigate, onToggleCollapsed }) {
  const pathname = usePathname();
  return <div className="flex h-full min-h-0 flex-col"><div className={cn("mb-6 flex shrink-0 items-center gap-2", collapsed ? "justify-center" : "justify-between")}><Link href="/dashboard" className={cn("font-extrabold tracking-tight", collapsed ? "grid size-12 place-items-center rounded-full bg-blue-50 text-h2 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20" : "text-2xl")} aria-label="ZoeLit Account"><span className="text-blue-700 dark:text-blue-300">{collapsed ? "Z" : "Zoe"}</span>{collapsed ? null : "Lit"}</Link>{onToggleCollapsed ? <button type="button" onClick={onToggleCollapsed} className={cn("grid place-items-center rounded-sm border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300", collapsed ? "size-12" : "size-10")} aria-label={collapsed ? "Show sidebar" : "Hide sidebar"} title={collapsed ? "Show sidebar" : "Hide sidebar"}>{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button> : null}</div><nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">{sidebarItems.map((item) => { const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)); return <Link key={`${item.label}-${item.href}`} href={item.href} onClick={onNavigate} className={cn("flex items-center rounded-sm py-3 text-body font-semibold transition duration-200", collapsed ? "justify-center px-3" : "gap-3 px-4", active ? "bg-blue-700 text-white shadow-lg shadow-blue-700/20 dark:bg-blue-600 dark:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300")} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}><item.icon className="size-4" />{collapsed ? null : item.label}</Link>; })}</nav></div>;
}

function getInitials(name = "ZoeLit Customer") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
