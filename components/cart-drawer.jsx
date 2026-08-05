"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { getProduct } from "@/lib/data";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, EmptyState } from "@/components/ui";

export function CartDrawer() {
  const { items, drawerOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div onClick={closeCart} className={`absolute inset-0 bg-slate-950/40 transition ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md overflow-hidden bg-white p-6 shadow-2xl transition duration-300 dark:bg-slate-950 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">Shopping Cart</h2><button onClick={closeCart} aria-label="Close cart"><X /></button></div>
        {items.length === 0 ? <div className="mt-10"><EmptyState title="Your cart is empty" description="Add a few premium essentials and they will show up here." action={<Button asChild href="/products" onClick={closeCart}>Continue Shopping</Button>} /></div> : (
          <>
            <div className="mt-8 h-[calc(100%-13rem)] space-y-4 overflow-y-auto pb-6 pr-1">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm transition hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-blue-500/40 dark:hover:bg-slate-900">
                    <div className="flex gap-4">
                      <div className="relative shrink-0 overflow-hidden rounded-xl bg-white shadow-inner dark:bg-slate-950">
                        <Image src={product.image} alt={product.name} width={96} height={96} className="size-24 object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="line-clamp-2 font-black leading-tight">{product.name}</h3>
                            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{money(product.price)}</p>
                          </div>
                          <button className="grid size-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" onClick={() => removeItem(item.productId)} aria-label={`Remove ${product.name}`}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                            <button className="grid size-8 place-items-center rounded-full text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label={`Decrease ${product.name} quantity`}><Minus className="size-4" /></button>
                            <span className="min-w-5 text-center text-sm font-black">{item.quantity}</span>
                            <button className="grid size-8 place-items-center rounded-full text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label={`Increase ${product.name} quantity`}><Plus className="size-4" /></button>
                          </div>
                          <p className="text-sm font-black text-slate-950 dark:text-slate-50">{money(product.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><div className="mb-5 flex items-center justify-between text-lg font-black"><span>Subtotal</span><span>{money(subtotal())}</span></div><Button asChild href="/checkout" className="w-full" onClick={closeCart}>Checkout</Button><Button asChild href="/cart" variant="ghost" className="mt-2 w-full" onClick={closeCart}>View Cart</Button></div>
          </>
        )}
      </aside>
    </div>
  );
}
