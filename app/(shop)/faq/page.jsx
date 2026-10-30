import { FAQAccordion } from "./faq-accordion";
import Link from "next/link";
import { ArrowRight, Package, Truck, UserRound } from "lucide-react";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";
import { Card } from "@/components/ui";

const faqs = [
  { question: "How do I track my order?", answer: "Sign in and open Dashboard > My Orders. Each order detail page shows the current status, payment state, tracking number when available, and timeline." },
  { question: "Can I checkout as a guest?", answer: "The checkout UI is ready for guest checkout. You can place a demo order from the cart without creating a real external account." },
  { question: "Is my cart saved?", answer: "Yes. The cart uses local browser persistence so items remain available after refreshes or returning to the site later." },
  { question: "What is the return window?", answer: "Eligible items can be returned within 30 days as long as they are unused and in their original packaging." },
  { question: "How do I update my address?", answer: "Open Dashboard > Addresses to add, delete, or set a default shipping address. Edit UI hooks are prepared for production integration." },
  { question: "What payment methods are supported?", answer: "The current implementation includes checkout-ready UI. Production payment providers such as Stripe or PayPal can be connected to the same flow." },
];

export const metadata = { title: "FAQ | ZoeLit Commerce" };

export default function FAQPage() {
  return (
    <section className="container-page min-w-0 py-6 sm:py-10 lg:py-14">
      <div className="mb-6 lg:mb-8">
        <DashboardSectionBanner eyebrow="Support Center" title="How can we help?" description="Find clear answers about orders, checkout, account tools, and your shopping experience." />
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4">
        <SupportCard icon={Package} title="Products & stock" text="Find products, compare options, and check SKU availability." />
        <SupportCard icon={Truck} title="Orders & delivery" text="Get help with order status, delivery, returns, and tracking." />
        <SupportCard icon={UserRound} title="Account support" text="Manage your profile, addresses, wishlist, and sign-in access." />
      </div>

      <div className="mt-8 flex min-w-0 flex-col items-start justify-between gap-3 border-b border-outline-variant/70 pb-4 sm:mt-10 sm:flex-row sm:items-end sm:gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Knowledge base</p><h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Frequently asked questions</h2></div>
        <Link href="/contact" className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5 sm:flex">Contact us <ArrowRight className="size-4" /></Link>
      </div>
      <FAQAccordion faqs={faqs} />
      <Card className="group mt-6 flex w-full min-w-0 flex-col gap-4 border-primary/20 bg-gradient-to-r from-primary to-primary-container p-4 text-white shadow-sm sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Need more help?</p><h2 className="mt-1 font-heading text-xl font-bold sm:text-2xl">Our support team is ready to assist</h2><p className="mt-2 text-sm leading-6 text-white/75">If you could not find the answer you need, send us your question and we will help you with the next step.</p></div>
        <Link href="/contact" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-white/90 sm:w-auto">Contact support <ArrowRight className="size-4 transition group-hover:translate-x-1" /></Link>
      </Card>
    </section>
  );
}

function SupportCard({ icon: Icon, title, text }) {
  return <Card className="flex min-w-0 items-start gap-3 border-outline-variant/70 p-4 shadow-sm sm:p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="min-w-0"><h3 className="text-sm font-bold text-on-surface">{title}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{text}</p></div></Card>;
}
