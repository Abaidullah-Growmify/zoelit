"use client";

import { AlertTriangle, ShoppingBag, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminPageSkeleton } from "@/components/skeletons";
import { Card } from "@/components/ui";
import { getAdminDashboardSummary } from "@/lib/api";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { AdminDashboardContent } from "./dashboard-content";

export default function AdminDashboardPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!token) return;
    getAdminDashboardSummary(token)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((fetchError) => {
        if (active) setError(fetchError.message || "Could not load dashboard.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (error) {
    return (
      <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
    );
  }

  if (!summary) {
    return <AdminPageSkeleton variant="dashboard" />;
  }

  const stats = summary.stats || {};
  const salesOverview = (summary.revenueOverview || []).map((item) => ({
    date: item.month,
    revenue: item.amount || 0,
  }));

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={money(stats.totalRevenue || 0)} icon={Wallet} helper="Excludes cancelled orders" tone="blue" />
        <AdminStatCard label="Total Orders" value={stats.totalOrders ?? 0} icon={ShoppingBag} helper={`${stats.pendingOrders ?? 0} require attention`} tone="blue" />
        <AdminStatCard label="Customers" value={stats.totalCustomers ?? 0} icon={Users} helper="Registered customer accounts" tone="blue" />
        <AdminStatCard label="Low Stock" value={stats.lowStockProducts ?? 0} icon={AlertTriangle} helper="At or below threshold" tone="blue" />
      </div>
      <AdminDashboardContent
        orders={summary.recentOrders || []}
        topProducts={summary.topProducts || []}
        lowStock={summary.lowStock || []}
        salesOverview={salesOverview}
        statusCounts={summary.statusCounts || {}}
      />
    </div>
  );
}