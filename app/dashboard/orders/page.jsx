"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import Pagination from "@/components/pagination";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import { statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { OrdersSkeleton } from "@/components/skeletons";
import { usePolling } from "@/lib/use-polling";

export default function OrdersPage() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

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

  useEffect(() => {
    if (page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination.totalPages]);

  usePolling(load, [token], 30000, !loading);

  const columns = [
    { key: "orderNumber", header: "Order Number", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.orderNumber}` },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.orderNumber}`} /> },
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not available" },
    { key: "total", header: "Total Amount", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  if (loading) return <OrdersSkeleton />;

  return (
    <div>
      <DashboardPageHeader
        title="My Orders"
        description="Review order history, tracking, and payment details."
      />
      <AdminTable
        className="mt-8"
        columns={columns}
        data={orders}
        searchPlaceholder="Search order, status, payment, tracking"
        searchKeys={["orderNumber", "status", "payment", "tracking", "total"]}
        filters={[{ key: "status", label: "Filter orders by status", allLabel: "All statuses", options: statuses, value: (order) => order.status }]}
        rowActions={(order) => [{ label: "Details", href: `/dashboard/orders/${order.id}` }]}
        pageSize={10}
        page={page}
        onPageChange={setPage}
        onPaginationChange={handlePaginationChange}
        hidePagination
        disableInitialSort
      />
      {pagination.totalPages > 1 ? (
        <div className="mt-8 flex justify-center">
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
