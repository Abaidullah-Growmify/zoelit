"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Calculator, Clock, MapPin, Package, PackageCheck, Wallet } from "lucide-react";
import { addresses, customer, orders } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminTable } from "@/components/admin-table";
import { Button, Card } from "@/components/ui";
import { DashboardPageHeader } from "@/components/dashboard-page-header";

const spendingOverview = [
  { month: "Feb", amount: 128 },
  { month: "Mar", amount: 215 },
  { month: "Apr", amount: 189 },
  { month: "May", amount: 249 },
  { month: "Jun", amount: 329 },
  { month: "Jul", amount: 858 },
];

export default function DashboardPage() {
  const pending = orders.filter((order) => ["Pending", "Processing"].includes(order.status)).length;
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const spent = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length ? spent / orders.length : 0;
  const recentOrderColumns = [
    { key: "id", header: "Order", sortable: true, accessor: "id", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.id}` },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back, ${customer.name.split(" ")[0]}`}
        description="Track orders, manage addresses, and keep checkout effortless."
        action={<Button asChild href="/products">Continue Shopping <ArrowRight className="size-4" /></Button>}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Total Orders" value={orders.length} icon={Package} helper="Lifetime order count" tone="blue" />
        <AdminStatCard label="Pending Orders" value={pending} icon={Clock} helper="Pending or processing" tone="amber" />
        <AdminStatCard label="Total Spent" value={money(spent)} icon={Wallet} helper="Excluding cancelled orders" tone="green" />
        <AdminStatCard label="Delivered Orders" value={delivered} icon={PackageCheck} helper="Completed deliveries" tone="emerald" />
        <AdminStatCard label="Average Order Value" value={money(averageOrderValue)} icon={Calculator} helper="Based on lifetime orders" tone="indigo" />
        <AdminStatCard label="Saved Addresses" value={addresses.length} icon={MapPin} helper="Ready for checkout" tone="teal" />
      </div>

      <SpendingChart />

      <div className="mt-8">
        <AdminTable
          title="Recent orders"
          description="Search, sort, and open your latest purchases."
          columns={recentOrderColumns}
          data={orders.slice(0, 5)}
          searchPlaceholder="Search recent orders"
          searchKeys={["id", "status", "total"]}
          filters={[{ key: "status", label: "Filter recent orders by status", allLabel: "All statuses", options: Array.from(new Set(orders.map((order) => order.status))), value: (order) => order.status }]}
          rowActions={(order) => [{ label: "View", href: `/dashboard/orders/${order.id}` }]}
          pageSize={5}
        />
        <div className="mt-4 flex justify-end">
          <Link href="/dashboard/orders" aria-label="Open all orders" className="grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SpendingChart() {
  return (
    <Card className="mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Spending over last 6 months</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mock monthly order totals.</p>
        </div>
      </div>
      <div className="mt-6 h-64 rounded-xl bg-gradient-to-b from-blue-50 to-slate-50 p-3 dark:from-blue-500/10 dark:to-slate-950">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spendingOverview} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="customerSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
            <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tickMargin={8} width={44} fontSize={12} />
            <Tooltip formatter={(value) => [money(value), "Spent"]} contentStyle={{ borderRadius: 12, border: "1px solid rgb(226 232 240)", boxShadow: "0 18px 55px rgba(15, 23, 42, 0.12)" }} />
            <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fill="url(#customerSpending)" dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
