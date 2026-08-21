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
  const cartQuantity = useCartStore((state) => state.getItemQuantity(product.id));

  const remainingStock = Math.max((Number(product.stock) || 0) - cartQuantity, 0);
  const max = Math.max(remainingStock, 1);

  function change(delta) {
    setQuantity((value) => Math.min(max, Math.max(1, value + delta)));
  }

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (remainingStock <= 0) return;
    addItem(product.id, quantity, { name: product.name, price: product.price, image: product.image, stock: product.stock });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
    openCart();
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Total</p>
          <span className="mt-1 block font-heading text-headline-lg font-extrabold tabular-nums tracking-[-0.03em] text-on-surface">
            {product.price > 0 ? money((Number(product.price) || 0) * quantity) : "On request"}
          </span>
          {product.price > 0 && quantity > 1 ? <p className="mt-1 text-label-sm font-semibold text-on-surface-variant">{money(product.price)} each</p> : null}
        </div>
        {outOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-error">Out of stock</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-tertiary">
            <PackageCheck className="size-4" />
            Ready to ship
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="inline-flex h-12 items-center rounded-lg border border-outline-variant bg-surface-container-lowest" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => change(-1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="grid size-12 place-items-center text-on-surface-variant transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-10 text-center font-semibold tabular-nums text-on-surface">{quantity}</span>
          <button
            type="button"
            onClick={() => change(1)}
            disabled={quantity >= max}
            aria-label="Increase quantity"
            className="grid size-12 place-items-center text-on-surface-variant transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button onClick={handleAdd} disabled={outOfStock || remainingStock <= 0} className="h-12 flex-1 text-label-md text-white">
          <ShoppingBag className="size-4" />
          {outOfStock || remainingStock <= 0 ? "Limit reached" : justAdded ? "Added to cart" : "Add to cart"}
        </Button>
      </div>
    </>
  );
}
