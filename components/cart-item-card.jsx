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
    <Card className="relative overflow-hidden rounded-lg bg-surface-container-low p-4 shadow-primary-elevated transition duration-300 hover:border-primary">
      <div className="flex gap-5">
        <Image src={displayProduct.image} alt={displayProduct.name} width={240} height={240} className="size-30 shrink-0 rounded-lg object-cover" />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0 pr-10">
            <h2 className="line-clamp-2 max-w-xl font-heading text-body-lg font-semibold leading-tight tracking-tight text-on-surface">{displayProduct.name}</h2>
            <p className="mt-1 line-clamp-1 max-w-xl text-body-md leading-5 text-on-surface-variant">{displayProduct.description}</p>
            <p className="mt-2 text-label-md font-semibold tabular-nums text-on-surface-variant">Each {money(price)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex shrink-0 items-center gap-3 rounded-lg bg-surface-container px-3 py-1.5">
              <button className="grid size-7 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary" onClick={() => updateQuantity(item.productId, quantity - 1)} aria-label={`Decrease ${displayProduct.name} quantity`}>
                <Minus className="size-4" />
              </button>
              <span className="min-w-5 text-center text-base font-semibold tabular-nums text-on-surface">{quantity}</span>
              <button className="grid size-7 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary" onClick={() => updateQuantity(item.productId, quantity + 1)} disabled={quantity >= maxStock} aria-label={`Increase ${displayProduct.name} quantity`}>
                <Plus className="size-4" />
              </button>
            </div>
            <p className="shrink-0 text-right text-body-lg font-semibold tabular-nums text-on-surface">{money(price * (quantity || 1))}</p>
          </div>
        </div>

        <button className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg text-on-surface-variant transition hover:bg-error-container hover:text-error" onClick={() => removeItem(item.productId)} aria-label={`Remove ${displayProduct.name}`}>
          <Trash2 className="size-5" />
        </button>
      </div>
    </Card>
  );
}
