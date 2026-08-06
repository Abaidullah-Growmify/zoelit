"use client";

import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { orders, statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";

export default function OrdersPage() {
  const columns = [
    { key: "id", header: "Order Number", sortable: true, accessor: "id", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.id}` },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not available" },
    { key: "total", header: "Total Amount", sortable: true, accessor: "total", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  return (
    <div>
      <AdminTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search order, status, payment, tracking"
        searchKeys={["id", "status", "payment", "tracking", "total"]}
        filters={[{ key: "status", label: "Filter orders by status", allLabel: "All statuses", options: statuses, value: (order) => order.status }]}
        rowActions={(order) => [{ label: "Details", href: `/dashboard/orders/${order.id}` }]}
        pageSize={4}
      />
    </div>
  );
}
