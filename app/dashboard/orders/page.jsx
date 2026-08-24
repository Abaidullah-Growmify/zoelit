"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import { money, shortDate } from "@/lib/utils";
import { OrdersSkeleton } from "@/components/skeletons";
import { usePolling } from "@/lib/use-polling";

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const load = useCallback(() => {
    if (!token) return;
    api
      .getOrders(token)
      .then((res) => {
        setOrders(res.orders.map((order) => ({ ...order, id: order._id })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  usePolling(load, [token], 30000, !loading);

  const columns = [
    { key: "orderNumber", header: "Order Number", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.customerOrderNumber || order.orderNumber}` },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.customerOrderNumber || order.orderNumber}`} /> },
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not available" },
    { key: "total", header: "Total Amount", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.total) },
  ];

  if (loading) return <OrdersSkeleton />;

  return (
    <div>
      <div className="pt-4 lg:pt-6">
        <AdminTable
          title="Orders"
          description="Search, sort, and open your latest purchases."
          columns={columns}
          data={orders}
          searchPlaceholder="Search order, status, payment, tracking"
          searchKeys={["orderNumber", "status", "payment", "tracking", "total"]}
          filters={[{ key: "status", label: "Filter orders by status", allLabel: "All statuses", options: Array.from(new Set(orders.map((order) => order.status).filter(Boolean))), value: (order) => order.status }]}
          rowActions={(order) => [{ label: "Details", href: `/dashboard/orders/${order.id}` }]}
          pageSize={10}
          page={safePage}
          onPageChange={setPage}
          onPaginationChange={handlePaginationChange}
          disableInitialSort
        />
      </div>
    </div>
  );
}
