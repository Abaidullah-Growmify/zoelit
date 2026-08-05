"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, Card } from "@/components/ui";

export function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <Card className="group overflow-hidden p-3 transition hover:-translate-y-1 hover:shadow-2xl">
      <Link href={`/products/${product.id}`} className="block overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Image src={product.image} alt={product.name} width={700} height={700} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{product.category}</span>
          <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{product.rating}</span>
        </div>
        <Link href={`/products/${product.id}`} className="font-bold text-slate-950 transition hover:text-blue-600 dark:text-white">{product.name}</Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-black text-blue-600">{money(product.price)}</span>
          <Button size="sm" variant="secondary" onClick={() => { addItem(product.id); toast.success(`${product.name} added to cart`); }} aria-label={`Add ${product.name} to cart`}>
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
