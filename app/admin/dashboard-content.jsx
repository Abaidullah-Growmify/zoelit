"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, ArrowUpRight, Eye, Search } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Select } from "@/components/ui";
import { money, shortDate } from "@/lib/utils";

export function AdminDashboardContent({ orders, topProducts, lowStock, salesOverview }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const statuses = ["All statuses", ...Array.from(new Set(orders.map((order) => order.status)))];
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = status === "All statuses" || order.status === status;
    const matchesQuery = !normalizedQuery || [order.id, order.customer.name, order.payment, order.total].some((value) => String(value).toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesQuery;
  });
  const visibleOrders = filteredOrders.slice(0, 5);
  const trend = chartTrend(salesOverview);

  return (
    <>
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-0">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-black">Recent orders</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search and filter the latest storefront activity.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] lg:w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order or customer" aria-label="Search recent orders" className="pl-10" />
                </div>
                <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter recent orders by status" className="w-full">
                  {statuses.map((option) => <option key={option}>{option}</option>)}
                </Select>
              </div>
            </div>
          </div>
          <AdminTable columns={["Order", "Customer", "Date", "Status", "Payment", "Total", ""]} className="rounded-none border-0 shadow-none" wrapperClassName="overflow-visible" tableClassName="table-auto">
            {visibleOrders.map((order) => (
              <AdminTableRow key={order.id}>
                <AdminTableCell className="font-black text-slate-950 dark:text-white">#{order.id}</AdminTableCell>
                <AdminTableCell className="min-w-0 whitespace-normal font-semibold">{order.customer.name}</AdminTableCell>
                <AdminTableCell>{shortDate(order.date)}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.status}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.payment}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell className="font-black text-slate-950 dark:text-white">{money(order.total)}</AdminTableCell>
                <AdminTableCell className="text-right"><Link aria-label={`Open order ${order.id}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/orders/${order.id}`}><Eye className="size-4" /></Link></AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p className="font-semibold text-slate-500 dark:text-slate-400">Showing {visibleOrders.length} of {filteredOrders.length} matching orders</p>
            <Button asChild href="/admin/orders" variant="outline" size="sm" aria-label="Open all orders"><ArrowRight className="size-4" /></Button>
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Sales overview</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last 7 days performance</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{trend}</span>
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
            <h2 className="text-xl font-black">Low stock alerts</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products that need quick attention.</p>
            <div className="mt-4 space-y-3">{lowStock.map((item) => <div key={item.productId} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"><div><p className="font-bold text-slate-950 dark:text-white">{item.productName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.sku}</p></div><strong className="rounded-full bg-white px-3 py-1 text-amber-700 dark:bg-slate-950 dark:text-amber-300">{item.currentStock}</strong></div>)}</div>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">Top products</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Best-rated products with real catalog imagery.</p></div><Link href="/admin/products" aria-label="Open products" className="grid size-9 shrink-0 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"><ArrowUpRight className="size-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topProducts.map((product) => <div key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900"><Image src={product.image} alt={product.name} width={420} height={280} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="font-black text-slate-950 dark:text-white">{product.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.category}</p><p className="mt-3 font-heading text-lg font-black">{money(product.price)}</p></div></div>)}</div>
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
