import Link from "next/link";
import { Phone, Mail, MapPin, Link2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer w-full border-t pt-16 pb-6">
      <div className="mx-auto mb-16 grid max-w-[1280px] grid-cols-1 gap-6 px-5 md:grid-cols-4 md:px-16">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center">
            <BrandLogo variant="auto" className="h-7 w-auto" />
          </Link>
          <p className="max-w-xs text-body-md leading-6">
            Curated network and connectivity solutions for professionals and businesses.
          </p>
          <div className="mt-1 flex gap-2 opacity-80 transition-opacity hover:opacity-100">
            <a className="footer-social flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Social link">
              <Link2 className="size-[18px]" />
            </a>
            <a className="footer-social flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Call us">
              <Phone className="size-[18px]" />
            </a>
            <a className="footer-social flex h-10 w-10 items-center justify-center rounded-full border transition duration-200 ease-out" href="#" aria-label="Email us">
              <Mail className="size-[18px]" />
            </a>
          </div>
        </div>

        <div>
           <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em]">Shop</h4>
          <ul className="flex flex-col gap-2">
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">All Products</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">New Arrivals</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">Best Sellers</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">Deals</a></li>
          </ul>
        </div>

        <div>
           <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em]">Company</h4>
          <ul className="flex flex-col gap-2">
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">About Us</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">Careers</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">News &amp; Updates</a></li>
             <li><a className="footer-link text-body-md leading-6 transition-colors" href="#">Contact Us</a></li>
          </ul>
        </div>

        <div>
           <h4 className="mb-4 text-label-md font-semibold tracking-[0.05em]">Contact</h4>
          <ul className="flex flex-col gap-2">
             <li className="footer-contact flex items-start gap-2">
              <Phone className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">+1 (917) 937 0201</span>
            </li>
             <li className="footer-contact flex items-start gap-2">
              <Mail className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">info@zoelit.com</span>
            </li>
             <li className="footer-contact flex items-start gap-2">
              <MapPin className="mt-0.5 size-5 text-primary" />
              <span className="text-body-md leading-6">
                681 Business Blvd, 6th<br />
                Floor, Northcrest, NY 12345
              </span>
            </li>
          </ul>
        </div>
      </div>

       <div className="footer-bottom mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t px-5 pt-6 text-center md:flex-row md:px-16 md:text-left">
         <p className="text-body-md leading-6">© 2024 ZoeLit. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6 md:justify-end">
           <a className="footer-link text-body-md leading-6 transition-colors" href="#">Privacy Policy</a>
           <a className="footer-link text-body-md leading-6 transition-colors" href="#">Terms of Service</a>
           <a className="footer-link text-body-md leading-6 transition-colors" href="#">Shipping Policy</a>
           <a className="footer-link text-body-md leading-6 transition-colors" href="#">Return Center</a>
        </div>
      </div>
    </footer>
  );
}
