"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useProductStore } from "@/store/product-store";
import { money } from "@/lib/utils";
import { Card } from "@/components/ui";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";

export function CartItemCard({ item, updateQuantity, removeItem }) {
  const storeProduct = useProductStore((state) => state.getById(item.productId));
  const product = item.name ? item : storeProduct;
  const displayProduct = product || {
    name: item.name || item.productId,
    image: item.image || FALLBACK_IMAGE,
    description: item.description || "",
    stock: item.stock || 0,
    price: item.price || 0,
  };

  const maxStock = Math.max(Number(displayProduct.stock ?? item.stock ?? 0) || 0, 1);
  const price = Number(item.price ?? displayProduct.price ?? 0) || 0;
  const quantity = Math.floor(Number(item.quantity)) || 0;

  return (
    <Card className="relative overflow-hidden rounded-lg bg-slate-50 p-4 shadow-sm transition duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10 dark:bg-slate-900 dark:hover:border-blue-500/40">
      <div className="flex gap-5">
        <Image src={displayProduct.image} alt={displayProduct.name} width={240} height={240} className="size-30 shrink-0 rounded-lg object-cover" />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0 pr-10">
            <h2 className="line-clamp-2 max-w-xl font-heading text-h2 font-semibold leading-tight tracking-tight text-slate-950 dark:text-white">{displayProduct.name}</h2>
            <p className="mt-1 line-clamp-1 max-w-xl text-body leading-5 text-slate-500 dark:text-slate-400">{displayProduct.description}</p>
            <p className="mt-2 text-base font-semibold tabular-nums text-slate-500 dark:text-slate-400">Each {money(price)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
              <button className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, quantity - 1)} aria-label={`Decrease ${displayProduct.name} quantity`}>
                <Minus className="size-4" />
              </button>
              <span className="min-w-5 text-center text-base font-semibold tabular-nums text-slate-950 dark:text-white">{quantity}</span>
              <button className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, quantity + 1)} disabled={quantity >= maxStock} aria-label={`Increase ${displayProduct.name} quantity`}>
                <Plus className="size-4" />
              </button>
            </div>
            <p className="shrink-0 text-right text-lg font-semibold tabular-nums text-slate-950 dark:text-white">{money(price * (quantity || 1))}</p>
          </div>
        </div>

        <button className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" onClick={() => removeItem(item.productId)} aria-label={`Remove ${displayProduct.name}`}>
          <Trash2 className="size-5" />
        </button>
      </div>
    </Card>
  );
}
