"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { Button, Card } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useProductStore } from "@/store/product-store";
import { clearCompletedCheckoutStorage, markCompletedCheckoutCleanup } from "@/store";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
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
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <Card className="max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-16 text-tertiary" />
        <h1 className="mt-6 font-heading text-display-xl font-extrabold">Order confirmed</h1>
        <p className="mt-4 text-on-surface-variant">Payment successful. Your order is being processed.</p>
        {loading ? <p className="mt-4 text-body-md font-medium text-on-surface-variant">Finalizing order...</p> : null}
        {orderNumber ? <p className="mt-2 text-body-md font-semibold text-on-surface">Order {orderNumber}</p> : null}
        {ingramOrderNumber ? <p className="mt-1 text-body-md font-normal text-on-surface-variant">Ingram order: {ingramOrderNumber}</p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {showOrdersLink ? <Button asChild href="/dashboard/orders" aria-label="View orders"><Eye className="size-4" /></Button> : null}
          <Button asChild href="/products" variant="outline">Continue Shopping</Button>
        </div>
      </Card>
    </section>
  );
}
