"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Eye } from "lucide-react";
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
  const orderNumber = params.get("order");
  const ingramOrderNumber = params.get("ingram");

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <Card className="max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-6 font-heading text-4xl font-extrabold">Order confirmed</h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Thanks for shopping with ZoeLit. Your confirmation and tracking updates will appear in your account dashboard.</p>
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