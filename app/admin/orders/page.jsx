"use client";

import { Eye, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import Pagination from "@/components/pagination";
import { Card, Input, Select } from "@/components/ui";
import { AdminOrdersSkeleton } from "@/components/skeletons";
import { getAdminOrders } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { usePolling } from "@/lib/use-polling";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "All statuses",
  "Pending",
  "Processing",
  "Invoiced",
  "On Hold",
  "Backordered",
  "Shipped",
  "Delivered",
  "Voided",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [orders, setOrders] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const hasLoaded = useRef(false);

  const load = useCallback(() => {
    if (!token) return;
    getAdminOrders({
      page,
      limit: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      status: status === "All statuses" ? undefined : status,
    }, token)
      .then((data) => {
        hasLoaded.current = true;
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setError("");
      })
      .catch((loadError) => {
        if (!hasLoaded.current) {
          setError(loadError.message || "Could not load orders.");
          setOrders([]);
        }
      });
  }, [token, page, debouncedKeyword, status]);

  useEffect(() => {
    hasLoaded.current = false;
    load();
  }, [load]);

  usePolling(load, [token, page, debouncedKeyword, status], 30000, orders !== null && !error);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  function handleStatusChange(value) {
    setStatus(value);
    setPage(1);
  }

  const columns = [
    { key: "orderNumber", header: "Order", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => `#${order.orderNumber || order.ingramOrderNumber || order.id}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer?.name || "—", cellClassName: "min-w-0 whitespace-normal font-semibold" },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <AdminStatusBadge>{order.status}</AdminStatusBadge> },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge>{order.payment}</AdminStatusBadge> },
    { key: "notes", header: "Notes", accessor: "notes", render: (order) => <OrderNotesDialog notes={order.notes} label={`View notes for order ${order.orderNumber || order.id}`} /> },
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not assigned" },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  return (
    <div className="space-y-6">
      {orders === null && !error ? (
        <AdminOrdersSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Orders"
            description="Review order history, tracking, and payment details."
            columns={columns}
            data={orders}
            pageSize={PAGE_SIZE}
            toolbar={(
              <>
                <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search order, customer or tracking" aria-label="Search orders" className="h-10 border-slate-200 bg-white pl-10 shadow-sm dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div className="w-full shrink-0 sm:w-56">
                  <Select value={status} onChange={(event) => handleStatusChange(event.target.value)} aria-label="Filter orders by status" className="h-10 border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                </div>
              </>
            )}
            hideSearch
            hidePagination
            disableInitialSort
            rowActions={(order) => [
              { label: `View order ${order.orderNumber}`, href: `/admin/orders/${order.id}`, icon: Eye },
            ]}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}
