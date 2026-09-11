"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, LogIn, Menu, ShoppingBag, X, LayoutDashboard, Package, Settings2, LogOut } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const profileRef = useRef(null);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

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

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeProfile = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeProfile);
    return () => document.removeEventListener("pointerdown", closeProfile);
  }, [profileOpen]);

  return (
    <>
      <header className="site-header sticky top-0 z-50 w-full border-b border-outline-variant/70 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-8 px-5 py-2.5 md:px-10 lg:px-16">
        <Link href="/" className="flex items-center">
          <BrandLogo className="h-auto w-[200px] max-w-[42vw]" priority />
        </Link>
        <nav className="hidden items-center gap-4 md:flex lg:gap-7">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                  className={`header-nav-link relative px-1 py-5 text-sm font-semibold transition-colors hover:text-primary ${active ? "text-primary" : "text-on-surface-variant"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle className="icon-btn shadow-none ring-0" />
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
           {user ? <div className="relative" ref={profileRef}><button type="button" onClick={() => setProfileOpen((open) => !open)} className="header-identity-chip" aria-label="Open profile menu" aria-expanded={profileOpen}><span className="header-avatar-initial">{user.name?.slice(0, 1).toUpperCase() || "U"}</span></button>{profileOpen ? <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-outline-variant bg-surface p-1.5 shadow-xl"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-on-surface-variant transition hover:bg-error-container hover:text-error"><LogOut className="size-4" />Sign Out</button></div> : null}</div> : <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-container"><LogIn className="size-4" />Sign In</Link>}
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
    {user ? <div className="account-strip sticky top-16 z-40"><div className="mx-auto flex max-w-[1280px] items-center justify-center gap-5 overflow-x-auto px-5 md:px-10 lg:px-16"><p className="hidden shrink-0 text-xs text-blue-200 lg:block">Hello, <b className="text-white">{user.name || "there"}</b></p><div className="flex min-w-max items-center justify-center gap-1"><AccountLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" pathname={pathname} /><AccountLink href="/dashboard/orders" icon={Package} label="My Orders" badge="5" pathname={pathname} /><AccountLink href="/dashboard/wishlist" icon={Heart} label="Wishlist" pathname={pathname} /><AccountLink href="/dashboard/profile" icon={Settings2} label="Account Settings" pathname={pathname} /><button type="button" onClick={handleLogout} className="account-strip-link"><LogOut className="size-3.5" />Sign Out</button></div></div></div> : null}
    </>
  );
}

function AccountLink({ href, icon: Icon, label, badge, pathname }) {
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  return <Link href={href} className={`account-strip-link relative ${active ? "active" : ""}`}><Icon className="size-3.5" />{label}{badge ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">{badge}</span> : null}</Link>;
}
