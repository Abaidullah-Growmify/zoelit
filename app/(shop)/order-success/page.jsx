"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card } from "@/components/ui";

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
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState(params.get("order"));
  const [ingramOrderNumber, setIngramOrderNumber] = useState(params.get("ingram"));
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!sessionId || !token) {
      setLoading(false);
      return;
    }

    let active = true;

    api.confirmCheckoutSession(sessionId, token)
      .then((res) => {
        if (!active) return;
        setOrderNumber(res.order?.orderNumber || params.get("order") || null);
        setIngramOrderNumber(res.ingram?.ingramOrderNumber || res.order?.ingramOrderNumber || params.get("ingram") || null);
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
  }, [sessionId, token]);

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <Card className="max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-6 font-heading text-4xl font-extrabold">Order confirmed</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Thanks for shopping with ZoeLit. Your confirmation and tracking updates will appear in your account dashboard.</p>
        {loading ? <p className="mt-4 inline-flex items-center gap-2 text-body font-semibold text-slate-600 dark:text-slate-300"><Loader2 className="size-4 animate-spin" /> Finalizing your order...</p> : null}
        {orderNumber ? <p className="mt-4 text-body font-semibold text-slate-900 dark:text-white">Order #{orderNumber}</p> : null}
        {ingramOrderNumber ? <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Ingram order: {ingramOrderNumber}</p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild href="/dashboard/orders" aria-label="Open orders"><Eye className="size-4" /></Button>
          <Button asChild href="/products" variant="outline">Continue Shopping</Button>
        </div>
      </Card>
    </section>
  );
}
