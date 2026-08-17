"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Home, Loader2, Lock, MapPin, Minus, Plus, ArrowLeft } from "lucide-react";
import { validateCheckoutPrices, createPaymentIntent, confirmPayment, getAddresses } from "@/lib/api";
import { cn, money } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useProductStore } from "@/store/product-store";
import { Badge, Button, Card, ErrorText, Input, Label, PageHeader, Textarea } from "@/components/ui";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Japan", "India", "Pakistan", "Brazil", "Netherlands",
  "Sweden", "Switzerland", "Singapore", "New Zealand", "Ireland",
];

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getById = useProductStore((state) => state.getById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const { items, clearCart, updateQuantity } = useCartStore();
  const [validatedPrices, setValidatedPrices] = useState({});
  const [priceNote, setPriceNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSheet, setPaymentSheet] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const cartItems = items
    .map((item) => ({
      ...item,
      quantity: Math.floor(Number(item.quantity)) || 0,
      product: item.name ? item : getById(item.productId),
    }))
    .filter((item) => item.product);

  const priceOf = (item) =>
    Number(validatedPrices[item.productId] ?? item.price ?? item.product.price ?? 0) || 0;
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + priceOf(item) * (item.quantity || 1),
    0
  );
  const shipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 12;
  const discount = 0;
  const total = cartSubtotal + shipping - discount;

  useEffect(() => {
    let active = true;

    async function validate() {
      if (!items.length) return;

      try {
        const data = await validateCheckoutPrices(
          items.map((item) => ({
            ingramPartNumber: item.productId,
            quantity: Math.floor(Number(item.quantity)) || 1,
          })),
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
    },
  });

  const applyAddress = useCallback((address) => {
    if (!address) return;
    const nameParts = String(address.name || "").split(/\s+/);
    form.setValue("firstName", nameParts.shift() || "");
    form.setValue("lastName", nameParts.join(" ") || "");
    form.setValue("address", address.line1 || "");
    form.setValue("city", address.city || "");
    form.setValue("state", address.region || "");
    form.setValue("postal", address.postal || "");
  }, [form]);

  useEffect(() => {
    if (!user) return;
    if (user.email) form.setValue("email", user.email || "");
    if (!token || paymentSheet) return;
    getAddresses(token)
      .then((res) => {
        const addresses = res.addresses || [];
        setSavedAddresses(addresses);
        const saved = addresses.find((item) => item.default) || addresses[0] || null;
        if (saved) applyAddress(saved);
      })
      .catch(() => {});
  }, [token, user, paymentSheet, applyAddress, form]);

  async function handleProceedToPayment() {
    const valid = await form.trigger();
    if (!valid) return toast.error("Please fill all billing details");
    if (!items.length) return toast.error("Your cart is empty");

    setIsProcessing(true);
    try {
      const products = items.map((item) => ({
        ingramPartNumber: item.productId,
        quantity: Math.floor(Number(item.quantity)) || 1,
      }));

      const data = await createPaymentIntent(products, token);

      setPaymentSheet({
        paymentIntentId: data.paymentIntentId,
        clientSecret: data.clientSecret,
        items: data.items || [],
        subtotal: data.subtotal,
        shipping: data.shipping,
        discount: data.discount,
        total: data.total,
      });

      setShowPayment(true);
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error(error.message || "Failed to create payment");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handlePaymentSubmit(cardData) {
    if (!paymentSheet) return;

    setIsProcessing(true);
    try {
      const billing = form.getValues();
      const products = items.map((item) => ({
        ingramPartNumber: item.productId,
        quantity: Math.floor(Number(item.quantity)) || 1,
      }));

      const result = await confirmPayment(
        {
          paymentIntentId: paymentSheet.paymentIntentId,
          paymentMethod: { card: cardData },
          billing: {
            firstName: billing.firstName,
            lastName: billing.lastName,
            address: billing.address,
            city: billing.city,
            state: billing.state,
            postal: billing.postal,
            email: billing.email,
            phone: billing.phone,
          },
          notes: billing.notes || "",
          products,
        },
        token
      );

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-success?order=${encodeURIComponent(result.order?.orderNumber || "")}&ingram=${encodeURIComponent(result.ingram?.ingramOrderNumber || "")}`);
    } catch (error) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  }

  if (showPayment && paymentSheet) {
    return (
      <PaymentOverlay
        cartItems={cartItems}
        priceOf={priceOf}
        cartSubtotal={cartSubtotal}
        shipping={shipping}
        discount={discount}
        total={total}
        paymentSheet={paymentSheet}
        onBack={() => setShowPayment(false)}
        onSubmit={handlePaymentSubmit}
        isProcessing={isProcessing}
        billingEmail={form.getValues("email")}
      />
    );
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Checkout"
        title="Complete your order"
        description="Confirm your billing details and shipping cost before placing the order."
        className="mb-8"
      />

      {user && savedAddresses.length ? (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between gap-4">
            <Label>Deliver to a saved address</Label>
            <span className="text-meta font-semibold text-slate-500 dark:text-slate-400">{savedAddresses.length} saved</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedAddresses.map((address) => (
              <button
                key={address._id}
                type="button"
                onClick={() => applyAddress(address)}
                className={cn("group flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5", address.default && "border-blue-200 bg-blue-50/40 dark:border-blue-500/30")}
                aria-label={`Fill billing details from ${address.label}`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {address.label.toLowerCase().includes("home") ? <Home className="size-4" /> : <MapPin className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 font-heading text-h3 font-semibold text-slate-950 dark:text-white">
                    {address.label}
                    {address.default ? <Badge tone="slate">Default</Badge> : null}
                  </span>
                  <span className="mt-1 block text-body font-regular leading-5 text-slate-600 dark:text-slate-300">
                    {address.name}<br />{address.line1}<br />{address.city}, {address.region} {address.postal}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-body font-regular text-slate-500 dark:text-slate-400">Click a box to fill the billing fields — everything stays editable.</p>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleProceedToPayment();
        }}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start"
      >
        <Card className="shadow-sm">
          <div className="mb-6 border-b border-slate-200 pb-3 dark:border-slate-800">
            <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              Billing details
            </h2>
          </div>

        <div className="grid gap-5 md:grid-cols-2">
            <Field label="First Name" name="firstName" required form={form} placeholder="First name" />
            <Field label="Last Name" name="lastName" required form={form} placeholder="Last name" />
            <Field
              label="Address"
              name="address"
              required
              form={form}
              placeholder="Street address"
              className="md:col-span-2"
            />
            <Field
              label="Town / City"
              name="city"
              required
              form={form}
              placeholder="Town / City"
              className="md:col-span-2"
            />
            <Field label="State / County" name="state" required form={form} placeholder="State / County" />
            <Field label="Postcode / Zip" name="postal" required form={form} placeholder="Postcode / Zip" />
            <Field
              label="Email Address"
              name="email"
              type="email"
              required
              form={form}
              placeholder="you@example.com"
            />
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
          <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Your order
          </h2>

          <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
            <OrderRow label="Product" value="Total" strong />
            {cartItems.length ? (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {item.product.name}
                    </p>
                    <div className="mt-1.5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="grid size-6 place-items-center rounded text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300"
                        aria-label={`Decrease ${item.product.name} quantity`}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-4 text-center text-sm font-semibold tabular-nums text-slate-950 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={
                          item.quantity >=
                          Math.max(Number(item.product.stock ?? item.stock ?? 0) || 0, 1)
                        }
                        className="grid size-6 place-items-center rounded text-slate-600 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300"
                        aria-label={`Increase ${item.product.name} quantity`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-950 dark:text-white">
                    {money(priceOf(item) * (item.quantity || 1))}
                  </span>
                </div>
              ))
            ) : (
              <OrderRow label="No products in cart" value={money(0)} />
            )}
            <OrderRow label="Cart Subtotal" value={money(cartSubtotal)} />
            {priceNote ? (
              <p className="py-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {priceNote}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-4 py-4 text-slate-600 dark:text-slate-300">
              <span>Shipping</span>
              <label className="flex items-center gap-2 text-right">
                <input type="radio" checked readOnly className="accent-blue-600" />
                <span className="tabular-nums">
                  {shipping === 0
                    ? "Free Shipping"
                    : `Delivery Cost : ${money(shipping)}`}
                </span>
              </label>
            </div>
            <OrderRow label="Sub Total" value={money(cartSubtotal)} strong />
            <OrderRow label="Shipping Cost" value={money(shipping)} strong />
            <OrderRow label="Discount" value={money(discount)} strong />
            <OrderRow label="Total Order" value={money(total)} total />
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="mt-8 h-12 w-full text-base shadow-xl shadow-blue-600/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </Card>
      </form>
    </section>
  );
}

function PaymentOverlay({
  cartItems,
  priceOf,
  cartSubtotal,
  shipping,
  discount,
  total,
  onBack,
  onSubmit,
  isProcessing,
  billingEmail,
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [country, setCountry] = useState("United States");
  const [saveInfo, setSaveInfo] = useState(false);
  const [email, setEmail] = useState(billingEmail || "");
  const [cardErrors, setCardErrors] = useState({});

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  function formatCardNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + " / " + digits.slice(2);
    }
    return digits;
  }

  function validate() {
    const errors = {};
    const raw = cardNumber.replace(/\s/g, "");
    if (raw.length < 13 || raw.length > 19) {
      errors.number = "Enter a valid card number";
    }
    const parts = cardExpiry.replace(/\s/g, "").split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      errors.expiry = "Enter expiry as MM/YY";
    } else {
      const month = parseInt(parts[0], 10);
      const year = parseInt(parts[1], 10);
      const now = new Date();
      const fullYear = 2000 + year;
      if (month < 1 || month > 12) {
        errors.expiry = "Invalid month";
      } else if (
        fullYear < now.getFullYear() ||
        (fullYear === now.getFullYear() && month < now.getMonth() + 1)
      ) {
        errors.expiry = "Card expired";
      }
    }
    if (!/^\d{3,4}$/.test(cardCvc.replace(/\s/g, ""))) {
      errors.cvc = "Invalid CVC";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      number: cardNumber.replace(/\s/g, ""),
      expMonth: parseInt(cardExpiry.split("/")[0].trim(), 10),
      expYear: parseInt("20" + cardExpiry.split("/")[1].trim(), 10),
      cvc: cardCvc.replace(/\s/g, ""),
      name: cardholderName,
      country,
    });
  }

  return (
    <div ref={containerRef} className="min-h-screen w-full overflow-x-hidden bg-[#f6f8fa]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to checkout
        </button>

        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/60">
          <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">

            <div className="min-w-0 border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your order
                </p>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex w-full items-center gap-4"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-[10px] font-medium text-slate-400">
                          No img
                        </div>
                      )}
                      <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-slate-600 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                      {money(priceOf(item) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-700">{money(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-slate-700">
                    {shipping === 0 ? "Free" : money(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-medium text-emerald-600">-{money(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold tabular-nums text-slate-900">
                    {money(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100">
                  <Lock className="size-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Secure Payment</h2>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <Label className="mb-1.5 block text-[13px] font-medium text-slate-700">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cardErrors.email ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : ""}
                  />
                  <ErrorText>{cardErrors.email}</ErrorText>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="text-[13px] font-medium text-slate-700">Card information</Label>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <svg className="h-5 w-auto" viewBox="0 0 32 20" fill="none">
                        <rect width="32" height="20" rx="3" fill="#1A1F71"/>
                        <text x="16" y="13" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">VISA</text>
                      </svg>
                      <svg className="h-5 w-auto" viewBox="0 0 32 20" fill="none">
                        <rect width="32" height="20" rx="3" fill="#EB001B" opacity="0.15"/>
                        <circle cx="12" cy="10" r="5" fill="#EB001B"/>
                        <circle cx="20" cy="10" r="5" fill="#F79E1B"/>
                      </svg>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 1234 1234 1234"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="h-11 w-full border-none bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <div className="flex border-t border-slate-200">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="h-11 w-1/2 border-none border-r border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="h-11 w-1/2 border-none bg-white px-3.5 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  {(cardErrors.number || cardErrors.expiry || cardErrors.cvc) && (
                    <p className="mt-1.5 text-[13px] text-rose-500">{cardErrors.number || cardErrors.expiry || cardErrors.cvc}</p>
                  )}
                </div>

                <div>
                  <Label className="mb-1.5 block text-[13px] font-medium text-slate-700">Cardholder name</Label>
                  <Input
                    type="text"
                    placeholder="Full name on card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block text-[13px] font-medium text-slate-700">Country or region</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 text-[15px] font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600"
                  />
                  <span className="text-[13px] leading-snug text-slate-600">
                    Save my information for next time
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="mt-2 h-12 w-full rounded-lg bg-[#635BFF] text-[15px] font-semibold text-white shadow-lg shadow-[#635BFF]/25 transition hover:bg-[#5046e4] hover:shadow-[#635BFF]/35"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${money(total)}`
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Lock className="size-3" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>

              <div className="mt-4 rounded-lg border border-slate-100 bg-[#f6f8fa] p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Test Mode
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Use <span className="font-mono font-medium text-slate-600">4242 4242 4242 4242</span>,
                  any future expiry, and any 3-digit CVC.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
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
      <span
        className={
          strong || total ? "font-semibold text-slate-950 dark:text-white" : undefined
        }
      >
        {label}
      </span>
      <span
        className={
          total
            ? "text-lg font-extrabold tabular-nums text-blue-700 dark:text-blue-300"
            : strong
              ? "font-semibold tabular-nums text-slate-950 dark:text-white"
              : "font-medium tabular-nums text-slate-950 dark:text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}
