"use client";

import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartItemCard } from "@/components/cart-item-card";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
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
    <section className="container-page py-10 sm:py-12">
      <PageHeader
        eyebrow="Shopping Cart"
        title="Review your bag"
        description="Fine tune quantities, check shipping, and continue to secure checkout when everything looks right."
        action={<Button asChild href="/products" variant="outline" className="w-full sm:w-auto">Continue shopping</Button>}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {items.map((item) => <CartItemCard key={item.productId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />)}
        </div>

        <Card className="h-fit overflow-hidden p-0 lg:sticky lg:top-24">
          <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_55%,#dbeafe_100%)] p-6 dark:bg-[linear-gradient(135deg,#0f172a_0%,#020617_58%,#172554_100%)]">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Order summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {shipping === 0 ? "Free shipping unlocked for this order." : `${money(freeShippingRemaining)} away from free shipping.`}
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="font-bold text-slate-950 dark:text-white">{money(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <span className="font-bold text-slate-950 dark:text-white">{shipping === 0 ? "Free" : money(shipping)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex justify-between gap-4 text-xl font-black text-slate-950 dark:text-white">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
              </div>
            </div>

            <Button asChild href="/checkout" className="h-12 w-full rounded-lg text-base shadow-xl shadow-blue-600/25">
              Checkout
            </Button>
            <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Taxes calculated at checkout.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
