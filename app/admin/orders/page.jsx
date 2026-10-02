"use client";

import { ChevronDown, Eye, Loader2, Pencil, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminOrderEditDialog } from "@/components/admin-order-edit-dialog";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Card, Input, Select } from "@/components/ui";
import { AdminOrdersSkeleton } from "@/components/skeletons";
import { getAdminOrders, getAdminOrder, updateAdminOrderStatus } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { minimumLoadingDelay } from "@/lib/utils";
import { usePolling } from "@/lib/use-polling";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  "All statuses",
  "Pending",
  "Partially Fulfilled",
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
  const [editingOrder, setEditingOrder] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const hasLoaded = useRef(false);

  const load = useCallback(() => {
    if (!token) return;
    const startedAt = Date.now();
    Promise.all([getAdminOrders({
      page,
      limit: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      status: status === "All statuses" ? undefined : status,
    }, token), minimumLoadingDelay(startedAt)]).then(([data]) => {
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
    setPendingOrderId(order.id);
    setOrders((current) => current.map((row) => row.id === order.id ? { ...row, status: nextStatus } : row));

    try {
      const result = await updateAdminOrderStatus(order.id, { status: nextStatus, note: "Status updated from orders list" }, token);
      toast.success(result?.order?.status === nextStatus ? `Order status updated to ${nextStatus}` : "Order status updated");
      load();
    } catch (statusError) {
      setOrders(previousOrders);
      toast.error(statusError.message || "Could not update order status");
    } finally {
      setPendingOrderId("");
    }
  }

  // The list payload already carries billing and line items, but re-fetching
  // guarantees the edit form always opens on the stored order rather than a
  // stale list snapshot. The returned promise is what keeps the row-action
  // loader on screen while the request is in flight.
  async function openEditOrder(order) {
    try {
      const data = await getAdminOrder(order.id, token);
      setEditingOrder(data.order || order);
    } catch (editError) {
      toast.error(editError.message || "Could not load order details");
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
    { key: "orderNumber", header: "Order ID", sortable: true, accessor: "publicOrderId", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => order.publicOrderId || order.orderNumber || order.ingramOrderNumber || order.id },
    { key: "customer", header: "Customer", sortable: true, accessor: (order) => order.customer?.name || "—", cellClassName: "min-w-0 whitespace-normal font-semibold" },
    { key: "payment", header: "Payment", accessor: "payment", render: (order) => <AdminStatusBadge className="text-label-md font-normal text-on-surface-variant">{order.payment}</AdminStatusBadge> },
    { key: "total", header: "Total", sortable: true, accessor: "total", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.total) },
    { key: "commissionTotal", header: "Commission", sortable: true, accessor: "commissionTotal", cellClassName: "font-semibold tabular-nums text-on-surface", render: (order) => money(order.commissionTotal || 0) },
    { key: "date", header: "Date", sortable: true, accessor: "date", render: (order) => shortDate(order.date) },
    { key: "status", header: "Status", accessor: "status", render: (order) => <OrderStatusSelect order={order} pending={pendingOrderId === order.id} onChange={handleOrderStatusChange} /> },
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
            title={<span className="text-2xl font-black tracking-tight">Orders</span>}
            description="Review order history, tracking, and payment details."
            columns={columns}
            data={tableRows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            action={(
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="relative min-w-0 flex-1 sm:max-w-md lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search order, customer or tracking" aria-label="Search orders" className="h-10 pl-10 shadow-sm" />
                </div>
                <div className="w-full shrink-0 sm:w-56">
                  <Select value={status} onChange={(event) => handleFilterStatusChange(event.target.value)} aria-label="Filter orders by status" className="h-10 shadow-sm">
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                </div>
              </div>
            )}
            hideSearch
            disableInitialSort
            rowActions={(order) => [
              { label: "View", href: `/admin/orders/${order.id}`, icon: Eye, ariaLabel: "View order" },
              { label: "Edit order", icon: Pencil, ariaLabel: "Edit order", onClick: () => openEditOrder(order) },
            ]}
          />
        </>
      )}

      {editingOrder ? (
        <AdminOrderEditDialog
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={load}
        />
      ) : null}
    </div>
  );
}

function OrderStatusSelect({ order, pending, onChange }) {
  const status = order.status || "Pending";

  return (
    <span className="relative inline-flex w-fit items-center">
      <select
        value={status}
        onChange={(event) => onChange(order, event.target.value)}
        disabled={pending}
        aria-busy={pending || undefined}
        aria-label={`Change status for order ${order.orderNumber || order.id}`}
        className={`h-8 w-fit appearance-none rounded-md border-0 py-0 pl-3 pr-8 text-label-sm font-semibold shadow-none outline-none ring-0 transition focus:ring-2 disabled:cursor-wait disabled:opacity-60 ${statusClassName(status)}`}
      >
        {ORDER_STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
      </select>
      {pending ? (
        <span className="absolute -left-6 inline-flex items-center" role="status" aria-label="Saving order status">
          <Loader2 className="size-3.5 animate-spin text-primary" />
        </span>
      ) : (
        <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-current" />
      )}
    </span>
  );
}

function statusClassName(status) {
  if (["Delivered", "Invoiced"].includes(status)) return "bg-emerald-100 text-emerald-700 focus:ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (["Cancelled", "Voided"].includes(status)) return "bg-rose-100 text-rose-700 focus:ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-300";
  if (["Shipped", "Processing"].includes(status)) return "bg-blue-100 text-blue-700 focus:ring-blue-500/20 dark:bg-blue-950/50 dark:text-blue-300";
  return "bg-amber-100 text-amber-700 focus:ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300";
}
