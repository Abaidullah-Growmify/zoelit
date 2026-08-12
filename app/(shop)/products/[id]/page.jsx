import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { getFeaturedProducts, getServerProduct } from "@/lib/server-catalog";
import { money } from "@/lib/utils";
import { ProductBuy } from "./product-buy";
import { ProductTabs } from "./product-tabs";
import { ProductImageZoom } from "./product-image-zoom";
import { ProductCard } from "@/components/product-card";
import { Badge, Card, SectionHeader } from "@/components/ui";

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
    <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3 dark:border-slate-800">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex items-start gap-2.5">
          <tile.icon className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
          <span className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">{tile.label}</span>
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
          <Link href="/products" aria-label="Open all products" className="grid size-9 place-items-center rounded-sm text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
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
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="transition hover:text-blue-600 dark:hover:text-blue-300">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="transition hover:text-blue-600 dark:hover:text-blue-300">Products</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-950 dark:text-white">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] lg:gap-14">
        <div className="self-start lg:sticky lg:top-24">
          <ProductImageZoom product={product} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge>{product.category}</Badge>
            {product.rating > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{product.rating}</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              {product.stock} in stock
            </span>
          </div>

          <h1 className="mt-4 max-w-2xl text-balance font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-slate-950 md:text-5xl dark:text-white">
            {product.name}
          </h1>

          <div className="mt-5 flex items-end gap-4">
            <span className="font-heading text-4xl font-extrabold tabular-nums tracking-[-0.035em] text-slate-950 dark:text-white">{money(product.price)}</span>
            <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Tax and shipping at checkout</span>
          </div>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>

          <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                <Check className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
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