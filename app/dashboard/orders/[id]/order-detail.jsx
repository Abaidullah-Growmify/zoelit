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
      <div className="print:hidden">
        <DashboardPageHeader
          title={`Order #${order.customerOrderNumber || order.orderNumber}`}
          description={`Placed ${shortDate(order.date)}. Review shipment progress, items, payment, and delivery information.`}
          action={<Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print invoice</Button>}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-h2 font-semibold">Summary</h2>
                <p className="text-body font-regular text-slate-500 dark:text-slate-400">Placed {shortDate(order.date)}</p>
              </div>
              <Badge>{order.status}</Badge>
            </div>

            <div className="mt-6 space-y-5">
              {(order.items || []).map((item) => (
                <div key={item.productId} className="flex gap-4">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={92} height={92} unoptimized className="size-24 rounded-md object-cover" />
                  ) : (
                    <div className="size-24 shrink-0 rounded-md bg-slate-100 dark:bg-slate-800" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-heading text-h3 font-semibold">{item.name}</h3>
                    <p className="text-body font-regular tabular-nums text-slate-500 dark:text-slate-400">Qty {Math.floor(Number(item.quantity)) || 0}</p>
                  </div>
                  <strong className="font-semibold tabular-nums text-slate-950 dark:text-white">{money((Number(item.price) || 0) * (Math.floor(Number(item.quantity)) || 1))}</strong>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5 font-heading text-h2 font-semibold dark:border-slate-800">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="tabular-nums">{money(order.total)}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="font-heading text-h3 font-semibold">Shipping address</h2>
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
            <Card>
              <h2 className="font-heading text-h3 font-semibold">Payment</h2>
              <p className="mt-3"><Badge tone="slate">{order.payment}</Badge></p>
              <p className="mt-5 text-body font-regular text-slate-500 dark:text-slate-400">Tracking: {order.tracking || "Not available yet"}</p>
            </Card>
            <Card>
              <h2 className="font-heading text-h3 font-semibold">Order notes</h2>
              <div className="mt-3"><BulletNotes notes={order.notes} /></div>
            </Card>
             {(order.fulfillmentGroups || []).length ? order.fulfillmentGroups.map((group) => (
               <Card key={group._id}>
                 <div className="flex items-center justify-between gap-3">
                   <h2 className="font-heading text-h3 font-semibold">{group.source === "ingram" ? "Ingram shipment" : "Manual shipment"}</h2>
                   <Badge>{group.status}</Badge>
                 </div>
                 <p className="mt-3 text-body font-regular text-slate-500 dark:text-slate-400">{group.items?.map((item) => item.name).join(", ")}</p>
                 <div className="mt-4 space-y-3 text-body font-regular">
                   <ShipmentInfo label="Carrier" value={group.carrierName || "—"} />
                   <ShipmentInfo label="Tracking number" value={group.tracking || "—"} />
                   <ShipmentInfo label="Ship date" value={group.shipDate ? shortDate(group.shipDate) : "—"} />
                   {group.source === "ingram" ? <ShipmentInfo label="Ingram order number" value={group.providerOrderNumber || order.ingramOrderNumber || "—"} /> : null}
                   <ShipmentInfo label="Invoice number" value={group.invoiceNumber || "—"} />
                 </div>
               </Card>
             )) : (
               <Card>
                 <h2 className="font-heading text-h3 font-semibold">Shipment</h2>
                 <div className="mt-4 space-y-3 text-body font-regular">
                   <ShipmentInfo label="Carrier" value={order.carrierName || "—"} />
                   <ShipmentInfo label="Tracking number" value={order.tracking || "—"} />
                   <ShipmentInfo label="Ship date" value={order.shipDate ? shortDate(order.shipDate) : "—"} />
                   <ShipmentInfo label="Ingram order number" value={order.ingramOrderNumber || "—"} />
                   <ShipmentInfo label="Invoice number" value={order.invoiceNumber || "—"} />
                 </div>
               </Card>
             )}
          </div>
        </div>

        <Card className="mt-6">
          <h2 className="font-heading text-h2 font-semibold">Order timeline</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {timelineStatuses.map((status, index) => {
              const done = order.status === "Cancelled" ? false : index <= activeIndex;
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={done ? "text-blue-600 dark:text-blue-300" : "text-slate-300 dark:text-slate-600"}>
                    <Icon className="size-5" />
                  </span>
                  <span className={done ? "text-body font-semibold text-slate-950 dark:text-white" : "text-body font-regular text-slate-500 dark:text-slate-400"}>{status}</span>
                </div>
              );
            })}
          </div>
        </Card>
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
