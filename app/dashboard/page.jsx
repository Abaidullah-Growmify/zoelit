"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, Clock, MapPin, Package, PackageCheck, ShoppingBag, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminTable } from "@/components/admin-table";
import { Badge, Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { DashboardSkeleton } from "@/components/skeletons";
import { OrderNotesDialog } from "@/components/order-notes-dialog";

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const safePage = Math.min(page, pagination.totalPages);

  const handlePaginationChange = useCallback((next) => {
    setPagination((current) => {
      if (
        current.page === next.page
        && current.totalPages === next.totalPages
        && current.totalItems === next.totalItems
        && current.showingStart === next.showingStart
        && current.showingEnd === next.showingEnd
      ) {
        return current;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) return;
    api
      .getDashboardSummary(token)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  if (!data) return <DashboardSkeleton />;

  const { stats, spendingOverview, recentOrders } = data;
  const recentOrderColumns = [
    { key: "id", header: "Order", sortable: true, accessor: "id", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.customerOrderNumber || order.id}` },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <Badge>{order.status}</Badge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
    { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.customerOrderNumber || order.id}`} /> },
  ];

  return (
    <div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Total Orders" value={stats.totalOrders} icon={Package} helper="Lifetime order count" tone="blue" />
        <AdminStatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} helper="Pending or processing" tone="blue" />
        <AdminStatCard label="Total Spent" value={money(stats.totalSpent)} icon={Wallet} helper="Excluding cancelled orders" tone="blue" />
        <AdminStatCard label="Delivered Orders" value={stats.deliveredOrders} icon={PackageCheck} helper="Completed deliveries" tone="blue" />
        <AdminStatCard label="Average Order Value" value={money(stats.averageOrderValue)} icon={Calculator} helper="Based on lifetime orders" tone="indigo" />
        <AdminStatCard label="Saved Addresses" value={stats.savedAddresses} icon={MapPin} helper="Ready for checkout" tone="blue" />
      </div>

      <SpendingChart data={spendingOverview} />

      <div className="mt-6">
        <div className="mb-4 flex justify-end">
          <Button asChild href="/products" className="h-12 w-full shrink-0 sm:w-auto">
            <ShoppingBag className="size-4" /> Continue Shopping
          </Button>
        </div>
        <AdminTable
          title="Recent orders"
          description="Search, sort, and open your latest purchases."
          columns={recentOrderColumns}
          data={recentOrders}
          searchPlaceholder="Search recent orders"
          searchKeys={["id", "status", "total"]}
          filters={[{ key: "status", label: "Filter recent orders by status", allLabel: "All statuses", options: Array.from(new Set(recentOrders.map((order) => order.status))), value: (order) => order.status }]}
          pageSize={5}
          page={safePage}
          onPageChange={setPage}
          onPaginationChange={handlePaginationChange}
          disableInitialSort
        />
      </div>
    </div>
  );
}

function SpendingChart({ data }) {
  return (
      <Card className="mt-6 overflow-hidden rounded-lg p-6 shadow-primary-elevated">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-headline-md font-semibold tracking-[-0.03em] text-on-surface">Spending over last 6 months</h2>
          <p className="mt-1 text-body-md font-normal text-on-surface-variant">Monthly order totals from your account data.</p>
        </div>
      </div>
      <div className="mt-6 h-64 rounded-lg bg-gradient-to-b from-primary-fixed/60 to-surface-container-low p-3 ring-1 ring-outline-variant">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="customerSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-outline) / 0.35)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
            <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tickMargin={8} width={44} fontSize={12} />
            <Tooltip formatter={(value) => [money(value), "Spent"]} contentStyle={{ borderRadius: 12, border: "1px solid rgb(var(--color-outline-variant))", boxShadow: "0 18px 55px rgb(15 23 42 / 0.12)", background: "var(--color-surface-container-lowest)" }} />
            <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} fill="url(#customerSpending)" dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface-container-lowest)" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
