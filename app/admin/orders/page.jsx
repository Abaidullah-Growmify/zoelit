"use client";

import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { adminOrders } from "@/lib/admin-data";
import { money, shortDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  const columns = [
    { key: "id", header: "Order", sortable: true, accessor: "id", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.id}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer.name },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not assigned" },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-bold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  return (
    <div>
      <AdminTable
        columns={columns}
        data={adminOrders}
        searchPlaceholder="Search order, customer, tracking"
        searchKeys={["id", (order) => order.customer.name, "status", "payment", "tracking"]}
        filters={[
          { key: "status", label: "Filter orders by status", allLabel: "All statuses", options: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], value: (order) => order.status },
          { key: "payment", label: "Filter orders by payment", allLabel: "All payments", options: ["Paid", "Pending", "Refunded"], value: (order) => order.payment },
        ]}
        rowActions={(order) => [
          { label: "View", href: `/admin/orders/${order.id}` },
          { label: "Edit", href: `/admin/orders/${order.id}` },
          { label: "Delete", tone: "danger", onClick: () => console.info(`Delete order ${order.id}`) },
        ]}
      />
    </div>
  );
}
