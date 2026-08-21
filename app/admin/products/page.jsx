"use client";

import Image from "next/image";
import { Eye, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import Pagination from "@/components/pagination";
import { Button, Card, Input } from "@/components/ui";
import { AdminProductsSkeleton } from "@/components/skeletons";
import { getAdminProducts, startPriceSync, startProductSync } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    getAdminProducts({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined }, token)
      .then((data) => {
        if (!active) return;
        setRows((data.products || []).map(toRow));
        setTotalPages(data.pagination?.totalPages ?? 1);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load products.");
        setRows([]);
      });
    return () => {
      active = false;
    };
  }, [token, page, debouncedKeyword]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

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

  return (
    <div className="space-y-6">
      {rows === null && !error ? (
        <AdminProductsSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Products"
            description="Browse and manage your product catalog. Products with photos and stock appear first."
            columns={columns}
            data={rows}
            pageSize={PAGE_SIZE}
            toolbar={(
              <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search products, SKU or category" aria-label="Search products" className="h-10 border-slate-200 bg-white pl-10 shadow-sm dark:border-slate-700 dark:bg-slate-950" />
              </div>
            )}
            hideSearch
            hidePagination
            disableInitialSort
            action={(
              <div className="flex gap-3">
                <Button variant="outline" onClick={handlePriceSync} disabled={syncing}>
                  <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync prices
                </Button>
                <Button onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync products
                </Button>
              </div>
            )}
            rowActions={(product) => [
              { label: `View ${product.name}`, href: `/products/${product.id}`, icon: Eye },
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
