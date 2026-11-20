"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { Button, Card, Skeleton } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { clearCompletedCheckoutStorage, markCompletedCheckoutCleanup } from "@/store";

const CONFIRM_CACHE_PREFIX = "zoelit:order-confirm:";

function confirmationCacheKey(sessionId) {
  return `${CONFIRM_CACHE_PREFIX}${sessionId}`;
}

function readConfirmationCache(sessionId) {
  if (!sessionId || typeof window === "undefined") return null;
  try {
    const key = confirmationCacheKey(sessionId);
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const safe = normalizeConfirmation(JSON.parse(raw));
    // Drop supplier references from cache entries written before this change.
    window.sessionStorage.setItem(key, JSON.stringify(safe));
    return safe;
  } catch {
    return null;
  }
}

function writeConfirmationCache(sessionId, result) {
  if (!sessionId || typeof window === "undefined") return;
  try {
    // Store only the values this page renders. Older cache entries may contain
    // supplier references, so they are replaced with this sanitized shape.
    window.sessionStorage.setItem(confirmationCacheKey(sessionId), JSON.stringify(normalizeConfirmation(result)));
  } catch {
    // Storage may be unavailable. The in-memory ref still prevents repeats.
  }
}

function normalizeConfirmation(result) {
  return {
    orderNumber: String(result?.orderNumber || result?.order?.publicOrderId || result?.order?.orderNumber || ""),
    ingramStatus: String(result?.ingramStatus || result?.order?.ingramSync || ""),
  };
}

function statusMessage(ingramStatus, loading) {
  if (loading) return "Payment successful. Finalizing your order...";
  if (ingramStatus === "submitted") {
    return "Payment successful. Your order has been submitted to our supplier for fulfillment.";
  }
  if (ingramStatus === "failed") {
    return "Payment successful, but this item could not be submitted to the supplier. Our team will review your order.";
  }
  if (ingramStatus === "retry_pending") {
    return "Payment successful. Supplier submission is being retried automatically. You do not need to do anything.";
  }
  return "Payment successful. Your supplier submission is being finalized.";
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessSkeleton />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);
  const clearCartRef = useRef(clearCart);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [ingramStatus, setIngramStatus] = useState("");
  const isClientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const showOrdersLink = isClientReady && Boolean(token);
  const handledSessionRef = useRef("");

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) return;

    // A full refresh remounts the component, so the ref alone is not enough.
    // Cache the successful confirmation per Stripe session for this tab and
    // never call the confirm endpoint twice for the same redirect.
    if (handledSessionRef.current === sessionId) return;
    handledSessionRef.current = sessionId;

    const cached = readConfirmationCache(sessionId);
    if (cached) {
      const normalized = normalizeConfirmation(cached);
      // Defer state updates outside the effect body so a cached refresh does
      // not trigger a cascading render on mount.
      queueMicrotask(() => {
        setOrderNumber((current) => normalized.orderNumber || current);
        setIngramStatus(normalized.ingramStatus);
        setLoading(false);
      });
      return;
    }

    markCompletedCheckoutCleanup();
    clearCompletedCheckoutStorage();
    clearCartRef.current();

    api.confirmCheckoutSession(sessionId, token)
      .then((res) => {
        const normalized = normalizeConfirmation(res);
        writeConfirmationCache(sessionId, res);
        if (normalized.orderNumber) setOrderNumber(normalized.orderNumber);
        setIngramStatus(normalized.ingramStatus);
      })
      .catch((error) => {
        toast.error(error.message || "Could not confirm payment");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, token]);

  return (
    <section className="container-page grid min-h-[56vh] place-items-center py-8 sm:py-12">
      <Card className="w-full max-w-lg p-5 text-center sm:p-8">
        <CheckCircle2 className="mx-auto size-12 text-tertiary sm:size-14" />
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:mt-5 sm:text-4xl">Payment confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:mt-4 sm:text-base">
          {statusMessage(ingramStatus, loading)}
        </p>
        {loading ? <p className="mt-2 text-sm font-medium text-on-surface-variant">Finalizing order...</p> : null}
        {orderNumber ? <p className="mt-2 text-sm font-semibold text-on-surface">Order {orderNumber}</p> : null}
        <div className="mt-6 flex w-full flex-col justify-center gap-3 sm:mt-7 sm:flex-row">
          {showOrdersLink ? <Button asChild href="/dashboard/orders" className="w-full whitespace-nowrap sm:w-auto"><Eye className="size-4" />View orders</Button> : null}
          <Button asChild href="/products" variant="outline" className="w-full whitespace-nowrap sm:w-auto">Continue Shopping</Button>
        </div>
      </Card>
    </section>
  );
}

function OrderSuccessSkeleton() {
  return <section className="container-page grid min-h-[56vh] place-items-center py-8 sm:py-12"><Card className="w-full max-w-lg p-5 text-center sm:p-8"><Skeleton className="mx-auto size-12 rounded-md sm:size-14" /><Skeleton className="mx-auto mt-4 h-9 w-64 max-w-full rounded-md sm:mt-5" /><Skeleton className="mx-auto mt-4 h-5 w-full max-w-sm rounded-md" /><div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row"><Skeleton className="h-11 w-full rounded-md sm:w-40" /><Skeleton className="h-11 w-full rounded-md sm:w-40" /></div></Card></section>;
}
