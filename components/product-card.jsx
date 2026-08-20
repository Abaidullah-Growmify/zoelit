"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, CheckCircle2, CircleX, Heart, ShoppingBag, Star } from "lucide-react";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Button, Card } from "@/components/ui";

export function ProductCard({ product }) {
  const imageRef = useRef(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartQuantity = useCartStore((state) => state.getItemQuantity(product.id));
  const token = useAuthStore((state) => state.token);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.hasItem(product.id));
  const remainingStock = Math.max((Number(product.stock) || 0) - cartQuantity, 0);

  async function animateToCart() {
    const source = imageRef.current;
    const target = document.querySelector("[data-cart-target]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!source || !target || prefersReducedMotion) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const clone = document.createElement("img");
    const size = Math.min(sourceRect.width, sourceRect.height, 120);
    const startX = sourceRect.left + sourceRect.width / 2 - size / 2;
    const startY = sourceRect.top + sourceRect.height / 2 - size / 2;
    const endX = targetRect.left + targetRect.width / 2 - size / 2;
    const endY = targetRect.top + targetRect.height / 2 - size / 2;

    clone.src = product.image;
    clone.alt = "";
    clone.style.position = "fixed";
    clone.style.left = `${startX}px`;
    clone.style.top = `${startY}px`;
    clone.style.width = `${size}px`;
    clone.style.height = `${size}px`;
    clone.style.objectFit = "cover";
    clone.style.borderRadius = "8px";
    clone.style.boxShadow = "0 18px 45px rgba(37, 99, 235, 0.28)";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "80";
    document.body.appendChild(clone);

    const movement = clone.animate([
      { opacity: 1, transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
      { opacity: 0.92, transform: `translate3d(${(endX - startX) * 0.52}px, ${Math.min(endY - startY, -40)}px, 0) scale(0.72) rotate(-4deg)` },
      { opacity: 0.18, transform: `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.18) rotate(8deg)` },
    ], { duration: 680, easing: "cubic-bezier(.22,1,.36,1)" });

    target.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.16)" },
      { transform: "scale(1)" },
    ], { duration: 340, delay: 520, easing: "cubic-bezier(.22,1,.36,1)" });

    await movement.finished.catch(() => {});
    clone.remove();
  }

  async function handleAddToCart() {
    if (remainingStock <= 0) return;
    await animateToCart();
    addItem(product.id, 1, product);
  }

  function handleWishlistToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!token) {
      return;
    }

    toggleWishlist(product, token).catch(() => {});
  }

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-lg border-slate-200 bg-white p-0 shadow-sm ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-slate-950/10 hover:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/50 dark:hover:ring-blue-500/10">
      <button
        type="button"
        onClick={handleWishlistToggle}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        className={`absolute right-5 top-5 z-20 grid size-10 place-items-center rounded-full border shadow-sm transition ${isWishlisted ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300" : "border-white/80 bg-white/95 text-slate-500 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-300 dark:hover:border-rose-500/30 dark:hover:text-rose-300"}`}
      >
        <Heart className="size-4" fill={isWishlisted ? "currentColor" : "none"} />
      </button>
      <Link href={`/products/${product.id}`} className="block p-2 pb-0 focus-visible:outline-none">
        <div ref={imageRef} className="relative overflow-hidden rounded-lg bg-slate-100 p-2 transition duration-300 dark:bg-slate-900">
          <Image src={product.image} alt={product.name} width={700} height={525} className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm transition duration-500 group-hover:scale-[1.035] group-hover:shadow-md" />
          <span className="absolute left-5 top-5 rounded-sm bg-white/95 px-3 py-1 text-meta font-semibold uppercase tracking-[0.12em] text-blue-700 shadow-sm backdrop-blur dark:bg-slate-950/90 dark:text-blue-300">{product.category}</span>
          <span className="absolute bottom-5 right-5 inline-flex translate-y-2 items-center gap-1 rounded-sm bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            View details <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-meta font-semibold text-slate-600 dark:text-slate-300">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-3.5" /> {product.stock} in stock</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><CircleX className="size-3.5" /> Out of stock</span>
          )}
          {product.rating > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {product.rating}</span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4">
          <Link href={`/products/${product.id}`} title={product.name} className="min-w-0 line-clamp-2 min-h-10 font-heading text-h3 font-semibold leading-tight tracking-[-0.02em] text-slate-950 transition hover:text-blue-700 focus-visible:outline-none focus-visible:text-blue-700 dark:text-white dark:hover:text-blue-300 dark:focus-visible:text-blue-300">{product.name}</Link>
          <span className="shrink-0 font-heading text-h3 font-semibold tabular-nums tracking-[-0.02em] text-blue-700 dark:text-blue-300">{product.price > 0 ? money(product.price) : "On request"}</span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-body font-regular text-slate-600 dark:text-slate-300">{product.description}</p>
        <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button className="w-full rounded-sm shadow-lg shadow-blue-600/20 active:translate-y-0" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`} disabled={remainingStock <= 0}>
            <ShoppingBag className="size-4" /> Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
