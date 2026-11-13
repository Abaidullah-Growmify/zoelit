import { Button, Card } from "@/components/ui";

export const metadata = {
  title: "About ZoeLit",
  description: "Learn how ZoeLit helps professionals find dependable technology and business equipment.",
  alternates: { canonical: "/about-us" },
  openGraph: { title: "About ZoeLit", description: "Learn how ZoeLit helps professionals find dependable technology and business equipment.", url: "/about-us" },
};

export default function AboutUsPage() {
  return (
    <section className="container-page py-10 lg:py-16">
      <Card className="mx-auto max-w-3xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Company</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-on-surface">About ZoeLit</h1>
        <p className="mt-4 text-base leading-7 text-on-surface-variant">ZoeLit helps professionals find dependable technology, connectivity, and business equipment from a carefully curated product network.</p>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">Our team focuses on clear product information, reliable fulfilment, and helpful support from discovery through delivery.</p>
        <Button asChild href="/contact" className="mt-6">Talk to our team</Button>
      </Card>
    </section>
  );
}
