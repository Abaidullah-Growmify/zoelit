"use client";

import { Eye, MousePointerClick, Search, ShoppingBag, ShoppingCart, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminTable } from "@/components/admin-table";
import { ConfirmActionDialog } from "@/components/action-feedback";
import { AdminCaptureSkeleton } from "@/components/skeletons";
import { Badge, Card, Input, Select } from "@/components/ui";
import { deleteAdminCaptureRecord, getAdminCaptureRecords } from "@/lib/api";
import { minimumLoadingDelay, money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

const STAGE_OPTIONS = ["All stages", "In progress", "Left checkout", "Left at payment", "Converted"];
const STAGE_VALUES = {
  "All stages": "",
  "In progress": "pending",
  "Left checkout": "checkout",
  "Left at payment": "stripe",
  Converted: "converted",
};

const VISITOR_OPTIONS = ["Everyone", "Members", "Guests"];
const VISITOR_VALUES = { Everyone: "", Members: "member", Guests: "guest" };

const STAGE_BADGE = {
  converted: { text: "Converted", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  stripe: { text: "Left at payment", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  checkout: { text: "Left at checkout", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  pending: { text: "In progress", className: undefined },
};

function StageBadge({ record }) {
  if (record.converted) {
    return <Badge tone="slate" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Converted</Badge>;
  }
  const cfg = STAGE_BADGE[record.exitPoint] || STAGE_BADGE.pending;
  return <Badge tone="slate" className={cfg.className}>{cfg.text}</Badge>;
}

function VisitorBadge({ type }) {
  return (
    <Badge tone="slate" className={type === "member" ? "bg-primary/10 text-primary" : undefined}>
      {type === "member" ? "Member" : "Guest"}
    </Badge>
  );
}

function CartCell({ record }) {
  const first = record.products[0];
  if (!first) return <span className="text-xs text-on-surface-variant">Empty cart</span>;
  const more = record.products.length > 1 ? ` +${record.products.length - 1} more` : "";
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-on-surface max-w-[180px]">{first.name}{more}</p>
      <p className="text-xs text-on-surface-variant">{record.itemsCount} item(s)</p>
    </div>
  );
}

export default function AdminCapturePage() {
  const token = useAdminAuthStore((state) => state.token);
  const [records, setRecords] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [stage, setStage] = useState("All stages");
  const [visitor, setVisitor] = useState("Everyone");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const load = useCallback(() => {
    if (!token) return;
    const startedAt = Date.now();
    Promise.all([
      getAdminCaptureRecords({
        keyword: debouncedKeyword || undefined,
        exitPoint: STAGE_VALUES[stage],
        visitorType: VISITOR_VALUES[visitor],
        page,
        limit: PAGE_SIZE,
      }, token),
      minimumLoadingDelay(startedAt),
    ])
      .then(([data]) => {
        hasLoaded.current = true;
        setRecords(data.records || []);
        setStats(data.stats || null);
        setTotalItems(data.pagination?.total || 0);
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
        setError("");
      })
      .catch((loadError) => {
        if (!hasLoaded.current) {
          setRecords([]);
          setError(loadError.message || "Could not load checkout visits.");
        }
      });
  }, [token, page, debouncedKeyword, stage, visitor]);

  useEffect(() => {
    hasLoaded.current = false;
    load();
  }, [load]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  function handleStageChange(value) {
    setStage(value);
    setPage(1);
  }

  function handleVisitorChange(value) {
    setVisitor(value);
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminCaptureRecord(deleteTarget.id, token);
      toast.success("Checkout visit deleted");
      setDeleteTarget(null);
      if (records?.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.message || "Could not delete the record");
    } finally {
      setDeleting(false);
    }
  }

  const tableRows = useMemo(() => (
    records || []
  ).map((record, index) => ({
    ...record,
    serial: (page - 1) * PAGE_SIZE + index + 1,
  })), [records, page]);

  const columns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "w-10 font-semibold tabular-nums text-on-surface" },
    { key: "name", header: "Name", sortable: true, accessor: (r) => r.customerName || "—", cellClassName: "min-w-0 max-w-[160px]", render: (r) => <span className="truncate font-medium text-on-surface">{r.customerName || "—"}</span> },
    { key: "email", header: "Email", sortable: true, accessor: (r) => r.email || "—", cellClassName: "min-w-0 max-w-[200px]", render: (r) => <span className="truncate text-sm text-on-surface-variant">{r.email || "—"}</span> },
    { key: "visitor", header: "Type", accessor: (r) => r.visitorType || "guest", cellClassName: "whitespace-nowrap", render: (r) => <VisitorBadge type={r.visitorType} /> },
    { key: "cart", header: "Cart", accessor: "itemsCount", cellClassName: "min-w-0 max-w-[180px]", render: (record) => <CartCell record={record} /> },
    { key: "total", header: "Total", sortable: true, accessor: "estimatedTotal", cellClassName: "font-semibold tabular-nums text-on-surface", render: (record) => money(record.estimatedTotal) },
    { key: "reached", header: "Reached", accessor: "exitPoint", cellClassName: "whitespace-nowrap", render: (record) => <StageBadge record={record} /> },
  ];

  const abandoned = (stats?.totalVisits ?? 0) - (stats?.convertedVisits ?? 0);

  return (
    <div className="space-y-6">
      {records === null && !error ? (
        <AdminCaptureSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Total visits" value={stats?.totalVisits ?? 0} icon={MousePointerClick} tone="blue" helper="Checkout page visits" />
            <AdminStatCard label="Converted" value={stats?.convertedVisits ?? 0} icon={ShoppingBag} tone="green" helper="Became an order" />
            <AdminStatCard label="Abandoned" value={abandoned} icon={ShoppingCart} tone="amber" helper="No order placed" />
            <AdminStatCard label="Cart value recorded" value={money(stats?.cartValue || 0)} icon={Wallet} tone="purple" helper="Estimated totals" />
          </div>

          <AdminTable
            title={<span className="text-2xl font-black tracking-tight">Checkout visits</span>}
            description="Every checkout visit is its own record: the cart, the details typed, and how far the customer got."
            columns={columns}
            data={tableRows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            action={(
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-0 flex-1 sm:max-w-md lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    value={keyword}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search email, phone, product, cart ID or order number"
                    aria-label="Search checkout visits"
                    className="h-10 pl-10 shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 sm:w-auto">
                  <Select value={stage} onChange={(event) => handleStageChange(event.target.value)} aria-label="Filter by stage" className="h-10 w-full sm:w-44 shadow-sm">
                    {STAGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                  <Select value={visitor} onChange={(event) => handleVisitorChange(event.target.value)} aria-label="Filter by visitor type" className="h-10 w-full sm:w-32 shadow-sm">
                    {VISITOR_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </Select>
                </div>
              </div>
            )}
            hideSearch
            disableInitialSort
            rowActions={(record) => [
              { label: "View", ariaLabel: `View checkout visit ${record.id}`, href: `/admin/capture/${record.id}`, icon: Eye, loadingLabel: "Opening visit..." },
              { label: "Delete", ariaLabel: `Delete checkout visit ${record.id}`, onClick: () => setDeleteTarget(record), icon: Trash2, tone: "danger" },
            ]}
          />
        </>
      )}

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        title="Delete this record?"
        message="The saved cart, typed details and timeline for this checkout visit will be removed permanently. Orders already placed are not affected."
        confirmLabel="Delete record"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}