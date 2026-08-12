import Link from "next/link";
import { ArrowRight, PackageCheck, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { getFeaturedProducts } from "@/lib/server-catalog";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button, Card, EmptyState, SectionHeader } from "@/components/ui";

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
              <SectionHeader eyebrow={section.eyebrow} title={section.title} action={<Link href="/products" aria-label="Open all products" className="grid size-9 place-items-center rounded-sm text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"><ArrowRight className="size-4" /></Link>} className="mb-8" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{section.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            </section>
          ))}
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
      <section className="container-page grid gap-4 pb-16 md:grid-cols-3">{[{ icon: Truck, title: "Clear fulfillment", text: "Shipping cost is visible before checkout and free shipping unlocks automatically." }, { icon: ShieldCheck, title: "Secure checkout", text: "Required fields, validation, and payment choice stay clear until order placement." }, { icon: PackageCheck, title: "Account control", text: "Customers can review orders, addresses, and profile details after purchase." }].map((item) => <Card key={item.title} className="shadow-sm"><item.icon className="size-8 text-blue-700 dark:text-blue-300" /><h3 className="mt-5 font-heading text-h2 font-semibold tracking-[-0.02em]">{item.title}</h3><p className="mt-2 text-body font-regular text-slate-600 dark:text-slate-300">{item.text}</p></Card>)}</section>
    </>
  );
}
