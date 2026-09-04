"use client";

import Link from "next/link";
import Image from "next/image";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import { Card } from "@/components/ui";
import { updateAdminOrderStatus } from "@/lib/api";
import { statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function AdminDashboardContent({ orders, topProducts, lowStock, salesOverview }) {
  const token = useAdminAuthStore((state) => state.token);
  const [tableOrders, setTableOrders] = useState(orders || []);
  const numberedOrders = tableOrders.map((order, index) => ({ ...order, serial: index + 1 }));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTableOrders(orders || []);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [orders]);

  async function handleOrderStatusChange(order, nextStatus) {
    const previousOrders = tableOrders;
    setTableOrders((current) => current.map((row) => row.id === order.id ? { ...row, status: nextStatus } : row));

    try {
      await updateAdminOrderStatus(order.id, { status: nextStatus, note: "Status updated from admin dashboard" }, token);
      toast.success("Order status updated");
    } catch (statusError) {
      setTableOrders(previousOrders);
      toast.error(statusError.message || "Could not update order status");
    }
  }

  const orderColumns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
    { key: "orderNumber", header: "Order", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => `#${order.orderNumber || order.id || order.ingramOrderNumber}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer?.name || "—", cellClassName: "min-w-0 whitespace-normal font-semibold text-on-surface" },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge className="text-label-md font-normal text-on-surface-variant">{order.payment}</AdminStatusBadge> },
    { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.orderNumber || order.id}`} /> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.total) },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <OrderStatusSelect order={order} onChange={handleOrderStatusChange} /> },
  ];
  const trend = chartTrend(salesOverview);

  return (
    <>
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        <Card className="flex h-full flex-col overflow-hidden p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Sales overview</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Revenue across the last 6 months</p>
            </div>
            {trend ? <span className="rounded-lg bg-tertiary-container px-3 py-1 text-label-sm font-semibold tabular-nums text-on-tertiary">{trend}</span> : null}
          </div>
          <div className="mt-6 min-h-60 flex-1 rounded-2xl bg-surface-container-low/70 p-3 ring-1 ring-outline-variant/70">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverview} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-outline) / 0.35)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => String(value)} axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tickMargin={8} width={44} fontSize={12} />
                <Tooltip formatter={(value) => [money(value), "Revenue"]} labelFormatter={(value) => String(value)} contentStyle={{ borderRadius: 12, border: "1px solid rgb(var(--color-outline-variant))", boxShadow: "0 18px 55px rgb(15 23 42 / 0.12)", background: "var(--color-surface-container-lowest)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fill="url(#salesRevenue)" dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface-container-lowest)" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="h-full p-5">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Low stock alerts</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Products that need quick attention.</p>
          <div className="mt-4 space-y-3">
            {lowStock.length ? (
              lowStock.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} width={40} height={40} className="size-10 shrink-0 rounded-md object-cover ring-1 ring-amber-200 dark:ring-amber-500/30" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-body-md font-semibold text-on-secondary-container">{item.productName}</p>
                      <p className="truncate text-label-sm font-semibold text-on-secondary-container">{item.sku}</p>
                    </div>
                  </div>
                  <strong className="shrink-0 rounded-lg bg-surface-container-lowest px-3 py-1 text-label-sm font-semibold tabular-nums text-on-surface">{item.currentStock}</strong>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-body-md font-normal text-on-surface-variant">All products are well stocked.</p>
            )}
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Top products</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Best-selling products, with catalog products shown until sales are available.</p>
          </div>
          <Link href="/admin/products" aria-label="Open products" className="icon-btn size-8 text-primary"><ArrowUpRight className="size-4" /></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topProducts.length ? (
            topProducts.map((product, index) => (
              <div key={`${product.productId}-${index}`} className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low/60 p-3">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={56} height={56} className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-outline-variant" />
                ) : (
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant">IT</div>
                )}
                <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-on-surface">{product.name}</p>
                    <p className="mt-1 text-label-sm font-semibold tabular-nums text-on-surface-variant">
                      {product.fallback ? `${product.qty} in stock · ${money(product.revenue)}` : `${product.qty} sold · ${money(product.revenue)}`}
                    </p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-body-md font-normal text-on-surface-variant">No sales yet.</p>
          )}
        </div>
      </Card>
      <AdminTable
        className="mt-6"
        title="Recent orders"
        description="Latest storefront orders with live status."
        columns={orderColumns}
        data={numberedOrders}
        searchPlaceholder="Search order or customer"
        searchKeys={["orderNumber", "id", (order) => order.customer?.name, "status", "payment", "total"]}
        filters={[{ key: "status", label: "Filter recent orders by status", allLabel: "All statuses", options: statuses, value: (order) => order.status }]}
        rowActions={(order) => [
          { label: "View", href: `/admin/orders/${order.id}` },
        ]}
        disableInitialSort
      />
    </>
  );
}

function OrderStatusSelect({ order, onChange }) {
  const status = order.status || "Pending";

  return (
    <span className="relative inline-flex w-fit items-center">
      <select
        value={status}
        onChange={(event) => onChange(order, event.target.value)}
        disabled={Boolean(order.fulfillmentGroups?.length)}
        aria-label={`Change status for order ${order.orderNumber || order.id}`}
        className={`h-8 w-fit appearance-none rounded-lg border-0 py-0 pl-3 pr-8 text-label-sm font-semibold shadow-none outline-none ring-0 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${statusClassName(status)}`}
      >
        {statuses.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-current" />
    </span>
  );
}

function statusClassName(status) {
  if (["Delivered", "Invoiced"].includes(status)) return "bg-emerald-100 text-emerald-700 focus:ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (["Cancelled", "Voided"].includes(status)) return "bg-rose-100 text-rose-700 focus:ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-300";
  if (["Shipped", "Processing"].includes(status)) return "bg-blue-100 text-blue-700 focus:ring-blue-500/20 dark:bg-blue-950/50 dark:text-blue-300";
  return "bg-amber-100 text-amber-700 focus:ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300";
}

function chartTrend(data) {
  if (!data.length) return "";
  const first = data[0]?.revenue || 0;
  const last = data[data.length - 1]?.revenue || 0;
  if (!first) return "0%";
  const percent = ((last - first) / first) * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}
