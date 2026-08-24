"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Printer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { AdminOrderDetailSkeleton } from "@/components/skeletons";
import { cancelAdminOrder, getAdminOrder, updateAdminOrderStatus } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { usePolling } from "@/lib/use-polling";
import { InvoicePrint } from "@/components/invoice-print";
import { BulletNotes, BulletTextarea } from "@/components/bullet-notes";

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Invoiced",
  "On Hold",
  "Backordered",
  "Shipped",
  "Delivered",
  "Voided",
  "Cancelled",
];

export function AdminOrderDetail({ id }) {
  const token = useAdminAuthStore((state) => state.token);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const dirtyRef = useRef(false);

  const load = useCallback(() => {
    if (!token || !id) return;
    if (dirtyRef.current) return;
    getAdminOrder(id, token)
      .then((data) => {
        setOrder(data.order);
        setStatus(data.order.status);
        setTracking(data.order.tracking || "");
        setCarrier(data.order.carrierName || "");
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id, token]);

  useEffect(() => {
    dirtyRef.current = false;
    load();
  }, [load]);

  usePolling(load, [id, token], 30000, !loading);

  async function handleUpdate() {
    if (!token) return;
    setSaving(true);
    try {
      const data = await updateAdminOrderStatus(id, { status, tracking, carrierName: carrier, note }, token);
      setOrder(data.order);
      setStatus(data.order.status);
      setTracking(data.order.tracking || "");
      setCarrier(data.order.carrierName || "");
      dirtyRef.current = false;
      toast.success("Order updated");
    } catch (error) {
      toast.error(error.message || "Could not update order");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!token) return;
    if (!window.confirm("Cancel this order with Ingram Micro? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const data = await cancelAdminOrder(id, token);
      setOrder(data.order);
      setStatus(data.order.status);
      dirtyRef.current = false;
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(error.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <AdminOrderDetailSkeleton />;
  }

  if (notFound || !order) {
    return <AdminPageHeader title="Order not found" description="We could not find the order you are looking for." />;
  }

  const customer = order.customer || {};
  const billing = order.billing || {};

  return (
    <>
      <div className="print:hidden">
        <AdminPageHeader title={`Order #${order.orderNumber}`} description={`Placed by ${customer.name || "Unknown"} on ${shortDate(order.date)}. Live status and fulfilment controls.`} action={<Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print invoice</Button>} />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-h2 font-semibold">Order items</h2>
                  <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Payment via {order.paymentMethod || "stripe"} · {order.payment}</p>
                </div>
                <AdminStatusBadge>{order.status}</AdminStatusBadge>
              </div>
              <div className="mt-6 space-y-5">
                {(order.lineItems || []).map((item) => (
                  <div key={item.productId} className="flex gap-4 rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={96} height={96} unoptimized className="size-24 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                    ) : (
                      <div className="size-24 shrink-0 rounded-md bg-slate-200 dark:bg-slate-800" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-heading text-h3 font-semibold text-slate-950 dark:text-white">{item.name}</h3>
                      <p className="mt-1 text-body font-regular tabular-nums text-slate-500 dark:text-slate-400">Qty {Math.floor(Number(item.quantity)) || 0}</p>
                    </div>
                    <strong className="font-semibold tabular-nums">{money((Number(item.price) || 0) * (Math.floor(Number(item.quantity)) || 1))}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-slate-200 pt-5 text-body dark:border-slate-800">
                <Summary label="Subtotal" value={money(order.subtotal || 0)} />
                <Summary label="Shipping" value={money(order.shippingFee || 0)} />
                <Summary label="Discount" value={`-${money(order.discount || 0)}`} />
                <Summary label="Total" value={money(order.total || 0)} strong />
              </div>
            </Card>

            <Card>
              <h2 className="font-heading text-h2 font-semibold">Ingram Micro fulfilment</h2>
              <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Order synchronisation with Ingram Micro and shipment details.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="Ingram order number" value={order.ingramOrderNumber || "Not submitted"} />
                <Info label="OMS order ID" value={order.omsOrderId || "—"} />
                <Info label="Carrier" value={order.carrierName || "—"} />
                <Info label="Ship date" value={order.shipDate ? shortDate(order.shipDate) : "—"} />
                <Info label="Tracking number" value={order.tracking || "—"} />
                <Info label="Invoice number" value={order.invoiceNumber || "—"} />
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-meta font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Sync status</span>
                <div className="mt-2"><AdminStatusBadge>{order.ingramSync === "submitted" ? "Synced" : order.ingramSync === "failed" ? "Failed" : order.ingramSync === "cancelled" ? "Cancelled" : "Not synced"}</AdminStatusBadge></div>
              </div>
            </Card>

            <Card>
              <h2 className="font-heading text-h2 font-semibold">Order notes</h2>
              <div className="mt-3 min-w-0 overflow-hidden">
                <BulletNotes notes={order.notes} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="font-heading text-h2 font-semibold">Admin controls</h2>
              <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Update fulfilment state and shipment details.</p>
              <div className="mt-5 space-y-4">
                <Field label="Order status">
                  <Select value={status} onChange={(event) => { setStatus(event.target.value); dirtyRef.current = true; }}>
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                </Field>
                <Field label="Tracking number">
                  <Input value={tracking} onChange={(event) => { setTracking(event.target.value); dirtyRef.current = true; }} placeholder="ZX-000000" />
                </Field>
                <Field label="Carrier name">
                  <Input value={carrier} onChange={(event) => { setCarrier(event.target.value); dirtyRef.current = true; }} placeholder="DHL Express" />
                </Field>
                <Field label="Internal note">
                  <BulletTextarea className="min-h-24" value={note} onChange={(event) => { setNote(event.target.value); dirtyRef.current = true; }} placeholder="Optional note for the status update" />
                </Field>
                <Button className="w-full" onClick={handleUpdate} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null} Update order
                </Button>
                <Button className="w-full" variant="outline" onClick={handleCancel} disabled={cancelling || order.status === "Cancelled"}>
                  <XCircle className="size-4" /> {cancelling ? "Cancelling..." : order.status === "Cancelled" ? "Order cancelled" : "Cancel order"}
                </Button>
              </div>
            </Card>
            <Card>
              <h2 className="font-heading text-h2 font-semibold">Customer</h2>
              <p className="mt-4 text-body font-semibold text-slate-950 dark:text-white">{customer.name || "Unknown"}</p>
              <p className="text-body font-regular text-slate-500 dark:text-slate-400">{customer.email || "—"}</p>
              <p className="mt-3 text-body font-regular text-slate-500 dark:text-slate-400">{customer.phone || "—"}</p>
            </Card>
            <Card>
              <h2 className="font-heading text-h2 font-semibold">Shipping address</h2>
              <p className="mt-4 min-w-0 break-words text-body font-regular leading-6 text-slate-600 [overflow-wrap:anywhere] dark:text-slate-300">
                {billing.firstName} {billing.lastName}<br />
                {billing.address || "—"}<br />
                {billing.city}, {billing.state} {billing.postal}<br />
                {billing.email} · {billing.phone}
              </p>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <h2 className="font-heading text-h2 font-semibold">Timeline</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(order.statusHistory && order.statusHistory.length ? order.statusHistory : [{ status: "Pending", date: order.date }]).map((event, index) => (
              <div key={`${event.status}-${index}`} className="flex min-w-0 gap-3 rounded-md bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
                <CheckCircle2 className="size-5 shrink-0 text-blue-600 dark:text-blue-300" />
                <div className="min-w-0">
                  <p className="break-words text-body font-semibold text-slate-950 [overflow-wrap:anywhere] dark:text-white">{event.status}</p>
                  <p className="mt-0.5 break-words text-meta font-regular text-slate-500 [overflow-wrap:anywhere] dark:text-slate-400">{event.eventType || "event"} · {shortDate(event.date)}</p>
                  {event.note ? <p className="mt-1 break-words text-meta font-regular text-slate-500 [overflow-wrap:anywhere] dark:text-slate-400">{event.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <InvoicePrint order={order} />
    </>
  );
}

function Summary({ label, value, strong }) {
  return (
    <div className={strong ? "flex justify-between font-heading text-h2 font-semibold" : "flex justify-between text-body font-regular text-slate-500 dark:text-slate-400"}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-meta font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-all text-body font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
