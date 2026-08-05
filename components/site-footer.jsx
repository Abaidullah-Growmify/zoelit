import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/", label: "About us" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Store Locations" },
      { href: "#", label: "Our Blog" },
      { href: "#", label: "Reviews" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/products", label: "Game & Video" },
      { href: "/products", label: "Phone & Tablets" },
      { href: "/products", label: "Computers & Laptop" },
      { href: "/products", label: "Sport Watches" },
      { href: "/products", label: "Discounts" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQs" },
      { href: "/privacy-policy", label: "Privacy & Policy" },
      { href: "#", label: "Terms & Conditions" },
      { href: "/contact", label: "Contact us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <section className="container-page py-12">
        <div className="rounded-lg bg-blue-600 p-8 text-white shadow-2xl shadow-blue-600/20 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">Premium commerce support</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Have a project in mind? Let&apos;s talk.</h2>
              <p className="mt-3 max-w-2xl text-blue-50">Reach Zoel IT for product questions, project enquiries, office information, and customer support.</p>
            </div>
            <Button asChild href="/contact" variant="outline" className="border-white/30 bg-white text-blue-700 hover:bg-blue-50">Contact Support</Button>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 border-t border-slate-200 py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr] dark:border-slate-800">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight"><span className="text-blue-600">Zoe</span>Lit</Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">The home and elements needed to create beautiful products.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="flex items-center gap-3"><Mail className="size-4 text-blue-600" /> info@zoelit.com</p>
            <p className="flex items-center gap-3"><Phone className="size-4 text-blue-600" /> +44 749637 9004</p>
            <p className="flex items-center gap-3"><Phone className="size-4 text-blue-600" /> +44 161 791 5621</p>
            <p className="flex items-center gap-3"><Phone className="size-4 text-blue-600" /> +92 3007404044</p>
            <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 text-blue-600" /> 66 Seymour Grove, Old Trafford, Manchester, M16 0LN, England</p>
            <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 text-blue-600" /> 123 - CC - Citi Housing Society, Gujranwala, 52310, Pakistan</p>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-black text-slate-950 dark:text-white">{column.title}</h3>
            <nav className="mt-4 grid gap-3">
              {column.links.map((link) => (
                <Link key={`${column.title}-${link.label}`} href={link.href} className="text-sm font-medium text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">{link.label}</Link>
              ))}
            </nav>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-200 py-5 dark:border-slate-800">
        <div className="container-page flex flex-col justify-between gap-3 text-sm text-slate-500 md:flex-row dark:text-slate-400">
          <p>Copyright © 2026 by Zoel IT All rights reserved</p>
          <p>Company Registration Number: 15458184</p>
        </div>
      </section>
    </footer>
  );
}
