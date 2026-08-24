"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Home, Loader2, MapPin, Minus, Plus } from "lucide-react";
import { createCheckoutSession, getAddresses, validateCheckoutPrices } from "@/lib/api";
import { money } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useProductStore } from "@/store/product-store";
import { Button, Card, ErrorText, Input, Label, PageHeader } from "@/components/ui";
import { BulletTextarea } from "@/components/bullet-notes";

export default function CheckoutPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getById = useProductStore((state) => state.getById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const restoreCart = useCartStore((state) => state.restoreCart);
  const [validatedPrices, setValidatedPrices] = useState({});
  const [priceNote, setPriceNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSessionKey, setCheckoutSessionKey] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const scopedUserId = String(user?.id || user?._id || "").trim();
  const draftStorageKey = token && scopedUserId ? `zoelit-checkout-draft:${scopedUserId}` : null;

  function readDraft() {
    if (!draftStorageKey) return null;
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveDraft(values, sessionKey = checkoutSessionKey, lastSubmittedSignature = null) {
    if (!draftStorageKey) return;
    if (typeof localStorage === "undefined") return;
    try {
      const existing = readDraft();
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          sessionKey: sessionKey || "",
          lastSubmittedSignature:
            lastSubmittedSignature === null ? existing?.lastSubmittedSignature || "" : String(lastSubmittedSignature || ""),
          values: {
            firstName: String(values.firstName || ""),
            lastName: String(values.lastName || ""),
            address: String(values.address || ""),
            city: String(values.city || ""),
            state: String(values.state || ""),
            postal: String(values.postal || ""),
            email: String(values.email || ""),
            phone: String(values.phone || ""),
            notes: String(values.notes || ""),
          },
        })
      );
    } catch {
      // Ignore storage failures.
    }
  }

  function buildCheckoutPayloadSignature(values) {
    return JSON.stringify({
      items: [...cartItems]
        .sort((a, b) => String(a.productId || "").localeCompare(String(b.productId || "")))
        .map((item) => ({
          productId: String(item.productId || ""),
          quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1),
        })),
      billing: {
        firstName: String(values.firstName || ""),
        lastName: String(values.lastName || ""),
        address: String(values.address || ""),
        city: String(values.city || ""),
        state: String(values.state || ""),
        postal: String(values.postal || ""),
        email: String(values.email || ""),
        phone: String(values.phone || ""),
      },
      notes: String(values.notes || ""),
    });
  }

  function clearDraft() {
    if (!draftStorageKey) return;
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore storage failures.
    }
  }

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
  const {
    formState: { errors },
    handleSubmit,
  } = form;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!draftStorageKey) {
      try {
        localStorage.removeItem("zoelit-checkout-draft:guest");
      } catch {
        // Ignore storage failures.
      }
      return;
    }

    const draft = readDraft();
    if (!draft?.values) return;

    form.reset({
      firstName: draft.values.firstName || "",
      lastName: draft.values.lastName || "",
      address: draft.values.address || "",
      city: draft.values.city || "",
      state: draft.values.state || "",
      postal: draft.values.postal || "",
      email: draft.values.email || "",
      phone: draft.values.phone || "",
      notes: draft.values.notes || "",
    });

    if (draft.sessionKey) {
      setCheckoutSessionKey(draft.sessionKey);
    }
  }, [draftStorageKey, form, isMounted]);

  const cartItems = items
    .map((item) => ({
      ...item,
      quantity: Math.floor(Number(item.quantity)) || 0,
      product: item.name ? item : getById(item.productId),
    }))
    .filter((item) => item.product);

  useEffect(() => {
    if (!isMounted) return;

    const subscription = form.watch((values) => {
      saveDraft(values, checkoutSessionKey);
    });

    return () => subscription.unsubscribe();
  }, [cartItems, checkoutSessionKey, form, isMounted]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const priceOf = (item) =>
    Number(validatedPrices[item.productId] ?? item.price ?? item.product.price ?? 0) || 0;

  const cartSubtotal = cartItems.reduce((sum, item) => sum + priceOf(item) * (item.quantity || 1), 0);
  const shipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 12;
  const discount = 0;
  const total = cartSubtotal + shipping - discount;

  const applyAddress = useCallback(
    (address) => {
      if (!address) return;
      const nameParts = String(address.name || "").split(/\s+/);
      form.setValue("firstName", nameParts.shift() || "");
      form.setValue("lastName", nameParts.join(" ") || "");
      form.setValue("address", address.line1 || "");
      form.setValue("city", address.city || "");
      form.setValue("state", address.region || "");
      form.setValue("postal", address.postal || "");
      if (address.phone || user?.phone) {
        form.setValue("phone", address.phone || user.phone || "");
      }
    },
    [form, user?.phone]
  );

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
        // Fall back to catalog prices when live validation is unavailable.
      }
    }

    validate();
    return () => {
      active = false;
    };
  }, [items, token]);

  useEffect(() => {
    if (!isMounted) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.get("canceled")) return;

    try {
      const raw = sessionStorage.getItem("zoelit-cart-backup");
      sessionStorage.removeItem("zoelit-cart-backup");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items) && parsed.items.length && !items.length) {
        restoreCart(parsed.items);
      }
    } catch {
      // Ignore malformed backups.
    }
  }, [isMounted, items.length, restoreCart]);

  useEffect(() => {
    if (!user) return;
    if (readDraft()?.values) return;
    if (user.email) form.setValue("email", user.email || "");
    if (user.phone) form.setValue("phone", user.phone || "");
  }, [draftStorageKey, form, user]);

  useEffect(() => {
    if (!token) return;

    let active = true;

    getAddresses(token)
      .then((res) => {
        if (!active) return;
        const addresses = res.addresses || [];
        setSavedAddresses(addresses);
        if (readDraft()?.values) return;
        const saved = addresses.find((item) => item.default) || addresses[0] || null;
        if (saved) applyAddress(saved);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [applyAddress, draftStorageKey, token]);

  if (!isMounted) {
    return null;
  }

  async function handleProceedToPayment() {
    if (!items.length) return toast.error("Your cart is empty");

    setIsProcessing(true);
    try {
      const billing = form.getValues();
      const payloadSignature = buildCheckoutPayloadSignature(billing);
      const draft = readDraft();
      let sessionKey = checkoutSessionKey || draft?.sessionKey || globalThis.crypto.randomUUID();

      if (!draft?.lastSubmittedSignature || draft.lastSubmittedSignature !== payloadSignature) {
        sessionKey = globalThis.crypto.randomUUID();
      }

      setCheckoutSessionKey(sessionKey);
      saveDraft(billing, sessionKey, payloadSignature);

      const products = items.map((item) => ({
        ingramPartNumber: item.productId,
        quantity: Math.floor(Number(item.quantity)) || 1,
      }));

      async function createSessionWithRetry(nextSessionKey, retryOnConflict = true) {
        try {
          const data = await createCheckoutSession(
            {
              products,
              checkoutSessionKey: nextSessionKey,
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
            },
            token
          );

          if (!data.url) {
            throw new Error("Stripe checkout URL was not returned by the server.");
          }

          return data;
        } catch (error) {
          if (error?.status === 409 && retryOnConflict) {
            const freshKey = globalThis.crypto.randomUUID();
            setCheckoutSessionKey(freshKey);
            saveDraft(billing, freshKey, payloadSignature);
            return createSessionWithRetry(freshKey, false);
          }

          throw error;
        }
      }

      const data = await createSessionWithRetry(sessionKey);

      try {
        sessionStorage.setItem("zoelit-cart-backup", JSON.stringify({ items }));
      } catch {
        // Ignore storage failures.
      }

      clearCart();
      window.location.assign(data.url);
    } catch (error) {
      toast.error(error.message || "Failed to create Stripe checkout");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!cartItems.length) {
    return (
      <section className="container-page py-12 sm:py-16">
        <Card className="mx-auto max-w-xl text-center">
          <PageHeader
            eyebrow="Checkout"
            title="Your cart is empty"
            description="Add products to your cart before continuing to Stripe Checkout."
          />
          <Button asChild href="/products" className="mt-6">
            Continue shopping
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Checkout"
        title="Review order and continue"
        description="You will be redirected to Stripe's official hosted checkout page to complete payment."
        className="mb-8"
      />

      <form
        onSubmit={handleSubmit(handleProceedToPayment)}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
      >
        <Card className="p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">
                Billing details
              </h2>
            </div>
          </div>

          {savedAddresses.length ? (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {savedAddresses.map((address) => (
                <button
                  key={address._id}
                  type="button"
                  onClick={() => applyAddress(address)}
                  className="flex items-start gap-3 rounded-lg border border-outline-variant/80 bg-surface-container-low p-4 text-left transition duration-200 ease-out hover:border-primary/20 hover:bg-surface-container-lowest"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-container-lowest text-on-surface-variant shadow-sm ring-1 ring-outline-variant">
                    {address.label.toLowerCase().includes("home") ? <Home className="size-4" /> : <MapPin className="size-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label-sm font-semibold text-on-surface">{address.label}</span>
                    <span className="mt-1 block text-label-sm leading-5 text-on-surface-variant">
                      {address.name}
                      <br />
                      {address.line1}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="First Name" name="firstName" required form={form} error={errors.firstName?.message} placeholder="First name" />
            <Field label="Last Name" name="lastName" required form={form} error={errors.lastName?.message} placeholder="Last name" />
            <Field label="Email Address" name="email" type="email" required form={form} error={errors.email?.message} placeholder="you@example.com" className="md:col-span-2" />
            <Field label="Phone" name="phone" type="tel" required form={form} error={errors.phone?.message} placeholder="Phone number" className="md:col-span-2" />
            <Field label="Address" name="address" required form={form} error={errors.address?.message} placeholder="Street address" className="md:col-span-2" />
            <Field label="Town / City" name="city" required form={form} error={errors.city?.message} placeholder="Town / City" />
            <Field label="State / County" name="state" required form={form} error={errors.state?.message} placeholder="State / County" />
            <Field label="Postcode / Zip" name="postal" required form={form} error={errors.postal?.message} placeholder="Postcode / Zip" />
            <div className="md:col-span-2">
              <Label className="font-medium">Order Notes</Label>
              <BulletTextarea {...form.register("notes")} rows={4} placeholder="Notes about your order, e.g. delivery instructions." />
            </div>
          </div>
        </Card>

        <Card className="h-fit p-6 shadow-sm sm:p-8 lg:sticky lg:top-24">
          <div className="mb-4">
            <h3 className="text-headline-md font-semibold tracking-[-0.02em] text-on-surface">Your order</h3>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 border-b border-outline-variant/40 pb-3 text-label-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {cartItems.map((item) => (
              <SummaryLine
                key={item.productId}
                item={item}
                price={priceOf(item)}
                updateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <Row label="Cart Subtotal" value={money(cartSubtotal)} />
            <Row label="Sub Total" value={money(cartSubtotal)} />
            <Row label="Shipping Cost" value={shipping === 0 ? "Free" : money(shipping)} tone={shipping === 0 ? "blue" : undefined} />
            <Row label="Discount" value={money(discount)} />
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Row label="Total Order" value={money(total)} total />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="mt-6 h-12 w-full text-base shadow-xl shadow-blue-600/20"
          >
            {isProcessing ? (
              <>
                Processing...
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>

          {priceNote ? (
            <p className="mt-4 text-label-sm font-semibold text-tertiary">{priceNote}</p>
          ) : null}
        </Card>
      </form>
    </section>
  );
}

function Field({ label, name, form, error, type = "text", placeholder, required, className }) {
  return (
    <div className={className}>
      <Label className="font-medium">
        {label} {required ? <span className="text-error">*</span> : null}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="mt-2"
        {...form.register(name, required ? { required: `${label} is required` } : undefined)}
      />
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function Row({ label, value, strong, total, tone, className = "" }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-1.5 text-sm ${className}`}>
      <span className={strong || total ? "font-semibold text-slate-950 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}>{label}</span>
        <span
          className={
            total
            ? `text-lg font-bold tabular-nums ${tone === "emerald" ? "text-emerald-600" : tone === "blue" ? "text-blue-700 dark:text-blue-300" : "text-slate-950 dark:text-white"}`
            : strong
              ? `font-semibold tabular-nums ${tone === "emerald" ? "text-emerald-600" : tone === "blue" ? "text-blue-700 dark:text-blue-300" : "text-slate-950 dark:text-white"}`
              : `font-medium tabular-nums ${tone === "emerald" ? "text-emerald-600" : tone === "blue" ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`
          }
        >
          {value}
        </span>
    </div>
  );
}

function SummaryLine({ item, price, updateQuantity }) {
  const product = item.product || item;
  const quantity = Math.floor(Number(item.quantity)) || 1;
  const stock = Math.max(Number(item.stock ?? product.stock ?? 0) || 0, 1);
  const lineTotal = price * quantity;

  return (
    <div className="border-b border-slate-200 py-2 last:border-b-0 dark:border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-slate-950 dark:text-white">{product.name || item.productId}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">{money(price)} each</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, quantity - 1)}
              className="grid size-6 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300"
              aria-label={`Decrease ${product.name || item.productId} quantity`}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-4 text-center text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, quantity + 1)}
              disabled={quantity >= stock}
              className="grid size-6 place-items-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-300"
              aria-label={`Increase ${product.name || item.productId} quantity`}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">{money(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}
