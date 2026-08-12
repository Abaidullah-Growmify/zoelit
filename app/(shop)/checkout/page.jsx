"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";
import { validateCheckoutPrices } from "@/lib/api";
import { money } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useProductStore } from "@/store/product-store";
import { Button, Card, ErrorText, Input, Label, PageHeader, Textarea } from "@/components/ui";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(6, "Street address is required"),
  city: z.string().min(2, "Town / city is required"),
  state: z.string().min(2, "State / county is required"),
  postal: z.string().min(3, "Postcode / zip is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone number is required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["stripe", "paypal"]),
});

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const getById = useProductStore((state) => state.getById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const { items, clearCart, updateQuantity } = useCartStore();
  const [validatedPrices, setValidatedPrices] = useState({});
  const [priceNote, setPriceNote] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const cartItems = items.map((item) => ({ ...item, quantity: Math.floor(Number(item.quantity)) || 0, product: item.name ? item : getById(item.productId) })).filter((item) => item.product);
  const priceOf = (item) => Number(validatedPrices[item.productId] ?? item.price ?? item.product.price ?? 0) || 0;
  const cartSubtotal = cartItems.reduce((sum, item) => sum + priceOf(item) * (item.quantity || 1), 0);
  const shipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 12;
  const discount = 0;
  const total = cartSubtotal + shipping - discount;

  useEffect(() => {
    let active = true;

    async function validate() {
      if (!items.length) return;

      try {
        const data = await validateCheckoutPrices(
          items.map((item) => ({ ingramPartNumber: item.productId, quantity: Math.floor(Number(item.quantity)) || 1 })),
          token
        );

        if (!active) return;

        const map = {};
        for (const line of data.items || []) map[line.ingramPartNumber] = line.price;
        setValidatedPrices(map);

        if (data.changed) {
          setPriceNote("Some prices were updated to the latest distributor prices.");
        }
      } catch {
        // Fall back to catalog prices when real-time validation is unavailable.
      }
    }

    validate();
    return () => {
      active = false;
    };
  }, [items, token]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      postal: "",
      email: "",
      phone: "",
      notes: "",
      paymentMethod: "stripe",
    },
  });

  async function onSubmit() {
    if (!items.length) return toast.error("Your cart is empty");
    await new Promise((resolve) => setTimeout(resolve, 350));
    clearCart();
    toast.success("Order placed successfully");
    router.push("/order-success");
  }

  return (
      <section className="container-page py-12 sm:py-16">
        <PageHeader eyebrow="Checkout" title="Complete your order" description="Confirm your billing details, shipping cost, and payment method before placing the order." className="mb-8" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
          <Card className="shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Billing details</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="First Name" name="firstName" required form={form} placeholder="First name" />
              <Field label="Last Name" name="lastName" required form={form} placeholder="Last name" />
              <Field label="Address" name="address" required form={form} placeholder="Street address" className="md:col-span-2" />
              <Field label="Town / City" name="city" required form={form} placeholder="Town / City" className="md:col-span-2" />
              <Field label="State / County" name="state" required form={form} placeholder="State / County" />
              <Field label="Postcode / Zip" name="postal" required form={form} placeholder="Postcode / Zip" />
              <Field label="Email Address" name="email" type="email" required form={form} placeholder="you@example.com" />
              <Field label="Phone" name="phone" type="tel" required form={form} placeholder="Phone number" />

              <div className="md:col-span-2">
                <Label className="font-medium">Order Notes</Label>
                <Textarea
                  {...form.register("notes")}
                  rows={7}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                />
                <ErrorText>{form.formState.errors.notes?.message}</ErrorText>
              </div>
            </div>
          </Card>

          <Card className="shadow-xl shadow-slate-950/5 lg:sticky lg:top-24 sm:p-8">
            <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Your order</h2>

            <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
              <OrderRow label="Product" value="Total" strong />
              {cartItems.length ? cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.product.name}</p>
                    <div className="mt-1.5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="grid size-6 place-items-center rounded text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" aria-label={`Decrease ${item.product.name} quantity`}>
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-4 text-center text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= Math.max(Number(item.product.stock ?? item.stock ?? 0) || 0, 1)} className="grid size-6 place-items-center rounded text-slate-600 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300" aria-label={`Increase ${item.product.name} quantity`}>
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{money(priceOf(item) * (item.quantity || 1))}</span>
                </div>
              )) : <OrderRow label="No products in cart" value={money(0)} />}
              <OrderRow label="Cart Subtotal" value={money(cartSubtotal)} />
              {priceNote ? <p className="py-3 text-xs font-semibold text-amber-600 dark:text-amber-400">{priceNote}</p> : null}
              <div className="flex items-center justify-between gap-4 py-4 text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <label className="flex items-center gap-2 text-right">
                  <input type="radio" checked readOnly className="accent-blue-600" />
                  <span className="tabular-nums">{shipping === 0 ? "Free Shipping" : `Delivery Cost : ${money(shipping)}`}</span>
                </label>
              </div>
              <OrderRow label="Sub Total" value={money(cartSubtotal)} strong />
              <OrderRow label="Shipping Cost" value={money(shipping)} strong />
              <OrderRow label="Discount" value={money(discount)} strong />
              <OrderRow label="Total Order" value={money(total)} total />
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-heading text-h3 font-semibold text-slate-950 dark:text-white">Select Payment method</p>
              <div className="flex gap-5 text-sm text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-1.5">
                  <input type="radio" value="stripe" {...form.register("paymentMethod")} className="accent-blue-600" />
                  Stripe
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" value="paypal" {...form.register("paymentMethod")} className="accent-blue-600" />
                  PayPal
                </label>
              </div>
            </div>
            <ErrorText>{form.formState.errors.paymentMethod?.message}</ErrorText>

            <Button disabled={form.formState.isSubmitting} className="mt-8 h-12 w-full text-base shadow-xl shadow-blue-600/20">
              {form.formState.isSubmitting ? "Placing order..." : "Place Order"}
            </Button>
          </Card>
        </form>
      </section>
  );
}

function Field({ label, name, form, type = "text", placeholder, required, className }) {
  return (
    <div className={className}>
      <Label className="font-medium">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        className="mt-2"
        {...form.register(name)}
      />
      <ErrorText>{form.formState.errors[name]?.message}</ErrorText>
    </div>
  );
}

function OrderRow({ label, value, strong, total }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
      <span className={strong || total ? "font-semibold text-slate-950 dark:text-white" : undefined}>{label}</span>
      <span className={total ? "text-lg font-extrabold tabular-nums text-blue-700 dark:text-blue-300" : strong ? "font-semibold tabular-nums text-slate-950 dark:text-white" : "font-medium tabular-nums text-slate-950 dark:text-white"}>{value}</span>
    </div>
  );
}
