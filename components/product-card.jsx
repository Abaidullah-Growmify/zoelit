"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, Card } from "@/components/ui";

export function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-lg border-slate-200 bg-white p-0 shadow-sm ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10 hover:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/40 dark:hover:ring-blue-500/10">
      <Link href={`/products/${product.id}`} className="block p-3 pb-0 focus-visible:outline-none">
        <div className="relative overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top_left,#ffffff_0,#eff6ff_45%,#dbeafe_100%)] p-3 transition duration-300 group-hover:bg-[radial-gradient(circle_at_top_left,#ffffff_0,#dbeafe_45%,#bfdbfe_100%)] dark:bg-[radial-gradient(circle_at_top_left,#1e293b_0,#0f172a_52%,#172554_100%)]">
          <Image src={product.image} alt={product.name} width={700} height={700} className="aspect-square w-full rounded-lg object-cover shadow-sm transition duration-500 group-hover:scale-[1.035] group-hover:shadow-md" />
          <span className="absolute left-5 top-5 rounded-lg bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur dark:bg-slate-950/90 dark:text-blue-300">{product.category}</span>
          <span className="absolute bottom-5 right-5 inline-flex translate-y-2 items-center gap-1 rounded-lg bg-slate-950/85 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            View details <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-3.5" /> {product.stock} in stock</span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-slate-800 dark:bg-amber-500/10 dark:text-slate-100"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {product.rating}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <Link href={`/products/${product.id}`} className="text-xl font-black leading-tight tracking-tight text-slate-950 transition hover:text-blue-600 focus-visible:outline-none focus-visible:text-blue-600 dark:text-white dark:hover:text-blue-300 dark:focus-visible:text-blue-300">{product.name}</Link>
          <span className="shrink-0 text-xl font-black tracking-tight text-blue-600">{money(product.price)}</span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{product.description}</p>
        <div className="mt-auto border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button className="w-full rounded-lg shadow-lg shadow-blue-600/20 active:translate-y-0" onClick={() => { addItem(product.id); toast.success(`${product.name} added to cart`); }} aria-label={`Add ${product.name} to cart`}>
            <ShoppingBag className="size-4" /> Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
