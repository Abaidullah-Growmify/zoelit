import { Button, Card } from "@/components/ui";

export const metadata = {
  title: "News and Updates",
  description: "Read ZoeLit product highlights, service improvements, and company updates.",
  alternates: { canonical: "/news-updates" },
  openGraph: { title: "News and Updates | ZoeLit", description: "Read ZoeLit product highlights, service improvements, and company updates.", url: "/news-updates" },
};

export default function NewsUpdatesPage() {
  return (
    <section className="container-page py-10 lg:py-16">
      <Card className="mx-auto max-w-3xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Company</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-on-surface">News &amp; updates</h1>
        <p className="mt-4 text-base leading-7 text-on-surface-variant">Product highlights, service improvements, and ZoeLit announcements will appear here.</p>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">Subscribe to the newsletter to receive the latest updates and offers in your inbox.</p>
        <Button asChild href="/contact" className="mt-6">Get in touch</Button>
      </Card>
    </section>
  );
}
