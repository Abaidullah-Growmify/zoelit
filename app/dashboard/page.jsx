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
import { OrderNotesDialog } from "@/components/order-notes-dialog";

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
  const cards = [
    { label: "Total Orders", value: stats.totalOrders, helper: "Lifetime order count", icon: Package },
    { label: "Wishlist Items", value: wishlistCount, helper: "Saved for later", icon: Heart },
    { label: "Total Spent", value: money(stats.totalSpent), helper: "Excluding cancelled orders", icon: Wallet },
    { label: "Orders in Transit", value: stats.pendingOrders, helper: "Pending or processing", icon: Truck },
  ];

  return <div className="container-page">
    <div className="mb-8"><h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-on-surface">Welcome back, {user?.name || "Customer"}</h1><p className="mt-2 text-sm text-on-surface-variant">Here is a quick overview of your account activity.</p></div>
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, helper, icon: Icon }) => <Card key={label} className="border-outline-variant/70 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="mb-5 flex items-start justify-between"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div></div><p className="font-heading text-2xl font-bold tracking-tight text-on-surface">{value}</p><p className="mt-1 text-sm font-medium text-on-surface-variant">{label}</p><p className="mt-2 text-xs text-on-surface-variant">{helper}</p></Card>)}</div>
    <SpendingChart data={spendingOverview} /><div className="flex justify-end py-7"><Button asChild href="/products"><ShoppingBag className="size-4" />Continue Shopping</Button></div><Card className="overflow-hidden p-0 shadow-sm"><div className="flex items-center justify-between border-b border-outline-variant/70 px-5 py-5 sm:px-6"><div><h2 className="font-heading text-lg font-semibold text-on-surface">Recent Orders</h2><p className="mt-1 text-sm text-on-surface-variant">Your latest purchases at a glance.</p></div><Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">View all<ArrowRight className="size-4" /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-surface-container-low text-xs uppercase tracking-[0.08em] text-on-surface-variant"><tr><th className="px-5 py-3 font-semibold">#</th><th className="px-5 py-3 font-semibold">Order ID</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Payment</th><th className="px-5 py-3 font-semibold">Tracking</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Total</th><th className="px-5 py-3 font-semibold">Notes</th></tr></thead><tbody>{recentOrders.slice(0, 5).map((order, index) => <tr key={order.id} className="border-t border-outline-variant/60 text-on-surface-variant"><td className="px-5 py-4 text-on-surface-variant">{index + 1}</td><td className="px-5 py-4 font-semibold text-on-surface">#{order.customerOrderNumber || order.id}</td><td className="px-5 py-4">{shortDate(order.date)}</td><td className="px-5 py-4">{order.paymentMethod || order.payment || "-"}</td><td className="px-5 py-4">{order.tracking || "Not available"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(order.status)}`}>{order.status}</span></td><td className="px-5 py-4 font-semibold text-on-surface">{money(order.total)}</td><td className="px-5 py-4"><OrderNotesDialog notes={order.notes} label={`View notes for order ${order.customerOrderNumber || order.id}`} /></td></tr>)}</tbody></table></div></Card>
  </div>;
}

function statusTone(status) {
  if (status === "Delivered") return "bg-emerald-50 text-emerald-700";
  if (status === "Shipped") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}


function SpendingChart({ data = [] }) {
  return <Card className="overflow-hidden p-5 sm:p-6"><h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">Spending over last 6 months</h2><p className="mt-1 text-sm text-on-surface-variant">Monthly order totals from your account data.</p><div className="mt-6 h-64 rounded-2xl bg-surface-container-low/70 p-3 ring-1 ring-outline-variant/70"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}><defs><linearGradient id="customerSpending" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.03} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgb(100 116 139 / 0.25)" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} /><YAxis tickFormatter={(value) => money(value)} axisLine={false} tickLine={false} tickMargin={8} width={58} fontSize={12} /><Tooltip formatter={(value) => [money(value), "Spent"]} /><Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} fill="url(#customerSpending)" /></AreaChart></ResponsiveContainer></div></Card>;
}
