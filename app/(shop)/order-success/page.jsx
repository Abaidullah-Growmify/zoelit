"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { Button, Card, Skeleton } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useProductStore } from "@/store/product-store";
import { clearCompletedCheckoutStorage, markCompletedCheckoutCleanup } from "@/store";

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
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [ingramOrderNumber, setIngramOrderNumber] = useState(params.get("ingram") || "");
  const isClientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const showOrdersLink = isClientReady && Boolean(token);
  const handledSessionRef = useRef("");

  useEffect(() => {
    if (!sessionId) return;

    // useCartStore builds a fresh store object on every render, so the
    // clearCart/fetchProducts identities change constantly. Guarding on the
    // session id keeps this from re-running and looping on its own dispatch.
    if (handledSessionRef.current === sessionId) return;
    handledSessionRef.current = sessionId;

    let active = true;

    // Stripe only redirects here after the payment is done, so empty the cart
    // right away. Waiting for the confirm call left the cart full whenever that
    // request was slow or failed, and customers then saw an order they had
    // already paid for still sitting in their cart.
    markCompletedCheckoutCleanup();
    clearCompletedCheckoutStorage();
    clearCart();

    api.confirmCheckoutSession(sessionId, token)
      .then((res) => {
        if (!active) return;
        if (res?.order?.publicOrderId || res?.order?.orderNumber) setOrderNumber(res.order.publicOrderId || res.order.orderNumber);
        if (res?.ingram?.ingramOrderNumber) setIngramOrderNumber(res.ingram.ingramOrderNumber);
        if (res?.success || res?.order) {
          fetchProducts().catch(() => {});
        }
      })
      .catch((error) => {
        if (!active) return;
        toast.error(error.message || "Could not confirm payment");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [clearCart, fetchProducts, sessionId, token]);

  return (
    <section className="container-page grid min-h-[56vh] place-items-center py-8 sm:py-12">
      <Card className="w-full max-w-lg p-5 text-center sm:p-8">
        <CheckCircle2 className="mx-auto size-12 text-tertiary sm:size-14" />
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:mt-5 sm:text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant sm:mt-4 sm:text-base">Payment successful. Your order is being processed.</p>
        {loading ? <p className="mt-2 text-sm font-medium text-on-surface-variant">Finalizing order...</p> : null}
        {orderNumber ? <p className="mt-2 text-sm font-semibold text-on-surface">Order {orderNumber}</p> : null}
        {ingramOrderNumber ? <p className="mt-1 text-sm text-on-surface-variant">Ingram order: {ingramOrderNumber}</p> : null}
        <div className="mt-6 grid grid-cols-2 justify-center gap-3 sm:mt-7 sm:flex">
          {showOrdersLink ? <Button asChild href="/dashboard/orders" className="w-full sm:w-auto"><Eye className="size-4" />View orders</Button> : null}
          <Button asChild href="/products" variant="outline" className="w-full sm:w-auto">Continue Shopping</Button>
        </div>
      </Card>
    </section>
  );
}

function OrderSuccessSkeleton() {
  return <section className="container-page grid min-h-[56vh] place-items-center py-8 sm:py-12"><Card className="w-full max-w-lg p-5 text-center sm:p-8"><Skeleton className="mx-auto size-12 rounded-full sm:size-14" /><Skeleton className="mx-auto mt-4 h-9 w-64 max-w-full rounded-md sm:mt-5" /><Skeleton className="mx-auto mt-4 h-5 w-full max-w-sm rounded-md" /><div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7"><Skeleton className="h-11 w-full rounded-md" /><Skeleton className="h-11 w-full rounded-md" /></div></Card></section>;
}
