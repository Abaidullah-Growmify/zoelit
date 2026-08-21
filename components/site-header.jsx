"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { CartDrawer } from "@/components/cart-drawer";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const cartButtonRef = useRef(null);
  const headerRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const cartReady = authHydrated && cartHydrated;
  const openCart = useCartStore((state) => state.openCart);
  const accountHref = authHydrated && user ? "/dashboard" : "/login";
  const AccountIcon = authHydrated && user ? User : LogIn;
  const accountLabel = authHydrated && user ? "Open profile" : "Login";
  const isActive = (href) => href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    if (!cartReady || count === 0 || !cartButtonRef.current) return;
    cartButtonRef.current.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(1)" },
    ], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
  }, [cartReady, count]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-blue-100 bg-slate-50/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <div className="container-page grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.03em] text-blue-700 dark:text-blue-400">ZoeLit</Link>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-xs font-extrabold uppercase tracking-[0.16em] transition ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300"}`}
                >
                  {item.label}
                  <span className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-sm bg-blue-700 transition ${active ? "opacity-100" : "opacity-0"}`} />
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle className="rounded-sm" />
            <button
              ref={cartButtonRef}
              data-cart-target
              onClick={openCart}
              className="relative grid size-11 place-items-center rounded-sm text-slate-950 transition hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800"
              aria-label={`Open cart${cartReady ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
            >
              <ShoppingBag className="size-5" />
              {cartReady && count > 0 ? (
                <span key={count} className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-sm bg-blue-600 text-xs font-semibold leading-none text-white ring-2 ring-white dark:ring-slate-950">
                  {count}
                </span>
              ) : null}
            </button>
            <Link href={accountHref} className="hidden size-11 place-items-center rounded-sm text-slate-950 transition hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800 md:grid" aria-label={accountLabel}>
              <AccountIcon className="size-5" />
            </Link>
            <button className="grid size-11 place-items-center rounded-sm bg-slate-100 md:hidden dark:bg-slate-800" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
        {open ? (
          <div className="container-page grid gap-3 pb-4 md:hidden">
            {nav.map((item) => {
              const active = isActive(item.href);
              const mobileLinkClass = active
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

              return (
                <Link
                  onClick={() => setOpen(false)}
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-4 py-3 text-xs font-extrabold uppercase tracking-[0.16em] ${mobileLinkClass}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href={accountHref} className="rounded-sm bg-blue-700 px-4 py-3 text-sm font-semibold text-white">
              {authHydrated && user ? "Dashboard" : "Login"}
            </Link>
          </div>
        ) : null}
      </header>
      <CartDrawer />
    </>
  );
}
