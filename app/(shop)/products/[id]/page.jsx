import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Truck } from "lucide-react";
import { getProduct, products } from "@/lib/data";
import { money } from "@/lib/utils";
import { AddToCartButton } from "./product-actions";
import { Badge, Card } from "@/components/ui";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} | ZoeLit Commerce` : "Product" };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <section className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <Card className="p-3"><Image src={product.image} alt={product.name} width={1000} height={1000} priority className="aspect-square w-full rounded-lg object-cover" /></Card>
        <div className="self-center"><Badge>{product.category}</Badge><h1 className="mt-5 text-4xl font-black md:text-5xl">{product.name}</h1><div className="mt-4 flex items-center gap-4"><span className="text-3xl font-black text-blue-600">{money(product.price)}</span><span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500"><Star className="size-4 fill-amber-400 text-amber-400" />{product.rating}</span></div><p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">{product.description}</p><div className="mt-7 flex items-center gap-2 text-sm font-semibold text-emerald-600"><Truck className="size-4" />In stock: {product.stock} units. Free shipping over $150.</div><AddToCartButton product={product} /><Card className="mt-8 bg-blue-50 shadow-none dark:bg-blue-500/10"><h2 className="font-black">Why customers love it</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Premium materials, clean design, easy returns, and a checkout flow designed to prevent surprises.</p></Card></div>
      </div>
    </section>
  );
}
