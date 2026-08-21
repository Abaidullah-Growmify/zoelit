import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-16 pb-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto mb-16 grid max-w-[1280px] grid-cols-1 gap-6 px-5 md:grid-cols-4 md:px-16">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-2xl font-bold tracking-[-0.02em] text-blue-700 dark:text-blue-300">
            ZoelLit
          </Link>
          <p className="max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
            Curated network and connectivity solutions for professionals and businesses.
          </p>
          <div className="mt-1 flex gap-2 opacity-80 transition-opacity hover:opacity-100">
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300" href="#" aria-label="Social link">
              <span className="material-symbols-outlined text-[18px]">link</span>
            </a>
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300" href="#" aria-label="Call us">
              <span className="material-symbols-outlined text-[18px]">call</span>
            </a>
            <a className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300" href="#" aria-label="Email us">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-slate-900 dark:text-white">Shop</h4>
          <ul className="flex flex-col gap-2">
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">All Products</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">New Arrivals</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Best Sellers</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Deals</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-slate-900 dark:text-white">Company</h4>
          <ul className="flex flex-col gap-2">
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">About Us</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Careers</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">News &amp; Updates</a></li>
            <li><a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-slate-900 dark:text-white">Contact</h4>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined mt-0.5 text-[20px] text-blue-700 dark:text-blue-300">call</span>
              <span className="text-sm leading-6">+1 (917) 937 0201</span>
            </li>
            <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined mt-0.5 text-[20px] text-blue-700 dark:text-blue-300">mail</span>
              <span className="text-sm leading-6">info@zoelit.com</span>
            </li>
            <li className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined mt-0.5 text-[20px] text-blue-700 dark:text-blue-300">location_on</span>
              <span className="text-sm leading-6">
                681 Business Blvd, 6th<br />
                Floor, Northcrest, NY 12345
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 pt-6 text-center md:flex-row md:px-16 md:text-left dark:border-slate-800">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">© 2024 ZoelLit. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6 md:justify-end">
          <a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Privacy Policy</a>
          <a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Terms of Service</a>
          <a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Shipping Policy</a>
          <a className="text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 hover:underline dark:text-slate-300 dark:hover:text-blue-300" href="#">Return Center</a>
        </div>
      </div>
    </footer>
  );
}
