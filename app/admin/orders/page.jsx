"use client";

import { Eye, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import Pagination from "@/components/pagination";
import { Card, Input, Select, Skeleton } from "@/components/ui";
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
    { key: "tracking", header: "Tracking", accessor: "tracking", render: (order) => order.tracking || "Not assigned" },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (order) => money(order.total) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search order, customer or tracking" aria-label="Search orders" className="w-64 pl-10" />
        </div>
        <div className="w-48 shrink-0">
          <Select value={status} onChange={(event) => handleStatusChange(event.target.value)} aria-label="Filter orders by status">
            {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
          </Select>
        </div>
      </div>

      {orders === null && !error ? (
        <Card className="p-5">
          <Skeleton className="h-6 w-48" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={orders}
            pageSize={PAGE_SIZE}
            hideSearch
            hidePagination
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