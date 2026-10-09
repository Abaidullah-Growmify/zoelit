"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, Home, Loader2, MapPin, Minus, Plus, Ticket, X } from "lucide-react";
import {
  createCheckoutSession,
  getAddresses,
  getAvailableVouchers,
  validateCheckoutPrices,
  validateVoucher,
} from "@/lib/api";
import {
  clearStripeIntent,
  createStepReporter,
  readStripeIntent,
  rememberStripeIntent,
  reportCaptureStep,
  reportCheckoutExit,
  startCaptureIntent,
  suppressCheckoutExit,
} from "@/lib/capture-client";
import { money } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useProductStore } from "@/store/product-store";
import { Button, Card, ErrorText, Input, Label, PageHeader } from "@/components/ui";
import { BulletTextarea } from "@/components/bullet-notes";

// The applied code rides along in sessionStorage so a round trip through Stripe
// (which reloads the page) does not silently drop the discount. It is removed
// when the cart is cleared, when the code is rejected, and when the visitor
// takes it off themselves.
const VOUCHER_STORAGE_KEY = "zoelit-checkout-voucher";

const VOUCHER_MESSAGES = {
  INVALID_CODE: "This voucher code is not valid.",
  INACTIVE: "This voucher is no longer active.",
  NOT_STARTED: "This voucher is not active yet.",
  EXPIRED: "This voucher has expired.",
  USAGE_LIMIT_REACHED: "This voucher has reached its usage limit.",
  CUSTOMER_LIMIT_REACHED: "You have already used this voucher the maximum number of times.",
  MIN_ORDER_NOT_MET: "This cart does not meet the minimum order for this voucher.",
  PRODUCT_NOT_ELIGIBLE: "This voucher does not apply to any item in your cart.",
  CATEGORY_NOT_ELIGIBLE: "This voucher does not apply to any item in your cart.",
};

const VOUCHER_ERROR_CODES = new Set(Object.keys(VOUCHER_MESSAGES));

function voucherErrorMessage(error) {
  const code = error?.code || "";

  if (code === "MIN_ORDER_NOT_MET" && Number(error?.shortfall) > 0) {
    return `Add $${Number(error.shortfall).toFixed(2)} more to use this voucher.`;
  }

  if (code && VOUCHER_MESSAGES[code]) return VOUCHER_MESSAGES[code];
  return error?.message || "This voucher could not be applied.";
}

// The offer cards show the exact clock time the voucher stops working, in the
// customer's own timezone, so "expires today" is never a surprise.
function offerExpiryLabel(iso) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const date = parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const time = parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

