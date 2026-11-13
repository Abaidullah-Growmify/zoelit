"use client";

import Link from "next/link";
import { ArrowRight, Heart, Package, ShoppingBag, Truck, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Button, Card } from "@/components/ui";
import { DashboardSkeleton } from "@/components/skeletons";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";

const recentOrdersColumns = [
  { key: "rowNumber", header: "#", sortable: true, accessor: "rowNumber", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white" },
  { key: "orderNumber", header: "Order ID", sortable: true, accessor: "orderNumber", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => order.publicOrderId || order.orderNumber },
  { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
  { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
  { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
  { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.publicOrderId || order.orderNumber}`} /> },
  { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not available" },
  { key: "total", header: "Total Amount", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.total) },
];

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const wishlistCount = useWishlistStore((state) => state.count());
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    api.getDashboardSummary(token).then((result) => { if (active) setData(result); }).catch(() => {});
    return () => { active = false; };
  }, [token]);

  if (!data) return <DashboardSkeleton />;
  const { stats, spendingOverview, recentOrders } = data;
  const dashboardOrders = recentOrders.map((order, index) => ({
    ...order,
    id: order._id,
    rowNumber: index + 1,
  }));
  const cards = [
    { label: "Total Orders", value: stats.totalOrders, helper: "Lifetime order count", icon: Package },
    { label: "Wishlist Items", value: wishlistCount, helper: "Saved for later", icon: Heart },
    { label: "Total Spent", value: money(stats.totalSpent), helper: "Excluding cancelled orders", icon: Wallet },
    { label: "Orders in Transit", value: stats.pendingOrders, helper: "Pending or processing", icon: Truck },
  ];

  return (
    <div className="container-page">
      <div className="mb-8"><h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-on-surface">Welcome back, {user?.name || "Customer"}</h1><p className="mt-2 text-sm text-on-surface-variant">Here is a quick overview of your account activity.</p></div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, helper, icon: Icon }) => (
          <Card key={label} className="min-w-0 border-outline-variant/70 p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className="mb-4 flex items-start justify-between sm:mb-5"><div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary sm:size-10"><Icon className="size-4 sm:size-5" /></div></div>
            <p className="truncate font-heading text-xl font-bold tracking-tight text-on-surface sm:text-2xl">{value}</p>
            <p className="mt-1 truncate text-xs font-medium text-on-surface-variant sm:text-sm">{label}</p>
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-on-surface-variant sm:text-xs">{helper}</p>
          </Card>
        ))}
      </div>
      <SpendingChart data={spendingOverview} />
      <div className="flex justify-end py-7">
        <Button asChild href="/products"><ShoppingBag className="size-4" />Continue Shopping</Button>
      </div>
      <AdminTable
        title="Recent Orders"
        description="Your latest purchases at a glance."
         action={<Link href="/dashboard/orders" className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap text-sm font-semibold text-primary hover:underline sm:self-auto">View all<ArrowRight className="size-4 shrink-0" /></Link>}
        columns={recentOrdersColumns}
        data={dashboardOrders}
        pageSize={5}
        hideSearch
        hidePagination
        hideReset
        inlineToolbar
        disableInitialSort
        rowActions={(order) => [{ label: "View", href: `/dashboard/orders/${order.id}` }]}
        zebra
      />
    </div>
  );
}

function SpendingChart({ data = [] }) {
  return <Card className="overflow-hidden p-4 sm:p-6"><h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Spending over last 6 months</h2><p className="mt-1 text-sm text-on-surface-variant">Monthly order totals from your account data.</p><div className="mt-5 h-56 min-w-0 rounded-2xl bg-surface-container-low/70 p-2 ring-1 ring-outline-variant/70 sm:h-64 sm:p-3"><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={data} margin={{ left: 0, right: 6, top: 12, bottom: 0 }}><defs><linearGradient id="customerSpending" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgb(100 116 139 / 0.25)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} interval="preserveStartEnd" /><YAxis tickFormatter={(value) => { const n = Number(value) || 0; return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`; }} axisLine={false} tickLine={false} tickMargin={6} width={44} fontSize={11} /><Tooltip formatter={(value) => [money(value), "Spent"]} /><Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} fill="url(#customerSpending)" /></AreaChart></ResponsiveContainer></div></Card>;
}
