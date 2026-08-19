"use client";

import { useState } from "react";
import { Minus, PackageCheck, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function ProductBuy({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const max = Math.max(product.stock, 1);

  function change(delta) {
    setQuantity((value) => Math.min(max, Math.max(1, value + delta)));
  }

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(product.id, quantity, { name: product.name, price: product.price, image: product.image, stock: product.stock });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    openCart();
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
          <span className="mt-1 block font-heading text-3xl font-extrabold tabular-nums tracking-[-0.035em] text-slate-950 dark:text-white">
            {product.price > 0 ? money((Number(product.price) || 0) * quantity) : "On request"}
          </span>
          {product.price > 0 && quantity > 1 ? <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{money(product.price)} each</p> : null}
        </div>
        {outOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">Out of stock</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <PackageCheck className="size-4" />
            Ready to ship
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="inline-flex h-12 items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => change(-1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="grid size-12 place-items-center text-slate-600 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:text-blue-300"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-10 text-center font-semibold tabular-nums text-slate-950 dark:text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => change(1)}
            disabled={quantity >= max}
            aria-label="Increase quantity"
            className="grid size-12 place-items-center text-slate-600 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:text-blue-300"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button onClick={handleAdd} disabled={outOfStock} className="h-12 flex-1 text-base">
          <ShoppingBag className="size-4" />
          {outOfStock ? "Out of stock" : justAdded ? "Added to cart" : "Add to cart"}
        </Button>
      </div>
    </>
  );
}
