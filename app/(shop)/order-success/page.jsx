"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { Button, Card } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useProductStore } from "@/store/product-store";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function purgeCheckoutStorage() {
  if (typeof localStorage === "undefined") return;
  try {
    const removable = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      if (
        key === "zoelit-cart-guest"
        || key === "zoelit-cart"
        || key === "zoelit-cart-backup"
        || key.startsWith("zoelit-cart-user:")
        || key.startsWith("zoelit-checkout-draft:")
      ) {
        removable.push(key);
      }
    }
    removable.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [ingramOrderNumber, setIngramOrderNumber] = useState(params.get("ingram") || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let active = true;

    api.confirmCheckoutSession(sessionId)
      .then((res) => {
        if (!active) return;
        if (res?.order?.customerOrderNumber || res?.order?.orderNumber) setOrderNumber(res.order.customerOrderNumber || res.order.orderNumber);
        if (res?.ingram?.ingramOrderNumber) setIngramOrderNumber(res.ingram.ingramOrderNumber);
        if (res?.success || res?.order) {
          clearCart();
          purgeCheckoutStorage();
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
  }, [clearCart, fetchProducts, sessionId]);

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <Card className="max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-6 font-heading text-4xl font-extrabold">Order confirmed</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Payment successful. Your order is being processed.</p>
        {loading ? <p className="mt-4 text-body font-medium text-slate-600 dark:text-slate-300">Finalizing order...</p> : null}
        {orderNumber ? <p className="mt-2 text-body font-semibold text-slate-900 dark:text-white">Order #{orderNumber}</p> : null}
        {ingramOrderNumber ? <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Ingram order: {ingramOrderNumber}</p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {mounted && token ? <Button asChild href="/dashboard/orders" aria-label="View orders"><Eye className="size-4" /></Button> : null}
          <Button asChild href="/products" variant="outline">Continue Shopping</Button>
        </div>
      </Card>
    </section>
  );
}
