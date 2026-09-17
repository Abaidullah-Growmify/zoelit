"use client";

import Image from "next/image";
import { CheckCircle2, Circle, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { Badge, Button, Card } from "@/components/ui";
import { OrderDetailSkeleton } from "@/components/skeletons";
import { usePolling } from "@/lib/use-polling";
import { InvoicePrint } from "@/components/invoice-print";
import { BulletNotes } from "@/components/bullet-notes";

export function OrderDetail({ id }) {
  const token = useAuthStore((state) => state.token);
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token || !id) return;
    Promise.all([
      api.getOrder(id, token),
      api.getAddresses(token).catch(() => ({ addresses: [] })),
    ])
      .then(([orderRes, addressRes]) => {
        setOrder(orderRes.order);
        setAddress(addressRes.addresses.find((item) => item.default) || addressRes.addresses[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  usePolling(load, [id, token], 30000, !loading);

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div>
        <DashboardPageHeader title="Order not found" description="We could not find the order you are looking for." />
      </div>
    );
  }

  const activeIndex = statuses.indexOf(order.status);
  const timelineStatuses = statuses.filter((status) => status !== "Cancelled");
  const invoiceBilling = address
    ? { firstName: address.name, address: address.line1, city: address.city, state: address.region, postal: address.postal }
    : {};

  return (
    <>
      <div className="print:hidden space-y-6 pb-2">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-0 shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Account / Order details</p>
              <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Order #{order.customerOrderNumber || order.orderNumber}</h1>
              <p className="mt-2 text-sm text-on-surface-variant">Placed {shortDate(order.date)} · Review your order and delivery progress.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="slate">{order.status}</Badge>
              <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print invoice</Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Progress</p><h2 className="mt-1 font-heading text-lg font-bold text-on-surface">Order timeline</h2></div><span className="text-sm font-semibold text-on-surface-variant">{order.status}</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
            {timelineStatuses.map((status, index) => {
              const done = order.status === "Cancelled" ? false : index <= activeIndex;
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <div key={status} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                  <span className={done ? "text-primary" : "text-slate-300 dark:text-slate-600"}><Icon className="size-5" /></span>
                  <span className={done ? "text-[11px] font-bold leading-4 text-on-surface" : "text-[11px] font-medium leading-4 text-on-surface-variant"}>{status}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Purchased items</p>
                <h2 className="mt-1 font-heading text-xl font-bold text-on-surface">Order summary</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Placed {shortDate(order.date)}</p>
              </div>
              <Badge>{order.status}</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {(order.items || []).map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-outline-variant/70 bg-surface-container-low/30 p-3">
                  {item.image ? (
                      <Image src={item.image} alt={item.name} width={72} height={72} unoptimized className="size-[72px] rounded-lg object-cover" />
                  ) : (
                    <div className="size-[72px] shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  )}
                  <div className="flex-1">
                    <h3 className="line-clamp-2 font-heading text-sm font-bold leading-tight text-on-surface">{item.name}</h3>
                    <p className="mt-1 text-xs font-medium tabular-nums text-on-surface-variant">Qty {Math.floor(Number(item.quantity)) || 0}</p>
                  </div>
                  <strong className="font-semibold tabular-nums text-slate-950 dark:text-white">{money((Number(item.price) || 0) * (Math.floor(Number(item.quantity)) || 1))}</strong>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-outline-variant pt-4 font-heading text-lg font-bold text-on-surface">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="tabular-nums">{money(order.total)}</span>
              </div>
            </div>
            </Card>

            {(order.fulfillmentGroups || []).length ? order.fulfillmentGroups.map((group) => (
              <Card key={group._id} className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Fulfillment</p><h2 className="mt-1 font-heading text-lg font-bold text-on-surface">{group.source === "ingram" ? "Ingram shipment" : "Manual shipment"}</h2></div><Badge>{group.status}</Badge></div>
                <p className="mt-3 text-sm text-on-surface-variant">{group.items?.map((item) => item.name).join(", ")}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2"><ShipmentInfo label="Carrier" value={group.carrierName || "—"} /><ShipmentInfo label="Tracking number" value={group.tracking || "—"} /><ShipmentInfo label="Ship date" value={group.shipDate ? shortDate(group.shipDate) : "—"} />{group.source === "ingram" ? <ShipmentInfo label="Ingram order number" value={group.providerOrderNumber || order.ingramOrderNumber || "—"} /> : null}<ShipmentInfo label="Invoice number" value={group.invoiceNumber || "—"} /></div>
              </Card>
            )) : (
              <Card className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Fulfillment</p><h2 className="mt-1 font-heading text-lg font-bold text-on-surface">Shipment</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><ShipmentInfo label="Carrier" value={order.carrierName || "—"} /><ShipmentInfo label="Tracking number" value={order.tracking || "—"} /><ShipmentInfo label="Ship date" value={order.shipDate ? shortDate(order.shipDate) : "—"} /><ShipmentInfo label="Ingram order number" value={order.ingramOrderNumber || "—"} /><ShipmentInfo label="Invoice number" value={order.invoiceNumber || "—"} /></div></Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="border-primary/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Delivery</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-on-surface">Shipping address</h2>
              {address ? (
                <p className="mt-3 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">
                  {address.name}<br />
                  {address.line1}<br />
                  {address.city}, {address.region} {address.postal}
                </p>
              ) : (
                <p className="mt-3 text-body font-regular text-slate-500 dark:text-slate-400">No saved shipping address on file.</p>
              )}
            </Card>
            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Payment</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-on-surface">Payment details</h2>
              <p className="mt-3"><Badge tone="slate">{order.payment}</Badge></p>
              <p className="mt-5 text-body font-regular text-slate-500 dark:text-slate-400">Tracking: {order.tracking || "Not available yet"}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Instructions</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-on-surface">Order notes</h2>
              <div className="mt-3"><BulletNotes notes={order.notes} /></div>
            </Card>
          </aside>
        </div>

      </div>

      <InvoicePrint order={{ ...order, items: order.items || [], billing: invoiceBilling }} />
    </>
  );
}

function ShipmentInfo({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="text-right font-semibold tabular-nums text-slate-950 dark:text-white">{value}</strong>
    </div>
  );
}
