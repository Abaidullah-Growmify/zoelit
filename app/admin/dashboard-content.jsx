"use client";

import Image from "next/image";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Card } from "@/components/ui";
import { money, shortDate } from "@/lib/utils";

export function AdminDashboardContent({ orders, topProducts, lowStock, salesOverview }) {
  const orderColumns = [
    { key: "id", header: "Order", sortable: true, accessor: "id", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.id}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer.name, cellClassName: "min-w-0 whitespace-normal font-semibold" },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];
  const trend = chartTrend(salesOverview);

  return (
    <>
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminTable
          title="Recent orders"
          description="Search and filter the latest storefront activity."
          columns={orderColumns}
          data={orders}
          searchPlaceholder="Search order or customer"
          searchKeys={["id", (order) => order.customer.name, "status", "payment", "total"]}
          filters={[{ key: "status", label: "Filter recent orders by status", allLabel: "All statuses", options: Array.from(new Set(orders.map((order) => order.status))), value: (order) => order.status }]}
          rowActions={(order) => [
            { label: "View", href: `/admin/orders/${order.id}` },
            { label: "Edit", href: `/admin/orders/${order.id}` },
            { label: "Delete", tone: "danger", onClick: () => console.info(`Delete order ${order.id}`) },
          ]}
        />
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Sales overview</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last 7 days performance</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold tabular-nums text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{trend}</span>
            </div>
            <div className="mt-6 h-60 rounded-xl bg-gradient-to-b from-blue-50 to-slate-50 p-3 dark:from-blue-500/10 dark:to-slate-950">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverview} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortChartDate} axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                  <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tickMargin={8} width={44} fontSize={12} />
                  <Tooltip formatter={(value) => [money(value), "Revenue"]} labelFormatter={shortDate} contentStyle={{ borderRadius: 12, border: "1px solid rgb(226 232 240)", boxShadow: "0 18px 55px rgba(15, 23, 42, 0.12)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#salesRevenue)" dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold">Low stock alerts</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products that need quick attention.</p>
            <div className="mt-4 space-y-3">{lowStock.map((item) => <div key={item.productId} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"><div><p className="font-bold text-slate-950 dark:text-white">{item.productName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.sku}</p></div><strong className="rounded-full bg-white px-3 py-1 tabular-nums text-amber-700 dark:bg-slate-950 dark:text-amber-300">{item.currentStock}</strong></div>)}</div>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Top products</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Best-rated products with real catalog imagery.</p></div><Link href="/admin/products" aria-label="Open products" className="grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"><ArrowUpRight className="size-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topProducts.map((product) => <div key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900"><Image src={product.image} alt={product.name} width={420} height={280} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="font-bold text-slate-950 dark:text-white">{product.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.category}</p><p className="mt-3 font-heading text-lg font-bold tabular-nums">{money(product.price)}</p></div></div>)}</div>
      </Card>
    </>
  );
}

function chartTrend(data) {
  const first = data[0]?.revenue || 0;
  const last = data[data.length - 1]?.revenue || 0;
  if (!first) return "0%";
  const percent = ((last - first) / first) * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function shortChartDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}
