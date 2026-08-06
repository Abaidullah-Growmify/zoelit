"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LogOut, MapPin, Menu, ShoppingBag, User, X, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui";
import { DashboardSkeleton } from "@/components/skeletons";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/products", label: "Wishlist", icon: Heart },
];

export function DashboardShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); }, [ready, user, router]);
  if (!ready || !user) return <div className="container-page py-10"><DashboardSkeleton /></div>;
  const sidebar = <Sidebar onNavigate={() => setMobileOpen(false)} onLogout={() => { logout(); toast.info("Signed out"); router.push("/login"); }} />;
  return <div className="min-h-screen bg-slate-100 dark:bg-slate-950"><div className="lg:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900"><Link href="/" className="font-extrabold"><span className="text-blue-600">Zoe</span>Lit</Link><button onClick={() => setMobileOpen(true)} aria-label="Open dashboard menu"><Menu /></button></div><aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block dark:border-slate-800 dark:bg-slate-900">{sidebar}</aside>{mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-80 bg-white p-5 dark:bg-slate-900"><button className="mb-4 ml-auto block" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>{sidebar}</aside></div> : null}<main className="lg:pl-72"><div className="container-page py-8 lg:py-10">{children}</div></main></div>;
}

function Sidebar({ onNavigate, onLogout }) {
  const pathname = usePathname();
  return <div className="flex h-full flex-col"><div className="mb-8 flex items-center justify-between gap-4"><Link href="/" className="text-2xl font-extrabold"><span className="text-blue-600">Zoe</span>Lit</Link></div><nav className="space-y-2">{items.map((item) => { const active = pathname === item.href; return <Link key={`${item.label}-${item.href}`} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold transition", active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><item.icon className="size-4" />{item.label}</Link>; })}</nav><div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><div className="mb-4 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"><LogOut className="size-4" /></span><div><p className="text-sm font-bold text-slate-900 dark:text-white">Leaving ZoeLit?</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Sign out safely and return to the secure login screen.</p></div></div><Button variant="danger" className="w-full shadow-lg shadow-rose-600/15" onClick={onLogout}><LogOut className="size-4" />Sign out</Button></div></div>;
}
