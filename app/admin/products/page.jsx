"use client";

import Image from "next/image";
import { Eye, Pencil, Trash2, RefreshCw, Search, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, FilterTabs, Input, SourceBadge } from "@/components/ui";
import { AddItemModal } from "@/components/add-item-modal";
import { AdminProductsSkeleton } from "@/components/skeletons";
import { ConfirmActionDialog, TransparentActionLoader, InfoActionDialog } from "@/components/action-feedback";
import {
   getAdminProducts,
   getAdminCategories,
   startPriceSync,
  createManualProduct,
  toggleProductActive,
  setProductPriority,
  getSyncStatus,
  deleteAdminProduct,
} from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { PriorityToggle } from "@/components/priority-toggle";

const PAGE_SIZE = 10;
const MIN_SKELETON_MS = 650;

export default function AdminProductsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
const [syncing, setSyncing] = useState(false);
  const [, setSyncProgress] = useState({ percent: 0, label: "" });
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    Promise.all([
      getAdminProducts({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined, source: sourceFilter !== "all" ? sourceFilter : undefined }, token),
      new Promise((resolve) => window.setTimeout(resolve, MIN_SKELETON_MS)),
    ])
      .then(([data]) => {
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
    setSyncing(true);
    setSyncProgress({ percent: 0, label: "Starting price sync..." });
    try {
      const data = await startPriceSync(token);
      toast.success(data.message || "Price synchronization started");
      pollSyncProgress("price");
    } catch (syncError) {
      toast.error(syncError.message || "Could not start price sync");
      setSyncing(false);
      setSyncProgress({ percent: 0, label: "" });
    }
  }

  function pollSyncProgress(syncType = "price") {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const maxAttempts = 120;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const data = await getSyncStatus(token);
         const sync = data.sync?.[syncType];
         if (sync?.status === "completed" || sync?.status === "failed" || attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setSyncing(false);
           setSyncProgress({ percent: 100, label: sync?.status === "completed" ? "Done!" : "Sync ended" });
          refreshProducts();
          setTimeout(() => setSyncProgress({ percent: 0, label: "" }), 2000);
         } else if (sync?.status === "processing" || sync?.status === "started") {
           const processed = sync.totalProcessed || 0;
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
      if (err.status === 409 && err.message) {
        setCategoryError(err.message);
      } else {
        toast.error(err.message || "Could not toggle product");
      }
    }
  }

async function handlePriorityChange(product, isPriority = true) {
    try {
      await setProductPriority(product.sku, isPriority, token);
      toast.success(isPriority ? "Priority product updated" : "Product priority removed");
      refreshProducts();
    } catch (err) {
      toast.error(err.message || "Could not update product priority");
    }
  }

  function handleDeleteProduct(product) {
    setDeleteTarget(product);
  }

  async function confirmDeleteProduct() {
    if (!deleteTarget) return;
    setActionLoading("Deleting product...");
    try {
      const data = await deleteAdminProduct(deleteTarget.id, token);
      toast.success(data.message || "Product permanently deleted from the database");
      setDeleteTarget(null);
      refreshProducts();
    } catch (err) {
      toast.error(err.message || "Could not delete product");
    } finally {
      setActionLoading("");
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
    { key: "priority", header: "Priority", accessor: "isPriority", render: (product) => <PriorityToggle checked={Boolean(product.isPriority)} onChange={(value) => handlePriorityChange(product, value)} label={`${product.isPriority ? "Remove priority from" : "Prioritize"} ${product.name}`} /> },
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
             description="Manage products from manual and Ingram sources."
            columns={columns}
            data={rows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            toolbar={(
              <>
                 <div className="relative min-w-[14rem] flex-1 sm:max-w-md lg:max-w-sm">
                   <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                   <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search products, SKU or category" aria-label="Search products" className="h-10 pl-10 shadow-sm" />
                 </div>
                 <Button onClick={handleOpenAddModal} className="shrink-0 gap-1.5"><Plus className="size-4" /> Add Product</Button>
                 <Button asChild href="/admin/products/sync" className="shrink-0 whitespace-nowrap"><RefreshCw className="size-4" /> Sync from Ingram</Button>
                 <Button onClick={handlePriceSync} disabled={syncing} className="shrink-0 gap-2 whitespace-nowrap"><RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync prices</Button>
               </>
            )}
             hideSearch
             disableInitialSort
             inlineToolbar
             toolbarInHeader
             secondaryToolbar={(
               <FilterTabs
                 value={sourceFilter}
                 onChange={(value) => { setSourceFilter(value); setPage(1); }}
                 tabs={[
                   { value: "all", label: "All" },
                   { value: "manual", label: "Manual" },
                   { value: "ingram", label: "Ingram" },
                 ]}
               />
             )}
rowActions={(product) => [
              { label: "View", ariaLabel: `View ${product.name}`, href: `/admin/products/${encodeURIComponent(product.id)}`, icon: Eye },
              {
                label: "Edit",
                ariaLabel: `Edit ${product.name}`,
                href: `/admin/products/${encodeURIComponent(product.id)}`,
                icon: Pencil,
                disabled: product.source === "ingram",
                disabledTitle: "Ingram products cannot be edited (read-only)",
              },
              { label: "Delete", ariaLabel: `Delete ${product.name}`, onClick: () => handleDeleteProduct(product), icon: Trash2, tone: "danger" },
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

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        title="Delete product"
        message="Are you sure you want to delete this product?"
        confirmLabel="Delete"
        loading={Boolean(actionLoading)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteProduct}
      />

      <TransparentActionLoader open={Boolean(actionLoading)} label={actionLoading} />

      <InfoActionDialog
        open={Boolean(categoryError)}
        title="Cannot activate product"
        message={categoryError}
        onClose={() => setCategoryError("")}
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
    isPriority: Boolean(product.isPriority),
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
         <p title={product.name} className="truncate text-base font-bold text-on-surface">{product.name}</p>
        <p className="mt-0.5 truncate text-meta font-normal text-on-surface-variant">{product.sku}</p>
      </div>
    </div>
  );
}
