"use client";

import { ShoppingBag, X } from "lucide-react";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartItemCard } from "@/components/cart-item-card";
import { Button, EmptyState } from "@/components/ui";

export function CartDrawer() {
  const { items, drawerOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div onClick={closeCart} className={`absolute inset-0 bg-slate-950/40 transition ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md overflow-hidden bg-white p-6 shadow-2xl transition duration-300 dark:bg-slate-950 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between"><h2 className="font-heading text-h2 font-semibold">Shopping Cart</h2><button onClick={closeCart} aria-label="Close cart"><X /></button></div>
        {items.length === 0 ? <div className="mt-10"><EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add a few premium essentials and they will show up here." action={<Button asChild href="/products" onClick={closeCart}>Continue Shopping</Button>} /></div> : (
          <>
            <div className="mt-8 h-[calc(100%-13rem)] space-y-4 overflow-y-auto pb-6 pr-1">
              {items.map((item) => <CartItemCard key={item.productId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />)}
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><div className="mb-5 flex items-center justify-between text-lg font-semibold"><span>Subtotal</span><span className="tabular-nums">{money(subtotal())}</span></div><Button asChild href="/checkout" className="w-full" onClick={closeCart}>Checkout</Button><Button asChild href="/cart" variant="ghost" className="mt-2 w-full" onClick={closeCart}>View Cart</Button></div>
          </>
        )}
      </aside>
    </div>
  );
}
