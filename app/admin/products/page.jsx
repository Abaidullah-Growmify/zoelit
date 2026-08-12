"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import { getAdminProducts, startPriceSync, startProductSync } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 50;

export default function AdminProductsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAdminProducts({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined }, token);
      setRows((data.products || []).map(toRow));
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Could not load products.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedKeyword]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSync() {
    setSyncing(true);
    try {
      const data = await startProductSync({}, token);
      toast.success(data.message || "Product synchronization started");
    } catch (syncError) {
      toast.error(syncError.message || "Could not start sync");
    } finally {
      setSyncing(false);
    }
  }

  async function handlePriceSync() {
    setSyncing(true);
    try {
      const data = await startPriceSync(token);
      toast.success(data.message || "Price synchronization started");
    } catch (syncError) {
      toast.error(syncError.message || "Could not start price sync");
    } finally {
      setSyncing(false);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      accessor: "name",
      render: (product) => <ProductCell product={product} />,
    },
    { key: "category", header: "Category", sortable: true, accessor: "category" },
    { key: "price", header: "Price", sortable: true, accessor: "price", cellClassName: "font-semibold tabular-nums text-slate-950 dark:text-white", render: (product) => money(product.price) },
    { key: "stock", header: "Stock", sortable: true, accessor: "stock", cellClassName: "tabular-nums" },
    { key: "status", header: "Status", accessor: "status", render: (product) => <AdminStatusBadge>{product.status}</AdminStatusBadge> },
  ];

  const showingStart = rows?.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-body font-regular text-slate-600 dark:text-slate-300">Browse and manage your product catalog. Products with photos and stock appear first.</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search products, SKU or category" aria-label="Search products" className="w-64 pl-10" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePriceSync} disabled={syncing}>
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync prices
            </Button>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync products
            </Button>
          </div>
        </div>
      </div>

      {rows === null && !error ? (
        <Card className="p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
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
            data={rows}
            pageSize={PAGE_SIZE}
            hideSearch
            hidePagination
            rowActions={(product) => [
              { label: `View ${product.name}`, href: `/products/${product.id}`, icon: Eye },
            ]}
          />
          <div className="flex flex-col gap-3 text-body sm:flex-row sm:items-center sm:justify-between">
            <p className="font-regular text-slate-600 dark:text-slate-300">Showing {showingStart}-{showingEnd} of {total.toLocaleString()} products</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" />Previous</Button>
              <span className="px-2 text-slate-600 dark:text-slate-300">Page {loading ? "…" : page} of {Math.max(1, totalPages)}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next<ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function toRow(product) {
  return {
    id: product.ingramPartNumber,
    name: product.description || product.ingramPartNumber || "Unnamed product",
    sku: product.ingramPartNumber || "—",
    category: product.category || "Uncategorized",
    price: product.price || 0,
    stock: product.stock || 0,
    image: product.imageUrl || FALLBACK_IMAGE,
    status: !product.isActive
      ? "Paused"
      : product.imageStatus === "failed"
        ? "Rejected"
        : product.imageStatus === "pending"
          ? "Pending"
          : product.imageStatus === "not_found"
            ? "No image"
            : "Active",
  };
}

function ProductCell({ product }) {
  return (
    <div className="flex max-w-64 items-center gap-3">
      <Image src={product.image} alt={product.name} width={48} height={48} className="size-12 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
      <div className="min-w-0">
        <p title={product.name} className="truncate font-semibold text-slate-950 dark:text-white">{product.name}</p>
        <p className="mt-0.5 truncate text-meta font-regular text-slate-500 dark:text-slate-400">{product.sku}</p>
      </div>
    </div>
  );
}