function readVoucherCode() {
  try {
    return sessionStorage.getItem(VOUCHER_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function rememberVoucherCode(code) {
  try {
    sessionStorage.setItem(VOUCHER_STORAGE_KEY, code);
  } catch {
    // Storage may be unavailable. The discount still works for this visit.
  }
}

function forgetVoucherCode() {
  try {
    sessionStorage.removeItem(VOUCHER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable. Ignore.
  }
}

export default function CheckoutPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const getById = useProductStore((state) => state.getById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const restoreCart = useCartStore((state) => state.restoreCart);
  const [validatedPrices, setValidatedPrices] = useState({});
  const [priceNote, setPriceNote] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  // The code the visitor wants applied. The server decides whether it sticks,
  // so the applied discount below is only ever read from `voucher`.
  const [appliedCode, setAppliedCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherChecking, setVoucherChecking] = useState(false);
  // Bumped on every manual "Apply" so re-entering the same code revalidates.
  const [voucherAttempt, setVoucherAttempt] = useState(0);
  // Offer list behind the "Apply Voucher" button. Manual code entry stays
  // available as the secondary path for codes that are not listed.
  const [offersOpen, setOffersOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictVoucher, setConflictVoucher] = useState(null);
  const offersRequestRef = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSessionKey, setCheckoutSessionKey] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  // Abandoned checkout capture. One record is created per visit, so these refs
  // only ever point at the record belonging to the current page open.
  const captureIntentRef = useRef(null);
  const captureStartedRef = useRef(false);
  const [captureReady, setCaptureReady] = useState(false);
  const captureCartSignatureRef = useRef("");
  const captureReporterRef = useRef(null);
  const tokenRef = useRef(token);

  if (!captureReporterRef.current) {
    captureReporterRef.current = createStepReporter();
  }

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

  function buildCheckoutPayloadSignature(values, voucherCode) {
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
      // Part of the signature: changing the voucher is a different checkout.
      voucherCode: String(voucherCode || ""),
    });
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
    getValues,
  } = form;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

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

      // Whatever they managed to type is kept with the record, so an abandoned
      // checkout still shows the email and phone they entered.
      const intent = captureIntentRef.current;
      if (intent) {
        captureReporterRef.current(
          intent,
          {
            step: "form",
            billing: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone,
              address: values.address,
              city: values.city,
              state: values.state,
              postal: values.postal,
              notes: values.notes,
            },
          },
          token
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [cartItems, checkoutSessionKey, form, isMounted, token]);

  // Every checkout visit is recorded on its own. The cart snapshot is taken
  // from the same summary the visitor is looking at, and the backend keeps the
  // real prices authoritative when the order is created.
  useEffect(() => {
    if (!isMounted || captureStartedRef.current || !cartItems.length) return;
    captureStartedRef.current = true;

    const items = buildCaptureItems(cartItems, validatedPrices);
    const { subtotal, shipping, total } = captureTotals(items);

    startCaptureIntent({
      items,
      subtotal,
      shipping,
      total,
      token,
    })
      .then((intent) => {
        captureIntentRef.current = intent;
        captureCartSignatureRef.current = captureCartSignature(cartItems);
        setCaptureReady(true);
      })
      .catch(() => {
        // Capture is best effort and must never block checkout.
      });
  }, [cartItems, isMounted, token, validatedPrices]);

  // Quantity edits inside this visit stay on the same record: the backend
  // re-prices the snapshot, so the abandoned record always mirrors the cart
  // the visitor actually left behind.
  useEffect(() => {
    if (!isMounted || !captureReady) return;
    const intent = captureIntentRef.current;
    if (!intent) return;

    const items = buildCaptureItems(cartItems, validatedPrices);
    if (!items.length) return;

    const signature = captureCartSignature(cartItems);
    if (signature === captureCartSignatureRef.current) return;
    captureCartSignatureRef.current = signature;

    const { total } = captureTotals(items);
    reportCaptureStep(intent, { step: "cart", items, total }, token);
  }, [captureReady, cartItems, isMounted, token, validatedPrices]);

  // Records how far this visit got: leaving the page (page hide or a route
  // change back to the cart) marks the visit as an abandoned checkout, while
  // handing over to Stripe is exempted by the redirect guard inside.
  useEffect(() => {
    if (!isMounted) return undefined;

    const handleExit = () => reportCheckoutExit(captureIntentRef.current, tokenRef.current);
    window.addEventListener("pagehide", handleExit);
    return () => {
      window.removeEventListener("pagehide", handleExit);
      reportCheckoutExit(captureIntentRef.current, tokenRef.current);
    };
  }, [isMounted]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const priceOf = (item) =>
    Number(validatedPrices[item.productId] ?? item.product.price ?? item.price ?? 0) || 0;

  const cartSubtotal = cartItems.reduce((sum, item) => sum + priceOf(item) * (item.quantity || 1), 0);
  const shipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 12;
  // Discount comes from the last successful server validation only. The server
  // recomputes it against the real cart before charging, so this is a preview.
  const discount = voucher ? Math.max(0, Math.min(Number(voucher.discountAmount) || 0, cartSubtotal)) : 0;
  const total = Math.max(0, cartSubtotal + shipping - discount);

  function applyVoucherCode() {
    const code = voucherInput.trim().toUpperCase();
    if (!code || voucherChecking) return;
    setVoucherError("");
    setAppliedCode(code);
    setVoucherAttempt((attempt) => attempt + 1);
  }

  function removeVoucher() {
    setVoucher(null);
    setVoucherError("");
    setAppliedCode("");
    setVoucherInput("");
    forgetVoucherCode();
  }

  // Only ever active offers come back, already filtered against the cart.
  // Selecting one still goes through validateVoucher below, and the server
  // revalidates again before the charge, so the list is a shortcut, never a
  // source of truth. A stale response (cart changed mid-flight) is dropped.
  // The billing email is watched so a guest typing it re-runs the list: a
  // voucher they already used (per-customer limit) must disappear right away.
  const billingEmail = form.watch("email") || "";
  const loadOffers = useCallback(async () => {
    const requestId = ++offersRequestRef.current;
    try {
      const data = await getAvailableVouchers(
        {
          products: items.map((item) => ({
            ingramPartNumber: item.productId,
            quantity: Math.floor(Number(item.quantity)) || 1,
          })),
          email: billingEmail,
        },
        token
      );
      if (requestId !== offersRequestRef.current) return;
      setOffers(Array.isArray(data.vouchers) ? data.vouchers : []);
    } catch {
      if (requestId === offersRequestRef.current) setOffers([]);
    } finally {
      if (requestId === offersRequestRef.current) setOffersLoading(false);
    }
  }, [items, token, billingEmail]);

  function openOffers() {
    setVoucherError("");
    setManualEntryOpen(false);
    setOffers([]);
    setOffersLoading(true);
    setOffersOpen(true);
  }

  function closeOffers() {
    setOffersOpen(false);
  }

  function applyOffer(offer) {
    const code = String(offer?.code || "").trim().toUpperCase();
    if (!code || voucherChecking) return;
    setVoucherError("");
    setAppliedCode(code);
    setVoucherAttempt((attempt) => attempt + 1);
  }

  // While the panel is open, keep it in step with the cart (and the billing
  // email used for per-customer limits) so a listed voucher can never drift
  // out of sync with what checkout will actually accept.
  useEffect(() => {
    if (!offersOpen) return undefined;
    loadOffers();
    return undefined;
  }, [offersOpen, loadOffers]);

  const applyAddress = useCallback(
    (address) => {
      if (!address) return;
      setSelectedAddressId(String(address._id || ""));
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

  // A round trip through Stripe reloads this page, so the code the visitor
  // already applied is picked back up and revalidated like any other change.
  useEffect(() => {
    if (!isMounted) return;
    const stored = readVoucherCode();
    if (stored) setAppliedCode(stored);
  }, [isMounted]);

  // The server is the authority: it re-prices the cart, re-checks every voucher
  // rule, and returns the discount we are allowed to show. Re-run whenever the
  // cart, the billing email (used for per-customer limits), or the requested
  // code changes. A rejected code clears itself so this never spins.
  useEffect(() => {
    if (!isMounted || !appliedCode) return undefined;

    let active = true;
    setVoucherChecking(true);

    validateVoucher(
      {
        code: appliedCode,
        products: items.map((item) => ({
          ingramPartNumber: item.productId,
          quantity: Math.floor(Number(item.quantity)) || 1,
        })),
        email: getValues("email") || "",
        voucher: voucher || null,
      },
      token
    )
      .then((data) => {
        if (!active) return;
        setVoucher({
          code: data.voucher?.code || appliedCode,
          name: data.voucher?.name || "",
          type: data.discount?.type || "percentage",
          value: Number(data.discount?.value) || 0,
          discountAmount: Number(data.discountAmount) || 0,
        });
        setVoucherError("");
        rememberVoucherCode(appliedCode);
      })
      .catch((error) => {
        if (!active) return;
        const code = error?.code || "";
        if (code === "VOUCHER_CONFLICT") {
          setConflictVoucher(error?.currentVoucher || voucher || null);
          setConflictOpen(true);
          // Keep the current applied voucher intact; do not clear.
          setVoucherChecking(false);
          return;
        }
        setVoucher(null);
        setVoucherError(voucherErrorMessage(error));
        forgetVoucherCode();
        setAppliedCode("");
      })
      .finally(() => {
        if (active) setVoucherChecking(false);
      });

    return () => {
      active = false;
    };
  }, [isMounted, appliedCode, voucherAttempt, items, token, getValues]);

  // Continuously revalidate the applied voucher when the cart changes. If it
  // becomes ineligible (e.g. products removed, minimum no longer met), remove
  // it with a clear message.
  useEffect(() => {
    if (!isMounted || !voucher || !appliedCode) return undefined;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const data = await validateVoucher(
          {
            code: appliedCode,
            products: items.map((item) => ({
              ingramPartNumber: item.productId,
              quantity: Math.floor(Number(item.quantity)) || 1,
            })),
            email: getValues("email") || "",
            voucher: voucher,
          },
          token
        );
        if (!active) return;
        // Still valid — refresh voucher state.
        setVoucher({
          code: data.voucher?.code || appliedCode,
          name: data.voucher?.name || "",
          type: data.discount?.type || "percentage",
          value: Number(data.discount?.value) || 0,
          discountAmount: Number(data.discountAmount) || 0,
        });
        setVoucherError("");
      } catch (error) {
        if (!active) return;
        const code = error?.code || "";
        if (code === "VOUCHER_CONFLICT") {
          // Conflict handled by the modal; do not auto-remove.
          setConflictVoucher(error?.currentVoucher || voucher || null);
          setConflictOpen(true);
          return;
        }
        // Any other failure means the voucher is no longer eligible.
        setVoucher(null);
        setVoucherError("This voucher is no longer valid for your cart and has been removed.");
        forgetVoucherCode();
        setAppliedCode("");
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [items, isMounted, appliedCode, token, getValues, voucher]);

  useEffect(() => {
    if (!isMounted) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.get("canceled")) return;

    // Coming back from Stripe means they started payment and backed out, which
    // is a different exit from simply closing the page.
    const stripeIntent = readStripeIntent();
    if (stripeIntent) {
      reportCaptureStep(stripeIntent, { step: "stripe_cancelled" }, token);
      clearStripeIntent();
    }

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
  }, [isMounted, items.length, restoreCart, token]);

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
      const payloadSignature = buildCheckoutPayloadSignature(billing, appliedCode);
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
              // Ties this Stripe session to this exact checkout visit, so the
              // order later converts that one record and nothing else.
              captureId: captureIntentRef.current?.id,
              visitKey: captureIntentRef.current?.visitKey,
              clientKey: captureIntentRef.current?.clientKey,
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
              // The server revalidates this against the live cart before it
              // charges anything; a stale or rejected code simply fails the
              // request instead of silently dropping the discount.
              voucherCode: appliedCode || "",
            },
            token
          );

          if (!data.url) {
            throw new Error("Stripe checkout URL was not returned by the server.");
          }

          return { data, sessionKey: nextSessionKey };
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

      const { data, sessionKey: usedSessionKey } = await createSessionWithRetry(sessionKey);

      try {
        sessionStorage.setItem("zoelit-cart-backup", JSON.stringify({ items }));
      } catch {
        // Ignore storage failures.
      }

      // This visit reached Stripe. The record keeps the session so a return from
      // Stripe can be reported on the same visit instead of a new one.
      const intent = captureIntentRef.current;
      if (intent) {
        rememberStripeIntent(intent);
        reportCaptureStep(
          intent,
          {
            step: "stripe",
            checkoutSessionKey: usedSessionKey,
            stripeSessionId: data.sessionId,
            billing: {
              firstName: billing.firstName,
              lastName: billing.lastName,
              email: billing.email,
              phone: billing.phone,
              address: billing.address,
              city: billing.city,
              state: billing.state,
              postal: billing.postal,
              notes: billing.notes,
            },
          },
          token
        );
      }

      // Handing over to Stripe is not an abandonment. Without this the pagehide
      // beacon would race the "stripe" step and can land the record on
      // "left at checkout" for a visitor who is actually paying.
      suppressCheckoutExit();
      window.location.assign(data.url);
    } catch (error) {
      if (error?.code && VOUCHER_ERROR_CODES.has(error.code)) {
        // The server rejected the voucher while creating the session. Drop it
        // so the summary, the stored code, and the next payload all agree.
        setVoucher(null);
        setAppliedCode("");
        setVoucherError(voucherErrorMessage(error));
        forgetVoucherCode();
      }
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
                  aria-pressed={selectedAddressId === String(address._id)}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition duration-200 ease-out ${selectedAddressId === String(address._id) ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-outline-variant/80 bg-surface-container-low hover:border-primary/20 hover:bg-surface-container-lowest"}`}
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
            {voucher ? (
              <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                    <Check className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      <Ticket className="size-3.5 shrink-0" />
                      <span className="uppercase">{voucher.code}</span>
                      <span className="font-normal opacity-80">applied</span>
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {voucher.type === "fixed" ? `${money(voucher.value)} off` : `${voucher.value}% off`}
                      {voucher.name ? ` · ${voucher.name}` : ""} · You save {money(voucher.discountAmount)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeVoucher}
                  disabled={voucherChecking}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  aria-label={`Remove voucher ${voucher.code}`}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-5">
                {!offersOpen ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-900/40">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Ticket className="size-4" />
                      Have a voucher?
                    </span>
                    <Button
                      type="button"
                      onClick={openOffers}
                      disabled={voucherChecking}
                      className="h-9 shrink-0 px-4"
                    >
                      Apply Voucher
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Available offers
                      </p>
                      <button
                        type="button"
                        onClick={closeOffers}
                        aria-label="Close available offers"
                        className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-0.5">
                      {offersLoading ? (
                        <p className="flex items-center gap-2 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Loader2 className="size-3.5 animate-spin" />
                          Finding offers...
                        </p>
                      ) : offers.length ? (
                        offers.map((offer) => (
                          <div
                            key={offer.code}
                            className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">
                                {offer.code}
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                {offer.discountType === "fixed"
                                  ? `${money(Number(offer.discountValue) || 0)} off`
                                  : `${Number(offer.discountValue) || 0}% off`}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {offer.scope}
                                {Number(offer.minimumOrderAmount) > 0
                                  ? ` · On orders over ${money(Number(offer.minimumOrderAmount))}`
                                  : ""}
                              </p>
                              {offer.expiresAt ? (
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  Valid until {offerExpiryLabel(offer.expiresAt)}
                                </p>
                              ) : null}
                              {offer.description ? (
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                  {offer.description}
                                </p>
                              ) : null}
                              {!offer.available && Number(offer.missingAmount) > 0 ? (
                                <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  Add {money(Number(offer.missingAmount))} more to use this voucher.
                                </p>
                              ) : null}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => applyOffer(offer)}
                              disabled={voucherChecking || !offer.available}
                              className="shrink-0"
                            >
                              {voucherChecking ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          No offers available for your cart right now.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!manualEntryOpen ? (
                  <button
                    type="button"
                    onClick={() => setManualEntryOpen(true)}
                    className="mt-2.5 text-xs font-semibold text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Have a voucher code? <span className="underline">Enter it manually</span>
                  </button>
                ) : (
                  <div className="mt-2.5 flex gap-2">
                    <Input
                      id="voucher-code"
                      value={voucherInput}
                      onChange={(event) => setVoucherInput(event.target.value.toUpperCase())}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          applyVoucherCode();
                        }
                      }}
                      placeholder="e.g. SAVE20"
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={Boolean(voucherError)}
                      aria-label="Voucher code"
                      className="h-11 flex-1 uppercase"
                    />
                    <Button
                      type="button"
                      onClick={applyVoucherCode}
                      disabled={voucherChecking || !voucherInput.trim()}
                      className="h-11 shrink-0"
                    >
                      {voucherChecking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {voucherError && !voucher ? (
              <p className="-mt-3 mb-5 text-xs font-semibold text-rose-600 dark:text-rose-400" role="alert">
                {voucherError}
              </p>
            ) : null}

            {conflictOpen ? (
              <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-lg dark:border-amber-900/40 dark:bg-amber-950/30">
                <div className="p-4">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Voucher already applied</h4>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    A voucher is already applied to this cart. Only one voucher can be used per order.
                  </p>
                  <div className="mt-3 rounded-xl border border-amber-200/60 bg-white/60 p-3 dark:border-amber-900/30 dark:bg-slate-900/40">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800 dark:text-amber-200">
                      {conflictVoucher?.code || ""}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {conflictVoucher?.type === "fixed" ? `${money(conflictVoucher?.value || 0)} off` : `${Number(conflictVoucher?.value || 0)}% off`}
                      {conflictVoucher?.name ? ` · ${conflictVoucher.name}` : ""}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConflictOpen(false)}
                      className="flex-1"
                    >
                      Keep Current Voucher
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setConflictOpen(false);
                        setVoucher(null);
                        setVoucherError("");
                        forgetVoucherCode();
                        setVoucherAttempt((a) => a + 1);
                        rememberVoucherCode(appliedCode);
                      }}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    >
                      Remove & Apply New
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <Row label="Cart Subtotal" value={money(cartSubtotal)} />
            <Row label="Sub Total" value={money(cartSubtotal)} />
            <Row label="Shipping Cost" value={shipping === 0 ? "Free" : money(shipping)} tone={shipping === 0 ? "blue" : undefined} />
            <Row
              label="Discount"
              value={discount > 0 ? `-${money(discount)}` : money(discount)}
              tone={discount > 0 ? "emerald" : undefined}
            />
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Row label="Total Order" value={money(total)} total />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || voucherChecking}
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

function buildCaptureItems(list, validatedPrices) {
  return list.map((item) => {
    const price = Number(validatedPrices[item.productId] ?? item.product?.price ?? item.price ?? 0) || 0;
    const quantity = Math.max(1, Math.floor(Number(item.quantity)) || 1);

    return {
      productId: item.productId,
      name: item.product?.name || item.name || item.productId,
      image: item.product?.image || item.image || "",
      price,
      quantity,
      sku: item.product?.sku || item.productId,
      source: item.product?.source || "",
    };
  });
}

function captureTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal > 150 ? 0 : 12;

  return { subtotal, shipping, total: subtotal + shipping };
}

function captureCartSignature(list) {
  return list
    .map((item) => `${item.productId}:${Math.max(1, Math.floor(Number(item.quantity)) || 1)}`)
    .join("|");
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
