"use client";

import Link from "next/link";
import { LogIn, Menu, ShoppingCart, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { CartDrawer } from "@/components/cart-drawer";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const cartButtonRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const accountHref = authHydrated && user ? "/dashboard" : "/login";
  const AccountIcon = authHydrated && user ? User : LogIn;
  const accountLabel = authHydrated && user ? "Open profile" : "Login";

  useEffect(() => {
    if (!cartHydrated || count === 0 || !cartButtonRef.current) return;
    cartButtonRef.current.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(1)" },
    ], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
  }, [cartHydrated, count]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight"><span className="text-blue-600">Zoe</span>Lit</Link>
          <nav className="hidden items-center gap-7 md:flex">{nav.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300">{item.label}</Link>)}</nav>
          <div className="flex items-center gap-2">
            <button ref={cartButtonRef} data-cart-target onClick={openCart} className="relative grid size-11 place-items-center rounded-md text-slate-950 transition hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800" aria-label={`Open cart${cartHydrated ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}><ShoppingCart className="size-6 stroke-[2.4]" />{cartHydrated && count > 0 ? <span key={count} className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-blue-600 text-xs font-black leading-none text-white ring-2 ring-white dark:ring-slate-950">{count}</span> : null}</button>
            <Link href={accountHref} className="hidden size-11 place-items-center rounded-md text-slate-950 transition hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800 md:grid" aria-label={accountLabel}><AccountIcon className="size-6 stroke-[2.4]" /></Link>
            <button className="grid size-11 place-items-center rounded-full bg-slate-100 md:hidden dark:bg-slate-800" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu /></button>
          </div>
        </div>
        {open ? <div className="container-page grid gap-3 pb-4 md:hidden">{nav.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="rounded-md bg-slate-100 px-4 py-3 text-sm font-bold dark:bg-slate-800">{item.label}</Link>)}<Link href={accountHref} className="rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white">{authHydrated && user ? "Dashboard" : "Login"}</Link></div> : null}
      </header>
      <CartDrawer />
    </>
  );
}
