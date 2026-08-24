"use client";

import { ChevronDown, Eye, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Card, Input, Select } from "@/components/ui";
import { AdminOrdersSkeleton } from "@/components/skeletons";
import { getAdminOrders, updateAdminOrderStatus } from "@/lib/api";
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

const ORDER_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option !== "All statuses");

export default function AdminOrdersPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [orders, setOrders] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
        setTotalItems(data.pagination?.total ?? 0);
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

  function handleFilterStatusChange(value) {
    setStatus(value);
    setPage(1);
  }

  async function handleOrderStatusChange(order, nextStatus) {
    const previousOrders = orders;
    setOrders((current) => current.map((row) => row.id === order.id ? { ...row, status: nextStatus } : row));

    try {
      await updateAdminOrderStatus(order.id, { status: nextStatus, note: "Status updated from orders list" }, token);
      toast.success("Order status updated");
      load();
    } catch (statusError) {
      setOrders(previousOrders);
      toast.error(statusError.message || "Could not update order status");
    }
  }

  const tableRows = useMemo(() => (
    orders || []
  ).map((order, index) => ({
    ...order,
    serial: (page - 1) * PAGE_SIZE + index + 1,
  })), [orders, page]);

  const columns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "w-16 font-semibold tabular-nums text-on-surface" },
    { key: "orderNumber", header: "Order ID", sortable: true, accessor: "orderNumber", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => `#${order.orderNumber || order.ingramOrderNumber || order.id}` },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer?.name || "—", cellClassName: "min-w-0 whitespace-normal font-semibold" },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge className="text-label-md font-normal text-on-surface-variant">{order.payment}</AdminStatusBadge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.total) },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <OrderStatusSelect order={order} onChange={handleOrderStatusChange} /> },
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
            data={tableRows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            toolbar={(
              <>
                <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search order, customer or tracking" aria-label="Search orders" className="h-10 pl-10 shadow-sm" />
                </div>
                <div className="w-full shrink-0 sm:w-56">
                  <Select value={status} onChange={(event) => handleFilterStatusChange(event.target.value)} aria-label="Filter orders by status" className="h-10 shadow-sm">
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                </div>
              </>
            )}
            hideSearch
            disableInitialSort
            rowActions={(order) => [
              { label: `View order ${order.orderNumber}`, href: `/admin/orders/${order.id}`, icon: Eye },
            ]}
          />
        </>
      )}
    </div>
  );
}

function OrderStatusSelect({ order, onChange }) {
  const status = order.status || "Pending";

  return (
    <span className="relative inline-flex w-fit items-center">
      <select
        value={status}
        onChange={(event) => onChange(order, event.target.value)}
        aria-label={`Change status for order ${order.orderNumber || order.id}`}
        className={`h-8 w-fit appearance-none rounded-full border-0 py-0 pl-3 pr-8 text-label-sm font-semibold shadow-none outline-none ring-0 transition focus:ring-2 ${statusClassName(status)}`}
      >
        {ORDER_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-current" />
    </span>
  );
}

function statusClassName(status) {
  if (["Delivered", "Invoiced"].includes(status)) return "bg-emerald-100 text-emerald-700 focus:ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (["Cancelled", "Voided"].includes(status)) return "bg-rose-100 text-rose-700 focus:ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-300";
  if (["Shipped", "Processing"].includes(status)) return "bg-blue-100 text-blue-700 focus:ring-blue-500/20 dark:bg-blue-950/50 dark:text-blue-300";
  return "bg-amber-100 text-amber-700 focus:ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300";
}
