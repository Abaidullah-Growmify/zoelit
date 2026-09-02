"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Heart, LogIn, Menu, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { BrandLogo } from "@/components/brand-logo";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Store" },
  { href: "/faq", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isClientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const canOpenWishlist = isClientReady && Boolean(user);

  useEffect(() => {
    if (!cartHydrated || count === 0 || !cartButtonRef.current) return;
    cartButtonRef.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" }
    );
  }, [cartHydrated, count]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const handlePointerDown = (event) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileNavOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-2.5 md:px-16">
        <Link href="/" className="flex items-center">
          <BrandLogo className="h-auto w-[200px] max-w-[42vw]" priority />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-container-low hover:text-primary ${active ? "text-primary" : "text-on-surface-variant"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {canOpenWishlist ? (
            <Link href="/dashboard/wishlist" aria-label="Open wishlist" className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary active:scale-95 motion-reduce:transition-colors">
              <Heart className="size-5" />
            </Link>
          ) : (
            <button type="button" aria-label="Wishlist is available after login" disabled className="flex h-10 w-10 cursor-default items-center justify-center rounded-full text-on-surface-variant opacity-70 motion-reduce:transition-colors">
              <Heart className="size-5" />
            </button>
          )}
          <button
            ref={cartButtonRef}
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary active:scale-95 motion-reduce:transition-colors"
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-white">
                {count}
              </span>
            ) : null}
          </button>
          <Link
            href={user ? "/dashboard" : "/login?next=%2Fdashboard"}
            aria-label={user ? "Open user dashboard" : "Log in to user dashboard"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary active:scale-95 motion-reduce:transition-colors"
          >
            {user ? <User className="size-5" /> : <LogIn className="size-5" />}
          </Link>
          <button
            type="button"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary active:scale-95 md:hidden"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {mobileNavOpen ? (
        <div className="border-t border-outline-variant/80 bg-surface-container-lowest md:hidden" ref={mobileNavRef}>
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 px-5 py-4">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-sm px-3 py-2 text-label-md font-semibold transition duration-200 ease-out hover:bg-surface-container-low hover:text-primary ${active ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
