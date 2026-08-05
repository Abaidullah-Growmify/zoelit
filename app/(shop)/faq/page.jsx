import { FAQAccordion } from "./faq-accordion";

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
    <section className="container-page py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-bold text-blue-600">FAQ</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Frequently asked questions</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Clear answers about orders, checkout, account tools, and support.</p>
      </div>
      <FAQAccordion faqs={faqs} />
    </section>
  );
}
