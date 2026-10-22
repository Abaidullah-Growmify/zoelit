"use client";

import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartItemCard } from "@/components/cart-item-card";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { CartPageSkeleton } from "@/components/skeletons";
import { useSyncExternalStore } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, hasHydrated } = useCartStore();
  const isClientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClientReady || !hasHydrated) return <CartPageSkeleton />;

  const cartSubtotal = subtotal();
  const shipping = cartSubtotal > 150 ? 0 : 12;
  const total = cartSubtotal + shipping;
  const freeShippingRemaining = Math.max(150 - cartSubtotal, 0);

  if (!items.length) {
    return (
      <section className="container-page py-12">
        <EmptyState
          title="Your cart is empty"
          description="Browse the collection and add your favorites."
          action={<Button asChild href="/products">Continue Shopping</Button>}
        />
      </section>
    );
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <PageHeader
        eyebrow="Shopping Cart"
        title="Review your bag"
        description="Fine tune quantities, check shipping, and continue to secure checkout when everything looks right."
          action={<Button asChild href="/products" variant="outline" className="w-full text-white sm:w-auto">Continue shopping</Button>}
      />

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          {items.map((item) => <CartItemCard key={item.productId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />)}
        </div>

        <Card className="h-fit overflow-hidden rounded-xl p-0 shadow-xl shadow-slate-950/5 lg:sticky lg:top-24">
          <div className="panel-gradient p-4 sm:p-6">
            <h2 className="font-heading text-2xl font-extrabold tracking-[-0.03em] text-on-surface sm:text-headline-lg">Order summary</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant sm:text-label-md">
              {shipping === 0 ? "Free shipping unlocked for this order." : <><span className="tabular-nums">{money(freeShippingRemaining)}</span> away from free shipping.</>}
            </p>
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <div className="space-y-3 text-sm sm:text-label-md">
                <div className="flex justify-between gap-4 text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-bold tabular-nums text-on-surface">{money(cartSubtotal)}</span>
              </div>
                <div className="flex justify-between gap-4 text-on-surface-variant">
                <span>Shipping</span>
                <span className="font-bold tabular-nums text-on-surface">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              <div className="border-t border-outline-variant/40 pt-4">
                <div className="flex justify-between gap-4 text-xl font-bold text-on-surface sm:text-headline-md">
                  <span>Total</span>
                  <span className="tabular-nums">{money(total)}</span>
                </div>
              </div>
            </div>

            <Button asChild href="/checkout" className="h-12 w-full text-label-md text-white shadow-xl shadow-blue-600/25">
              Checkout
            </Button>
            <p className="text-center text-label-sm font-semibold text-on-surface-variant">Taxes calculated at checkout.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
