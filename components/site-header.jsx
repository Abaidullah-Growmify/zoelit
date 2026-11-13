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

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Store" },
  { href: "/faq", label: "Support" },
  { href: "/contact", label: "Contact" },
];

function submitSearch(router, rawQuery) {
  const q = String(rawQuery || "").trim();
  if (!q) return;
  // A normal word such as "printer" is a keyword, not a product id. Catalog
  // SKUs contain at least one digit (for example CE03283 or CA70846).
  const looksLikeSku = /^(?=.*\d)[A-Z0-9-]{4,}$/i.test(q);
  if (looksLikeSku) router.push(`/products/${encodeURIComponent(q)}`);
  else router.push(`/products?keyword=${encodeURIComponent(q)}`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const cartButtonRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileMenuTriggerRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) => state.count());
  const openCart = useCartStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);
  const hasHydratedAuth = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastPathname, setLastPathname] = useState(pathname);
  const router = useRouter();
  const showAccountStrip = Boolean(user) || !hasHydratedAuth;

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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const panel = mobileNavRef.current;
    const trigger = mobileMenuTriggerRef.current;
    if (!panel) return undefined;

    const getFocusable = () => [...panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex=\"-1\"])")];
    const focusable = getFocusable();
    focusable[0]?.focus();

    function handleMenuKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileNavOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleMenuKeyDown);
    return () => {
      document.removeEventListener("keydown", handleMenuKeyDown);
      trigger?.focus();
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
    const closeSearch = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeSearch);
    return () => document.removeEventListener("pointerdown", closeSearch);
  }, [searchOpen]);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setProfileOpen(false);
    setSearchQuery("");
  }

  return (
    <div className={`relative z-50 ${showAccountStrip ? "h-24 sm:h-[108px]" : "h-14 sm:h-16"}`}>
      <div className="fixed inset-x-0 top-0 z-[200]">
      <header className="relative z-[300] w-full border-b border-outline-variant/70 bg-surface backdrop-blur-md">
        <Container className="store-shell flex h-14 items-center gap-2 sm:grid sm:h-16 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 lg:gap-8">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              ref={mobileMenuTriggerRef}
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="-ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-on-surface-variant transition hover:bg-slate-100 active:scale-95 sm:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex min-w-0 shrink-0 items-center">
              <BrandLogo className="site-brand-logo h-6 w-auto max-w-[130px] shrink-0 object-contain sm:h-8 sm:max-w-[160px] md:max-lg:h-7 lg:h-7" priority />
            </Link>
          </div>

          <nav className="hidden items-center sm:flex sm:justify-self-center sm:gap-4 lg:gap-6 xl:gap-8">
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

            <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:ml-0 sm:gap-1 sm:justify-self-end md:gap-2 lg:gap-3">
              <div ref={searchRef} className={`relative z-30 shrink-0 ${searchOpen ? "w-[clamp(9rem,32vw,12rem)] sm:w-32 md:w-40 lg:w-52 xl:w-80" : "w-9"}`}>
                <button
                  type="button"
                  aria-label="Search products"
                  aria-expanded={searchOpen}
                  onClick={() => setSearchOpen((open) => !open)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-slate-100 md:h-10 md:w-10 ${searchOpen ? "hidden" : ""}`}
                >
                  <Search className="h-5 w-5 md:h-6 md:w-6" />
                </button>

                {searchOpen ? (
                  <form
                    role="search"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitSearch(router, searchQuery);
                      setSearchOpen(false);
                    }}
                    className="static flex h-9 w-full translate-x-0 items-center overflow-hidden rounded-md border border-outline-variant/80 bg-surface-container-lowest px-1 shadow-sm ring-1 ring-transparent transition focus-within:border-primary focus-within:ring-primary/20 sm:h-10"
                  >
                    <input
                      autoFocus
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search SKU, keyword..."
                      aria-label="Search products by SKU or keyword"
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
                    />
                    <button type="submit" aria-label="Submit search" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary">
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                ) : null}
              </div>

              {user ? (
                <Link
                  href="/dashboard/wishlist"
                  aria-label="Wishlist"
                  className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg text-on-surface-variant transition hover:bg-slate-100 sm:grid md:h-10 md:w-10"
                >
                  <Heart className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
              ) : null}

            <button
              ref={cartButtonRef}
              type="button"
               aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
              onClick={openCart}
               className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-slate-100 active:scale-95 md:h-10 md:w-10"
             >
               <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative z-[120] ml-0 sm:ml-1 lg:ml-3" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                   className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white transition hover:bg-primary-container md:h-9 md:w-9"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  {user.name?.slice(0, 1).toUpperCase() || "U"}
                </button>
                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[1000] mt-2 w-max max-w-[calc(100vw-1rem)] origin-top-right rounded-lg border border-outline-variant bg-white p-1.5 shadow-xl transition-opacity duration-150 dark:bg-surface"
                  >
                    <span aria-hidden="true" className="absolute -top-1.5 right-3 size-3 rotate-45 border-l border-t border-outline-variant bg-surface" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="relative z-10 flex h-10 w-max items-center gap-2 whitespace-nowrap rounded-lg px-3 text-left text-sm font-semibold text-error transition hover:bg-error-container"
                    >
                      <LogOut className="size-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : !hasHydratedAuth ? (
              <div aria-hidden="true" className="ml-0 size-9 shrink-0 animate-pulse rounded-lg bg-surface-container-high sm:ml-1 lg:ml-3" />
            ) : (
              <Link
                href="/login"
                className="ml-0 inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-primary px-2 text-xs font-medium text-white transition hover:bg-primary-container sm:ml-1 sm:px-2.5 sm:text-sm md:h-9 md:px-3 lg:ml-3 lg:px-3 xl:px-4"
              >
                <LogIn className="h-4 w-4" />
                <span className="max-[359px]:hidden">Sign In</span>
              </Link>
            )}
          </div>
        </Container>
      </header>

      {showAccountStrip && (
        <div className="w-full border-b border-outline-variant/70 bg-gradient-to-r from-[#14213d] to-[#17479f]">
          <Container className="store-shell flex min-h-10 items-center justify-center py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:min-h-11 md:py-0">
            {user ? (
              <div className="mx-auto flex w-full flex-nowrap items-center justify-start gap-x-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] min-[360px]:gap-x-3 sm:gap-x-6 sm:justify-center lg:gap-8 [&::-webkit-scrollbar]:hidden">
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
                <BrandLogo className="h-6 w-auto max-w-[120px]" priority />
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-semibold transition hover:bg-surface-container-low ${
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
                   className="rounded-lg px-4 py-3 text-left text-base font-semibold text-error transition hover:bg-error-container"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-semibold text-primary transition hover:bg-surface-container-low"
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
      className={`relative inline-flex items-center gap-1 whitespace-nowrap px-1 py-1 text-[11px] font-medium transition-colors min-[360px]:px-1.5 min-[360px]:text-xs min-[440px]:gap-1.5 sm:gap-1.5 sm:px-2 sm:py-2 sm:text-[13px] md:text-sm ${
        active ? "text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary" : "text-blue-200 hover:text-white"
      }`}
    >
      <Icon className="hidden size-3.5 shrink-0 min-[440px]:block sm:size-4" />
      <span>{label}</span>
    </Link>
  );
}
