"use client";

import Image from "next/image";
import { getProduct } from "@/lib/data";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, Card, EmptyState } from "@/components/ui";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  if (!items.length) return <section className="container-page py-12"><EmptyState title="Your cart is empty" description="Browse the collection and add your favorites." action={<Button asChild href="/products">Continue Shopping</Button>} /></section>;
  return <section className="container-page py-12"><h1 className="text-4xl font-black">Cart</h1><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><Card className="space-y-5">{items.map((item) => { const product = getProduct(item.productId); if (!product) return null; return <div key={item.productId} className="flex flex-col gap-4 border-b border-slate-100 pb-5 last:border-0 sm:flex-row dark:border-slate-800"><Image src={product.image} alt={product.name} width={120} height={120} className="size-28 rounded-2xl object-cover" /><div className="flex-1"><h2 className="font-black">{product.name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{money(product.price)}</p><div className="mt-4 flex items-center gap-3"><button className="size-9 rounded-full bg-slate-100 dark:bg-slate-800" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button><span className="font-bold">{item.quantity}</span><button className="size-9 rounded-full bg-slate-100 dark:bg-slate-800" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button><button className="ml-auto text-sm font-bold text-rose-600" onClick={() => removeItem(item.productId)}>Remove</button></div></div><strong>{money(product.price * item.quantity)}</strong></div>; })}</Card><Card className="h-fit"><h2 className="text-xl font-black">Order summary</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal())}</span></div><div className="flex justify-between"><span>Shipping</span><span>{subtotal() > 150 ? "Free" : money(12)}</span></div><div className="border-t border-slate-200 pt-3 text-lg font-black dark:border-slate-800"><div className="flex justify-between"><span>Total</span><span>{money(subtotal() + (subtotal() > 150 ? 0 : 12))}</span></div></div></div><Button asChild href="/checkout" className="mt-6 w-full">Checkout</Button></Card></div></section>;
}
