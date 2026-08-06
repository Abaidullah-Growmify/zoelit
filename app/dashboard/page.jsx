"use client";

import Link from "next/link";
import { ArrowRight, Package, Clock, Wallet } from "lucide-react";
import { customer, orders } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminTable } from "@/components/admin-table";
import { Button } from "@/components/ui";
import { DashboardPageHeader } from "@/components/dashboard-page-header";

export default function DashboardPage() {
  const pending = orders.filter((order) => ["Pending", "Processing"].includes(order.status)).length;
  const spent = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.total, 0);
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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Total Orders" value={orders.length} icon={Package} helper="Lifetime order count" tone="blue" />
        <AdminStatCard label="Pending Orders" value={pending} icon={Clock} helper="Pending or processing" tone="amber" />
        <AdminStatCard label="Total Spent" value={money(spent)} icon={Wallet} helper="Excluding cancelled orders" tone="green" />
      </div>

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
