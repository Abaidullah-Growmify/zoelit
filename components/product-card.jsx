"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn, money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Button, Card } from "@/components/ui";

export function ProductCard({
  product,
  image = product?.image,
  title = product?.name,
  price = product?.price,
  category = product?.category,
  stockCount = product?.stock,
  description = product?.description,
  rating = product?.rating ?? 0,
  isPriceOnRequest = product ? Number(product.price) <= 0 : false,
  isWishlisted: controlledWishlisted,
  onAddToCart,
  onToggleWishlist,
  productId = product?.id,
}) {
  const imageRef = useRef(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartQuantity = useCartStore((state) => (productId ? state.getItemQuantity(productId) : 0));
  const token = useAuthStore((state) => state.token);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const storedWishlisted = useWishlistStore((state) => (productId ? state.hasItem(productId) : false));

  const isWishlisted = controlledWishlisted ?? storedWishlisted;
  const remainingStock = Math.max((Number(stockCount) || 0) - cartQuantity, 0);
  const hasDetailLink = Boolean(productId);
  const detailHref = hasDetailLink ? `/products/${productId}` : undefined;

  async function animateToCart() {
    if (!product?.image || !imageRef.current) return;

    const target = document.querySelector("[data-cart-target]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!target || prefersReducedMotion) return;

    const sourceRect = imageRef.current.getBoundingClientRect();
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
    clone.style.boxShadow = "0 20px 40px -10px rgb(0 63 177 / 0.28)";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "80";
    document.body.appendChild(clone);

    const movement = clone.animate(
      [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
        {
          opacity: 0.92,
          transform: `translate3d(${(endX - startX) * 0.52}px, ${Math.min(endY - startY, -40)}px, 0) scale(0.72) rotate(-4deg)`,
        },
        { opacity: 0.18, transform: `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.18) rotate(8deg)` },
      ],
      { duration: 680, easing: "cubic-bezier(.22,1,.36,1)" },
    );

    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.16)" }, { transform: "scale(1)" }],
      { duration: 340, delay: 520, easing: "cubic-bezier(.22,1,.36,1)" },
    );

    await movement.finished.catch(() => {});
    clone.remove();
  }

  async function handleAddToCart() {
    if (remainingStock <= 0) return;

    if (onAddToCart) {
      onAddToCart();
      return;
    }

    if (!productId) return;

    await animateToCart();
    addItem(productId, 1, product);
  }

  function handleWishlistToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (onToggleWishlist) {
      onToggleWishlist();
      return;
    }

    if (!token || !product) return;

    toggleWishlist(product, token).catch(() => {});
  }

  const titleNode = hasDetailLink ? (
    <Link
      href={detailHref}
      title={title}
      className="min-w-0 line-clamp-2 font-heading text-body-lg font-bold uppercase leading-tight tracking-[-0.02em] text-on-surface transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:text-primary group-hover:text-primary"
    >
      {title}
    </Link>
  ) : (
    <span className="min-w-0 line-clamp-2 font-heading text-body-lg font-bold uppercase leading-tight tracking-[-0.02em] text-on-surface">{title}</span>
  );

  const imageNode = (
    <div
      ref={imageRef}
      className="relative mx-auto flex aspect-[4/3] w-[74%] items-center justify-center overflow-hidden rounded-sm border border-outline-variant/70 bg-surface-container-lowest p-2 shadow-[0_14px_30px_-18px_rgb(15_23_42_/_0.55)] transition duration-200 ease-out group-hover:border-primary/20 dark:bg-surface-container-high"
    >
      <Image
        src={image}
        alt={title}
        width={700}
        height={525}
        className="h-full w-full rounded-sm object-contain transition-transform duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-colors motion-reduce:hover:scale-100 group-hover:scale-[1.04]"
      />
    </div>
  );

  return (
    <Card className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-outline-variant/80 bg-surface-container-lowest p-0 shadow-primary-elevated ring-1 ring-transparent transition duration-200 ease-out hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_26px_58px_-16px_rgb(0_63_177_/_0.16)] hover:ring-primary/10 motion-reduce:transform-none motion-reduce:transition-colors motion-reduce:hover:translate-y-0 dark:bg-surface-container-low">
      <button
        type="button"
        onClick={handleWishlistToggle}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border bg-surface-container-lowest/95 shadow-sm backdrop-blur transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 motion-reduce:transition-colors motion-reduce:hover:scale-100",
          isWishlisted
            ? "border-error-container bg-error-container text-error animate-[wishlistBounce_220ms_ease-out] motion-reduce:animate-none"
            : "border-outline-variant text-on-surface-variant hover:scale-110 hover:border-primary hover:text-primary",
        )}
      >
        <Heart className="size-4" fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <div className="p-2 pb-0">
        <div className="relative flex min-h-44 items-center rounded-lg border border-outline-variant/50 bg-surface-container-low p-5 dark:bg-surface-container">
          {category ? (
            <span className="absolute left-4 top-4 max-w-[60%] truncate rounded-sm bg-primary/10 px-2.5 py-1 text-label-sm font-bold uppercase tracking-[0.08em] text-primary ring-1 ring-primary/10 transition duration-200 ease-out group-hover:bg-primary/15">
              {category}
            </span>
          ) : null}
          {hasDetailLink ? <Link href={detailHref} className="block w-full pt-5 focus-visible:outline-none">{imageNode}</Link> : <div className="block w-full pt-5">{imageNode}</div>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{titleNode}</div>
          <div className="shrink-0 text-right">
            <span className={cn("block whitespace-nowrap font-heading text-body-lg font-extrabold tabular-nums tracking-[-0.02em]", isPriceOnRequest ? "text-on-surface-variant" : "text-primary")}>{isPriceOnRequest ? "On request" : money(Number(price) || 0)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-body-md font-medium text-on-surface-variant">
            <span className={cn("size-2 rounded-full", remainingStock > 0 ? "bg-tertiary" : "bg-error")} />
            {remainingStock > 0 ? `${remainingStock} in stock` : "Out of stock"}
          </span>

          {rating > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-secondary-container px-2 py-1 text-label-sm font-semibold text-on-secondary-container">
              <Star className="size-3.5 fill-current" />
              {rating}
            </span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-1 min-h-5 text-label-md font-medium uppercase leading-5 tracking-[0.02em] text-on-surface-variant">{description}</p>

        <div className="mt-auto pt-7">
          <Button
            className="group/cta h-12 w-full rounded-sm text-body-md font-bold text-white shadow-primary-elevated transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:scale-[0.97] motion-reduce:transform-none motion-reduce:hover:translate-y-0 motion-reduce:hover:brightness-100 motion-reduce:active:scale-100"
            onClick={handleAddToCart}
            aria-label={`Add ${title} to cart`}
            disabled={remainingStock <= 0}
          >
            <ShoppingBag className="size-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none" />
            Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
