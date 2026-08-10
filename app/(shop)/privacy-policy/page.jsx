import { Card, PageHeader } from "@/components/ui";

const sections = [
  { title: "Information We Collect", text: "We collect account details, contact information, shipping addresses, order history, and checkout-related data needed to provide the shopping experience." },
  { title: "How We Use Information", text: "Information is used to process orders, provide customer support, personalize your account experience, prevent fraud, and improve site performance." },
  { title: "Cart and Account Storage", text: "Cart and demo authentication state may be stored locally in your browser so your experience remains consistent between visits." },
  { title: "Sharing and Service Providers", text: "Production integrations may share only necessary data with payment, shipping, analytics, and support providers that help operate the store." },
  { title: "Your Choices", text: "You may request updates, deletion, or access to your personal information by contacting support. You can also clear local browser storage at any time." },
  { title: "Security", text: "The interface is designed for secure checkout patterns, clear validation, and protected account routes. Production deployments should use HTTPS and secure auth providers." },
];

export const metadata = { title: "Privacy Policy | ZoeLit Commerce" };

export default function PrivacyPolicyPage() {
  return (
    <section className="container-page py-12">
      <PageHeader eyebrow="Privacy" title="Privacy Policy" description="Last updated August 5, 2026. This page explains how ZoeLit Commerce handles customer information in this e-commerce experience." align="center" />
      <div className="mx-auto mt-10 grid max-w-4xl gap-5">
        {sections.map((section) => (
          <Card key={section.title} className="shadow-none">
            <h2 className="font-heading text-h2 font-semibold">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{section.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
