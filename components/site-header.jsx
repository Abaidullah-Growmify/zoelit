"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Store" },
  { href: "/faq", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartButtonRef = useRef(null);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!cartHydrated || count === 0 || !cartButtonRef.current) return;
    cartButtonRef.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" }
    );
  }, [cartHydrated, count]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-4 md:px-16">
        <Link href="/" className="text-2xl font-bold tracking-[-0.02em] text-blue-700 dark:text-blue-300">
          ZoelLit
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-sm px-3 py-2 text-sm font-semibold tracking-[0.05em] transition-colors hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300 ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-300"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Favorites" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button
            ref={cartButtonRef}
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold leading-none text-white dark:bg-blue-500">
                {count}
              </span>
            ) : null}
          </button>
          <Link
            href={user ? "/dashboard/profile" : `/login?next=${encodeURIComponent(pathname || "/")}`}
            aria-label={user ? "Open profile" : "Log in"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            <span className="material-symbols-outlined">{user ? "account_circle" : "login"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
