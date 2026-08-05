"use client";

import Link from "next/link";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "My Account" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const accountHref = authHydrated && user ? "/dashboard" : "/login";
  const accountLabel = authHydrated && user ? "Account" : "Login";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-600">Zoe</span>Lit</Link>
          <nav className="hidden items-center gap-7 md:flex">{nav.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300">{item.label}</Link>)}</nav>
          <div className="flex items-center gap-2">
            <button onClick={openCart} className="relative grid size-11 place-items-center rounded-full bg-slate-100 transition hover:bg-slate-200 dark:bg-slate-800" aria-label="Open cart"><ShoppingBag className="size-5" />{cartHydrated && count > 0 ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{count}</span> : null}</button>
            <Button asChild href={accountHref} variant="outline" className="hidden md:inline-flex"><User className="size-4" />{accountLabel}</Button>
            <button className="grid size-11 place-items-center rounded-full bg-slate-100 md:hidden dark:bg-slate-800" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu /></button>
          </div>
        </div>
        {open ? <div className="container-page grid gap-3 pb-4 md:hidden">{nav.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="rounded-md bg-slate-100 px-4 py-3 text-sm font-bold dark:bg-slate-800">{item.label}</Link>)}<Link href={accountHref} className="rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white">{authHydrated && user ? "Dashboard" : "Login"}</Link></div> : null}
      </header>
      <CartDrawer />
    </>
  );
}
