import Link from "next/link";
import { ArrowRight, Mail, PackageCheck, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { getFeaturedProducts } from "@/lib/server-catalog";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button, Card, EmptyState, Input, SectionHeader } from "@/components/ui";

export default async function HomePage() {
  const products = await getFeaturedProducts();
  const heroProducts = products.slice(0, 4);
  const productSections = [
    { eyebrow: "Top Sale", title: "Best deals this week", products: products.slice(4, 8) },
    { eyebrow: "New Arrivals", title: "Fresh picks just landed", products: products.slice(8, 12) },
    { eyebrow: "Trending", title: "Popular right now", products: products.slice(12, 16) },
  ];

  return (
    <>
      {products.length ? (
        <>
          <HomeHero products={heroProducts} />
          {productSections.map((section, index) => (
            <section key={section.eyebrow} className={`container-page ${index === 0 ? "section-fade-up py-16" : "pb-16"}`}>
              <SectionHeader eyebrow={section.eyebrow} title={section.title} action={<Link href="/products" aria-label="View all products" className="inline-flex h-9 items-center gap-2 rounded-sm px-3 text-label-md font-semibold text-primary transition duration-200 ease-out hover:bg-surface-container-low dark:hover:bg-surface-container-low">View all<ArrowRight className="size-4" /></Link>} className="mb-8" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{section.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            </section>
          ))}
          <section className="container-page pb-16">
            <Card className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1.5 text-label-sm font-bold uppercase tracking-[0.12em] text-primary ring-1 ring-primary/10">
                    <Mail className="size-4" />
                    Newsletter
                  </span>
                  <h2 className="mt-5 max-w-2xl text-balance font-heading text-headline-lg-mobile font-bold tracking-[-0.03em] text-on-surface sm:text-headline-lg">
                    Subscribe for Latest Trends & Offers
                  </h2>
                  <p className="mt-4 max-w-xl text-body-md leading-7 text-on-surface-variant">
                    Get fresh arrivals, limited-time deals, and smart shopping notes delivered straight to your inbox.
                  </p>
                </div>
                <form className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-3 shadow-sm dark:bg-surface-container" aria-label="Subscribe for latest trends and offers">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input type="email" name="email" placeholder="Enter your email" aria-label="Email address" className="h-12 flex-1 bg-surface-container-lowest" />
                    <Button type="button" className="h-12 px-6 text-white">
                      Subscribe
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-3 text-label-sm font-medium leading-5 text-on-surface-variant">No spam. Just ZoeLit picks, offers, and product updates.</p>
                </form>
              </div>
            </Card>
          </section>
        </>
      ) : (
        <section className="container-page py-16">
          <EmptyState
            icon={PackageSearch}
            title="No products in the catalog yet"
            description="The catalog has not been loaded yet. Please check back shortly or contact support."
            action={<Button asChild href="/admin/products"><ArrowRight className="size-4" />Go to admin</Button>}
          />
        </section>
      )}
      <section className="container-page grid gap-4 pb-16 md:grid-cols-3">{[{ icon: Truck, title: "Clear fulfillment", text: "Shipping cost is visible before checkout and free shipping unlocks automatically." }, { icon: ShieldCheck, title: "Secure checkout", text: "Required fields, validation, and payment choice stay clear until order placement." }, { icon: PackageCheck, title: "Account control", text: "Customers can review orders, addresses, and profile details after purchase." }].map((item) => <Card key={item.title} className="shadow-sm"><item.icon className="size-8 text-primary" /><h3 className="mt-5 font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">{item.title}</h3><p className="mt-2 text-body-md font-normal text-on-surface-variant">{item.text}</p></Card>)}</section>
    </>
  );
}
