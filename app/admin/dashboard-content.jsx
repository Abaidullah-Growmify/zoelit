"use client";

import Link from "next/link";
import Image from "next/image";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Card } from "@/components/ui";
import { statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";

export function AdminDashboardContent({ orders, topProducts, lowStock, salesOverview }) {
  const orderColumns = [
    { key: "orderNumber", header: "Order", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.orderNumber || order.id || order.ingramOrderNumber}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer?.name || "—", cellClassName: "min-w-0 whitespace-normal font-semibold" },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];
  const trend = chartTrend(salesOverview);

  return (
    <>
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        <Card className="h-full overflow-hidden p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em]">Sales overview</h2>
              <p className="mt-1 text-body font-regular text-slate-600 dark:text-slate-300">Revenue across the last 6 months</p>
            </div>
            {trend ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-meta font-semibold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{trend}</span> : null}
          </div>
          <div className="mt-6 h-60 rounded-md bg-gradient-to-b from-blue-50 to-slate-50 p-3 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-950 dark:ring-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverview} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(value) => String(value)} axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tickMargin={8} width={44} fontSize={12} />
                <Tooltip formatter={(value) => [money(value), "Revenue"]} labelFormatter={(value) => String(value)} contentStyle={{ borderRadius: 12, border: "1px solid rgb(226 232 240)", boxShadow: "0 18px 55px rgba(15, 23, 42, 0.12)" }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#salesRevenue)" dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="h-full p-5 shadow-sm">
          <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em]">Low stock alerts</h2>
          <p className="mt-1 text-body font-regular text-slate-600 dark:text-slate-300">Products that need quick attention.</p>
          <div className="mt-4 space-y-3">
            {lowStock.length ? (
              lowStock.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 rounded-md border border-amber-200/70 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} width={40} height={40} className="size-10 shrink-0 rounded-md object-cover ring-1 ring-amber-200 dark:ring-amber-500/30" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-body font-semibold text-amber-900 dark:text-amber-50">{item.productName}</p>
                      <p className="truncate text-meta font-semibold text-amber-700 dark:text-amber-200">{item.sku}</p>
                    </div>
                  </div>
                  <strong className="shrink-0 rounded-full bg-white px-3 py-1 text-meta font-semibold tabular-nums text-amber-800 dark:bg-slate-950 dark:text-amber-300">{item.currentStock}</strong>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-body font-regular text-slate-500 dark:text-slate-400">All products are well stocked.</p>
            )}
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-h2 font-semibold tracking-[-0.03em]">Top products</h2>
            <p className="mt-1 text-body font-regular text-slate-600 dark:text-slate-300">Best-selling products by quantity ordered.</p>
          </div>
          <Link href="/admin/products" aria-label="Open products" className="grid size-9 shrink-0 place-items-center rounded-sm text-blue-700 transition hover:bg-slate-100 hover:text-blue-950 dark:text-blue-300 dark:hover:bg-slate-800 dark:hover:text-blue-50"><ArrowUpRight className="size-4" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topProducts.length ? (
            topProducts.map((product) => (
              <div key={product.productId} className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={56} height={56} className="size-14 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                ) : (
                  <div className="grid size-14 shrink-0 place-items-center rounded-md bg-slate-200 text-meta font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">IT</div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-heading text-h3 font-semibold text-slate-950 dark:text-white">{product.name}</p>
                  <p className="mt-1 text-meta font-semibold tabular-nums text-slate-500 dark:text-slate-400">{product.qty} sold · {money(product.revenue)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-body font-regular text-slate-500 dark:text-slate-400">No sales yet.</p>
          )}
        </div>
      </Card>
      <AdminTable
        className="mt-6"
        title="Recent orders"
        description="Latest storefront orders with live status."
        columns={orderColumns}
        data={orders}
        searchPlaceholder="Search order or customer"
        searchKeys={["orderNumber", "id", (order) => order.customer?.name, "status", "payment", "total"]}
        filters={[{ key: "status", label: "Filter recent orders by status", allLabel: "All statuses", options: statuses, value: (order) => order.status }]}
        rowActions={(order) => [
          { label: "View", href: `/admin/orders/${order.id}` },
        ]}
      />
    </>
  );
}

function chartTrend(data) {
  if (!data.length) return "";
  const first = data[0]?.revenue || 0;
  const last = data[data.length - 1]?.revenue || 0;
  if (!first) return "0%";
  const percent = ((last - first) / first) * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}