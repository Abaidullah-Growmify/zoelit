import { Button, Card } from "@/components/ui";

export const metadata = {
  title: "Careers at ZoeLit",
  description: "Explore future opportunities with the ZoeLit technology commerce team.",
  alternates: { canonical: "/careers" },
  openGraph: { title: "Careers at ZoeLit", description: "Explore future opportunities with the ZoeLit technology commerce team.", url: "/careers" },
};

export default function CareersPage() {
  return (
    <section className="container-page py-10 lg:py-16">
      <Card className="mx-auto max-w-3xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Company</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-on-surface">Careers at ZoeLit</h1>
        <p className="mt-4 text-base leading-7 text-on-surface-variant">We are building a thoughtful commerce experience for technology buyers. New opportunities will be published here as our team grows.</p>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">For now, tell us about your experience and the kind of work you would like to do with ZoeLit.</p>
        <Button asChild href="/contact" className="mt-6">Contact ZoeLit</Button>
      </Card>
    </section>
  );
}
