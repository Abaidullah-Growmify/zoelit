"use client";

import Image from "next/image";
import { Eye, RefreshCw, Search, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, FilterTabs, Input, SourceBadge } from "@/components/ui";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminProductsSkeleton } from "@/components/skeletons";
import {
  getAdminProducts,
  getAdminCategories,
  startPriceSync,
  createManualProduct,
  toggleProductActive,
  getSyncStatus,
} from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ percent: 0, label: "" });
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const pollRef = useRef(null);

  const checkSyncStatus = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getSyncStatus(token);
      const catalog = data.sync?.catalog;
      if (catalog?.status === "processing" || catalog?.status === "started") {
        setSyncing(true);
        const processed = catalog.totalProcessed || 0;
        const percent = Math.min(95, Math.round((processed / Math.max(processed, 10)) * 100));
        setSyncProgress({ percent, label: `Processed ${processed} products` });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      checkSyncStatus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [checkSyncStatus]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    getAdminProducts({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined, source: sourceFilter !== "all" ? sourceFilter : undefined }, token)
      .then((data) => {
        if (!active) return;
        setRows((data.products || []).map((product, index) => toRow(product, (page - 1) * PAGE_SIZE + index + 1)));
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalItems(data.pagination?.total ?? 0);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load products.");
        setRows([]);
      });
    return () => { active = false; };
  }, [token, page, debouncedKeyword, sourceFilter]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  async function handleOpenAddModal() {
    try {
      const data = await getAdminCategories(token);
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
    setAddModalOpen(true);
  }

  async function handlePriceSync() {
    const isRunning = await checkSyncStatus();
    if (isRunning) return;
    setSyncing(true);
    setSyncProgress({ percent: 0, label: "Starting price sync..." });
    try {
      const data = await startPriceSync(token);
      toast.success(data.message || "Price synchronization started");
      pollSyncProgress();
    } catch (syncError) {
      toast.error(syncError.message || "Could not start price sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  function pollSyncProgress() {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const maxAttempts = 120;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await getSyncStatus(token);
        const catalog = data.sync?.catalog;
        if (catalog?.status === "completed" || catalog?.status === "failed" || attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
          setSyncProgress({ percent: 100, label: catalog?.status === "completed" ? "Done!" : "Sync ended" });
          refreshProducts();
          setTimeout(() => setSyncProgress({ percent: 0, label: "" }), 2000);
        } else if (catalog?.status === "processing") {
          const processed = catalog.totalProcessed || 0;
          const percent = Math.min(95, Math.round((processed / Math.max(processed, 10)) * 100));
          setSyncProgress({ percent, label: `Processed ${processed} products` });
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
          setSyncProgress({ percent: 0, label: "" });
        }
      }
    }, 3000);
  }

  async function handleCreateProduct(payload) {
    setSubmitting(true);
    try {
      await createManualProduct(payload, token);
      toast.success("Product created successfully");
      setAddModalOpen(false);
      refreshProducts();
    } catch (err) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

  function refreshProducts() {
    if (!token) return;
    getAdminProducts({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined, source: sourceFilter !== "all" ? sourceFilter : undefined }, token)
      .then((data) => {
        setRows((data.products || []).map(toRow));
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalItems(data.pagination?.total ?? 0);
      })
      .catch(() => {});
  }

  async function handleToggleProduct(ingramPartNumber) {
    try {
      const data = await toggleProductActive(ingramPartNumber, token);
      toast.success(data.message);
      refreshProducts();
    } catch (err) {
      toast.error(err.message || "Could not toggle product");
    }
  }

  const columns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
    {
      key: "name",
      header: "Product",
      sortable: true,
      accessor: "name",
      render: (product) => <ProductCell product={product} />,
    },
    {
      key: "source",
      header: "Source",
      accessor: "source",
      render: (product) => <SourceBadge source={product.source} />,
    },
    { key: "category", header: "Category", sortable: true, accessor: "category" },
    { key: "price", header: "Price", sortable: true, accessor: "price", cellClassName: "font-semibold tabular-nums text-on-surface", render: (product) => money(product.price) },
    { key: "stock", header: "Stock", sortable: true, accessor: "stock", cellClassName: "tabular-nums" },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (product) => (
        <span className="relative inline-flex">
          <select
            value={product.isActive ? "active" : "inactive"}
            onChange={() => handleToggleProduct(product.sku)}
            className={`h-8 appearance-none rounded-lg border px-3 pr-7 text-xs font-medium transition-colors ${
              product.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 ${product.isActive ? "text-emerald-600" : "text-rose-600"}`} />
        </span>
      ),
    },
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
            description="Browse and manage your product catalog. Manually added and Ingram synced products are tracked separately."
            columns={columns}
            data={rows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            toolbar={(
              <>
                <FilterTabs
                  value={sourceFilter}
                  onChange={(value) => { setSourceFilter(value); setPage(1); }}
                  tabs={[
                    { value: "all", label: "All" },
                    { value: "manual", label: "Manual" },
                    { value: "ingram", label: "Ingram" },
                  ]}
                />
                <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search products, SKU or category" aria-label="Search products" className="h-10 pl-10 shadow-sm" />
                </div>
              </>
            )}
            hideSearch
            disableInitialSort
            action={(
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleOpenAddModal} className="gap-1.5">
                  <Plus className="size-4" /> Add Product
                </Button>
                <Button variant="outline" onClick={handlePriceSync} disabled={syncing}>
                  <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync prices
                </Button>
                <div className="relative">
                  <Button asChild href="/admin/products/sync" className="min-w-[160px]">
                    {syncing ? (
                      <span className="flex items-center gap-2">
                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {syncProgress.percent > 0 ? `${syncProgress.percent}%` : "Syncing..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="size-4" /> Sync from Ingram
                      </span>
                    )}
                  </Button>
                  {syncing && syncProgress.percent > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-md bg-primary/20">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${syncProgress.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            rowActions={(product) => [
              { label: `View ${product.name}`, href: `/admin/products/${encodeURIComponent(product.id)}`, icon: Eye },
            ]}
          />
        </>
      )}

      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        type="product"
        categories={categories}
        onSubmit={handleCreateProduct}
        submitting={submitting}
      />
    </div>
  );
}

function toRow(product, serial) {
  return {
    id: product.ingramPartNumber,
    serial,
    name: product.name || product.description || product.ingramPartNumber || "Unnamed product",
    sku: product.ingramPartNumber || "—",
    category: product.category || "Uncategorized",
    price: product.price || 0,
    stock: product.stock || 0,
    image: product.imageUrl || FALLBACK_IMAGE,
    isActive: product.isActive,
    source: product.source || "manual",
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
      <Image src={product.image} alt={product.name} width={48} height={48} className="size-10 shrink-0 rounded-xl object-cover ring-1 ring-outline-variant" />
      <div className="min-w-0">
        <p title={product.name} className="truncate font-semibold text-on-surface">{product.name}</p>
        <p className="mt-0.5 truncate text-meta font-normal text-on-surface-variant">{product.sku}</p>
      </div>
    </div>
  );
}
