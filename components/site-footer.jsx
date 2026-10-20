"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, MapPin, Phone, Link2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useStoreConfig } from "@/components/store-config-provider";
import { Button, Input } from "@/components/ui";
import { subscribeNewsletter } from "@/lib/api";

const FALLBACK_PHONE = "+1 (917) 937 0201";
const FALLBACK_EMAIL = "info@zoelit.com";
const FALLBACK_ADDRESS = "681 Business Blvd, 6th Floor,\nNorthcrest, NY 12345";

const linkClass =
  "footer-link flex min-h-11 items-center text-body-md leading-6 transition-colors";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Store" },
  { href: "/faq", label: "Support" },
  { href: "/contact", label: "Contact" },
];

const CARE_LINKS = [
  { href: "/faq", label: "Shipping & Delivery" },
  { href: "/faq", label: "Returns & Refunds" },
  { href: "/dashboard/orders", label: "Track Order" },
  { href: "/faq", label: "FAQs" },
];

const SOCIALS = [
  { href: "#", label: "Facebook", Icon: FacebookIcon },
  { href: "#", label: "X", Icon: XIcon },
  { href: "#", label: "Instagram", Icon: InstagramIcon },
  { href: "#", label: "YouTube", Icon: YoutubeIcon },
];

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function SiteFooter() {
  const { name, email, phone, address } = useStoreConfig();
  const storeName = name || "ZoeLit";
  const storeEmail = email || FALLBACK_EMAIL;
  const storePhone = phone || FALLBACK_PHONE;
  const storeAddress = address || FALLBACK_ADDRESS;
  const copyright = `(c) 2026 ${storeName}. All rights reserved.`;
  return (
    <footer className="site-footer w-full border-t pb-2 md:pb-3">
      {/* Mobile layout (unchanged). */}
      <div className="md:hidden">
        <div className="container-page pt-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            <div className="flex min-w-0 flex-col gap-5 col-span-2">
              <div className="flex flex-col items-start gap-3">
                <Link href="/" className="flex items-start">
                  <BrandLogo variant="dark" crop className="w-36 max-w-full sm:w-40" />
                </Link>
                <p className="min-w-0 text-body-md leading-6">
                  Curated network and connectivity solutions for professionals and businesses.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="footer-social flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Social link">
                  <Link2 className="size-[18px]" />
                </a>
                <a className="footer-social flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Call us">
                  <Phone className="size-[18px]" />
                </a>
                <a className="footer-social flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Email us">
                  <Mail className="size-[18px]" />
                </a>
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em]">Shop</h4>
              <ul className="flex flex-col">
                <li><Link className={linkClass} href="/products">All Products</Link></li>
                <li><Link className={linkClass} href="/products">Categories</Link></li>
                <li><Link className={linkClass} href="/faq">Support</Link></li>
                <li><Link className={linkClass} href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em]">Company</h4>
              <ul className="flex flex-col">
                <li><a className={linkClass} href="#">About Us</a></li>
                <li><a className={linkClass} href="#">Careers</a></li>
                <li><a className={linkClass} href="#">News &amp; Updates</a></li>
                <li><a className={linkClass} href="#">Contact Us</a></li>
              </ul>
            </div>

            <div className="min-w-0 footer-mobile-contact">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em]">Contact</h4>
              <ul className="flex flex-col">
                <li className="footer-contact flex items-start gap-2">
                  <Phone className="mt-3 size-5 shrink-0 text-primary" />
                  <a className="flex min-h-11 items-center text-body-md leading-6 transition-colors hover:text-primary" href={`tel:${storePhone.replace(/[^\d+]/g, "")}`}>{storePhone}</a>
                </li>
                <li className="footer-contact flex items-start gap-2">
                  <Mail className="mt-3 size-5 shrink-0 text-primary" />
                  <a className="flex min-h-11 items-center text-body-md leading-6 transition-colors hover:text-primary" href={`mailto:${storeEmail}`}>{storeEmail}</a>
                </li>
                <li className="footer-contact flex items-start gap-2">
                  <MapPin className="mt-3 size-5 shrink-0 text-primary" />
                  <span className="whitespace-pre-line pt-3 text-body-md leading-6">{storeAddress}</span>
                </li>
              </ul>
            </div>

            <div className="min-w-0 footer-mobile-newsletter">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em]">Newsletter</h4>
              <p className="mb-3 text-body-md leading-6">Get the latest updates and offers.</p>
              <FooterNewsletter />
            </div>
          </div>
        </div>

        <div className="container-page">
          <div className="footer-bottom flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t py-5 pb-3 text-center">
            <p className="text-body-md leading-6">{copyright}</p>
          </div>
        </div>
      </div>

      {/* Tablet + desktop layout (reference design). */}
      <div className="hidden md:block">
        <div className="container-page pt-12 md:pt-14">
          <div className="grid items-start gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="min-w-0">
              <Link href="/" className="flex items-start">
                <BrandLogo variant="dark" crop className="w-36 md:w-40 lg:w-44" />
              </Link>
              <p className="mt-4 max-w-xs text-body-md leading-6">
                Better technology, thoughtfully chosen.
              </p>
              <div className="mt-4 flex items-center gap-1">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a key={label} href={href} aria-label={label} className="footer-social grid h-10 w-10 place-items-center rounded-full transition duration-200 ease-out">
                    <Icon className="size-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em] md:mb-3">Quick Links</h4>
              <ul className="flex flex-col">
                {QUICK_LINKS.map((item) => (
                  <li key={item.href + item.label}><Link className={linkClass} href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em] md:mb-3">Customer Care</h4>
              <ul className="flex flex-col">
                {CARE_LINKS.map((item) => (
                  <li key={item.label}><Link className={linkClass} href={item.href}>{item.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-body-lg font-semibold tracking-[0.05em] md:mb-3">Newsletter</h4>
              <p className="mb-3 text-body-md leading-6">Get the latest updates and offers.</p>
              <FooterNewsletter />
            </div>
          </div>
        </div>

        <div className="container-page">
          <div className="footer-bottom flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t py-5 pb-3">
            <p className="text-body-md leading-6">{copyright}</p>
            <div className="flex items-center gap-4">
              <Link className="footer-link inline-flex min-h-11 items-center text-body-md leading-6 transition-colors" href="/privacy-policy">Privacy Policy</Link>
              <Link className="footer-link inline-flex min-h-11 items-center text-body-md leading-6 transition-colors" href="/privacy-policy">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });
    try {
      const data = await subscribeNewsletter({ email });
      setStatus({ type: "success", message: data.message || "Subscription confirmed." });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not complete your subscription." });
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Subscribe to newsletter">
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="h-11 min-w-0 flex-1 rounded-lg border-0 bg-white text-on-surface shadow-sm focus:ring-2 focus:ring-primary/40"
        />
        <Button type="submit" disabled={status.type === "loading"} className="h-11 shrink-0 rounded-md bg-[#2f6fed] px-4 text-white hover:bg-[#1d54c8]">
          {status.type === "loading" ? "Joining..." : "Subscribe"}
          {status.type !== "loading" ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
      <p className={`mt-2 text-label-sm font-medium leading-5 ${status.type === "error" ? "text-error" : status.type === "success" ? "text-emerald-300" : ""}`} role={status.type === "idle" ? undefined : "status"}>
        {status.message}
      </p>
    </form>
  );
}
