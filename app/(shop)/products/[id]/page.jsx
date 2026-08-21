import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { getFeaturedProducts, getServerProduct } from "@/lib/server-catalog";
import { money } from "@/lib/utils";
import { ProductBuy } from "./product-buy";
import { ProductTabs } from "./product-tabs";
import { ProductImageZoom } from "./product-image-zoom";
import { ProductCard } from "@/components/product-card";
import { Card, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getServerProduct(id);
  return { title: product ? `${product.name} | ZoeLit Commerce` : "Product" };
}

function TrustTiles({ product }) {
  const tiles = [
    { icon: Truck, label: "Shipping shown before checkout" },
    { icon: ShieldCheck, label: "Secure, validated checkout" },
    { icon: RotateCcw, label: product.details?.Warranty ? `Includes ${product.details.Warranty} warranty` : "Account and order tracking" },
  ];

  return (
    <div className="mt-6 grid gap-3 border-t border-outline-variant/40 pt-5 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex items-start gap-2.5">
          <tile.icon className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-label-sm font-semibold leading-5 text-on-surface-variant">{tile.label}</span>
        </div>
      ))}
    </div>
  );
}

function YouMayAlsoLike({ currentId, products }) {
  const related = products.filter((product) => product.id !== currentId).slice(0, 4);

  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="Keep browsing"
        title="You may also like"
        action={
          <Link href="/products" aria-label="View all products" className="inline-flex h-9 items-center gap-2 rounded-sm px-3 text-label-md font-semibold text-primary transition duration-200 ease-out hover:bg-surface-container-low">
            View all
            <ArrowRight className="size-4" />
          </Link>
        }
        className="mb-8"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getServerProduct(id);
  if (!product) notFound();

  const featured = await getFeaturedProducts();

  return (
    <section className="container-page py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-md font-semibold text-on-surface-variant">
        <Link href="/" className="transition hover:text-primary">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="transition hover:text-primary">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] lg:gap-14">
        <div className="self-start lg:sticky lg:top-24">
          <ProductImageZoom product={product} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              {product.category}
            </span>
            {product.rating > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-secondary text-secondary" aria-hidden="true" />
                <span className="text-label-sm font-bold text-on-surface">{product.rating}</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-label-sm font-bold text-tertiary">
              <CheckCircle2 className="size-4" />
              {product.stock} in stock
            </span>
          </div>

          <h1 className="mt-4 max-w-2xl text-balance font-heading text-headline-md font-extrabold leading-tight tracking-[-0.03em] text-on-surface sm:text-headline-lg">
            {product.name}
          </h1>

          <div className="mt-5 flex items-end gap-4">
            <span className="font-heading text-headline-lg font-extrabold tabular-nums tracking-[-0.03em] text-on-surface">{money(product.price)}</span>
            <span className="pb-1 text-label-md font-semibold text-on-surface-variant">Tax and shipping at checkout</span>
          </div>

          <p className="mt-6 max-w-xl text-body-md leading-7 text-on-surface-variant">{product.description}</p>

          <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-label-md font-medium leading-6 text-on-surface-variant">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {highlight}
              </li>
            ))}
          </ul>

          <Card className="mt-9 p-5 sm:p-6">
            <ProductBuy product={product} />

            <TrustTiles product={product} />
          </Card>
        </div>
      </div>

      <div className="mt-14">
        <ProductTabs product={product} />
      </div>

      <YouMayAlsoLike currentId={product.id} products={featured} />
    </section>
  );
}
