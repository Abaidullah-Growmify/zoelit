"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { Heart, LogIn, LogOut, LayoutDashboard, Menu, Package, Search, Settings2, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/container";
import { Input } from "@/components/ui";

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
  const searchInputRef = useRef(null);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);
  const hasHydratedAuth = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [lastPathname, setLastPathname] = useState(pathname);
  const router = useRouter();
  const showAccountStrip = Boolean(user) || !hasHydratedAuth;

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = searchValue.trim();
    setSearchOpen(false);
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeProfile = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("pointerdown", closeProfile);
    return () => document.removeEventListener("pointerdown", closeProfile);
  }, [profileOpen]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    searchInputRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setSearchOpen(false);
    setProfileOpen(false);
  }

  return (
    <div className={`relative z-50 ${showAccountStrip ? "h-24 sm:h-[108px]" : "h-14 sm:h-16"}`}>
      <div className="fixed inset-x-0 top-0 z-[200]">
      <header className="relative z-[300] w-full border-b border-outline-variant/70 bg-surface backdrop-blur-md">
        <Container className="store-shell flex h-14 items-center gap-2 sm:h-16 md:grid md:h-16 md:grid-cols-[auto_1fr_auto] md:gap-4 lg:grid lg:h-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition hover:bg-slate-100 active:scale-95 md:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex min-w-0 shrink-0 items-center">
              <BrandLogo className="h-7 w-auto max-w-[160px] shrink-0 object-contain sm:h-8 md:max-lg:h-7 lg:h-7" priority />
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex md:justify-center md:gap-5 lg:gap-8">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-2 text-sm font-medium transition-colors hover:text-primary lg:text-[15px] ${
                    active ? "border-b-2 border-primary text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0 md:justify-self-end md:gap-1 lg:ml-0 lg:justify-self-end lg:gap-2">
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition hover:bg-slate-100 active:scale-95"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            
            <Link 
              href="/dashboard/wishlist" 
              aria-label="Wishlist" 
              className="hidden h-9 w-9 place-items-center rounded-full text-on-surface-variant transition hover:bg-slate-100 sm:grid"
            >
              <Heart className="h-5 w-5" />
            </Link>
            
            <button
              ref={cartButtonRef}
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-slate-100 active:scale-95 lg:gap-1"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative z-[120] ml-2 lg:ml-3" ref={profileRef}>
                <button 
                  type="button" 
                  onClick={() => setProfileOpen((open) => !open)} 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white transition hover:bg-primary-container md:h-9 md:w-9 lg:h-9 lg:w-9"
                  aria-label="Open profile menu" 
                  aria-expanded={profileOpen}
                >
                  {user.name?.slice(0, 1).toUpperCase() || "U"}
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[1000] mt-2 w-max max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-outline-variant bg-white p-1.5 shadow-xl transition-opacity duration-150 dark:bg-surface"
                  >
                    <span aria-hidden="true" className="absolute -top-1.5 right-3 size-3 rotate-45 border-l border-t border-outline-variant bg-surface" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="relative z-10 flex h-10 w-max items-center gap-2 whitespace-nowrap rounded-xl px-3 text-left text-sm font-semibold text-error transition hover:bg-error-container"
                    >
                      <LogOut className="size-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : !hasHydratedAuth ? (
              <div aria-hidden="true" className="ml-2 size-9 animate-pulse rounded-full bg-surface-container-high" />
            ) : (
              <Link 
                href="/login" 
                  className="ml-1 inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-primary px-2.5 text-xs font-medium text-white transition hover:bg-primary-container sm:ml-2 sm:px-3 sm:text-sm md:h-9 md:px-4 lg:ml-3"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </Container>

        {searchOpen && (
          <div className="border-t border-outline-variant/70">
            <form onSubmit={handleSearchSubmit} role="search">
              <Container className="store-shell flex items-center gap-3 py-3">
                <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  ref={searchInputRef}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="h-10 pl-10 text-sm"
                />
              </div>
              <button 
                type="submit" 
                className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-container"
              >
                  Search
                </button>
              </Container>
            </form>
          </div>
        )}
      </header>

      {showAccountStrip && (
        <div className="w-full border-b border-outline-variant/70 bg-gradient-to-r from-[#14213d] to-[#17479f]">
          <Container className="store-shell flex h-10 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:h-11 lg:h-11">
            {user ? (
              <div className="mx-auto flex w-max min-w-max items-center justify-center gap-4 lg:gap-6">
                <p className="hidden shrink-0 border-r border-white/20 pr-4 text-xs font-normal text-blue-200 md:block md:pr-5 md:text-[13px] lg:pr-6 lg:text-[13px] lg:font-medium">
                  Hello, <span className="font-semibold text-white">{user.name || "there"}</span>
                </p>
                <AccountLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" pathname={pathname} />
                <AccountLink href="/dashboard/orders" icon={Package} label="My Orders" pathname={pathname} />
                <AccountLink href="/dashboard/wishlist" icon={Heart} label="Wishlist" pathname={pathname} />
                <AccountLink href="/dashboard/profile" icon={Settings2} label="Account Settings" pathname={pathname} />
              </div>
            ) : null}
          </Container>
        </div>
      )}
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-[400] lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/40 transition-opacity"
          />
          <div
            ref={mobileNavRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-surface p-4 shadow-2xl transition-transform"
          >
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <Link href="/" onClick={() => setMobileNavOpen(false)} className="flex items-center">
                <BrandLogo className="h-8 w-auto" priority />
              </Link>
              <button 
                type="button" 
                onClick={() => setMobileNavOpen(false)} 
                aria-label="Close menu" 
                className="grid h-9 w-9 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-surface-container-low ${
                      active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {user ? (
                <button 
                  type="button" 
                  onClick={() => { handleLogout(); setMobileNavOpen(false); }} 
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error-container"
                >
                  Sign out
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMobileNavOpen(false)} 
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary transition hover:bg-surface-container-low"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountLink({ href, icon: Icon, label, pathname }) {
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center gap-1.5 py-2 text-xs font-medium transition-colors md:text-[13px] lg:text-[13px] ${
        active ? "text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary" : "text-blue-200 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
