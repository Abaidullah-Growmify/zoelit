import Link from "next/link";
import { Phone, Mail, MapPin, Link2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-lowest pt-16 pb-6">
      <div className="mx-auto mb-16 grid max-w-[1280px] grid-cols-1 gap-6 px-5 md:grid-cols-4 md:px-16">
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-heading text-headline-md font-bold tracking-[-0.02em] text-primary">
            ZoelLit
          </Link>
          <p className="max-w-xs text-body-md leading-6 text-on-surface-variant">
            Curated network and connectivity solutions for professionals and businesses.
          </p>
          <div className="mt-1 flex gap-2 opacity-80 transition-opacity hover:opacity-100">
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition duration-200 ease-out hover:border-primary hover:text-primary" href="#" aria-label="Social link">
              <Link2 className="size-[18px]" />
            </a>
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition duration-200 ease-out hover:border-primary hover:text-primary" href="#" aria-label="Call us">
              <Phone className="size-[18px]" />
            </a>
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition duration-200 ease-out hover:border-primary hover:text-primary" href="#" aria-label="Email us">
              <Mail className="size-[18px]" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em] text-on-surface">Shop</h4>
          <ul className="flex flex-col gap-2">
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">All Products</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">New Arrivals</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Best Sellers</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Deals</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em] text-on-surface">Company</h4>
          <ul className="flex flex-col gap-2">
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">About Us</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Careers</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">News &amp; Updates</a></li>
            <li><a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em] text-on-surface">Contact</h4>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2 text-on-surface-variant">
              <Phone className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">+1 (917) 937 0201</span>
            </li>
            <li className="flex items-start gap-2 text-on-surface-variant">
              <Mail className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">info@zoelit.com</span>
            </li>
            <li className="flex items-start gap-2 text-on-surface-variant">
              <MapPin className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">
                681 Business Blvd, 6th<br />
                Floor, Northcrest, NY 12345
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-outline-variant px-5 pt-6 text-center md:flex-row md:px-16 md:text-left">
        <p className="text-body-md leading-6 text-on-surface-variant">© 2024 ZoelLit. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6 md:justify-end">
          <a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Privacy Policy</a>
          <a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Terms of Service</a>
          <a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Shipping Policy</a>
          <a className="text-body-md leading-6 text-on-surface-variant transition-colors hover:text-primary hover:underline" href="#">Return Center</a>
        </div>
      </div>
    </footer>
  );
}
