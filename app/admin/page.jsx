import { AlertTriangle, ShoppingBag, Users, Wallet } from "lucide-react";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminDashboardContent } from "./dashboard-content";
import { adminOrders, adminProducts, adminStats, adminStatTrends, inventory, salesOverview } from "@/lib/admin-data";
import { money } from "@/lib/utils";

export default function AdminDashboardPage() {
  const topProducts = [...adminProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const lowStock = inventory.filter((item) => item.status === "Low Stock");

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Revenue" value={money(adminStats.totalRevenue)} icon={Wallet} helper="Excludes cancelled orders" tone="green" trend={adminStatTrends.totalRevenue} />
        <AdminStatCard label="Total Orders" value={adminStats.totalOrders} icon={ShoppingBag} helper={`${adminStats.pendingOrders} require attention`} tone="blue" trend={adminStatTrends.totalOrders} />
        <AdminStatCard label="Customers" value={adminStats.totalCustomers} icon={Users} helper="Mock customer records" tone="purple" trend={adminStatTrends.totalCustomers} />
        <AdminStatCard label="Low Stock" value={adminStats.lowStockProducts} icon={AlertTriangle} helper="At or below threshold" tone="amber" trend={adminStatTrends.lowStockProducts} />
      </div>
      <AdminDashboardContent orders={adminOrders} topProducts={topProducts} lowStock={lowStock} salesOverview={salesOverview} />
    </div>
  );
}
