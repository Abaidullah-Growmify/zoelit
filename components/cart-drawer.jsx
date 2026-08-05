"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { getProduct } from "@/lib/data";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, EmptyState } from "@/components/ui";

export function CartDrawer() {
  const { items, drawerOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div onClick={closeCart} className={`absolute inset-0 bg-slate-950/40 transition ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 shadow-2xl transition duration-300 dark:bg-slate-950 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between"><h2 className="text-xl font-black">Shopping Cart</h2><button onClick={closeCart} aria-label="Close cart"><X /></button></div>
        {items.length === 0 ? <div className="mt-10"><EmptyState title="Your cart is empty" description="Add a few premium essentials and they will show up here." action={<Button asChild href="/products" onClick={closeCart}>Continue Shopping</Button>} /></div> : (
          <>
            <div className="mt-8 space-y-5 overflow-y-auto pr-1">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return <div key={item.productId} className="flex gap-4"><Image src={product.image} alt={product.name} width={88} height={88} className="size-22 rounded-md object-cover" /><div className="flex-1"><h3 className="font-bold">{product.name}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{money(product.price)}</p><div className="mt-3 flex items-center gap-2"><button className="size-8 rounded-full bg-slate-100 dark:bg-slate-800" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button><span>{item.quantity}</span><button className="size-8 rounded-full bg-slate-100 dark:bg-slate-800" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button><button className="ml-auto text-sm text-rose-600" onClick={() => removeItem(item.productId)}>Remove</button></div></div></div>;
              })}
            </div>
            <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><div className="mb-5 flex items-center justify-between text-lg font-black"><span>Subtotal</span><span>{money(subtotal())}</span></div><Button asChild href="/checkout" className="w-full" onClick={closeCart}>Checkout</Button><Button asChild href="/cart" variant="ghost" className="mt-2 w-full" onClick={closeCart}>View Cart</Button></div>
          </>
        )}
      </aside>
    </div>
  );
}
