"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";

const schema = z.object({ name: z.string().min(2, "Name is required"), email: z.string().email("Enter a valid email"), address: z.string().min(6, "Address is required"), city: z.string().min(2, "City is required"), postal: z.string().min(3, "Postal code is required") });

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", address: "", city: "", postal: "" } });
  const onSubmit = () => { if (!items.length) return toast.error("Your cart is empty"); clearCart(); toast.success("Order placed successfully"); router.push("/order-success"); };
  return <section className="container-page py-12"><h1 className="text-4xl font-black">Checkout</h1><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><Card><h2 className="text-xl font-black">Shipping details</h2><form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Full name" name="name" form={form} /><Field label="Email" name="email" form={form} /><Field label="Address" name="address" form={form} className="md:col-span-2" /><Field label="City" name="city" form={form} /><Field label="Postal code" name="postal" form={form} /><Button disabled={form.formState.isSubmitting} className="md:col-span-2">{form.formState.isSubmitting ? "Placing order..." : "Place Order"}</Button></form></Card><Card className="h-fit"><h2 className="text-xl font-black">Summary</h2><p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{items.length} item(s) ready for checkout.</p><div className="mt-6 flex justify-between border-t border-slate-200 pt-5 text-lg font-black dark:border-slate-800"><span>Total</span><span>{money(subtotal() + (subtotal() > 150 ? 0 : 12))}</span></div></Card></div></section>;
}

function Field({ label, name, form, className }) {
  return <div className={className}><Label>{label}</Label><Input {...form.register(name)} /><ErrorText>{form.formState.errors[name]?.message}</ErrorText></div>;
}
