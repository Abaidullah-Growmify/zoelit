"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getProduct } from "@/lib/data";
import { money } from "@/lib/utils";
import { Card } from "@/components/ui";

export function CartItemCard({ item, updateQuantity, removeItem }) {
  const product = getProduct(item.productId);
  if (!product) return null;

  return (
    <Card className="relative overflow-hidden rounded-lg bg-slate-50 p-4 shadow-sm transition duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/10 dark:bg-slate-900 dark:hover:border-blue-500/40">
      <div className="flex gap-5">
        <Image src={product.image} alt={product.name} width={240} height={240} className="size-30 shrink-0 rounded-lg object-cover" />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0 pr-10">
            <h2 className="line-clamp-2 max-w-xl text-xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white">{product.name}</h2>
            <p className="mt-1 line-clamp-1 max-w-xl text-sm leading-5 text-slate-500 dark:text-slate-400">{product.description}</p>
            <p className="mt-2 text-base font-bold tabular-nums text-slate-500 dark:text-slate-400">{money(product.price)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
              <button className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>
                <Minus className="size-4" />
              </button>
              <span className="min-w-5 text-center text-base font-bold tabular-nums text-slate-950 dark:text-white">{item.quantity}</span>
              <button className="grid size-7 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label={`Increase ${product.name} quantity`}>
                <Plus className="size-4" />
              </button>
            </div>
            <p className="shrink-0 text-right text-lg font-bold tabular-nums text-slate-950 dark:text-white">{money(product.price * item.quantity)}</p>
          </div>
        </div>

        <button className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" onClick={() => removeItem(item.productId)} aria-label={`Remove ${product.name}`}>
          <Trash2 className="size-5" />
        </button>
      </div>
    </Card>
  );
}
